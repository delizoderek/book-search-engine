const { AuthenticationError } = require("apollo-server-express");
const { User } = require("../models");
const { signToken } = require("../utils/auth");

const resolvers = {
  Query: {
    // By adding context to our query, we can retrieve the logged in user without specifically searching for them
    users: async (parent) => {
      try {
        return User.find({});
      } catch (error) {
        console.log(error);
      }
    },

    me: async (parent, args, context) => {
        return User.findOne({ _id: '612c4cbcf9e503681869523a' });
      // return User.findOne({_id:'612c4cbcf9e503681869523a',})
      throw new AuthenticationError("You need to be logged in!");
    },
  },

  Mutation: {
    addUser: async (parent, { username, email, password }) => {
      try {
        const user = await User.create({ username, email, password });
        const token = signToken(user);
        return { token, user };
      } catch (error) {
        // console.log(error);
        throw new Error(error);
      }
    },

    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email: email });

      if (!user) {
        throw new AuthenticationError("No profile with this email found!");
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError("Incorrect password!");
      }

      const token = signToken(user);
      return { token, user };
    },

    // Set up mutation so a logged in user can only remove their profile and no one else's
    // saveBook(authors: $saveBookAuthors, description: $saveBookDescription, bookId: $saveBookBookId, title: $saveBookTitle)
    saveBook: async (parent, { newBook }, context) => {
      // If user not signed in then they cannot save a book
      if (!context.user) {
        throw new AuthenticationError("User not logged in!");
      }

      try {
        const bookUpdate = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $push: { savedBooks: { ...newBook } } },
          { new: true }
        );
        if (!bookUpdate) {
          throw new Error("Could not add the user");
        }
        return bookUpdate;
      } catch (err) {
        console.log(err);
      }
    },

    removeBook: async (parent, { bookId }, context) => {
      // If user not signed in then they cannot save a book
      if (!context.user) {
        throw new AuthenticationError("User not logged in!");
      }

      try {
        const bookUpdate = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId: bookId } } },
          { new: true }
        );

        if (!bookUpdate) {
          throw new Error("Could not add the user");
        }

        return bookUpdate;
      } catch (err) {
        console.log(err);
      }
    },
  },
};

module.exports = resolvers;
