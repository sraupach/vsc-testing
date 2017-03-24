/*

It queries a database and inserts channel ID and username into a table. Upon the client starting, it gets all data within that table and checks the length. If the length is > 0, send message to channel ID, ignore if otherwise.
Also, my restart command completly kills the bot
and node process
My Batch script forces it to restart after 4 seconds(edited)

*/

module.exports = function command(bot, container) {
    // command-----------------------------------
    return {
        alias: ['r'],
        description: 'Restart the Bot',
        permissions: 'private',
        action: function (meta) {
            bot.sendMessage({
                to: meta.channelID,
                message: `NO restart now...` + process.uptime()
            });
            var quit = function (code) {
                process.exit(code);
            }
            quit("1");

        }
    };
}