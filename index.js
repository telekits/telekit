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

        if (!options.token) {
            throw new Error('Token is missing');
        }

        /** Create instance of teleapi */
        this.api = teleapi(options.token);

        /** Create middleware and bind it with kit */
        this.middleware = new Middleware(this);
        this.use = this.middleware.use.bind(this.middleware);

        /** Create helper and set listeners */
        this.helper = new Helper();
        this.helper.on('update', this._update.bind(this));
        this.helper.on('message', this._message.bind(this));
        this.helper.on('post', this._post.bind(this));
        this.helper.on('inline', this._inline.bind(this));
        this.helper.on('callback', this._callback.bind(this));

        /** Create global context */
        this.context = new (Context(this))();

        /** Create polling or webhook client */
        this.client = Client(this.api, this.options);

        if (this.client) {
            this.client.update = (update) => {
                this.helper.put(update);
            }
        }
    }

    /** @private */
    _update(update, type) {
        this.context.update = update[type];

        this.emit('update', this.context, type);
        this.update(this.context, type);
        this.middleware.transmit('update', this.context, type);
    }

    /** @private */
    _message(update, isEdited) {
        this.context.isEdited = isEdited;

        this.emit('message', this.context);
        this.message(this.context);
        this.middleware.transmit('message', this.context);
    }

    /** @private */
    _post(update, isEdited) {
        this.context.isEdited = isEdited;

        this.emit('post', this.context);
        this.post(this.context);
        this.middleware.transmit('post', this.context);
    }

    /** @private */
    _inline(update, isChosen) {
        this.context.isChosen = isChosen;

        this.emit('inline', this.context);
        this.inline(this.context);
        this.middleware.transmit('inline', this.context);
    }

    /** @private */
    _callback(update) {
        this.emit('callback', this.context);
        this.callback(this.context);
        this.middleware.transmit('callback', this.context);
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
