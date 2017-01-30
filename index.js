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

        /** Create global context */
        this.context = new (Context(this))();

        /** Create polling or webhook client */
        this.client = Client(this.api, this.options);

        if (!this.client) {
            this.insertUpdate = (update) => {
                this.helper.put(update);
            };
        } else {
            this.client.update = (update) => {
                this.helper.put(update);
            };
        }
    }

    /** @private */
    _update(update, info) {
        /** Update context */
        this.context.update = update[info.original];

        /** Emitted `beforeUpdate` event with context and update info */
        this.emit('beforeUpdate', this.context, info);

        /** Emitted `update` event with context and update name */
        this.update(this.context, info.name);
        this.emit('update', this.context, info.name);
        this.middleware.transmit('update', this.context, info.name);

        /** Emitted name of update with context */
        this[info.name](this.context);
        this.emit(info.name, this.context);
        this.middleware.transmit(info.name, this.context);

        /** Emitted afterUpdate event with context and update info */
        this.emit('afterUpdate', this.context, info);
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
