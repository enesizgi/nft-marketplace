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
  const profilePath = useLocation().pathname.split('/')[2];
  const isPathSlug = !profilePath.startsWith('0x');

  useEffect(() => {
    if (isPathSlug) {
      API.getUserIDFromSlug(profilePath).then(({ id }) => {
        setProfileID(id);
        setIsOwner(id === account);
      });
    } else {
      setProfileID(profilePath);
      setIsOwner(profilePath === account);
    }
  }, [account]);

  if (!profileID) {
    return <UserNotFound />;
  }

  return (
    <>
      <ProfileHeader id={profileID} isOwner={isOwner} account={account}/>
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
