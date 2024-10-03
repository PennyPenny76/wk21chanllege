import { gql } from '@apollo/client';

export const QUERY_GET_SINGLE_USER = gql`
  query user($usernameId: ID!) {
    user(usernameId: $usernameId) {
      _id
      username
      email
      savedBooks {
        _id
        authors
        description
        bookId
        image
        link
        title
      }
    }
  }
`;


export const QUERY_ME = gql`
  query me {
    me {
      _id
      username
      email
      savedBooks {
        bookId
        authors
        title
        description
        image
      }
    }
  }
`;


export const SEARCH_GOOGLE_BOOKS = gql`
  query searchGoogleBooks($query: String!) {
    searchGoogleBooks(query: $query) {
      bookId
      title
      authors
      description
      image
      link
    }
  }
`;


