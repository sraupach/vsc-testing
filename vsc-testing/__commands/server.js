module.exports = function command(bot, container) {

  // command-----------------------------------
  return {
    alias: ['srv'],
    description: 'get Home-Server Information',
    permissions: 'private',
    action: function (meta) {

      /*; 
      ## Spot to enhance the command to get other Servers Information
      let serverID;
      if (meta.input.trim() === '') {
        serverID = meta.server;
      } else {
        serverID = meta.input;
      }
      */
      var sname = bot.servers[meta.server].name;
      var sregion = bot.servers[meta.server].region;
      var sowner = bot.users[bot.servers[meta.server].owner_id].username;
      var owner = sowner + '#' + bot.users[bot.servers[meta.server].owner_id].discriminator
      var members = bot.servers[meta.server].member_count;
      var tc = []
      var vc = []
      for (var chanID in bot.servers[meta.server].channels) {
        if (bot.servers[meta.server].channels[chanID].type === "text") {
          tc.push(bot.servers[meta.server].channels[chanID].name);
        } else {
          vc.push(bot.servers[meta.server].channels[chanID].name);
        }
      }

      let embedObj = {
        type: 'rich',
        title: 'Server Information',
        description: '',
        color: container.util.toColorInt('AF00FF'),
        fields: [],
        thumbnail: {
          url: 'http://vignette3.wikia.nocookie.net/rocketleague/images/d/d0/Discord_logo.png',
          proxy_url: ''  // optional
        }
      };

      // Add Servername
      embedObj.fields.push({
        name: `Servername: `,
        value: sname,
        inline: true
      });
      // Add Region
      embedObj.fields.push({
        name: `Region: `,
        value: sregion,
        inline: true
      });
      // Add Owner
      embedObj.fields.push({
        name: `Owner: `,
        value: owner,
        inline: true
      });
      // Add Members
      embedObj.fields.push({
        name: `Members: `,
        value: members,
        inline: true
      });
      if (meta.isHome) {
        // Add Text-Channel
        embedObj.fields.push({
          name: `Text-Channel`,
          value: tc.join("\n"),
          inline: true
        });
        // Add Voice-Channel
        embedObj.fields.push({
          name: `Voice-Channel`,
          value: vc.join("\n"),
          inline: true
        });
      }
      // send the message
      bot.sendMessage({
        to: meta.channelID,
        message: '',
        embed: embedObj
      });

    }
  };
};
