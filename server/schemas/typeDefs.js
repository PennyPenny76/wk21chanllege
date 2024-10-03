const typeDefs = `
 type User {
    _id: ID
    username: String
    email: String
    password: String
    savedBooks: [Book]!
    bookCount: Int
  } 

  type Book {
    authors: [String]
    description: String!
    bookId: ID!
    image: String
    link: String
    title: String!
  }

  type Query {
    getSingleUser(username: String, userId: ID ): User
    me: User
    searchGoogleBooks(query: String!): [Book]
  }

  type Auth {
    token: ID!
    user: User
  }


  type Mutation {
      createUser(username: String!, email: String!, password: String!): Auth
      loginUser(email: String!, password: String!): Auth
      
      saveBook(book: BookInput): User

      deleteBook(
      bookId: ID!): User
  }

  input BookInput {
    authors: [String]
    description: String!
    bookId: ID!
    image: String
    link: String
    title: String!
  }


    

  
`



module.exports = typeDefs;
