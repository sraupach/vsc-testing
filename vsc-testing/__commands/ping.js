module.exports = function command(bot, container) {
    const util = container.util
    // command-----------------------------------
    return {
        alias: ['p'],
        description: 'ping <host>',
        permissions: 'public',
        action: function (meta) {
            util.latency(meta.input, function (response) {
                if (response) {
                    message = ':eye_in_speech_bubble:' + '`current latency is ' + response + 'ms\`'
                    
                } else {
                    //nothing else
                }
                bot.sendMessage({
                        to: meta.channelID,
                        message: message
                    });
            });
        }
    };
};