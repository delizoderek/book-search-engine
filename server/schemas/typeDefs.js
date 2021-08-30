const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type User{
    _id: ID!
    username: String
    email: String
    password: String
    bookCount: Int
    savedBooks: [Book]
  }

  type Book {
    authors: [String]
    description: String!
    bookId: String!
    image: String
    link: String
    title: String!
  }

  type Auth {
    token: ID!
    user: User
  }

  input saveBookContent {
    authors: [String]
    description: String!
    title: String!
    bookId: String!
    image: String
    link: String
}

  type Query {
    # Because we have the context functionality in place to check a JWT and decode its data, we can use a query that will always find and return the logged in user's data
    users: [User]
    me: User
  }

  type Mutation {
    addUser(username: String!, email: String!, password: String!): Auth
    login(email: String!, password: String!): Auth

    saveBook(newBook: saveBookContent!): User
    removeBook(bookId: String!): User
  }

`;

module.exports = typeDefs;
