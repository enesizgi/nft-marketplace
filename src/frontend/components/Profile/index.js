import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom'
import OwnerProfile from './OwnerProfile';
import PublicProfile from './PublicProfile';

const Profile = ({ account }) => {
  const [isOwner, setIsOwner] = useState(false);
  const requestedSlug = useLocation().pathname.split('/')[2];

  const getUserSlug = async () => {
    // Account is just an id string.
    return fetch(`http://localhost:3001/get-user-slug?id=${account}`, {
      method: 'GET'
    }).then(result => result.json());
  };

  useEffect(() => {
    getUserSlug().then(response => {
      setIsOwner(response.slug === requestedSlug)
    });
  }, []);

  return isOwner ? <OwnerProfile /> : <PublicProfile />;
};

export default Profile;