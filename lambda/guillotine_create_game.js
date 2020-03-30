const db_utils = require("./guillotine_db_utils.js");


exports.handler = function(event, context) {
    return db_utils.createGame();
};