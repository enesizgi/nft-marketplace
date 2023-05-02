import React from 'react';
import { useSelector } from 'react-redux';
import UserNotFound from './UserNotFound';
import ProfileHeader from './ProfileHeader';
import ProfileContent from './ProfileContent';
import { getProfileId } from '../../store/selectors';

const Profile = () => {
  const profileId = useSelector(getProfileId);

  if (!profileId) {
    return <UserNotFound />;
  }

  return (
    <div className="profile-page" style={{ minHeight: '100%', maxWidth: '1200px', margin: 'auto', boxShadow: '0 0 3px #fff' }}>
      <ProfileHeader id={profileId} />
      <ProfileContent id={profileId} />
    </div>
  );
};

export default Profile;
