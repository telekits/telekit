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
const { getUpdateType } = require('./utility.js');
const debug = require('debug')('telekit:helper');

/** Implementation */
class Helper extends EventEmitter {
    constructor() {
        super();
    }

    put(update) {
        let type = getUpdateType(update);
        let isEdited = false;
        let isChosen = false;

        debug('update: %s', type);

        this.emit('update', update, type);

        switch (type) {
            /** Message */
            case 'message':
            case 'edited_message': {
                isEdited = (type == 'edited_message') ? true : false;

                debug('%s: %O', type, update);
                this.emit('message', update[type], isEdited);
                break;
            }

            /** Post */
            case 'channel_post':
            case 'edited_channel_post': {
                isEdited = (type == 'edited_channel_post') ? true : false;

                debug('%s: %O', type, update);
                this.emit('post', update[type], isEdited);
                break;
            }

            /** Inline */
            case 'inline_query':
            case 'chosen_inline_query': {
                isChosen = (type == 'chosen_inline_query') ? true : false;

                debug('%s: %O', type, update);
                this.emit('inline', update[type], isChosen);
                break;
            }

            /** Callback */
            case 'callback_query': {
                debug('%s: %O', type, update);
                this.emit('callback', update[type]);
                break;
            }
        }
    }
}

/** Exports */
module.exports = Helper;
