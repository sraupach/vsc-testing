module.exports = function command(bot, container) {
    const util = container.util
    // command-----------------------------------
    return {
        alias: ['ac'],
        description: 'Set \'now Playing\' activity',
        permissions: 'private',
        action: function (meta) {
            bot.setPresence({
                game: {
                    "name": meta.input
                }
            }, function () {
                bot.sendMessage({
                    to: meta.channelID,
                    message: '\`activity set to *'+meta.input+'*\`'
                });
            });
        }
    };
};