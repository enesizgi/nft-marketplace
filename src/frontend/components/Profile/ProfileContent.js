import React from 'react';
import { bool, string } from 'prop-types';

const ProfileContent = ({ id, isOwner }) => {
  return (
    <div>Content will be here.</div>
  );
};

ProfileContent.propTypes = {
  id: string,
  isOwner: bool
};

ProfileContent.defaultProps = {
  id: '',
  isOwner: false
};

export default ProfileContent;
