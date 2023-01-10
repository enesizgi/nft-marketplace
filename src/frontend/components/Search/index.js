import React, { useState } from 'react';
import styled from 'styled-components';
import { FaSearch } from 'react-icons/fa';

const ScSearchBar = styled.div`
  .search-form {
    position: relative;
    width: 0; /* Start with a small width */
    transition: width 0.3s ease-in-out; /* Animate the width change */
    overflow: hidden;
  }

  .search-form.expanded {
    width: 250px; /* Expand to a larger width when clicked */
    border-color: #0089a8;
  }

  .search-input {
    border-radius: 25px;
    width: 100%; /* Fill the expanded area */
    padding: 12px 20px;
    font-size: 16px;
    box-sizing: border-box;
    border: 2px solid #0089a8;
    background-color: transparent;
    color: white;
    transition: all 0.3s ease-in-out;
  }

  .search-input::placeholder {
    color: #ccc;
  }

  .search-button {
    width: 50px;
    height: 100%;
    padding: 0;
    background-color: #23252a;
    color: #fff;
    cursor: pointer;
    font-size: 20px;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .faSearchIcon {
    color: white;
  }

  .search-container {
    display: flex;
    align-items: center;
    margin-right: auto;
  }
`;

const Search = ({ onSearch }) => {
  const [expanded, setExpanded] = useState(false);
  const [searchText, setSearchText] = useState('');

  const handleChange = event => {
    setSearchText(event.target.value);
  };

  const handleSubmit = event => {
    event.preventDefault();
    onSearch(searchText);
  };

  const handleButtonClick = () => {
    setExpanded(!expanded);
  };

  return (
    <ScSearchBar>
      <div className="search-container">
        <button type="button" className="search-button" onClick={handleButtonClick}>
          <FaSearch style={{ color: '#0089a8' }} />
        </button>
        <form className={`search-form ${expanded ? 'expanded' : ''}`} onSubmit={handleSubmit}>
          <input type="text" placeholder="Search..." value={searchText} onChange={handleChange} className="search-input" />
        </form>
      </div>
    </ScSearchBar>
  );
};

export default Search;
