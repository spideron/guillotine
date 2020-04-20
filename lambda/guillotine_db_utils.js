const AWS = require('aws-sdk');
const dynamoClient = new AWS.DynamoDB.DocumentClient();
const ddb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });
const tables = {
    nobles: 'NobleCards',
    actions: 'ActionCards',
    games: 'Games',
    players: 'Players'
};

const guillotineUtils = require('./guillotine_utils.js');
var nobleCards, actionCards, nobleCardsIds, actionCardsIds;

AWS.config.update({
    region: "us-west-2"
});

// Scan a DynamoDB table and get all it's attributes
function scan_table(tableName) {
    var params = {
        TableName: tableName,
        Select: "ALL_ATTRIBUTES"
    };

    var promise = new Promise(function(resolve, reject) {
        dynamoClient.scan(params, function(err, data) {
            if (err) {
                console.error("Unable to scan item. Error JSON:", JSON.stringify(err, null, 2));
                reject(Error(err));
            }
            else {
                resolve({ cards: data.Items });
            }
        });
    });

    return promise;
}

function getItemById(tableName, keyField, id) {
    var params = {
        TableName: tableName,
        Key: {}
    };

    params.Key[keyField] = id;

    var promise = new Promise(async function(resolve, reject) {
        dynamoClient.get(params, await
            function(err, data) {
                if (err) {
                    console.log("Error", err);
                    reject(Error(err));
                }
                else {
                    if (!Object.keys(data).length) {
                        // no result returned
                        resolve({ err: 'No data found for ' + keyField + '=' + id });
                    }
                    else {
                        resolve(data.Item);
                    }
                }
            });
    });

    return promise;
}

// Get all the noble cards and cache it locally
async function get_all_noble_cards() {
    if (!nobleCards) {
        nobleCards = await scan_table(tables.nobles);
    }
    return nobleCards;
}

// Get all the actions card an cache it locally
function get_all_action_cards() {
    if (!actionCards) {
        actionCards = scan_table(tables.actions);
    }
    return actionCards;
}

// Get all the noble cards id an cache it locally
async function getAllNobleCardsIds() {
    if (!nobleCardsIds) {
        let cardsObject = await get_all_noble_cards();
        nobleCardsIds = guillotineUtils.getIds(cardsObject.cards, 'CardId');
    }
    return nobleCardsIds;
}

// Get all the action cards id an cache it locally
async function getAllActionCardsIds() {
    if (!actionCardsIds) {
        let cardsObject = await get_all_action_cards();
        actionCardsIds = guillotineUtils.getIds(cardsObject.cards, 'CardId');
    }
    return actionCardsIds;
}


async function getGame(gameId) {
    var game = await getItemById(tables.games, "GameId", gameId);

    return game;
}

// Crate a new item in the Games table
async function createGame() {
    var nobleCards = await getAllNobleCardsIds();
    var actionCards = await getAllActionCardsIds();

    guillotineUtils.shuffleArr(nobleCards);
    guillotineUtils.shuffleArr(actionCards);

    var params = {
        TableName: tables.games,
        Item: {
            'GameId': { S: guillotineUtils.generateId() },
            'CreatedAt': { S: (new Date()).toISOString() },
            'GameDay': { N: '1' },
            'NoblesCardsDeck': { SS: nobleCards },
            'ActionsCardsDeck': { SS: actionCards },
            'GameState': { S: 'Created' }
        }
    };

    var promise = new Promise(async function(resolve, reject) {
        ddb.putItem(params, await
            function(err, data) {
                if (err) {
                    console.log("Error", err);
                    reject(Error(err));
                }
                else {
                    resolve({
                        gameId: params.Item.GameId.S,
                        createdAt: params.Item.CreatedAt.S,
                        state: params.Item.GameState.S
                    });
                }
            });
    });

    return promise;
}

// Change the game state
async function changeGameState(gameId, gameState) {
    var params = {
        TableName: tables.games,
        Key: {
            "GameId": gameId
        },
        UpdateExpression: "set GameState = :s",
        ConditionExpression: "GameId = :gid",
        ExpressionAttributeValues: {
            ":s": gameState,
            ":gid": gameId
        },
        ReturnValues: "UPDATED_NEW"
    };

    var promise = new Promise(async function(resolve, reject) {
        dynamoClient.update(params, await
            function(err, data) {
                if (err) {
                    if (err.code == 'ConditionalCheckFailedException') {
                        // game dows not exists
                        resolve({
                            err: 'Game ' + gameId + ' does not exists'
                        });
                    }
                    console.log("Error", err);
                    reject(Error(err));
                }
                else {
                    resolve({
                        gameId: gameId,
                        state: gameState
                    });
                }
            });
    });

    return promise;
}

// Delete an item from the Games table
async function deleteGame(gameId) {
    const params = {
        TableName: tables.games,
        Key: {
            GameId: { S: gameId }
        }
    };

    var promise = new Promise(async function(resolve, reject) {
        ddb.deleteItem(params, await
            function(err, data) {
                if (err) {
                    console.log("Error", err);
                    reject(Error(err));
                }
                else {
                    resolve({
                        gameId: gameId,
                        state: 'deleted'
                    });
                }
            });
    });

    return promise;
}

async function createPlayer(name) {
    var params = {
        TableName: tables.players,
        Item: {
            'PlayerId': { S: guillotineUtils.generateId() },
            'CreatedAt': { S: (new Date()).toISOString() },
            'PlayerName': { S: name }
        }
    };

    var promise = new Promise(async function(resolve, reject) {
        ddb.putItem(params, await
            function(err, data) {
                if (err) {
                    console.log("Error", err);
                    reject(Error(err));
                }
                else {
                    resolve({
                        playerId: params.Item.PlayerId.S,
                        createdAt: params.Item.CreatedAt.S
                    });
                }
            });
    });

    return promise;
}

async function getPlayer(playerId){
    var player = await getItemById(tables.players, "PlayerId", playerId);

    return player;
}

function isPlayerInGame(game, playerId) {
    return game && game.Players && game.Players.indexOf(playerId) > -1;
}

async function updateGamePlayers(gameId, players){
    const params = {
        TableName: tables.games,
        Key: {
            "GameId": gameId
        },
        UpdateExpression: "set Players = :p",
        ConditionExpression: "GameId = :gid",
        ExpressionAttributeValues: {
            ":p": players,
            ":gid": gameId
        },
        ReturnValues: "UPDATED_NEW"
    };

    var promise = new Promise(async function(resolve, reject) {
        dynamoClient.update(params, await
            function(err, data) {
                if (err) {
                    if (err.code == 'ConditionalCheckFailedException') {
                        // game dows not exists
                        resolve({
                            err: 'Game ' + gameId + ' does not exists'
                        });
                    }
                    console.log("Error", err);
                    reject(Error(err));
                }
                else {
                    resolve({
                        gameId: gameId,
                        players: players
                    });
                }
            });
    });

    return promise;
}

async function playerJoinGame(playerId, gameId) {
    const game = await getGame(gameId);
    const player = await getPlayer(playerId);

    if (game.err) {
        return game;
    }
    
    if(player.err){
        return player;
    }

    if (game.GameState != 'Created') {
        return {
            err: 'cannot add player ' + playerId + ' to game ' + gameId +
                '. The game state is ' + game.GameState
        };
    }

    if (isPlayerInGame(game, playerId)) {
        return { err: 'player ' + playerId + ' has already joined game ' + gameId };
    }

    let players = game.Players || [];
    players.push(playerId);

    return updateGamePlayers(gameId, players);
}


async function playerLeaveGame(playerId, gameId) {
    const game = await getGame(gameId);
    const player = await getPlayer(playerId);

    if (game.err) {
        return game;
    }
    
    if(player.err){
        return player;
    }
    
    if(!isPlayerInGame(game, playerId)){
        return {gameId: gameId, players: game.Players};
    }
    
    let players = game.Players;
    players.splice(game.Players.indexOf(playerId), 1);
    
    return updateGamePlayers(gameId, players);
}

async function playerDelete(playerId){
    const params = {
        TableName: tables.players,
        Key: {
            PlayerId: { S: playerId }
        }
    };

    var promise = new Promise(async function(resolve, reject) {
        ddb.deleteItem(params, await
            function(err, data) {
                if (err) {
                    console.log("Error", err);
                    reject(Error(err));
                }
                else {
                    resolve({
                        playerId: playerId,
                        state: 'deleted'
                    });
                }
            });
    });

    return promise;
}

exports.get_all_noble_cards = get_all_noble_cards;
exports.get_all_action_cards = get_all_action_cards;

exports.getGame = getGame;
exports.createGame = createGame;
exports.changeGameState = changeGameState;
exports.deleteGame = deleteGame;

exports.getPlayer = getPlayer;
exports.createPlayer = createPlayer;
exports.playerJoinGame = playerJoinGame;
exports.playerLeaveGame = playerLeaveGame;
exports.playerDelete = playerDelete;