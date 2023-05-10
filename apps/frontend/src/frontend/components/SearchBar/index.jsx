import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import { useDebounce, useEffectIgnoreFirst } from '../../hooks';
import * as ACTION_CREATORS from '../../store/actionCreators';
import { theme } from '../../constants';
import { ReactComponent as SearchIcon } from '../../assets/search-icon.svg';

const ScSearchBar = styled.div`
  display: flex;
  align-items: center;
  width: 300px;
  height: 100%;
  border: 2px solid ${theme.secondaryBlue};
  background: rgba(10, 16, 30, 0.8);
  border-radius: 8px;
  overflow: hidden;

  input {
    height: 100%;
    color: #fff;
    padding: 5px 10px;
    font-size: 18px;
    font-weight: 600;
    background: none;
    border-left: 2px solid ${theme.secondaryBlue};
    flex-grow: 1;
    &::placeholder {
      color: ${theme.blue};
      opacity: 1;
    }

    &:focus {
      outline: none;
      &::placeholder {
        opacity: 0;
      }
    }
  }
  label {
    margin: 5px 10px;
    cursor: pointer;
    display: flex;
    align-items: center;
    height: calc(100% - 10px);
    svg {
      margin: auto;
      height: 30px;
      width: 100%;
      fill: ${theme.blue};
    }
  }
`;

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const dispatch = useDispatch();
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const handleSearchTermChange = e => {
    setSearchTerm(e.target.value);
  };

  useEffectIgnoreFirst(() => {
    dispatch(ACTION_CREATORS.setSearchTerm(debouncedSearchTerm));
  }, [debouncedSearchTerm]);

  return (
    <ScSearchBar>
      <label htmlFor="searchBar">
        <SearchIcon />
      </label>
      <input id="searchBar" type="search" value={searchTerm} placeholder="Search" onChange={handleSearchTermChange} />
    </ScSearchBar>
  );
};

export default SearchBar;
