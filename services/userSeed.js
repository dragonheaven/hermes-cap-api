const User = require('../db_apis/user');

const userSeed = async () => {
  try {
    console.log('Users seed start.');

    await User.deleteAll();
    console.log('Delete All Users.');

    await User.create({
      email: 'john@gmail.com',
      password: '123456',
      firstName: 'John',
      lastName: 'Doe',
      role: 'hermes_capital'
    });

    await User.create({
      email: 'jack@gmail.com',
      password: '123456',
      firstName: 'Jack',
      lastName: 'Pa',
      role: 'crm'
    });

    await User.create({
      email: 'bill@gmail.com',
      password: '123456',
      firstName: 'Bill',
      lastName: 'Pa',
      role: 'client'
    });

    console.log('Create Users Successfully');
  } catch (err) {
    console.error(err);
  }
};

module.exports = userSeed;
