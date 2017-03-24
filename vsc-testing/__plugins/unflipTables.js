/*
    Unflip Tables

    Author:  Frosthaven
    Twitter: @thefrosthaven

    Description:
        STOP FLIPPING MY TABLES
*/

module.exports = function plugin(bot, container, pconfig) {

    // reference---------------------------------
    const config = container.config;

    // plugin------------------------------------
    bot.on('message', function(user, userID, channelID, message, event) {
        const dm = channelID in bot.directMessages ? true : false;
        const server = !dm ? bot.channels[channelID].guild_id : null;
        if (server === config.home.server && userID !== bot.id) {
            /* jshint -W100 */
            if (message.indexOf('(╯°□°）╯︵ ┻━┻') > -1) {
                bot.sendMessage({
                    to: channelID,
                    message: '┬─┬﻿ ノ( ゜-゜ノ)'
                });
            } else if (message.indexOf('┬─┬﻿ ノ( ゜-゜ノ)') > -1) {
                bot.sendMessage({
                    to: channelID,
                    message: `(╯°□°）╯︵ ┻━┻`
                });
            }
        }
    });

    return true;
};
