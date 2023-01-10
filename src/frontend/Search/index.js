import React, { useState } from 'react';
import Styled from 'styled-components';

const ScSearchBar = Styled.div`
 .search-form {
    position: relative;
    width: 50px; /* Start with a small width */
    transition: width 0.3s ease-in-out; /* Animate the width change */
    
}

.search-form:focus-within, .search-form:active {
    width: 250px; /* Expand to a larger width when focused */
    border-color : #0089a8;
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
    position: absolute;
    top: 0;
    right: 0;
    width: 50px;
    height: 100%;
    padding: 0;
    background-color: #4CAF50;
    color: #fff;
    cursor: pointer;
    font-size: 20px;
    border: none;
}

.faSearchIcon {
    color : white;
    
}

.search-container {
    display : flex;
}

`;

const Search = ({ onSearch }) => {
  const [searchText, setSearchText] = useState('');

  const handleChange = event => {
    setSearchText(event.target.value);
  };

  const handleSubmit = event => {
    event.preventDefault();
    onSearch(searchText);
  };

  return (
    <ScSearchBar>
      <div className="search-container">
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="Search..." value={searchText} onChange={handleChange} className="search-input" />
        </form>
      </div>
    </ScSearchBar>
  );
};

export default Search;
