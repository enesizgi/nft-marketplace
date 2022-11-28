import React, { useEffect, useState } from 'react';
import { bool, string } from 'prop-types';
import API from '../../modules/api';
import ScProfileHeader from './ScProfileHeader';

const ProfileHeader = ({ id, isOwner }) => { // eslint-disable-line no-unused-vars
  const [profilePhoto, setProfilePhoto] = useState(''); // eslint-disable-line no-unused-vars
  const [coverPhoto, setCoverPhoto] = useState('');
  const [username, setUsername] = useState('');

  useEffect(() => {
    API.getProfilePhoto(id).then(response => setProfilePhoto(response.url));
    API.getCoverPhoto(id).then(response => setCoverPhoto(response.url));
    API.getUsername(id).then(response => setUsername(response.name));
  });

  const [selectedImage, setSelectedImage] = useState(null);


  return (
    <ScProfileHeader>
      <img className="cover-photo" src={coverPhoto} alt="coverPhoto" />


      <div className="profile-info">
        <div>
          {selectedImage && (
              <div>
                <img className="profile-photo" alt="profilePhoto"  src={URL.createObjectURL(selectedImage)} />
                <br />
                <button type="button" onClick={()=>setSelectedImage(null)}>Remove</button>
              </div>
          )}
          <br />

          <br />
          <input
              type="file"
              name="myImage"
              onChange={(event) => {
                console.log(event.target.files[0]);
                setSelectedImage(event.target.files[0]);
              }}
          />
        </div>
        <div className="profile-names">
          { username && <h1 className="profile-names-name">{username}</h1> }
          <h2 className="profile-names-id">{id}</h2>
        </div>
      </div>
    </ScProfileHeader>
  );
};

ProfileHeader.propTypes = {
  id: string,
  isOwner: bool
};

ProfileHeader.defaultProps = {
  id: '',
  isOwner: false
};



export default ProfileHeader;
