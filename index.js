/**
 * The strong and elegant of Telegram Bot Framework;
 * This module to provide a collection one to one.
 *
 * @module telekit
 * @author Denis Maslennikov <mrdenniska@gmail.com> (nofach.com)
 * @license MIT
 */

/** Dependencies */
const telekit = require('./lib/telekit.js');
const teleapi = require('teleapi');

/** Exports */
module.exports = Object.assign(function Telekit(options) {
    if (options) return new telekit(options);
    return telekit;
}, { api: teleapi });
