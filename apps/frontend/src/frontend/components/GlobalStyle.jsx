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
    width: 100%;
    height: 100%;
  }
  
  .routes-container {
    position: absolute;
    bottom: 0;
    height: calc(100% - 100px);
    width: 100%;
    overflow: auto;
    @media screen and (max-width: 768px) {
      height: calc(100% - 80px);
      margin-top: 80px;
    }
    transition: .2s;
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
