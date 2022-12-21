import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import API from '../../modules/api';
import UserNotFound from './UserNotFound';
import ProfileHeader from './ProfileHeader';
import ProfileContent from './ProfileContent';

const Profile = () => {
  const [profileID, setProfileID] = useState(null);
  const { pathname } = useLocation();
  const [profilePath, setProfilePath] = useState(null);

  useEffect(async () => {
    const newProfilePath = pathname.split('/')[2];
    if (profilePath === newProfilePath) return;
    if (newProfilePath.startsWith('0x')) {
      API.checkUser(newProfilePath).then(response => setProfileID(response.id));
    } else {
      API.getUserIDFromSlug(newProfilePath).then(response => setProfileID(response.id));
    }
    setProfilePath(newProfilePath);
  }, [pathname]);

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
