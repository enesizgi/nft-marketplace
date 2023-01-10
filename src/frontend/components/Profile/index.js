import React from 'react';
import { useSelector } from 'react-redux';
import UserNotFound from './UserNotFound';
import ProfileHeader from './ProfileHeader';
import ProfileContent from './ProfileContent';
import { getProfileID } from '../../store/selectors';

const Profile = () => {
  const profileID = useSelector(getProfileID);

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
