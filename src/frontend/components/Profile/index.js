import React, { useEffect, useState } from 'react';
import { string } from 'prop-types';
import { useLocation } from 'react-router-dom';
import UserNotFound from './UserNotFound';
import ProfileHeader from './ProfileHeader';
import ProfileContent from './ProfileContent';

const Profile = ({ account }) => {
  const [isOwner, setIsOwner] = useState(false);
  const [profileID, setProfileID] = useState('');
  const requestedSlug = useLocation().pathname.split('/')[2];

  const getLoggedUserSlug = async () => {
    // Account is just an id string.
    fetch(`http://localhost:3001/user/slug?id=${account}`, {
      method: 'GET',
    }).then((response) => response.json());
  };

  const getUserIDFromSlug = async () => fetch(`http://localhost:3001/user/id?slug=${requestedSlug}`, {
    method: 'GET',
  }).then((response) => response.json())
    .catch((error) => {
      console.log(error);
      return { id: '' };
    });

  useEffect(() => {
    getUserIDFromSlug().then(response => setProfileID(response.id));
  }, []);

  useEffect(() => {
    if (account) {
      getLoggedUserSlug().then(response => {
        setIsOwner(response.slug === requestedSlug);
      });
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
