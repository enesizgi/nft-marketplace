import React, { useState, useEffect } from 'react';
import { Input } from '@chakra-ui/react';

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

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const handleSearchTermChange = e => {
    setSearchTerm(e.target.value);
  };

  useEffect(() => {
    if (!debouncedSearchTerm) return;
    console.log('searching for', debouncedSearchTerm);
  }, [debouncedSearchTerm]);
  return <Input placeholder="Search nfts, users, transactions..." onChange={handleSearchTermChange} />;
};

export default HomePage;
