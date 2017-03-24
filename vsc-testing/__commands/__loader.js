/*
    Command Loader

    Author:  Frosthaven
    Twitter: @thefrosthaven

    Description:
        This module will dynamically load all *.js files
        in it's directory and add them to the commands
        object.
*/

module.exports = function commandLoader(bot, container) {

    const commands = {};

    // reference---------------------------------
    const config = container.config;

    // dependancies------------------------------
    const fs = require('fs');

    // dynamically load command files------------
    fs.readdir(__dirname, function(err, items) {
        if (err) {
            console.log(err);
        } else {
            items.sort();
            for (let i=0; i<items.length; i++) {
                const commandName = items[i].slice(0, -3);
                if (items[i] !== '__loader.js' && items[i].endsWith('.js')) {
                    commands[commandName] = require(__dirname + '/' + items[i])(
                      bot,
                      container
                    );

                    if (!commands[commandName]) {
                        // our command didn't return anything so lets remove it
                        delete commands[commandName];
                    }
                }
            }
        }
    });

    // help command------------------------------
    commands['help'] = {
        alias: ['?'],
        description: 'Show help menu',
        permissions: 'public',
        action: function(meta) {
            const wrap = '```md\n%content\n```';

            const sendMenuByPermission = function(perm) {
                let lines = perm === 'private'
                  ? '#Help Menu [ADMIN COMMANDS]\n'
                  : '#Help Menu\nNote: If using this bot from a foreign ' +
                  'server, you may need to type `@' + bot.username + ' ' +
                  config.prefix + 'command`\n';

                Object.keys(commands).forEach(function(key) {
                    const aliases  = [];
                    let aliasStr = '';
                    let newLine;
                    if (commands[key]
                    && commands[key]['permissions'] === perm) {
                        // check for aliases
                        if (typeof commands[key]['alias'] === 'object') {
                            for (
                            let i = 0; i < commands[key]['alias'].length; i++) {
                                aliases.push(
                                  config.prefix + commands[key]['alias'][i]
                                );
                            }
                            aliasStr = aliases.length > 0
                                      ? ' ' + aliases.join(' ')
                                      : aliasStr;
                        }

                        // define the new line
                        newLine = '\n[' + config.prefix + key + aliasStr + ']('
                        + commands[key]['description']
                        .replace(/[\)]/g, '\]')
                        .replace(/[\(]/g, '\[') + ')';

                        // decide if we need to split based on character limit
                        // 2000 and 12 character wrap variable
                        if (lines.length + newLine.length + 12 > 2000) {
                            lines = wrap.replace('%content', lines);
                            bot.sendMessage({
                                to: meta.userID,
                                message: lines
                            });
                            lines = '';
                        } else {
                            lines += newLine;
                        }
                    }
                });

                // do we have leftover lines to send?
                if (lines !== '') {
                    lines = wrap.replace('%content', lines);
                    bot.sendMessage({
                        to: meta.userID,
                        message: lines
                    });
                }
            };

            // lets send the help menu
            sendMenuByPermission('public');
            if (meta.isAdministrator) {
                sendMenuByPermission('private');
            }

            // notify the user that we have sent the help menu
            if (!meta.isDirectMessage) {
                bot.sendMessage({
                    to: meta.channelID,
                    message: ':mailbox_with_mail: <@' + meta.userID +
                    '>: I\'ve sent the help menu to your inbox'
                });
            }
        }
    };

    // return------------------------------------
    return commands;
};
