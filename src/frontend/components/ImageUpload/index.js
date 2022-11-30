import React from 'react';
import styled from 'styled-components';
import { func, string } from 'prop-types';
import API from '../../modules/api';

const ScImageUpload = styled.div`
  width: 100%;
  height: 100%;
  background-color: rgba(140, 140, 140, 0.2);
`;

const ImageUpload = ({ id: userID, setPhoto }) => {
  const uploadProfilePhoto = async e => {
    e.preventDefault();
    const file = e.target.files[0];
    if (file) {
      try {
        const formData = new FormData();
        formData.append('profile-photo', file);
        API.uploadProfilePhoto(userID, formData).then(response => setPhoto(response.url));
      } catch (error) {
        console.warn('Error on uploading file', error);
      }
    }
  }
  return (
    <ScImageUpload>
      <input
        type="file"
        name="myImage"
        onChange={uploadProfilePhoto}
      />
    </ScImageUpload>
  )
};

ImageUpload.propTypes = {
  id: string,
  setPhoto: func
};

ImageUpload.defaultProps = {
  id: '',
  setPhoto: f => f
};

export default ImageUpload;

