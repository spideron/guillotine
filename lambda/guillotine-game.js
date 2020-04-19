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
        case 'create':
            respone = await db_utils.createGame();
            break;
        case 'start':
            respone = await db_utils.changeGameState(body.gameId, 'started');
            break;
        case 'end':
            respone = await db_utils.changeGameState(body.gameId, 'ended');
            break;
        case 'delete':
            respone = await db_utils.deleteGame(body.gameId);
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
