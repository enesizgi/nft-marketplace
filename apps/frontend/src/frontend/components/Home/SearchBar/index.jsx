import React, { useState, useEffect } from 'react';
import { Input } from '@chakra-ui/react';
import API from '../../../modules/api';

function useDebounce(value, delay) {
  // State and setters for debounced value
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(
    () => {
      // Update debounced value after delay
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);
      // Cancel the timeout if value changes (also on delay change or unmount)
      // This is how we prevent debounced value from updating if value is changed ...
      // .. within the delay period. Timeout gets cleared and restarted.
      return () => {
        clearTimeout(handler);
      };
    },
    [value, delay] // Only re-call effect if value or delay changes
  );
  return debouncedValue;
}

const HomePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  // const [nfts, setNfts] = useState([]);
  const [searchResults, setSearchResults] = useState({
    nfts: [],
    users: []
  });

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const handleSearchTermChange = e => {
    setSearchTerm(e.target.value);
  };

  useEffect(() => {
    if (!debouncedSearchTerm) return;
    const search = async () => {
      console.log('searching for', debouncedSearchTerm);
      const response = await API.search({ searchTerm: debouncedSearchTerm });
      if (response) {
        setSearchResults(response);
      }
    };
    search();
  }, [debouncedSearchTerm]);
  console.log(searchResults);
  return <Input placeholder="Search nfts, users, transactions..." onChange={handleSearchTermChange} />;
};

export default HomePage;
