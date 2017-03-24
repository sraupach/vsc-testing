module.exports = function command(bot, container) {

    // command---------------------------------
    return {
        alias: ['c'],
        description: 'Flip a coin',
        permissions: 'public',
        action: function(meta) {
            const label = Math.floor(Math.random() * 2) + 1 === 1
                          ? 'heads'
                          : 'tails';
            bot.sendMessage({
                to: meta.channelID,
                message: `:eye_in_speech_bubble: <@${meta.userID}>'s coin landed on \`${label}\``
            });
        }
    };
};
