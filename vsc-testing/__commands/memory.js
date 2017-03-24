module.exports = function command(bot, container) {

    // reference---------------------------------
    const config = container.config;
    const util = container.util;

    // dependancies------------------------------
    const fs = require('fs');
    const nUtil = require('util');
    // const tcpp = require('tcp-ping');
    const du = require('du');

    // command-----------------------------------
    return {
        description: 'Get bot memory usage details',
        permissions: 'private',
        alias: ['mem'],
        action: function (meta) {
            du('./', function (duErr, size) {

                // memory usage
                const rss = nUtil.inspect(process.memoryUsage()
                    .rss);
                const heapUsed = nUtil.inspect(process.memoryUsage()
                    .heapUsed);
                const heapTotal = nUtil.inspect(process.memoryUsage()
                    .heapTotal);
                const codeStack = rss - heapTotal;
                const dbSize = fs.statSync('./storage.nedb')['size'];

                let embedObj = {
                    type: 'rich',
                    title: 'Performance Metrics',
                    description: '[Node Memory Diagram](http://i.stack.imgur.com/I188N.png)',
                    color: container.util.toColorInt('ff7200'),
                    fields: [],
                    thumbnail: {
                        url: 'https://puu.sh/sF53F/39d9bd0461.png',
                        proxy_url: '',  // optional
                        height: '25px', // optional
                        width: '25px'   // optional
                    }
                };

                // memory usage field
                embedObj.fields.push({
                    name: 'Memory Usage',
                    value: `Total:                ${util.formatBytes(rss, 0)}\nCode & Stack: ${util.formatBytes(codeStack, 0)}\nHeap Use:        ${util.formatBytes(heapUsed, 0)}`,
                    inline: true
                });

                // disk usage field
                embedObj.fields.push({
                    name: 'Disk Usage',
                    value: `Total:          ${util.formatBytes(size, 0)}\nPlatform:    ${util.formatBytes(size - dbSize, 0)}\nDatabase:  ${util.formatBytes(dbSize, 0)}`,
                    inline: true
                });

                // scheduled tasks
                let taskLabel;
                let taskLines = '';
                Object.keys(container.tasks).forEach(function (key) {
                    if (parseInt(container.tasks[key].interval) > 1) {
                        taskLabel = `every ${container.tasks[key].interval}`;
                    } else {
                        taskLabel = 'every 1';
                    }
                    taskLines += `\n${key} (${taskLabel})`;
                });
                embedObj.fields.push({
                    name: 'Scheduled Tasks/Minute',
                    value: taskLines,
                    inline: true
                });
                // registered modules
                embedObj.fields.push({
                    name: `Registered Modules (${Object.keys(container.plugins).length})`,
                    value: `${Object.keys(container.plugins).join(', ')}`,
                    inline: false
                });
                // registered commands
                embedObj.fields.push({
                    name: `Registered Commands (${Object.keys(container.commands).length})`,
                    value: ` type \`@${bot.username} ${config.prefix}help\` for the list of commands available to you`,
                    inline: false
                });
                // active servers
                var srv = [];
                for (var srvID in bot.servers) {
                    srv.push(bot.servers[srvID].name)
                }
                embedObj.fields.push({
                    name: `Active Servers (${Object.keys(bot.servers).length})`,
                    value: srv.toString(),
                    inline: false
                });
                // send the message
                bot.sendMessage({
                    to: meta.channelID,
                    message: '',
                    embed: embedObj
                });
            });
        }
    };
};
