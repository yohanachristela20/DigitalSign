import Navbar from 'react-bootstrap/Navbar';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import { FaSearch } from 'react-icons/fa'; 

function SearchBar({ searchQuery, handleSearchChange }) {
  return (
    <Form className="search-group w-25 ml-auto">
      <InputGroup>
        <Form.Control
          type="text"
          placeholder="Search"
          value={searchQuery}
          onChange={handleSearchChange}
        />
        <Button type="submit" variant="primary">
          <FaSearch />
        </Button>
      </InputGroup>
    </Form>
  );
}

export default SearchBar;
