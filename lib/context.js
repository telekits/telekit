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
function createProxy(kit, obj, methods) {
    return new Proxy(obj, {
        get(target, name) {
            if (methods.includes(name)) {
                return (params, callback) => kit.api.method(name,
                    Object.assign({ chat_id: obj.id }, params),
                    callback
                );
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
module.exports = function(kit) {
    let hidden = {
        kit: kit,

        update: null,

        user: null,
        chat: null,
    };

    return new class Context {
        constructor() {
            this.isEdited = false;
            this.isChosen = false;
        }

        get update() {
            return hidden.update;
        }

        set update(value) {
            hidden.chat = null;
            hidden.user = null;

            if (value.chat) {
                hidden.chat = createProxy(
                    hidden.kit,
                    value.chat,
                    METHOD_CHAT
                );
            }

            if (value.from) {
                hidden.user = createProxy(
                    hidden.kit,
                    value.from,
                    METHOD_USER
                );
            }

            debug(
                'chat(%s) and user(%s) is applied',
                (hidden.chat) ? hidden.chat.id : '_', hidden.user.id
            );

            hidden.update = value;
        }

        get chat() {
            return hidden.chat;
        }

        get user() {
            return hidden.user;
        }

        get api() {
            return hidden.kit.api;
        }
    }
};
