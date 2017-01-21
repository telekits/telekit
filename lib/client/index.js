/**
 * A colleciton of clients to Telegram Bot API
 *
 * @module telekit/client
 * @author Denis Maslennikov <mrdenniska@gmail.com>
 * @license MIT
 */

/** Dependencies */
const Polling = require('./polling.js');
const Webhook = require('./webhook.js');

/** Exports */
module.exports = (api, options) => {
    if (options.polling) {
        return new Polling(api, options.polling);
    }

    if (options.webhook) {
        return new Webhook(api, options.webhook);
    }

    return false;
};
