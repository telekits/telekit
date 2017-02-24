/**
 * A lightweight webhook server for Telegram Bot API
 *
 * @module telekit/client/webhook
 * @author Denis Maslennikov <mrdenniska@gmail.com> (nofach.com)
 * @license MIT
 */

/** Dependencies */
const { EventEmitter } = require('events');
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
class Webhook extends EventEmitter {
    constructor(api, options) {
        super();

        /** Default options */
        this.options = Object.assign({
            allowed_updates: [],
            connections: 40,
            port: 443,
            url: '',
            ssl: { cert: null, key: null, },
        }, options);

        if (options.url === '') {
            throw new Error('URL of webhook is missing');
        }

        this.server = null;
        this.api = api;
        this.url = url.parse(options.url.replace('{token}', this.api.token));

        /** Set webhook and start listening */
        this.api.setWebhook({
            allowed_updates: this.options.allowed_updates,
            connections: this.options.connections,
            certificate: this.options.cert,
            url: this.url.href,
        }).then(() => {
            this.server = this.listen(this.options.port);
        }).catch((error) => {
            error();
        });
    }

    listen(...args) {
        this.server = createServer(
            this.options.ssl,
            this.route.bind(this)
        );

        return this.server.listen(...args);
    }

    route(req, res) {
        if (req.method === 'POST') {
            const query = url.parse(req.url || '/');

            if (query.pathname === this.url.pathname) {
                req.on('data', (data) => {
                    try {
                        const body = JSON.parse(data.toString());

                        this.emit('update', body);
                        Webhook.response(res, 200);
                    } catch (e) {
                        Webhook.response(res, 400);
                    }
                });
            }

            return;
        }

        Webhook.response(res, 404);
    }

    static response(res, status) {
        res.writeHead(status);
        res.end(JSON.stringify({
            message: http.STATUS_CODES[status],
            status,
        }));
    }
}

/** Exports */
module.exports = Webhook;
