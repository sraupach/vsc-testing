/*
    Command Loader

    Author:  Frosthaven
    Twitter: @thefrosthaven

    Description:
        This module will dynamically load all *.js files
        in it's directory and add them to the commands
        object.
*/

module.exports = function pluginLoader(client, container) {

    const plugins = {};

    // dependancies------------------------------
    const fs = require('fs');

    // dynamically load command files------------
    fs.readdir(__dirname, function(err, items) {
        if (err) {
            console.log(err);
        } else {
            let savePluginConfig = false;
            for (let i=0; i<items.length; i++) {
                if (items[i] !== '__loader.js' && items[i].endsWith('.js')) {
                    const pluginName = items[i].slice(0, -3);

                    // create the config entry for our plugin
                    if (!container.config.plugins[pluginName]) {
                        container.config.plugins[pluginName] = {};
                        container.config.plugins[pluginName].enabled = true;
                        savePluginConfig = true;
                    }

                    // load the plugin if it's enabled
                    if (container.config.plugins[pluginName].enabled) {
                        const pconfig = container.config.plugins[pluginName];
                        plugins[pluginName] = require(__dirname + '/' + items[i])(client, container, pconfig);
                        if (typeof plugins[pluginName] === 'object') {
                            plugins[pluginName].config = pconfig;
                        }
                    }
                }
            }

            if (savePluginConfig) {
                // we need to update the plugin settings file to include newly added content
                fs.writeFileSync('./settings/plugins.json', JSON.stringify(container.config.plugins, null, '\t'));
            }
        }
    });

    // return------------------------------------
    return plugins;
};
