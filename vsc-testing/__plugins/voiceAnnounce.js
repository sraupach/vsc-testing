/*
    Voice Announce

    Author:  Krasserdudu
    Twitter: @gexooo

    Description:
        Announce Voice-Channel join and leave
        on command it will list the current Voice Channel Users(+count)
*/

module.exports = function plugin(bot, container, pconfig) {

    // reference---------------------------------
    const config = container.config;
    const util = container.util
    // dependencies
    var LinkedList = require('singly-linked-list');
    var list = new LinkedList();

    list.clear();
    // plugin------------------------------------
    bot.on('any', function (event) {
        if (event.t == "VOICE_STATE_UPDATE") {
            if (event.d) {
                var usernick = bot.users[event.d.user_id].username;
                var userid = event.d.user_id
                var serverID = event.d.guild_id
                var serverName = bot.servers[serverID].name

                // OOOO hier musst du jetzt die ServerID raussuchen und dann in eine Var/Const schreiben, diese dann unten einfügen
                // bot.servers[serverID].channels[pconfig.Server[serverID].vcID].members) in members sind die Discord-IDs

                if (serverID in pconfig.Server) {
                    if (event.d.channel_id == pconfig.Server[serverID].vcID) {

                        if (list.contains(userid)) {
                            util.vlog(usernick + " in der Liste gefunden - (activ in Raid voice Channel)", serverName)
                        } else {
                            list.insert(userid)
                            var vcName = bot.servers[serverID].channels[event.d.channel_id].name
                            util.vlog(usernick + " added to List - Joined " + vcName + " Channel", serverName)

                            bot.sendMessage({
                                to: pconfig.Server[serverID].reportToChannel,
                                message: util.timestamp() + usernick + " joined"
                            });
                        };

                    } else {

                        if (list.contains(userid)) {
                            list.removeNode(userid)
                            util.vlog(usernick + " removed from List - Left Channel", serverName);

                            bot.sendMessage({
                                to: pconfig.Server[serverID].reportToChannel,
                                message: util.timestamp() + usernick + " left"
                            });
                        } else {
                            //console.log("User exisitert nicht in der Liste")
                        };
                        
                    };
                };
            };
        } else {

        };
    });

    // methods-----------------------------------

    /**
     * returns the current UserCount & all Users in Voice Channel
     */
    plugin.getVClist = function () {
        //hier muss die listenausgabe rein
        var voicelist = []
        var voicecount = list.getSize()
        if (voicecount > 0) {
            for (var i = 0; i < voicecount; i++) {
                vUID = list.findAt(i);
                user = bot.users[vUID].username;
                voicelist.push(user);
            }
        } else {
            voicelist = "No user found";

        }
        return [voicecount, voicelist];
    };
    /*
       
        bot.on('message', function(user, userID, channelID, message, event) {
            const dm = channelID in bot.directMessages ? true : false;
            const server = !dm ? bot.channels[channelID].guild_id : null;
            if (server === pconfig.home.server && userID !== bot.id) {
                /* jshint -W100 */ /*
    if (message.indexOf('(╯°□°）╯︵ ┻━┻') > -1) {
        bot.sendMessage({
            to: channelID,
            message: '┬─┬﻿ ノ( ゜-゜ノ)'
        });
    } else if (message.indexOf('┬─┬﻿ ノ( ゜-゜ノ)') > -1) {
        bot.sendMessage({
            to: channelID,
            message: `(╯°□°）╯︵ ┻━┻`
        });
    }
}
});

    var voicelist = []
    var vcName = client.servers[ServerID].channels[VCID].name
    var voicecount = list.getSize()
    if (voicecount > 0) {
        for(var i = 0; i < voicecount ; i++) {
                vUID = list.findAt(i);
                user = getNick(vUID);
                voicelist.push(user+"("+vUID+")");
        }
    } else {
            voicelist = "user found in "+vcName
    }
    send(channelID, voicecount+" "+voicelist);
*/

    //return true;
    return plugin;
};
