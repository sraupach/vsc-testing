/*
    Stat Tracker

    Author:  Frosthaven
    Twitter: @thefrosthaven

    Description:
        This plugin tracks user statistics and provides
        a method to grab those statistics from the db
*/

module.exports = function plugin(client, container, pconfig) {

    const plugin = {};

    // reference---------------------------------
    const db   = container.db;

    // plugin------------------------------------
    let trackingSince = null;

    // events------------------------------------
    client.on('dbready', function() {
        db.client.findOne({type: 'global-stats'}, function(err, globalStats) {
            if (globalStats) {
                trackingSince = globalStats.tracking_since;
            } else {
                // we need to create the global stats
                globalStats = {
                    type: 'global-stats',
                    tracking_since: Date.now()
                };

                // insert the stats
                db.client.insert(globalStats, function(err, globalStats) {
                    trackingSince = globalStats.tracking_since;
                });
            }
        });
    });
    client.on('presence', function(user, userID, status, game, rawEvent) {
        const serverID = rawEvent.d.guild_id;
        db.client.findOne({type: 'user-stats', userID: userID, serverID: serverID}, function(err, userStats) {
            if (userStats) {
                // did the game change?
                if (game) {
                  // update the game history
                  if (!userStats.game_history) {
                    userStats.game_history = [];
                  }

                  if (game.name
                  && !userStats.game_history.includes(game.name)) {
                    userStats.game_history.push(game.name);

                    // ensure we only store the last n applications
                    const maxRemembered = pconfig.rememberedGames;
                    if (userStats.game_history.length > maxRemembered) {
                      // we need to splice from the top of the array
                      const difference = userStats.game_history.length
                                       - maxRemembered;
                      userStats.game_history.splice(0, difference);
                    }
                  } else if (game.name
                  && userStats.game_history.includes(game.name)) {
                    // remove it from the array and then add it to the top
                    const fIndex = userStats.game_history.indexOf(game.name);
                    userStats.game_history.splice(fIndex, 1);
                    userStats.game_history.push(game.name);
                    /*
                    userStats.game_history.splice(
                      0,
                      fIndex,
                      userStats.game_history.splice(fIndex, 1)[0]
                    );
                    */
                  }
                } else {
                  game = {type: 0, url: null, name: undefined};
                }
                if (userStats.last_game !== game.name) {
                    userStats.last_game_time = Date.now();
                }

                // did the status change?
                if (userStats.last_status !== status) {
                    userStats.last_status_time = Date.now();
                }

                // update the data
                db.client.update({
                  type:'user-stats',
                  userID: userStats.userID,
                  serverID: userStats.serverID
                }, {$set: {
                  game_history: userStats.game_history,
                  last_seen: Date.now(),
                  last_game: game.name,
                  last_game_time: userStats.last_game_time,
                  last_status: status,
                  last_status_time: userStats.last_status_time}
                });
            } else {
                userStats = {
                    type:             'user-stats',
                    userID:           userID,
                    serverID:         serverID,
                    last_seen:        Date.now(),
                    messages_sent:    0,
                    links_sent:       0,
                    mentions_sent:    0
                };
                db.client.insert(userStats);
            }
        });
    });

    client.on('message', function(user, userID, channelID, message, event) {
        // fetch the user
        const isDirectMessage = channelID in client.directMessages ? true : false;
        if (!isDirectMessage) {
            const serverID = client.channels[channelID].guild_id;
            db.client.findOne({type: 'user-stats', userID: userID, serverID: serverID}, function(err, userStats) {
                if (userStats) {
                    // update the details
                    userStats.messages_sent++;
                    if(new RegExp('([a-zA-Z0-9]+://)([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?(/.*)?').test(message)) {
                        userStats.links_sent++;
                    }
                    const regexp = /(<\@[a-zA-Z0-9]+>)/g;
                    let m;
                    let matches = [];
                    do {
                        m = regexp.exec(message);
                        if (m) {
                            matches.push(m[1]);
                        }
                    } while(m);
                    userStats.mentions_sent = userStats.mentions_sent
                                            + matches.length;

                    // update the stats
                    db.client.update({type:'user-stats', userID: userID, serverID: serverID}, {$set: {messages_sent: userStats.messages_sent, links_sent: userStats.links_sent, mentions_sent: userStats.mentions_sent, last_seen: Date.now(), last_spoke: Date.now()}});
                } else {
                    // create the user stats object and save it
                    userStats = {
                        type:             'user-stats',
                        userID:           userID,
                        serverID:         serverID,
                        last_seen:        Date.now(),
                        last_spoke:       Date.now(),
                        messages_sent:    0,
                        links_sent:       0,
                        mentions_sent:    0,
                        game_history:     []
                    };

                    // update the stat counters
                    userStats.messages_sent++;
                    if(new RegExp('([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?(/.*)?').test(message)) {
                        userStats.links_sent++;
                    }
                    const regexp = /(<\@[a-zA-Z0-9]+>)/g;
                    let m;
                    let matches = [];
                    do {
                        m = regexp.exec(message);
                        if (m) {
                            matches.push(m[1]);
                        }
                    } while(m);
                    userStats.mentions_sent = userStats.mentions_sent
                                            + matches.length;

                    // insert the stats
                    db.client.insert(userStats);
                }

                // now for the levelUp segment
                if (pconfig.levelUp[userStats.serverID]
                && pconfig.levelUp[userStats.serverID].reportToChannel) {
                  // we have levelUp support
                  const channelID = pconfig
                                    .levelUp[userStats.serverID]
                                    .reportToChannel;
                  const rank      = plugin.getRankFromMessageCount(
                                      userStats.serverID,
                                      userStats.messages_sent
                                    );

                  // did we announce this user's rank yet?
                  if (
                    (
                      !userStats.announcedRankAt
                      || userStats.announcedRankAt !== rank.postReq
                    )
                    && !client.servers[userStats.serverID]
                       .members[userStats.userID].bot
                  ) {
                    // announce the rank and save the value of announced rank to
                    // the database
                    if (rank && rank.message) {
                      const levelUpMessage = ':up: ' + rank.message
                                .replace(/\%rank/g, `\`${rank.rank}\``)
                                .replace(/\%user/g, `<@${userStats.userID}>`);

                      // update the announced details and send the message
                      db.client.update({type:'user-stats', userID: userStats.userID, serverID: userStats.serverID}, {$set: {announcedRankAt: rank.postReq}});

                      client.sendMessage({
                        to: channelID,
                        message: levelUpMessage
                      });
                    }
                  }
                }
            });
        }
    });

    // methods-----------------------------------

    /**
     * @param {string} serverID the server id currently in use
     * @param {number} messageCount the number of messages sent by the user
     * @return {object} the rank object which contains useful rank details
     */
    plugin.getRankFromMessageCount = (serverID, messageCount) => {
      if (pconfig.levelUp[serverID] && pconfig.levelUp[serverID].ranks) {
        let   theRank    = null;
        const rankLength = pconfig.levelUp[serverID].ranks.length;

        for (let i = rankLength-1; i >= 0; --i) {
          if (messageCount >= pconfig.levelUp[serverID].ranks[i].postReq) {
            theRank = pconfig.levelUp[serverID].ranks[i];
            theRank.numeric = i+1;
            theRank.total   = rankLength;
            break;
          }
        }

        return theRank;
      } else {
        return false;
      }
    };

    /**
     * returns the tracking_since Date value
     * @return {Date} [date of when tracking started]
     */
    plugin.getTrackingSince = function() {
        return trackingSince;
    };

    /**
     * returns all saved statistics for a given user
     * @param  {string}   serverID [the server id]
     * @param  {string}   userID   [the user id]
     * @param  {Function} callback [code to run once stats are obtained]
     */
    plugin.getUserStats = function(serverID, userID, callback) {
        db.client.findOne({type: 'user-stats', userID: userID, serverID: serverID}, function(err, userStats) {

            if (userStats) {
                // check if bot
                if (client.users[userID].bot) {
                    userStats.bot = true;
                }
                callback(userStats);
            } else {
                // create the user stats object and save it
                userStats = {
                    type:             'user-stats',
                    userID:           userID,
                    serverID:         serverID,
                    messages_sent:    0,
                    links_sent:       0,
                    mentions_sent:    0
                };

                /*
                // insert the stats
                db.insert(userStats, function(err, userStats) {
                    // check if bot
                    if (bot.users[userID].bot) {
                        userStats.bot = true;
                    }
                    callback(userStats);
                });
                */
            }
        });
    };

    return plugin;
};
