const connectionManager = require('./connection_manager.js');
const db_utils = require("./guillotine_db_utils.js");

module.exports.handler = async(event, context, callback) => {
    let body;
    let result = 'success';
    try {
        body = JSON.parse(event.body);
    }
    catch (e) {
        console.log(e);
        result = 'failure';
    }

    let respone;
    switch (body.action) {
        case 'get':
            respone = await db_utils.getPlayer(body.playerId);
            break;
        case 'create':
            respone = await db_utils.createPlayer(body.name);
            break;
        case 'join':
            respone = await db_utils.playerJoinGame(body.playerId, body.gameId);
            break;
        case 'leave':
            respone = await db_utils.playerLeaveGame(body.playerId, body.gameId);
            break;
        case 'delete':
            respone = await db_utils.playerDelete(body.playerId);
            break;
        default:
            result = 'failure';
            respone = 'Unkokwn action ' + body.action;
            console.log(new Error(body.action + ' action not implemented'));
            break;
    }

    if (respone.err) {
        result = 'failure';
        body.response = respone.err;
    }
    else {
        body.response = respone;
    }

    body.result = result;

    return await connectionManager.sendMessage(
        body,
        event.requestContext.domainName,
        event.requestContext.connectionId);

};
