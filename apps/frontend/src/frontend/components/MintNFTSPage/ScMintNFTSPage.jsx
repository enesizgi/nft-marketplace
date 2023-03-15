import styled from 'styled-components';

const ScMintNFTSPage = styled.div`
  .buttonContainer {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-left: 6%;
    margin-top: 24px;
  }

  .drop-container {
    position: relative;
    display: flex;
    gap: 10px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 200px;
    padding: 20px;
    border-radius: 10px;
    border: 2px dashed #555;
    color: #444;
    cursor: pointer;
    transition: background 0.2s ease-in-out, border 0.2s ease-in-out;
    margin-left: 20%;
    margin-top: 16px;
    margin-right: 20%;
    &:hover {
      background: #eee;
      border-color: #111;
      .drop-title {
        color: #222;
      }
    }
    .drop-title {
      color: #444;
      font-size: 20px;
      font-weight: bold;
      text-align: center;
      transition: color 0.2s ease-in-out;
    }
  }

  .isGreen {
    background-color: #00a83b;
    border: 1px solid #00a83b;
  }

  button {
    background-color: ${({ theme }) => theme.blue};
    border: 1px solid ${({ theme }) => theme.blue};
    border-radius: 4px;
    box-shadow: rgba(0, 0, 0, 0.1) 0 2px 4px 0;
    box-sizing: border-box;
    color: #fff;
    cursor: pointer;
    font-family: 'Akzidenz Grotesk BQ Medium', -apple-system, BlinkMacSystemFont, sans-serif;
    font-size: 16px;
    font-weight: 400;
    outline: none;
    outline: 0;
    padding: 10px 25px;
    margin-right: 16px;
    text-align: center;
    transform: translateY(0);
    transition: transform 150ms, box-shadow 150ms;
    user-select: none;
    -webkit-user-select: none;
    touch-action: manipulation;
  }

  button:hover {
    box-shadow: rgba(0, 0, 0, 0.15) 0 3px 9px 0;
    transform: translateY(-2px);
  }

  .input-group {
    margin-bottom: 10px;
    margin-left: 40%;
    margin-top: 5%;
  }

  .input-flat {
    background: ${({ theme }) => theme.blue};
    padding: 5px;
    color: white;
    max-width: 100px;
    width: 50%;
    text-align: center;
    border-radius: 9px;
  }

  .input-control {
    border: none;
    border-bottom: 2px solid ${({ theme }) => theme.blue};
    outline: none;
    padding: 5px;
    -webkit-transition: all 700ms ease-out;
    -moz-transition: all 700ms ease-out;
    -ms-transition: all 700ms ease-out;
    -o-transition: all 700ms ease-out;
    transition: all 700ms ease-out;
    width: 50%;
  }

  .input-control:focus {
    background: #ecf0f1;
    width: calc(100% - 10%);
    -webkit-transition: all 700ms ease-in;
    -moz-transition: all 700ms ease-in;
    -ms-transition: all 700ms ease-in;
    -o-transition: all 700ms ease-in;
    transition: all 700ms ease-in;
  }

  input[type='file'] {
    width: 50%;
    max-width: 100%;
    color: #444;
    padding: 5px;
    background: #fff;
    border-radius: 10px;
    border: 1px solid #555;
  }

  input[type='file']::file-selector-button {
    margin-right: 20px;
    border: none;
    background: ${({ theme }) => theme.blue};
    padding: 10px 20px;
    border-radius: 10px;
    color: #fff;
    cursor: pointer;
    transition: background 0.2s ease-in-out;
  }

  input[type='file']::file-selector-button:hover {
    background: ${({ theme }) => theme.blue};
  }
`;

export default ScMintNFTSPage;
