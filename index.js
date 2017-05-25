/**
 * The strong and elegant of the Telegram Bot Framework;
 * This module to provide an export function as is an object.
 *
 * @module telekit
 * @author Denis Maslennikov <mrdenniska@gmail.com> (nofach.com)
 * @license MIT
 */

/** Dependencies */
const API = require('teleapi');
const Kit = require('./lib');

/** Exports */
module.exports = Object.assign((options) => {
    if (options) return new Kit(options);
    return Kit;
}, { api: API });
