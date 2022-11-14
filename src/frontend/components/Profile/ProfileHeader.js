import React, { useEffect, useState } from 'react';
import { bool, string } from 'prop-types';

const ProfileHeader = ({ id, isOwner }) => {
  const [profilePhoto, setProfilePhoto] = useState('');

  const getProfilePhoto = async () => fetch(`http://localhost:3001/user/profile-photo?id=${id}`, {
    method: 'GET'
  }).then(response => response.json());

  useEffect(() => {
    getProfilePhoto().then(response => setProfilePhoto(response.url));
  });

  return (
    <img src={profilePhoto} alt="profilePhoto" />
  );
};

ProfileHeader.propTypes = {
  id: string,
  isOwner: bool
};

ProfileHeader.defaultProps = {
  id: '',
  isOwner: false
};

export default ProfileHeader;
