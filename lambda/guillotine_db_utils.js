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
            'ActionsCardsDeck': { SS: actionCards }
        }
    };

    var promise = new Promise(async function(resolve, reject) {
        ddb.putItem(params, await function(err, data) {
            if (err) {
                console.log("Error", err);
                reject(Error(err));
            }
            else {
                resolve(params.Item);
            }
        });
    });

    return promise;
}


exports.get_all_noble_cards = get_all_noble_cards;
exports.get_all_action_cards = get_all_action_cards;
exports.createGame = createGame;
