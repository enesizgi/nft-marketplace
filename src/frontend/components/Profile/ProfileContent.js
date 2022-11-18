/* eslint-disable react/prop-types */
// TODO: Remove eslint disables
import React from 'react';
import { bool, string } from 'prop-types';

const ProfileContent = ({ id, isOwner }) => ( // eslint-disable-line no-unused-vars
  <div>Content will be here.</div>
);

ProfileContent.propTypes = {
  id: string,
  isOwner: bool
};

ProfileContent.defaultProps = {
  id: '',
  isOwner: false
};

export default ProfileContent;
