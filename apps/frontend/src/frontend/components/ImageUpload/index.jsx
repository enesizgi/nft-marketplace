import React from 'react';
import styled from 'styled-components';
import { func } from 'prop-types';
import { ReactComponent as EditIcon } from '../../assets/edit-icon.svg';

const ScImageUpload = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  top: 50%;
  left: 50%;
  background-color: rgba(140, 140, 140);
  opacity: 0;
  :hover {
    opacity: 0.7;
  }
  transition: 0.3s ease;
  transform: translate(-50%, -50%);
  z-index: 1;

  > input {
    cursor: pointer;
    position: absolute;
    z-index: 4;
    opacity: 0;
    width: 100%;
    height: 100%;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  .profile-photo-edit {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 3;
    width: 30%;
    height: 30%;
    fill: #fff;
  }
`;

const ImageUpload = ({ onUpload }) => (
  <ScImageUpload>
    <EditIcon className="profile-photo-edit" />
    <input type="file" onChange={onUpload} />
  </ScImageUpload>
);

ImageUpload.propTypes = {
  onUpload: func
};

ImageUpload.defaultProps = {
  onUpload: f => f
};

export default ImageUpload;
