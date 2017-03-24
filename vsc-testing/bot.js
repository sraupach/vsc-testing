(function () {

    /* SETUP =================================================================
    ========================================================================*/

    // top level container-----------------------
    const container = {};

    // configuration-----------------------------
    container.config = require('./settings/config.json');
    container.config.plugins = require('./settings/plugins.json');

    // create bot
    const client = new (require('discord.io')).Client({
        token: container.config.api.discord_bot_token,
        autorun: true
    });

    // local modules-----------------------------
    container.util = require('./lib/util.js')(client, container);
    container.db = require('./lib/db.js')(client, container);
    container.plugins = require('./__plugins/__loader.js')(client, container);
    container.commands = require('./__commands/__loader.js')(client, container);
    const repl = require('repl');
    const chalk = require('chalk');

    // some easy references----------------------
    const util = container.util;
    const commands = container.commands;
    const config = container.config;

    // Load link-list Stuff
    var LinkedList = require('singly-linked-list');
    var list = new LinkedList();

    var dcmd = "dev"

    list.clear();

    client.on('ready', function () {
        //console.log("bot connected ", client.username, client.id); 

        client.connected = true;
        let lines = '';
        lines += `${client.username} [${chalk.yellow(client.id)}] is now online.`;
        Object.keys(client.servers).forEach(function (id) {
            lines += `\n  > ${client.servers[id].name} [${chalk.yellow(id)}]`;
        });
        util.log(lines);


        client.setPresence({
            idle_since: null,
            game: {
                name: config.playing === ''
                    ? `@${client.username} ${config.prefix}help`
                    : config.playing,
                url: ''
            }
        });

        if (!client.repl) {
            client.container = container;
            //repl.start('##>').context.bot = client;
            client.repl = true;
        }

    });

    var getNick = function (uID) {
        var usernick = client.users[uID].username;
        return usernick;
    }

    client.on('message', function (user, userID, channelID, message, event) {
        const meta = {
            user: user,
            userID: userID,
            channelID: channelID,
            message: message,
            event: event,
        };

        // was it a direct message?
        meta.isDirectMessage = meta.channelID in client.directMessages ? true : false;
        // which server was this sent in?
        meta.server = !meta.isDirectMessage
            ? client.channels[channelID].guild_id
            : null;
        // are we in the home server defined in config?
        meta.isHome = meta.server === config.home.server
            ? true
            : false;
        // is the message a potential command?
        meta.isCommandFormat = util.isCommandFormat(
            message,
            meta.server,
            meta.isDirectMessage
        );
        // is the message sender listed as an administrator?
        meta.isAdministrator = util.isAdministrator(meta.userID)
            || event === 'webMessage';
        // does the message start with @Bot mention?
        meta.isBotMention = util.isBotMention(message, meta.server);
        // is the message ONLY an @Bot mention?
        meta.botNameOnly = message.trim() === `<@${client.id}>`
            || message.trim() === `<@!${client.id}>`
            ? true
            : false;
        // was it sent from a WebHook
        meta.isWebhook = client.servers[meta.server]
            && event.d.webhook_id
            ? true
            : false;
        if (!meta.isWebhook) {
            // was the message sent by a bot?
            meta.isBot = client.servers[meta.server]
                && client.users[userID].bot
                ? true
                : false;
        }
        // was the message sent by THIS bot?
        meta.isSelf = meta.userID === client.id ? true : false;

        if (meta.isCommandFormat) {
            // user provided proper command format
            let cmd = util.stripCommandPrefixes(message);
            let keyword = cmd.split(' ')[0];
            meta.input = cmd.replace(keyword, '').trim();
            keyword = keyword.toLowerCase();

            if (commands[keyword]
                && typeof commands[keyword].action === 'function') {
                // base command found
                if (commands[keyword]['permissions'] !== 'private'
                    || meta.isAdministrator) {
                    commands[keyword].action(meta);
                }
            } else {
                // base command not found. look for an alias in our commands
                for (let index in commands) {
                    if (commands[index]
                        && typeof commands[index]['alias'] === 'object') {
                        // does the alias object have the keyword used?

                        if (commands[index]['alias'].indexOf(keyword) > -1) {
                            if (commands[index]['permissions'] !== 'private'
                                || meta.isAdministrator) {
                                commands[index].action(meta);
                            }
                            break;
                        }
                    }
                }
            }
        } else if (meta.isBotMention && meta.botNameOnly && !meta.isSelf) {
            // user only included the bot name, so let's show them the help menu
            commands['help']['action'](meta);
        } else if ((meta.isBotMention || meta.isDirectMessage) && !meta.isSelf) {
            // user started a conversation with the bot
            let cmd = util.stripCommandPrefixes(message);
            util.log('privmsg received' + cmd);
        }


        //var MsgServerID = client.channels[channelID].guild_id
    });



    client.on('disconnect', function () {
        client.connected = false;
    /* jshint -W030 */ repl.exit;
        util.log(chalk.red(
            'Bot disconnected. Will attempt to reconnect in 5 seconds...\n'
        ));
        setTimeout(function () {
            client.connect();
        }, 5000);
    });

}());
