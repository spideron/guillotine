'use strict';

const AWS = require('aws-sdk');
AWS.config.update({ region: process.env.AWS_REGION });
const DDB = new AWS.DynamoDB({ apiVersion: '2012-10-08' });
const Bluebird = require('bluebird');
const fetch = require('node-fetch');
fetch.Promise = Bluebird;
AWS.config.setPromisesDependency(Bluebird);
require('aws-sdk/clients/apigatewaymanagementapi');


const successfullResponse = {
  statusCode: 200,
  body: 'Connected'
};

const deleteConnection = connectionId => {
  const deleteParams = {
    TableName: process.env.CONNECTION_TABLE,
    Key: {
      ConnectionId: { S: connectionId }
    }
  };

  return DDB.deleteItem(deleteParams).promise();
};

const send = (data, endpoint, connectionId) => {
  const apigwManagementApi = new AWS.ApiGatewayManagementApi({
    apiVersion: "2018-11-29",
    endpoint: endpoint
  });
  return apigwManagementApi
    .postToConnection({ ConnectionId: connectionId, Data: JSON.stringify(data) })
    .promise();
};


module.exports.connectionManager = (event, context, callback) => {
  if (event.requestContext.eventType === 'CONNECT') {
    addConnection(event.requestContext.connectionId)
      .then(() => {
        callback(null, successfullResponse);
      })
      .catch(err => {
        callback(null, JSON.stringify(err));
      });
  } else if (event.requestContext.eventType === 'DISCONNECT') {
    deleteConnection(event.requestContext.connectionId)
      .then(() => {
        callback(null, successfullResponse);
      })
      .catch(err => {
        callback(null, {
          statusCode: 500,
          body: 'Failed to connect: ' + JSON.stringify(err)
        });
      });
  }
};

module.exports.defaultMessage = (event, context, callback) => {
  callback(null);
};

module.exports.sendMessage = send;

const addConnection = connectionId => {
  const putParams = {
    TableName: process.env.CONNECTION_TABLE,
    Item: {
      ConnectionId: { S: connectionId }
    }
  };

  return DDB.putItem(putParams).promise();
};