/* eslint-disable react/prop-types */
// TODO: Remove eslint disables
import React from 'react';
import { bool, string } from 'prop-types';

/* eslint-disable no-unused-vars */
const ProfileContent = ({ id, isOwner }) => <div>Content will be here.</div>;

ProfileContent.propTypes = {
  id: string,
  isOwner: bool
};

ProfileContent.defaultProps = {
  id: '',
  isOwner: false
};

export default ProfileContent;
