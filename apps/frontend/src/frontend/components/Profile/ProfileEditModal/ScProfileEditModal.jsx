import styled from 'styled-components';
import { FormControl } from '@chakra-ui/react';

const ScProfileEditModal = styled(FormControl)`
  display: flex;
  flex-direction: column;
  padding: 16px;
  max-width: 800px;
  @media screen and (max-width: 768px) {
    height: 100%;
  }
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
    border-color: #969696;
  }
  label {
    white-space: nowrap;
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

  .profilePhoto-container {
    margin-bottom: 20px;
  }
  .upload-button-container {
    display: flex;
    flex-direction: column;
    max-width: 250px;
    @media screen and (max-width: 768px) {
      max-width: 100%;
    }
  }
  .coverPhoto-container {
    margin-bottom: 20px;
  }

  .form-footer {
    width: 100%;
    border-top: 1px solid #969696;
    padding-top: 20px;
    display: flex;
    justify-content: flex-end;
    align-self: flex-end;
    > div {
      font-weight: 600;
      font-size: 16px;
      margin: 0 10px;
    }
  }
`;

export default ScProfileEditModal;
