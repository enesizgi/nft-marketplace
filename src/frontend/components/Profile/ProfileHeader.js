import React, { useEffect, useState } from 'react';
import { bool, string } from 'prop-types';
import API from '../../modules/api';
import ScProfileHeader from './ScProfileHeader';

const ProfileHeader = ({ id, isOwner }) => { // eslint-disable-line no-unused-vars
  const [profilePhoto, setProfilePhoto] = useState('');
  const [coverPhoto, setCoverPhoto] = useState('');
  const [username, setUsername] = useState('');

  useEffect(() => {
    API.getProfilePhoto(id).then(response => setProfilePhoto(response.url));
    API.getCoverPhoto(id).then(response => setCoverPhoto(response.url));
    API.getUsername(id).then(response => setUsername(response.name));
  });

  return (
    <ScProfileHeader>
      <img className="cover-photo" src={coverPhoto} alt="coverPhoto" />
      <div className="profile-info">
        <img className="profile-photo" src={profilePhoto} alt="profilePhoto" />
        <div className="profile-names">
          { username && <h1 className="profile-names-name">{username}</h1> }
          <h2 className="profile-names-id">{id}</h2>
        </div>
      </div>
    </ScProfileHeader>
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
