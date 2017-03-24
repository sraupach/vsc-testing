/*
    Database + Stats

    Author:  Frosthaven
    Twitter: @thefrosthaven

    Description:
        This library initializes a NEDB database and also
        tracks useful statistics on users.
*/

module.exports = function dbStorage(bot, container) {

    const lib = {};

    // reference---------------------------------
    const util = container.util;

    // dependancies------------------------------
    const chalk        = require('chalk');
    const NEDB         = require('nedb');

    // setup-------------------------------------
    lib.client         = null;

    // lib---------------------------------------
    /**
     * logs db events to the console
     * @param  {string} msg [the message to send]
     */
    lib.log = function(msg) {
        console.log(chalk.magenta(`[db storage]: ${msg}`));
    };

    /**
     * initializes the database
     */
    lib.init = function() {
        // configure the new client configuration
        lib.client = new NEDB({filename: 'storage.nedb'});

        // load the database
        lib.client.loadDatabase(function(err) {
            bot.emit('dbready');
        });

        // log the output
        console.log('');
        lib.log(chalk.green('loaded database using file `storage.nedb`'));
    };

    /**
     * shorthand method to compact the database file
     */
    lib.compact = function() {
        if (lib.client) {
            lib.client.persistence.compactDatafile();
        }
    };

    // bot events --------------------------------------------
    bot.on('ready', function(event) {
        lib.init();

        util.registerTask('db-compact', 10, function() {
            lib.compact();
        });
    });

    // return ------------------------------------------------
    return lib;
};

