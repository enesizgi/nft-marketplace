import styled from 'styled-components';
import { FormControl } from '@chakra-ui/react';

const ScProfileEditModal = styled(FormControl)`
  display: flex;
  flex-direction: column;
  padding: 16px;
  input {
    height: 3rem;
    padding: 10px;
    font-size: 18px;
    color: #fff;
    font-size: 18px;
    color: #fff;
    &:not([aria-invalid]) {
      margin-bottom: 20px;
    }
  }
  label {
    @media screen and (max-width: 480px) {
      align-self: flex-start;
    }
    font-weight: 600;
    font-size: 24px;
  }
  button {
    word-wrap: break-word;
  }
  .chakra-form__helper-text {
    margin-bottom: 20px;
    color: red;
  }

  .photoUpload-group {
    display: flex;
    justify-content: space-around;
    width: 100%;
    @media screen and (max-width: 480px) {
      flex-direction: column;
    }
  }

  .photoUpload-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    margin: 20px;
    width: 50%;
    @media screen and (max-width: 480px) {
      width: 100%;
      margin: 20px 0;
    }
    & > img {
      margin-bottom: 20px;
    }
  }

  .no-photo {
    justify-content: center;
  }

  .profilePhoto {
    display: inline;
    width: 200px;
    height: 200px;
    border-radius: 100%;
    @media screen and (max-width: 768px) {
      width: 175px;
      height: 175px;
    }
    @media screen and (max-width: 480px) {
      width: 120px;
      height: 120px;
    }
  }
  .upload-button-container {
    display: flex;
    flex-direction: column;
  }
  .coverPhoto {
    height: 200px;
    @media screen and (max-width: 768px) {
      height: 175px;
    }
    @media screen and (max-width: 480px) {
      height: 120px;
    }
  }

  .form-footer {
    margin-top: 20px;
    align-self: center;
    display: flex;
    justify-content: center;
    align-items: center;
    > div {
      font-weight: 600;
      font-size: 16px;
      margin: 0 10px;
    }
  }
`;

export default ScProfileEditModal;
