import React, { useState, useEffect } from 'react';
import { Input } from '@chakra-ui/react';
import API from '../../../modules/api';
import { useDebounce } from '../../../hooks';

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
    (async () => {
      console.log('searching for', debouncedSearchTerm);
      const response = await API.search({ searchTerm: debouncedSearchTerm });
      if (response) {
        setSearchResults(response);
      }
    })();
  }, [debouncedSearchTerm]);
  console.log(searchResults);
  return <Input placeholder="Search nfts, users, transactions..." onChange={handleSearchTermChange} />;
};

export default HomePage;
