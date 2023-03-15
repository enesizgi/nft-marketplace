import { createGlobalStyle } from 'styled-components';

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
    /* Consider top bar heights before changing */
    position: fixed;
    overflow: auto;
    bottom: 0;
    width: 100%;
    height: 88%;
    @media screen and (max-width: 768px) {
      height: calc(100% - 80px);
    }
  }
  
  button {
    background: none;
    color: inherit;
    border: none;
    padding: 0;
    font: inherit;
    cursor: pointer;
    outline: inherit;
  }
`;

export default GlobalStyle;
