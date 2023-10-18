const { Sequelize } = require('sequelize');
const { SecretsManagerClient, GetSecretValueCommand } = require("@aws-sdk/client-secrets-manager");
const AWS = require('aws-sdk');
const { readFileSync } = require('node:fs');

let secretsManager = new SecretsManagerClient();
let { DB_SECRET_ARN, DB_PROXY_ENDPOINT, REGION } = process.env;
AWS.config.update({region: REGION});
 
const getSecret = async () => {
    try {
      const data = await secretsManager.send( new GetSecretValueCommand({ SecretId: DB_SECRET_ARN }));
      console.log('secrets: ', data.SecureString) // Testing purposes, need to check output
      return JSON.parse(data.SecretString)
      
    } catch (error) {
      console.error('Error fetching database credentials from Secrets Manager:', error);
      throw error;
    }
  };
  

exports.handler = async function (event, context) {
    let credentials = await getSecret()
    console.log(readFileSync('./ssl/us-east-1-bundle.pem').toString())
    const sequelize = new Sequelize(credentials.engine, credentials.username, credentials.password, {
        host: DB_PROXY_ENDPOINT, 
        dialect: "postgres", 
        dialectOptions: {
          ssl: {
            ca: readFileSync('./ssl/us-east-1-bundle.pem').toString()
          }
        }
    })
    
    try {
      await sequelize.authenticate();
      console.log('Connection has been established successfully.');
    } catch (error) {
      console.error('Unable to connect to the database:', error);
    }

    // if (!sequelize) {
    //     sequelize = await loadSequelize(connectionConfig);

    // } else {     
    //     sequelize.connectionManager.initPools();
    //     if (sequelize.connectionManager.hasOwnProperty("getConnection")) {
    //         delete sequelize.connectionManager.getConnection;
    //     }
    // }
    
    //     const operation = event
    //     // console.log("event info: ", event.info)
    //     switch (operation) {
    //         case 'createVenue':
    //             console.log(`${operation} case `)
    //             // Handle the "createVenue" mutation
    //             // Parse and process input, create a new Venue record
    //             break;
          
    //         case 'updateVenue':
    //             console.log(`${operation} case `)
    //             // Handle the "updateVenue" mutation
    //             // Parse and process input, update an existing Venue record
    //             break;
    
    //         case 'deleteVenue':
    //             console.log(`${operation} case `)
    //             // Handle the "deleteVenue" mutation
    //             // Parse and process input, delete a Venue record
    //             break;
    
    //         case 'getVenue':
    //             console.log(`${operation} case `)
    //             // Handle the "getVenue" query
    //             // Retrieve a Venue record by ID and return it
    //             break;
    
    //         case 'listVenues':
    //             console.log(`${operation} case `)
    //             // Handle the "listVenues" query
    //             // Retrieve a list of Venue records based on filters and return them
    //             break;
    
    //         case 'onCreateVenue':
    //             console.log(`${operation} case `)
    //             // Handle the "onCreateVenue" subscription
    //             // Subscribe to new Venue creations
    //             break;
    
    //         case 'onUpdateVenue':
    //             console.log(`${operation} case `)
    //             // Handle the "onUpdateVenue" subscription
    //             // Subscribe to Venue updates
    //             break;
    
    //         case 'onDeleteVenue':
    //             console.log(`${operation} case `)
    //             // Handle the "onDeleteVenue" subscription
    //             // Subscribe to Venue deletions
    //             break;
    
    //         default:
    //             // Invalid operation
    //             console.error('Invalid operation - did not meet any case.')
    //     }
        
    //     // await sequelize.connectionManager.close();
    //     return payload;

    // } catch (error) {
    //     console.error('Error:', error);
    // }
}
