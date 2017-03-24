module.exports = function command(bot, container) {

    // dependancies------------------------------
    const statTracker = container.util.usePlugin('statTracker');
    const shortNumber = require('short-number');

    // command-----------------------------------
    return {
        description: 'Lists attainable message ranks for this server',
        permissions: 'public',
        action: function(meta) {
          if (
            statTracker.config.levelUp[meta.server]
            && statTracker.config.levelUp[meta.server].ranks
          ) {
            const ranks = statTracker.config.levelUp[meta.server].ranks.map(
              (x, i) => {
                return `${x.rank} (${shortNumber(x.postReq)}+)`;
              }
            );
            let embedObj = {
              type: 'rich',
              title: `Message Ranks for ${bot.servers[meta.server].name}`,
              description: 'These are ranks earned by chatting on this server',
              color: container.util.toColorInt('919191'),
              fields:[{
                name: 'Ranks',
                value: ranks.join('\n')
              }]
            };

            bot.sendMessage({
              to: meta.channelID,
              message: ``,
              embed: embedObj
            });
          }
          /*
            let celcius = false;
            meta.input = meta.input.trim().toLowerCase();
            if (meta.input.endsWith('--c')) {
              celcius = true;
              meta.input = meta.input.replace(/\-\-c/g, '');
            }
            weather.getWeather(meta.input, (error, response) => {
              if (error) {
                bot.sendMessage({
                  to: meta.channelID,
                  message: `:information_source: <@${meta.userID}> ${error}`
                });
              } else {
                const momentNow = moment(new Date()).tz(response.timezone);

                let embedObj = {
                  type: 'rich',
                  title: `Weather for ${response.address}`,
                  description: `[Powered by Dark Sky](https://darksky.net/poweredby/)\n${response.hourly.summary} ${response.daily.summary} [Click here to see the map](https://maps.darksky.net/@temperature,${response.latitude},${response.longitude},5).`,
                  color: container.util.toColorInt('9c00cf'),
                  fields:[],
                  footer: {
                    text: `${momentNow.format('h:mma dddd, MM-DD-YYYY')} (${response.timezone})`,
                    icon_url: 'http://cdn.fortiscoregaming.com/claptrap/darksky-icons/clock.png'
                  },
                  thumbnail: {
                    url: `http://cdn.fortiscoregaming.com/claptrap/darksky-icons/${response.currently.icon}.png`,
                  }
                };

                // alerts
                if (response.alerts && response.alerts.length > 0) {
                  response.alerts.forEach((alert)=> {
                    embedObj.fields.push({
                      name: `${alert.title}`,
                      value: `${alert.description}`,
                      inline: false
                    });
                  });
                }

                // current conditions
                let curTemp = celcius ? `${Math.round((response.currently.temperature-32)*5/9)}°C` : `${Math.round(response.currently.temperature)}°F`;
                embedObj.fields.push({
                  name: 'Current',
                  value: `${curTemp}\n${(response.currently.humidity * 100).toFixed(0)}% Humidity\n${(response.currently.precipProbability * 100).toFixed(0)}% Precipitation\n${weather.concatSummary(response.currently.summary)}\n_ _`,
                  inline: true
                });

                // forecast
                let daysAdded = 0;
                response.daily.data.forEach((day) => {
                  if (daysAdded < 5) {
                    daysAdded++;
                    const momentDay = daysAdded === 1 ? momentNow: momentNow.add(1, 'day');
                    const dayName = daysAdded === 1 ? `Today` : momentDay.format('dddd');

                    let dayMin = celcius ? `${Math.round((day.temperatureMin-32)*5/9)}°C` : `${Math.round(day.temperatureMin)}°F`;
                    let dayMax = celcius ? `${Math.round((day.temperatureMax-32)*5/9)}°C` : `${Math.round(day.temperatureMax)}°F`;

                    embedObj.fields.push({
                      name: `${dayName}`,
                      value: `${dayMin} / ${dayMax}\n${(day.humidity * 100).toFixed(0)}% Humidity\n${(day.precipProbability * 100).toFixed(0)}% Precipitation\n${weather.concatSummary(day.summary)}\n _ _`,
                      inline: true
                    });
                  }
                });

                // send the message
                bot.sendMessage({
                    to: meta.channelID,
                    message: '',
                    embed: embedObj
                });
              }
            });
            */
        }
    };
};

