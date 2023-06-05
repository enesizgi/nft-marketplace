import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import ScNFTCard from './NFTCard/ScNFTCard';
import API from '../modules/api';
import { ReactComponent as DefaultProfilePhoto } from '../assets/default-profile-photo.svg';
import { setSearchTerm } from '../store/actionCreators';

const UserCard = ({ user }) => {
  const [profilePhoto, setProfilePhoto] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      try {
        // eslint-disable-next-line no-underscore-dangle
        const _profilePhoto = await API.getProfilePhoto(user.walletId);
        setProfilePhoto(_profilePhoto.url);
      } catch (e) {
        console.log(e);
      }
    })();
  }, []);

  const handleGoToProfile = () => {
    dispatch(setSearchTerm(''));
    navigate(`/user/${user.walletId}`);
  };

  return (
    <ScNFTCard onClick={handleGoToProfile}>
      <div className="nft-image">
        {profilePhoto ? <img alt="userPhoto" className="user-photo" src={profilePhoto} /> : <DefaultProfilePhoto className="defaultPhoto" />}
      </div>
      <div className="nft-info">
        <div className="nft-info-name">
          <p className="nft-info-name-itemName">{user.name}</p>
        </div>
      </div>
    </ScNFTCard>
  );
};

export default UserCard;
