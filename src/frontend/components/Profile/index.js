import React, { useEffect, useState } from 'react';
import API from '../../modules/api';
import UserNotFound from './UserNotFound';
import ProfileHeader from './ProfileHeader';
import ProfileContent from './ProfileContent';

const Profile = () => {
  const [profileID, setProfileID] = useState(null);
  const profilePath = window.location.pathname.split('/')[2];

  useEffect(async () => {
    if (profilePath.startsWith('0x')) {
      API.checkUser(profilePath).then(response => setProfileID(response.id));
    } else {
      API.getUserIDFromSlug(profilePath).then(response => setProfileID(response.id));
    }
  });

  if (!profileID) {
    return <UserNotFound />;
  }

  return (
    <>
      <ProfileHeader id={profileID} />
      <ProfileContent id={profileID} />
    </>
  );
};

export default Profile;
