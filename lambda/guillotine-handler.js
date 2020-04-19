const connectionManager = require('./connection_manager.js');
const db_utils = require("./guillotine_db_utils.js");

const successfullResponse = {
  statusCode: 200,
  body: 'Connected'
};

module.exports.connectionManager = connectionManager.connectionManager;
module.exports.defaultMessage = connectionManager.defaultMessage;


module.exports.getAllNobleCards = async (event, context, callback) => {
    const cards = await db_utils.get_all_noble_cards();
    console.log(cards);
    
    return await connectionManager.sendMessage(
      cards,
      event.requestContext.domainName,
      event.requestContext.connectionId);
};

// module.exports.sendMessage = async (event, context, callback) => {
//   let connectionData;
//   try {
//     connectionData = await DDB.scan({
//       TableName: process.env.CONNECTION_TABLE,
//       ProjectionExpression: "connectionId"
//     }).promise();
//   } catch (err) {
//     console.log(err);
//     return { statusCode: 500 };
//   }
//   const postCalls = connectionData.Items.map(async ({ connectionId }) => {
//     try {
//       return await send(event, connectionId.S);
//     } catch (err) {
//       if (err.statusCode === 410) {
//         return await deleteConnection(connectionId.S);
//       }
//       console.log(JSON.stringify(err));
//       throw err;
//     }
//   });

//   try {
//     await Promise.all(postCalls);
//   } catch (err) {
//     console.log(err);
//     callback(null, JSON.stringify(err));
//   }
//   callback(null, successfullResponse);
// };








