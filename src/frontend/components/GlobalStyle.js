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
  
  .App {
    width: 100%;
    height: 100%;
  }
`;

export default GlobalStyle;
