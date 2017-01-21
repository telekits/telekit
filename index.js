/**
 * The powerful, but an elegantly simple toolkit for making Telegram Bots
 *
 * @module telekit
 * @author Denis Maslennikov <mrdenniska@gmail.com> (nofach.com)
 * @license MIT
 */

/** Dependencies */
const { Middleware, Context, Client, Helper } = require('./lib/');
const { EventEmitter } = require('events');
const teleapi = require('teleapi');

/**
 * Implementation
 * @public
 */
class Kit extends EventEmitter {
    constructor(options) {
        super();

        this.options = Object.assign({
        }, options);

        /** Create instance of teleapi */
        this.api = teleapi(options.token);

        /** Create middleware and bind it with kit */
        this.middleware = new Middleware(this);
        this.use = this.middleware.use.bind(this.middleware);

        /** Create polling or webhook client */
        this.client = Client(this.api, this.options);

        if (this.client) {
            this.helper = new Helper();
            this.helper.on('update', this._update.bind(this));
            this.helper.on('message', this._message.bind(this));
            this.helper.on('post', this._post.bind(this));
            this.helper.on('inline', this._inline.bind(this));
            this.helper.on('callback', this._callback.bind(this));
            this.client.update = (update) => {
                this.helper.put(update);
            }
        }
    }

    /** @private */
    _update(update, type) {
        let context = Context(this, update[type]);

        this.emit('update', context, type);
        this.update(context, type);
        this.middleware.transmit('update', context, type);
    }

    /** @private */
    _message(update, isEdited) {
        let context = Context(this, update);
        context.isEdited = isEdited;

        this.emit('message', context);
        this.message(context);
        this.middleware.transmit('message', context);
    }

    /** @private */
    _post(update, isEdited) {
        let context = Context(this, update);
        context.isEdited = isEdited;

        this.emit('post', context);
        this.post(context);
        this.middleware.transmit('post', context);
    }

    /** @private */
    _inline(update, isChosen) {
        let context = Context(this, update);
        context.isChosen = isChosen;

        this.emit('inline', context);
        this.inline(context);
        this.middleware.transmit('inline', context);
    }

    /** @private */
    _callback(update) {
        let context = Context(this, update);

        this.emit('callback', context);
        this.callback(context);
        this.middleware.transmit('callback', context);
    }

    update(context, type) { /** Abstract method */ }
    message(context) { /** Abstract method */ }
    post(context) { /** Abstract method */ }
    inline(context) { /** Abstract method */ }
    callback(context) { /** Abstract method */ }
}

/** Exports */
module.exports = Object.assign((options) => {
    if (options) return new Kit(options);
    return Kit;
}, { api: teleapi, kit: Kit });
