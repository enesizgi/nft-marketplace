import { createGlobalStyle } from 'styled-components';
import { theme } from '../constants';

const GlobalStyle = createGlobalStyle`
  * {
    font-family: Arial, Helvetica, sans-serif;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    height: 100vh;
    width: 100vw;
  }

  body {
    height: 100%;
    width: 100%;
  }

  #root {
    height: 100%;
    width: 100%;
  }
  
  #modal-root {
    position: relative;
    display: block;
  }
  
  .App {
    width: 100%;
    height: 100%;
  }
  
  #chakra-toast-manager-top-right {
    top: 100px !important;
    @media screen and (max-width: 768px) {
      top: 80px !important;
    }
  }
  
  .routes-container {
    position: absolute;
    bottom: 0;
    height: calc(100%);
    width: 100%;
    overflow: auto;
    padding-top: 100px;
    @media screen and (max-width: 768px) {
      padding-top: 80px;
    }
    &.isHomepage {
      padding-top: 0;
    }
    > * {
      margin-bottom: 30px;
      height: unset;
    }
    background-color: ${theme.background};
  }
  
  p, span, label, h1, h2, h3 {
    color: #fff;
  }
  
  button {
    background: none;
    color: #fff;
    border: none;
    padding: 0;
    font: inherit;
    cursor: pointer;
    outline: inherit;
  }
`;

export default GlobalStyle;
