// utility Module

module.exports = function util(client, container) {
    const lib = {};

    // reference---------------------------------
    const config = container.config;

    // dependancies------------------------------
    const chalk      = require('chalk');

    // setup-------------------------------------
    container.tasks = {};

        const ping = require('net-ping');

        lib.timestamp = function() {
                var time = new Date();
                var hour = time.getHours();
                var min = time.getMinutes();
                var sec = time.getSeconds();
                hour = (hour < 10 ? "0" : "") + hour;
                min = (min < 10 ? "0" : "") + min;
                sec = (sec < 10 ? "0" : "") + sec;
                var ts = "["+hour+":"+min+":"+sec+ "] "
                return ts;
        };

        lib.latency = function(destination, callback) {
                var target = !destination ? "4.2.2.2" : destination;
                var options = {
                        retries: 3,
                        timeout: 2000
                };
                var session = ping.createSession(options);
                        session.on ("error", function(error) {
                                console.trace (error.toString());
                });

                session.pingHost (target, function(error, target, sent, rcvd) {
                        var ms = rcvd - sent;
                                if (error)
                                        if (error instanceof ping.RequestTimedOutError)
                                                console.log (target + ": Not alive (ms=" + ms + ")");
                                        else
                                                console.log (target + ": " + error.toString () + " (ms=" + ms + ")");
                                else
                                        //console.log (target + ": Alive alive (ms=" + ms + ")");
                return callback(ms);
                });
        };

    lib.log = function(msg) {
        console.log(chalk.cyan('[discord.io]: ') + msg);
    };

    lib.vlog = function(msg, svr) {
        console.log(chalk.blue('[voiceAnnouncer] ')+ chalk.yellow(svr) + ': ' + msg);
    };


    lib.usePlugin = function(pName) {
        if (container.plugins[pName]) {
            return container.plugins[pName];
        } else {
            return false;
        }
    };

    lib.log = function(msg) {
        console.log(chalk.cyan('[discord.io]: ') + msg);
    };

    lib.registerTask = function(name, minutes, callback) {
        const timer = parseInt(minutes) * 60000;

        container.tasks = container.tasks || {};

        if (container.tasks[name]) {
            // fail silently for now since plugins will attempt to
            // reregister tasks on reconnect
        } else {
            container.tasks[name] = {
                interval: minutes,
                action: setInterval(function() {
                    process.nextTick(function() {
                        callback();
                    });
                }, timer),
            };

            callback();
        }
    };
    /**
     * makes the first letter uppercase
     * @param  {string} string the string to uppercase
     * @return {string}        the modified string
     */
    lib.upperFirstLetter = function(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };


    lib.isCommandFormat = function(message, server, isDirectMessage) {
        // is the message in command format?
        if (server === config.home.server && message.startsWith(config.prefix)
        || isDirectMessage && message.startsWith(config.prefix)
        || message.startsWith('<@' + client.id + '> ' + config.prefix)
        || message.startsWith('<@!' + client.id + '> ' + config.prefix)) {
            return true;
        } else {
            return false;
        }
    };

    /**
     * checks if the message begins with a mention
     * directed at the bot
     * @param  {string}  message [the message text body]
     * @param  {string}  server  [the server id]
     * @return {Boolean}         [description]
     */
    lib.isBotMention = function(message, server) {
        // is the message directed at the bot?
        return message.startsWith('<@' + client.id + '>')
              || message.startsWith('<@!' + client.id + '>') ? true : false;
    };

    /**
     * removes the leading syntax for commands from
     * a text message
     * @param  {string} message [the message text body]
     * @return {string}         [the message with the command portion removed]
     */
    lib.stripCommandPrefixes = function(message) {
        // removes the leading syntax for commands
        if (message.startsWith('<@' + client.id + '> ' + config.prefix)) {
            message = message.replace(
              '<@' + client.id + '> ' + config.prefix,
              ''
            );
        } else if (message.startsWith('<@!' + client.id + '> ' + config.prefix)) {
            message = message.replace(
              '<@!' + client.id + '> ' + config.prefix,
              ''
            );
        } else if (message.startsWith(config.prefix)) {
            message = message.replace(config.prefix, '');
        }

        return message;
    };

    /**
     * gets a user's name by providing their id
     * @param  {string} serverID [the server id]
     * @param  {string} userID   [the user's id]
     * @return {string}          [the user's name]
     */
    lib.getUserNameByID = function(serverID, userID) {
        return client.servers[serverID].members[userID].username;
    };

    /**
     * searches for and returns a user's id by providing
     * all or part of the user's nickname / username
     * @param  {string} serverID [the server's id]
     * @param  {string} search   [the search string]
     * @return {variable}        [returns the id if found, false otherwise]
     */
    lib.getUserIDByNameSearch = function(serverID, search) {
        search = search.toString();
        for (let key in client.servers[serverID].members) {
            // skip loop if the property is from prototype
            if (!client.servers[serverID].members.hasOwnProperty(key)) {
                continue;
            }

            // check for nickname if it exists
            if (client.servers[serverID].members[key].nick) {
                if (client.servers[serverID].members[key].nick
                .toLowerCase().indexOf(search) > -1) {
                    return client.servers[serverID].members[key].id;
                }
            } else {
                if (client.servers[serverID].members[key].username
                && client.servers[serverID].members[key].username
                .toLowerCase().indexOf(search) > -1) {
                    return client.servers[serverID].members[key].id;
                }
            }
        }

        return false;
    };

    /**
     * searches for and returns the id of a role by
     * providing all or part of the role's name
     * @param  {string} serverID [the server's id]
     * @param  {string} search   [the search string]
     * @return {variable}        [returns the id string if found]
     */
    lib.getRoleIDByNameSearch = function(serverID, search) {
        search = search.toString();
        for (let key in client.servers[serverID].roles) {
            // skip loop if the property is from prototype
            if (!client.servers[serverID].roles.hasOwnProperty(key)) {
                continue;
            }

            // check for the role
            if (client.servers[serverID].roles[key].name
            && client.servers[serverID].roles[key].name
            .toLowerCase().indexOf(search) > -1) {
                return client.servers[serverID].roles[key].id;
            }
        }

        return false;
    };

    /**
     * checks if a user id is registered as an admin
     * within the bot's configuration
     * @param  {string}  userID [the user id to check]
     * @return {Boolean}        [true if admin, false otherwise]
     */
    lib.isAdministrator = function(userID) {
        return config.administrators.indexOf(userID) > -1;
    };

    /**
     * searches for and returns the role of an id
     * using the provided search string
     * @param  {string} serverID   [the server id]
     * @param  {string} roleString [the text search string]
     * @return {variable}          [returns the role id if found]
     */
    lib.resolveRoleID = function(serverID, roleString) {
        roleString = roleString.toString();
        let roleID = false;
        if (roleString === serverID) {
            // this is the everyone role
            roleID = roleString;
        } else {
            // did we provide an id string?
            let regexp = /(^[0-9]+$)/g;
            let match = regexp.exec(roleString);
            if (match) {
                roleID = match[1];
            } else {
                // fallback to name search
                match = lib.getRoleIDByNameSearch(
                  serverID,
                  roleString.toLowerCase()
                );
                if (match) {
                    roleID = match;
                }
            }
        }

        return roleID;
    };

    /**
     * checks if a provided user in a channel has
     * a specified role
     * @param  {string} roleName  [the name of the role to check against]
     * @param  {string} channelID [the channel id]
     * @param  {string} userID    [the user's id]
     * @return {boolean}          [true if user has role, false otherwise]
     */
    lib.userHasRole = function(roleName, channelID, userID) {
        let hasRole = false;

        if (client.channels[channelID].guild_id) {
            // good, it isn't a direct message
            const serverID = client.channels[channelID].guild_id;

            if (client.servers[serverID].members[userID]) {
                client.servers[serverID].members[userID].roles.some((role) => {
                    console.log(client.servers[serverID].roles[role].name);
                    if (client.servers[serverID].roles[role].name
                    === 'Fortis Admin') {
                        hasRole = true;
                        return true;
                    } else {
                        return false;
                    }
                });
            }
        }
        return hasRole;
    };

    /**
     * searches for and returns a user id by checking
     * against multiple patterns
     *  - <@username>
     *  - userid
     *  - name search
     * @param  {string} serverID   [the server id]
     * @param  {string} userString [the string to parse user information from]
     * @return {variable}          [user id string if found, false otherwise]
     */
    lib.resolveUserID = function(serverID, userString) {
        userString = userString.toString();
        let userID = false;
        if (userString !== '') {
            // did we provide a mention?
            let regexp = /<\@!?([a-zA-Z0-9]+)>/g;
            let match = regexp.exec(userString);
            if (match) {
                userID = match[1];
            } else {
                // did we provide an id string?
                regexp = /(^[0-9]+$)/g;
                match = regexp.exec(userString);
                if (match) {
                    userID = match[1];
                } else {
                    // fallback to name search
                    match = lib.getUserIDByNameSearch(
                      serverID,
                      userString.toLowerCase()
                    );
                    if (match) {
                        userID = match;
                    }
                }
            }
        }
        return userID;
    };

    /**
     * searches for and returns a channel id by checking
     * against multiple patterns
     *  - <#general>
     *  - channelid
     * @param  {string} channelString [the string to parse channel info from]
     * @return {variable}             [channel id if found, false otherwise]
     */
    lib.resolveChannelID = function(channelString) {
        channelString = channelString.toString();
        // did we provide a channel id?
        let channelID = false;
        let regexp = /<\#([a-zA-Z0-9]+)>/g;
        let match = regexp.exec(channelString);
        if (match) {
            channelID = match[1];
        } else {
            // did we provide an id string?
            regexp = /(^[0-9]+$)/g;
            match = regexp.exec(channelString);
            if (match) {
                channelID = match[1];
            }
        }
        return channelID;
    };

    /**
     * converts a 6 digit hex color to decimal
     * @param  {string}   hex the hex color value
     * @return {int}      the decimal color value
     */
    lib.toColorInt = function(hex) {
        return parseInt(`0x${hex}`);
    };

    /**
     * makes the first letter uppercase
     * @param  {string} string the string to uppercase
     * @return {string}        the modified string
     */
    lib.upperFirstLetter = function(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };

    /**
     * wraps code in a syntax highlighted block
     * @param  {string} str   [the message body]
     * @param  {string} style [the syntax style (js, xl, etc)]
     * @return {string}       [the resulting wrapped message]
     */
    lib.codeBlock = function(str, style) {
        return `\`\`\`${style || ''}\n${str}\n\`\`\``;
    };

    /**
     * converts bytes into a readable string
     * @param  {number} bytes    [size in bytes]
     * @param  {number} decimals [number of decimal places]
     * @return {string}          [the formatted string]
     */
    lib.formatBytes = function(bytes, decimals) {
        if (bytes === 0) {
            return '0 Byte';
        }
        const k = 1000;
        const dm = decimals + 1 || 3;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes/Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    /**
     * leaves all currently active voice channels
     * @param  {string} except [a voice channel id]
     */
    lib.leaveAllVoiceChannels = function(except) {
        Object.keys(bot._vChannels).forEach(function(key) {
            if (except && key === except) {
                // do nothing
            } else {
                bot.leaveVoiceChannel(key);
            }
        });
    };

        return lib;
}

