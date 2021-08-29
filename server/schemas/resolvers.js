const { AuthenticationError } = require('apollo-server-express');
const { User,Book } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    // By adding context to our query, we can retrieve the logged in user without specifically searching for them
    me: async (parent, args, context) => {
      if (context.user) {
        return User.findOne({ _id: context.user._id }).populate('books');
      }
      throw new AuthenticationError('You need to be logged in!');
    },
  },

  Mutation: {
    addUser: async (parent, { username, email, password }) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user);
      if (!user) {
        throw new AuthenticationError('No profile with this email found!');
      }

      return { token, user };
    },

    login: async (parent, { email, password }) => {
      const user = await User.findOne({email: email});

      if (!user) {
        throw new AuthenticationError('No profile with this email found!');
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError('Incorrect password!');
      }

      const token = signToken(user);
      return { token, user };
    },

    // Set up mutation so a logged in user can only remove their profile and no one else's
    // saveBook(authors: $saveBookAuthors, description: $saveBookDescription, bookId: $saveBookBookId, title: $saveBookTitle)
    saveBook: async (parent, {newBook,token}) => {
      // If user not signed in then they cannot save a book
      try{
        const bookUpdate = await User.findOneAndUpdate({token: token},{$push:{'savedBooks':{...newBook}}});
        // const bookUpdate = await User.findOneAndUpdate({token: token},{$push:{'savedBooks':{...bookToSave}}});
        if(!bookUpdate){
          throw new Error('Could not add the user');
        }
        console.log(bookUpdate);
        return bookUpdate;
      } catch (err){
        console.log(err);
      }
      // Create a new book
      // Add the book id to the user
    },

    removeBook: async (parent, {bookId}) => {
      // If user not signed in then they cannot save a book
      try{
        const bookUpdate = await User.findOneAndUpdate({token: token},{$pull:{savedBooks:{'bookId':bookId}}});
        // const bookUpdate = await User.findOneAndUpdate({token: token},{$push:{'savedBooks':{...bookToSave}}});
        if(!bookUpdate){
          throw new Error('Could not add the user');
        }
        console.log(bookUpdate);
        return bookUpdate;
      } catch (err){
        console.log(err);
      }
      // Create a new book
      // Add the book id to the user
    },
  },
};

module.exports = resolvers;
