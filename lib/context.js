/**
 * Context is context
 *
 * @module telekit/context
 * @author Denis Maslennikov <mrdenniska@gmail.com> (nofach.com)
 * @license MIT
 */

/** Dependencies */
const debug = require('debug')('telekit:context');

/**
 * Constants
 * @private
 */

/** Methods that available for user and chat */
const METHOD_COMMON = [
    'sendMessage',
    'forwardMessage',
    'sendPhoto',
    'sendAudio',
    'sendDocument',
    'sendSticker',
    'sendVideo',
    'sendVoice',
    'sendLocation',
    'sendVenue',
    'sendContact',
    'sendChatAction',
    'editMessageText',
    'editMessageCaption',
    'editMessageReplyMarkup',

];

/** Methods that available only for user */
const METHOD_USER = [
    ...METHOD_COMMON,
    'getUserProfilePhotos',

];

/** Methods that available only for chat */
const METHOD_CHAT = [
    ...METHOD_COMMON,
    'leaveChat',
    'getChat',
    'getChatAdministrators',
    'getChatMembersCount',
    'getChatMember',
];

/**
 * Methods
 * @private
 */
function createProxy(api, obj, methods) {
    return new Proxy(obj, {
        get(target, name) {
            if (methods.includes(name)) {
                return (params, callback) => {
                    const inject = Object.assign({ chat_id: obj.id }, params);
                    return api.method(name, inject, callback);
                };
            }

            return target[name];
        },

        set() {
            return new Error('Cannot change `chat` or `user`.');
        },
    });
}

/**
 * Implementation and Exports
 * @public
 */
module.exports = function Context(API) {
    const api = API;
    let update = null;
    let chat = null;
    let user = null;

    return {
        /** Used for edited or chosen updates */
        isEdited: false,
        isChosen: false,

        /** Raw incoming update */
        get update() { return update; },
        set update(raw) {
            chat = null;
            user = null;

            if (raw.chat) {
                chat = createProxy(api, raw.chat, METHOD_CHAT);
                debug('chat(%s) is apply', chat.id);
            }

            if (raw.from) {
                user = createProxy(api, raw.from, METHOD_USER);
                debug('user(%s) is apply', user.id);
            }

            update = raw;
        },

        /** Chat and user instances with API for them */
        get chat() { return chat; },
        get user() { return user; },

        /** Global API */
        get api() { return api; },
    };
};
