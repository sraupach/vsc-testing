module.exports = function command(bot, container) {

    // reference---------------------------------
    const config = container.config;
    const util   = container.util;

    // dependancies------------------------------
    const moment      = require('moment');
    const shortNumber = require('short-number');
    const statTracker = util.usePlugin('statTracker');
    if (!statTracker) {
      return;
    }

    // command-----------------------------------
    return {
        alias: ['s'],
        description: 'Retrieves statistical data about a user. Provide either the user id: `' + config.prefix + 'stats 141906786750955521`, a mention: `' + config.prefix + 'stats @Someone` or leave it blank to get your own statistics: `' + config.prefix + 'stats`. You can also do a fuzzy search if you know part of the username: `' + config.prefix + 'stats frost` or `' + config.prefix + 'stats osthave` will both match Frosthaven',
        permissions: 'public',
        action: function(meta) {
            if (meta.isDirectMessage) {
                bot.sendMessage({
                    to: meta.channelID,
                    message: ':information_source: I can\'t manage stats through direct messaging!'
                });
                return;
            }

            const serverID = meta.server;
            let userID;
            if (meta.input.trim() === '') {
                userID = meta.userID;
            } else {
                userID = util.resolveUserID(serverID, meta.input);
            }

            if (bot.users[userID] && bot.servers[serverID].members[userID]) {
                // we need to persist this to the database eventually
                statTracker.getUserStats(serverID, userID, function(stats) {
                    // tracking_since
                    const trackTimeM = moment.utc(
                      statTracker.getTrackingSince()
                    );
                    const botJoinedM = moment.utc(
                      bot.servers[serverID].members[bot.id].joined_at
                    );
                    const userJoinedM = moment.utc(
                      bot.servers[serverID].members[userID].joined_at
                    );
                    let trackingSince = trackTimeM;
                    if (botJoinedM > trackTimeM) {
                      // bot joined this server after tracking was enabled
                      trackingSince = botJoinedM;
                    }
                    if (userJoinedM > botJoinedM && userJoinedM > trackTimeM) {
                      // user joined this server after tracking was enabled and after the bot was added
                      trackingSince = userJoinedM;
                    }

                    // setup the embed object and username
                    const userDisplayName = bot.servers[serverID]
                    .members[userID].nick
                                ? bot.servers[serverID].members[userID].nick
                                : bot.users[userID].username;
                    let embedObj = {
                      type: 'rich',
                      title: `${userDisplayName} of ${bot.servers[serverID].name}`,
                      description: `Tracking for this user started at least ${trackingSince.fromNow()}`,
                      color: container.util.toColorInt('ff63a2'),
                      fields:[],
                      thumbnail: {
                        url: `https://cdn.discordapp.com/avatars/${userID}/${bot.users[userID].avatar}.gif`
                      }
                    };

                    // message counter and rank field
                    const rank = statTracker.getRankFromMessageCount(
                                   serverID,
                                   stats.messages_sent
                                 );
                    const statCounterEmbed = {
                      inline: false
                    };
                    if (typeof rank === 'object' && rank && rank.rank) {
                      statCounterEmbed.name  = `Messaging Rank`;
                      statCounterEmbed.value = `${rank.rank} (${shortNumber(rank.postReq)}+)\n- Rank ${rank.numeric} of ${rank.total}\n- Sent ${stats.messages_sent} messages`;
                    } else {
                      statCounterEmbed.name  = 'Messaging Stats';
                      statCounterEmbed.value = `Sent ${stats.messages_sent} messages`;
                    }
                    embedObj.fields.push(statCounterEmbed);

                    // status field
                    let statusField = {
                      name: 'Status',
                      inline:true
                    };

                    if (bot.servers[serverID].members[userID].status) {
                      if (stats.last_status_time) {
                          const statusM = moment.utc(stats.last_status_time);
                          statusField.value = `${util.upperFirstLetter(bot.servers[serverID].members[userID].status)} for ${statusM.toNow(true)}`;
                      } else {
                          statusField.value = `${util.upperFirstLetter(bot.servers[serverID].members[userID].status)}`;
                      }
                    } else {
                      statusField.value = `Offline`;
                    }
                    if (bot.users[userID].game && bot.users[userID].game.name) {
                        let currentActivity;
                        if (stats.last_game_time) {
                            const playingM = moment.utc(stats.last_game_time);
                            currentActivity = `${bot.users[userID].game.name} (${playingM.toNow(true)})`;
                        } else {
                            currentActivity = `${bot.users[userID].game.name}`;
                        }
                        statusField.value += `\n${currentActivity}`;
                    }
                    embedObj.fields.push(statusField);

                    // last interaction field
                    let lastSpokeM;
                    let lastInteraction;
                    if (stats.last_spoke) {
                        lastSpokeM = moment.utc(stats.last_spoke);
                        lastInteraction = lastSpokeM.fromNow();
                    } else {
                        lastInteraction = 'unknown';
                    }
                    embedObj.fields.push({
                      name: 'Last Interaction',
                      value: lastInteraction,
                      inline:true
                    });

                    // details field (created/joined)
                    const timestamp = new Date(
                      parseInt(bot.users[userID].id) / 4194304 + 1420070400000
                    );
                    const createdM = moment.utc(timestamp);
                    const joinedM = moment.utc(
                      bot.servers[serverID].members[userID].joined_at
                    );
                    embedObj.fields.push({
                      name: 'Historical',
                      value: `Created: ${createdM.fromNow()}\nJoined:    ${joinedM.fromNow()}`,
                      inline:true
                    });

                    // game history field
                    if (stats.game_history && stats.game_history.length > 0) {
                      embedObj.fields.push({
                        name:'Game History',
                        value: stats.game_history.reverse().join(', '),
                        inline: true
                      });
                    }

                    /*
                    // roles field
                    const roles = [];
                    bot.servers[serverID].members[userID].roles.forEach(
                      function(role) {
                        roles.push(bot.servers[serverID].roles[role].name.replace('@', ''));
                      }
                    );

                    roles.push('everyone');
                    embedObj.fields.push({
                      name: 'Server Roles',
                      value: roles.join(', '),
                      inline:true
                    });
                    */

                    // send the message
                    bot.sendMessage({
                        to: meta.channelID,
                        message: '',
                        embed: embedObj
                    });
                });
            }
        }
    };
};
