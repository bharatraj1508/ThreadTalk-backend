const crypto = require("crypto");
const { faker } = require("@faker-js/faker");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = mongoose.model("User");

const randomString = (length) => {
  return crypto.randomBytes(Math.ceil(length / 2)).toString("hex");
};

// this function will generate random account provided with the number of accounts needed to create using faker js
// const genrateAccounts = (numOfAccounts) => {
//   const accounts = [];

//   for (let i = 0; i < numOfAccounts; i++) {
//     const firstName = faker.person.firstName();
//     const lastName = faker.person.lastName();
//     const email = faker.internet.email(firstName, lastName);

//     // Generating a salt and hashing the password
//     const salt = bcrypt.genSaltSync(10);
//     const password = bcrypt.hashSync("password", salt);

//     accounts.push({
//       first_name: firstName,
//       last_name: lastName,
//       email: email,
//       password: password,
//       verified: false,
//       roles: ["user"],
//       faker: true,
//     });
//   }

//   return accounts;
// };

const generateQuestionPosts = async (numOfQuestions) => {
  const questions = [];

  const users = await User.find();

  for (let i = 0; i < numOfQuestions; i++) {
    const body = faker.lorem.sentence();
    const tags = faker.lorem.words(3).split(" ");
    const randomUserIndex = Math.floor(Math.random() * users.length);
    const author = users[randomUserIndex]._id;

    const views = Math.floor(Math.random() * 100000);

    questions.push({
      body,
      tags,
      author,
      views,
      faker: true,
    });
  }

  return questions;
};

module.exports = {
  randomString,
  generateQuestionPosts,
};
