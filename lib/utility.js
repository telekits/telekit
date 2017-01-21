/**
 * A collection of constants and helpful tools
 *
 * @module telekit/utility
 * @author Denis Maslennikov <mrdenniska@gmail.com> (nofach.com)
 * @license MIT
 */

/** Constants */
const UPDATE_TYPE = [
    'message',
    'edited_message',
    'channel_post',
    'edited_channel_post',
    'inline_query',
    'chosen_inline_result',
    'callback_query',
];

/** Methods */
function getUpdateType(update) {
    for (let i = 0, c = UPDATE_TYPE.length; i < c; i++) {
        if (update[UPDATE_TYPE[i]]) {
            return UPDATE_TYPE[i];
        }
    }

    return false;
}

/** Exports */
module.exports = {
    UPDATE_TYPE,
    getUpdateType,
};
