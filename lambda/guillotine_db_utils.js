const AWS = require('aws-sdk');
const dynamoClient = new AWS.DynamoDB.DocumentClient();
const ddb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });
const tables = {
    nobles: 'NobleCards',
    actions: 'ActionCards',
    games: 'Games'
}
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
                    if(err.code == 'ConditionalCheckFailedException'){
                        // game dows not exists
                        resolve({
                            err: 'Game ' + gameId + ' does not exists'
                        })
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


exports.get_all_noble_cards = get_all_noble_cards;
exports.get_all_action_cards = get_all_action_cards;
exports.createGame = createGame;
exports.changeGameState = changeGameState;
exports.deleteGame = deleteGame;
