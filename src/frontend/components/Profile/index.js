import React, { useEffect, useState } from 'react';
import { string } from 'prop-types';
import { useLocation } from 'react-router-dom';
import API from '../../modules/api';
import UserNotFound from './UserNotFound';
import ProfileHeader from './ProfileHeader';
import ProfileContent from './ProfileContent';

const Profile = ({ account }) => {
  const [isOwner, setIsOwner] = useState(false);
  const [profileID, setProfileID] = useState('');
  const requestedSlug = useLocation().pathname.split('/')[2];

  useEffect(() => {
    API.getUserIDFromSlug(requestedSlug)
      .then(response => setProfileID(response.id));
  }, []);

  useEffect(() => {
    if (account) {
      // Fetch logged-in user slug, not the profile owner's.
      API.getUserSlug(account)
        .then(response => setIsOwner(response.slug === requestedSlug));
    }
  }, []);

  if (!profileID) {
    return <UserNotFound />;
  }

  return (
    <>
      <ProfileHeader id={profileID} isOwner={isOwner} />
      <ProfileContent id={profileID} isOwner={isOwner} />
    </>
  );
};

Profile.propTypes = {
  account: string
};

Profile.defaultProps = {
  account: ''
};

export default Profile;
