/* eslint-disable react/no-unknown-property */
// import { useState, useEffect } from 'react';
import { QUERY_ME } from '../utils/queries';
import { DELETE_BOOK } from '../utils/mutations';
import { useQuery, useMutation } from '@apollo/client';

import {
  Container,
  Card,
  Button,
  Row,
  Col
} from 'react-bootstrap';

import Auth from '../utils/auth';
import { removeBookId } from '../utils/localStorage';

const SavedBooks = () => {
  
  const { loading, data: queryData } = useQuery(QUERY_ME);
  console.log("data", queryData)
  const userData = queryData?.me || {};

  if (!Auth.loggedIn()) {
    return (
      <h4>
        You need to be logged in to see this. Use the navigation links above to
        sign up or log in!
      </h4>
    );
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [deleteBook] = useMutation(DELETE_BOOK, {
    update(cache, { data: { deleteBook } }) {
      const userId = userData._id;

      cache.modify({
        id: cache.identify({ __typename: 'User', id: userId }),
        fields: {
          savedBooks(existingBooks = [], { readField }) {
            return existingBooks.filter(
              (bookRef) => readField('bookId', bookRef) !== deleteBook.bookId
            );
          },
        },
      });
    },
  });

  const handleDeleteBook = async (bookId) => {

    try {
       await deleteBook({
        variables: { bookId },
      });

      removeBookId(bookId);

    } catch (err) {
      console.error(err);
    }
    
  };

  if (loading || !userData?.username) {
    return <div>Loading...</div>;
  }
  
 

  return (
    <>
      <div className="text-light bg-dark p-5" fluid="true">
        <Container fluid >
          <h1>Viewing saved books!</h1>
        </Container>
      </div>
      <Container>
        <h2 className='pt-5'>
          {userData.savedBooks.length
            ? `Viewing ${userData.savedBooks.length} saved ${userData.savedBooks.length === 1 ? 'book' : 'books'}:`
            : 'You have no saved books!'}
        </h2>
        <Row>
          {userData.savedBooks.map((book) => {
            return (
              // eslint-disable-next-line react/jsx-key
              <Col key={book.bookId} md="4">
                <Card id={book.bookId} border='dark'>
                  {book.image ? <Card.Img src={book.image} alt={`The cover for ${book.title}`} variant='top' /> : null}
                  <Card.Body>
                    <Card.Title>{book.title}</Card.Title>
                    <p className='small'>Authors: {book.authors}</p>
                    <Card.Text>{book.description}</Card.Text>
                    <Button className='btn-block btn-danger' onClick={() => handleDeleteBook(book.bookId)}>
                      Delete this Book!
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Container>
    </>
  );
};

export default SavedBooks;
