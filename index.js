/**
 * The strong and elegant of Telegram Bot Framework;
 * This module to provide a collection one to one.
 *
 * @module telekit
 * @author Denis Maslennikov <mrdenniska@gmail.com> (nofach.com)
 * @license MIT
 */

/** Dependencies */
const Telekit = require('./lib/telekit.js');
const teleapi = require('teleapi');

/** Exports */
module.exports = Object.assign((options) => {
    if (options) return new Telekit(options);
    return Telekit;
}, { api: teleapi });
