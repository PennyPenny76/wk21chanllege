const { User, bookSchema } = require('../models');
const { signToken, AuthenticationError } = require('../utils/auth');
const axios = require('axios');

const resolvers = {
  Query: {

    getSingleUser: async (parent, { user = null, params }) => {
      const foundUser = User.findOne({ 
        $or: [{ _id: user ? user._id : params.id }, 
          { username: params.username }], });

      if (!foundUser) {
        return res.status(400).json({ message: 'Cannot find a user with this id!' });
      }

      return foundUser;
    },
    me: async (parent, args, context) => {
      if (context.user) {
        return User.findOne({ _id: context.user._id });
      }
      throw AuthenticationError;
    },

    searchGoogleBooks: async (parent, { query }) => {
      try {
        const response = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=${query}`);
        console.log(response.data);

        const books = response.data.items.map((item) => ({
          bookId: item.id,
          title: item.volumeInfo.title,
          authors: item.volumeInfo.authors || [],
          description: item.volumeInfo.description || '',
          image: item.volumeInfo.imageLinks?.thumbnail || '',
          link: item.volumeInfo.infoLink || '' 
        }));
        return books;
      } catch (error) {
        console.error(error);
        throw new Error('Failed to fetch data from Google Books API');
      }
    }
  },

  Mutation: {
    createUser: async (parent, { username, email, password }) => {
      const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new Error('This email is already registered.');
    }
      const user = await User.create({ username, email, password });
      const token = signToken(user);

      return { token, user };
    },

    loginUser: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw AuthenticationError
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw AuthenticationError
      }

      const token = signToken(user);
      return { token, user };
    },

    saveBook: async (parent, { book }, context) => {
      console.log("Context user: ", context.user);

      if (context.user) {
        console.log("Saving book for user: ", context.user._id);
        const updatedUser = await User.findOneAndUpdate(
        
        { _id: context.user._id  },
        {
          $addToSet: { savedBooks: book},
        },
        {
          new: true,
          runValidators: true,
        } 
      )
        return updatedUser;
      };
      throw new AuthenticationError;
      ('You need to be logged in!');
    },

    deleteBook: async (parent, { bookId }, context) => {

      if (context.user) {

        const updatedUser = await User.findOneAndUpdate(
        
        { _id: context.user._id  },
        {
          $pull: { savedBooks: {bookId} } 
        },
        {
          new: true,
          runValidators: true,
        } 
      )
        return updatedUser;
      };
      throw new AuthenticationError;
      ('You need to be logged in!');
    },

  },
};

module.exports = resolvers;
