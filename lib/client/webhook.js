/**
 * A lightweight webhook server for Telegram Bot API
 *
 * @module telekit/client/webhook
 * @author Denis Maslennikov <mrdenniska@gmail.com> (nofach.com)
 * @license MIT
 */

/** Dependencies */
const https = require('https');
const http = require('http');
const url = require('url');

/**
 * Methods
 * @private
 */
function createServer(options, callback) {
    if (options && options.cert && options.key) {
        return https.createServer(options, callback);
    }

    return http.createServer(callback || null);
}

/**
 * Implementation
 * @public
 */
class Webhook {
    constructor(api, options) {
        this.options = Object.assign({
            allowed_updates: [],
            connections: 40,
            port: 443,
            url: '',
            ssl: {
                cert: null,
                key: null,
            },
        }, options);

        this.server = null;
        this.api = api;
        this.url = url.parse(options.url);

        /** Set webhook and start listening */
        this.api.setWebhook({
            allowed_updates: this.options.allowed_updates,
            connections: this.options.connections,
            certificate: this.options.cert,
            url: this.url.href,
        }).then((res) => {
            this.server = this.listen(this.options.port);
        }).catch((error) => {
        });
    }

    listen(...args) {
        this.server = createServer(
            this.options.ssl,
            this.route.bind(this)
        );

        return this.server.listen.apply(this.server, args);
    }

    route(req, res) {
        if (req.method == 'POST') {
            let query = url.parse(req.url || '/');

            if (query.pathname == this.url.pathname) {
                req.on('data', (data) => {
                    try {
                        const body = JSON.parse(data.toString());

                        this.update(body);
                        this.response(res, 200);
                    } catch (e) {
                        this.response(res, 400);
                    }
                });
            }

            return;
        }

        this.response(res, 404);
    }

    response(res, status) {
        res.writeHead(status);
        res.end(JSON.stringify({
            message: http.STATUS_CODES[status],
            status,
        }));
    }

    update(update) { /** Abstract method */ }
}

/** Exports */
module.exports = Webhook;
