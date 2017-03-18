/**
 * Basic is a wrapper over updates from Telegram Bot API;
 * This module adopts an incoming updates from Telegram Bot API
 * and checks them to before distribution of between own methods.
 *
 * @module telekit/basic
 * @author Denis Maslennikov <mrdenniska@gmail.com> (nofach.com)
 * @license MIT
 */

/** Dependencies */
const { EventEmitter } = require('events');
const isArrow = require('isarrow');
const isClass = require('isclass');
const debug = require('debug')('telekit:basic');

/**
 * Methods
 * @private
 */

/**
 * Returns info about raw updates from Telegram Bot API
 *
 * @param  {Object} update - Raw incoming update
 * @return {Object}
 */
function getUpdateInfo(update) {
    /** Is it chosen inline or edited message/post */
    let isChosen = false;
    let isEdited = false;

    /** Raw and formatted names of update */
    let original = '';
    let name = '';

    if (update.message) {
        name = 'message';
        original = 'message';
    } else if (update.edited_message) {
        isEdited = true;
        original = 'edited_message';
        name = 'message';
    } else if (update.channel_post) {
        original = 'channel_post';
        name = 'post';
    } else if (update.edited_channel_post) {
        isEdited = true;
        original = 'edited_channel_post';
        name = 'post';
    } else if (update.inline_query) {
        original = 'inline_query';
        name = 'inline';
    } else if (update.chosen_inline_query) {
        isChosen = true;
        original = 'chosen_inline_query';
        name = 'inline';
    } else if (update.callback_query) {
        original = 'callback_query';
        name = 'callback';
    }

    return { isChosen, isEdited, original, name };
}

/** Implementation */
class Basic extends EventEmitter {
    constructor() {
        super();

        /** Store of middlewares */
        this.middlewares = [];
    }

    /**
     * To spread params between middleware with method
     *
     * @param  {String}   method -
     * @param  {...[Any]} params -
     * @return {Promise}
     */
    dispatch(method, ...params) {
        return new Promise((resolve, reject) => {
            const handles = this.middlewares.keys();
            const fn = () => {
                const result = handles.next();
                if (result.done) return resolve(true);
                if (!this.middlewares[result.value][method]) return fn();

                try {
                    this.middlewares[result.value][method](...params, fn);
                } catch (error) {
                    reject(error);
                }

                return false;
            };

            debug('dispatch params to %s method from middlewares', method);
            fn();
        });
    }

    /**
     * Takes a raw update for processing and
     * distribution of between the middlewares
     *
     * @param  {Object} update - Raw incoming update
     * @return {Helper}
     */
    fetch(update) {
        const info = getUpdateInfo(update);

        debug('update: %s', info.original);
        debug('%s: %O', info.name, update[info.original]);

        if (this.handle) this.handle(update, info);
        this.emit('handle', update, info);

        return this;
    }

    /**
     * Register middleware(s) in queue stack for updates
     *
     * @param  {...[Class|Function]} params - middleware(s)
     * @return {Helper}
     */
    use(...params) {
        let handle = null;

        /** Params is empty */
        if (params.length === 0) {
            throw new Error('Params should not be empty.');
        }

        this.emit('beforeUse', this, this.middleware);
        params.forEach((param) => {
            /** Param is array */
            if (Array.isArray(param)) {
                this.use(...param);
                return;
            }

            /** Param is function */
            if (typeof param === 'function') {
                /** Param is class */
                if (isClass(param) && !isArrow(param)) {
                    /* eslint new-cap: "off" */
                    handle = new param(this);
                } else {
                    handle = param(this);
                }
            }

            /** Add handle into stack(if it there's) */
            if (handle) {
                debug('added %s into stack', param.name || '_');
                this.middlewares.push(handle);
            }

            handle = undefined;
        });

        this.emit('afterUse', this, this.middlewares);
        return this;
    }
}

/** Exports */
module.exports = Basic;
