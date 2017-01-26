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
 * Constants
 * @private
 */
const UPDATE_TYPE = [
    'message',
    'edited_message',
    'channel_post',
    'edited_channel_post',
    'inline_query',
    'chosen_inline_result',
    'callback_query',
];

/**
 * Methods
 * @private
 */

/**
 * Returns type of update from object
 * @param  {Object} update - An incoming update
 * @return {String}
 */
function getUpdateType(update) {
    for (let i = 0, c = UPDATE_TYPE.length; i < c; i++) {
        if (update[UPDATE_TYPE[i]]) {
            return UPDATE_TYPE[i];
        }
    }

    return false;
}

/**
 * Implementation
 * @public
 */
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
