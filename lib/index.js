/**
 * Kit is module by modules
 *
 * @module telekit/kit
 * @author Denis Maslennikov <mrdenniska@gmail.com> (nofach.com)
 * @license MIT
 */

/** Dependencies */
const teleapi = require('teleapi');

const Context = require('./context.js');
const Client = require('./client/index.js');
const Basic = require('./basic.js');

/** Implementation */
class Telekit extends Basic {
    constructor(options) {
        super();

        /** Create API instance with help of teleapi */
        const API = teleapi(options.token);

        /** Options */
        this.options = options;

        /** Global Context */
        this.context = Context(API);

        /** Client for Telegram Bot API */
        this.client = Client(API, this.options);
        if (this.client) this.client.on('update', this.fetch.bind(this));

        /** Global Telegram Bot API */
        this.api = API;
    }

    handle(update, info) {
        this.context.update = update[info.original];

        this.emit('beforeUpdate', this.context, info);

        if (this.update) this.update(this.context, info);
        this.emit('update', this.context, info);

        this.dispatch('update', this.context, info).then(() => {
            if (this[info.name]) this[info.name](this.context);
            this.emit(info.name, this.context);

            return this.dispatch(info.name, this.context);
        }).then(() => {
            this.emit('afterUpdate', this.context, info);
        });
    }
}

/** Exports */
module.exports = Telekit;
