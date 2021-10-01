const bcrypt = require('bcryptjs');
//Helper Functions
const findUserByEmail = (email, usersDb) => { //Check if user already exists
  for (let userId in usersDb) {
    const user = usersDb[userId];
    if (email === user.email) {
      return user;
    }
  }
  return false;
};

const createUser = (email, password, usersDb) => {  // Create a new user
  const userId = generateRandomString(); //Generate a random string
  usersDb[userId] = {
    id: userId,
    email,
    password: bcrypt.hashSync(password, 10)
  };
  return userId;
};

const authenticateUser = (email, password, usersDb) => { // Check and retrieve the user from the userDb
  const userFound = findUserByEmail(email, usersDb);
  if (userFound) {
  } if (bcrypt.compareSync(password, userFound.password)) { // Check if password is correct
    return userFound; // Return user if password is correct    
  }
  return false; // Return false if password is not correct
};

//const extractUrlsForUser = (urlsDB, userID) {};

module.exports = { findUserByEmail, createUser, authenticateUser };