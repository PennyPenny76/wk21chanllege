import { useState, useEffect } from 'react';
import { useLazyQuery, useMutation } from '@apollo/client';
import { Container, Col, Form, Button, Card, Row } from 'react-bootstrap';
import Auth from '../utils/auth';
import { saveBookIds, getSavedBookIds } from '../utils/localStorage';
import { SEARCH_GOOGLE_BOOKS } from '../utils/queries';
import { SAVE_BOOK } from '../utils/mutations';

const SearchBooks = () => {
  const [searchedBooks, setSearchedBooks] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [savedBookIds, setSavedBookIds] = useState(getSavedBookIds());
 
  useEffect(() => {
    saveBookIds(savedBookIds);
  }, [savedBookIds]);

  const [searchGoogleBooks, { loading, data, error }] = useLazyQuery(SEARCH_GOOGLE_BOOKS);

  if (error) {
    console.error('Error fetching data:', error);
  }

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    if (!searchInput) {
      return false;
    }

    await searchGoogleBooks({
      variables: { query: searchInput }
    });

    setSearchInput('');
  };

  useEffect(() => {
    if (data && !loading) {
      const books = data.searchGoogleBooks || [];
      setSearchedBooks(books);
      console.log("books data", books);
    }
  }, [data, loading]);
  

  const [saveBook] = useMutation(SAVE_BOOK);

  const handleSaveBook = async ( book ) => {
    const { authors, description, bookId, image, link, title } = book;
    console.log("Clicked save book with ID:", bookId);
    console.log("Book details:", authors, description, image, link, title); 

    const bookInput = {
      authors,
      description,
      bookId,
      image,
      link,
      title,
    };

    if (savedBookIds.includes(bookId)) {
      console.log("Book already saved");
      return; 
    }

    console.log("Attempting to save book..."); 
    console.log("Saving book:", book);

    try {
      const { data } = await saveBook({
        variables: { book: bookInput },
      });

      if (!data) {
        console.error("Failed to save book");
      }
      
      console.log("handlesave", bookId)

      setSavedBookIds([...savedBookIds, bookId]);
      console.log('Book saved:', data);
      
    } catch (err) {
      console.error('Error saving book:', err.message);
    }
  };

  return (
    <>
      <div className="text-light bg-dark p-5">
        <Container>
          <h1>Search for Books!</h1>
          <Form onSubmit={handleFormSubmit}>
            <Row>
              <Col xs={12} md={8}>
                <Form.Control
                  name='searchInput'
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  type='text'
                  size='lg'
                  placeholder='Search for a book'
                />
              </Col>
              <Col xs={12} md={4}>
                <Button type='submit' variant='success' size='lg'>
                  Submit Search
                </Button>
              </Col>
            </Row>
          </Form>
        </Container>
      </div>

      <Container>
        <h2 className='pt-5'>
          {loading
            ? 'Loading...'
            : searchedBooks.length
            ? `Viewing ${searchedBooks.length} results:`
            : 'Search for a book to begin'}
        </h2>
        {loading && <p>Loading books...</p>}
        {!loading && searchedBooks.length === 0 && (
        <p>No results found. Try a different search.</p>
        )}
        <Row>
          {searchedBooks.map((book) => {
            return (
              <Col md="4" key={book.bookId}>
                <Card border='dark' id={book.bookId}>
                  {book.image ? (
                    <Card.Img src={book.image} alt={`The cover for ${book.title}`} variant='top' />
                  ) : null}
                  <Card.Body>
                    <Card.Title>{book.title}</Card.Title>
                    <p className='small'>Authors: {book.authors.join(', ')}</p>
                    <Card.Text>{book.description}</Card.Text>
                    {Auth.loggedIn() && (
                      <Button
                        disabled={savedBookIds.includes(book.bookId)}
                        className='btn-block btn-info'
                        onClick={() => handleSaveBook(book)}>
                        {savedBookIds.includes(book.bookId)
                          ? 'This book has already been saved!'
                          : 'Save this Book!'}
                      </Button>
                    )}
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

export default SearchBooks;
