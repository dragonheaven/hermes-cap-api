const Client = require('../db_apis/client');

const clients = [
  {
    email: 'john@gmail.com',
    firstName: 'John',
    lastName: 'Doe',
    country2cd: 'US'
  },
  {
    email: 'alex@gmail.com',
    firstName: 'Alex',
    country2cd: 'US'
  },
  {
    email: 'jack@gmail.com',
    firstName: 'Jack',
    country2cd: 'US'
  },
  {
    email: 'chris@gmail.com',
    firstName: 'Chris',
    country2cd: 'US'
  },
  {
    email: 'david@gmail.com',
    firstName: 'David',
    country2cd: 'US'
  },
  {
    email: 'lion@gmail.com',
    firstName: 'Lion',
    country2cd: 'US'
  }
];

const clientSeed = async () => {
  try {
    console.log('Clients seed start.');

    await Client.deleteAll();
    console.log('Delete All Clients.');

    await Promise.all(clients.map(async (client) => {
      await Client.create(client);
      return client;
    }));
    console.log('Create Clients Successfully');
  } catch (err) {
    console.log('clientSeed::', err);
    console.error(err);
  }
};

module.exports = clientSeed;
