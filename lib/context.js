/**
 * Context is context
 *
 * @module telekit/context
 * @author Denis Maslennikov <mrdenniska@gmail.com> (nofach.com)
 * @license MIT
 */

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
function createProxy(bot, obj, methods) {
    return new Proxy(obj, {
        get(target, name) {
            if (methods.includes(name)) {
                return (params, callback) => bot.api.method(name,
                    Object.assign({ chat_id: obj.id}, params),
                    callback
                );
            }

            return target[name];
        },

        set() {
            return undefined;
        },
    });
}

/**
 * Implementation
 * @public
 */
function context(kit, update) {
    let user = null;
    let chat = null;

    if (update.from) {
        user = createProxy(kit, update.from, METHOD_USER);
    }

    if (update.chat) {
        chat = createProxy(kit, update.chat, METHOD_CHAT);
    }

    return {
        /** Variables */
        isEdited: false,
        isChosen: false,

        /** Getters and setters */
        get update() { return update; },
        get api() { return kit.api; },

        /** Proxies */
        user,
        chat,
    };
}

/** Exports */
module.exports = context;
