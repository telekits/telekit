/**
 * A lightweight long polling client for Telegram Bot API
 *
 * @module telekit/client/polling
 * @author Denis Maslennikov <mrdenniska@gmail.com> (nofach.com)
 * @license MIT
 */

/**
 * Implementation
 * @public
 */
class Polling {
    constructor(api, options) {
        this.options = Object.assign({
            allowed_updates: [],
            timeout: 0,
            offset: 0,
            limit: 0,
        }, options);

        this.offset = this.options.offset;
        this.api = api;

        /**
         * Delete webhook(if there's)
         * and start fetching updates.
         */
        this.api.deleteWebhook().then((d) => {
            this.getUpdates();
        }).catch((err) => {
            console.log(err);
        });
    }

    getUpdates() {
        return this.api.getUpdates({
            allowed_updates: this.allowed_updates,
            timeout: this.options.timeout,
            limit: this.options.limit,
            offset: this.offset,
        }).then((response) => {
            response.result.forEach((item) => {
                this.offset = item.update_id + 1;
                this.update(item);
            });

            this.getUpdates();
        });
    }

    update(update) { /** Abstract method */ }
}

/** Exports */
module.exports = Polling;
