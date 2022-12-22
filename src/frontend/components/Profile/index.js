import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import UserNotFound from './UserNotFound';
import ProfileHeader from './ProfileHeader';
import ProfileContent from './ProfileContent';
import { initProfile } from '../../store/actionCreators';
import { getProfileID } from '../../store/selectors';

const Profile = () => {
  const { pathname } = useLocation();
  const dispatch = useDispatch();
  const profileID = useSelector(getProfileID);
  const [profilePath, setProfilePath] = useState(null);

  useEffect(() => {
    const newProfilePath = pathname.split('/')[2];
    if (profilePath === newProfilePath) return;
    dispatch(initProfile(newProfilePath));
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
