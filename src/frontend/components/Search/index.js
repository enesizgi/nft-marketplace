import React, { useState, useRef, useEffect } from 'react';
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
    border-color: ${({ theme }) => theme.blue};
    input:focus-visible {
      outline: unset;
    }
  }

  .search-input {
    border-radius: 25px;
    width: 100%; /* Fill the expanded area */
    padding: 12px 20px;
    font-size: 16px;
    box-sizing: border-box;
    border: 2px solid ${({ theme }) => theme.blue};
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
    color: white;
    cursor: pointer;
    font-size: 20px;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;

    svg {
      color: ${({ theme }) => theme.blue};
    }
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

const Search = () => {
  const [expanded, setExpanded] = useState(false);
  const [searchText, setSearchText] = useState('');
  const searchInputRef = useRef(null);

  const handleChange = event => {
    setSearchText(event.target.value);
  };

  const handleButtonClick = () => {
    setExpanded(prev => !prev);
  };

  useEffect(() => {
    if (expanded) {
      searchInputRef.current.focus();
    }
  }, [expanded]);

  return (
    <ScSearchBar>
      <div className="search-container">
        <button type="button" className="search-button" onClick={handleButtonClick}>
          <FaSearch />
        </button>
        <button
          type="button"
          className={`search-form ${expanded ? 'expanded' : ''}`}
          onFocus={() => console.log('focused')}
          onBlur={() => setExpanded(false)}
        >
          <input ref={searchInputRef} type="text" placeholder="Search..." value={searchText} onChange={handleChange} className="search-input" />
        </button>
      </div>
    </ScSearchBar>
  );
};

export default Search;
