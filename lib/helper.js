/**
 * Helper is a wrapper over updates from Telegram Bot API;
 * This module adopts an incoming updates from Telegram Bot API
 * and checks them to before distribution of between own methods.
 *
 * @module telekit/helper
 * @author Denis Maslennikov <mrdenniska@gmail.com> (nofach.com)
 * @license MIT
 */

/** Dependencies */
const { EventEmitter } = require('events');
const debug = require('debug')('telekit:helper');

/**
 * Implementation
 * @public
 */
class Helper extends EventEmitter {
    constructor() {
        super();
    }

    getUpdateInfo(update) {
        let result = {
            isChosen: false,
            isEdited: false,
            original: '',
            name: '',
        };

        if (update['message']) {
            result.name = result.original = 'message';
        } else if (update['edited_message']) {
            result.isEdited = true;
            result.original = 'edited_message';
            result.name = 'message';
        } else if (update['channel_post']) {
            result.original = 'channel_post';
            result.name = 'post';
        } else if (update['edited_channel_post']) {
            result.isEdited = true;
            result.original = 'edited_channel_post';
            result.name = 'post';
        } else if (update['inline_query']) {
            result.original = 'inline_query';
            result.name = 'inline';
        } else if (update['chosen_inline_query']) {
            result.isChosen = true;
            result.original = 'chosen_inline_query';
            result.name = 'inline';
        } else if (update['callback_query']) {
            result.original = 'callback_query';
            result.name = 'callback';
        }

        return result;
    }

    put(update) {
        const info = this.getUpdateInfo(update);

        debug('update: %s', info.original);
        debug('%s: %O', info.original, update[info.original]);

        /** Emitted `update` with raw update and info*/
        this.emit('update', update, info);
    }
}

/** Exports */
module.exports = Helper;
