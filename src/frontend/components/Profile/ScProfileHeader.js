import styled from 'styled-components';

const ScProfileHeader = styled.div`
  width: 100%;
  height: 50%;
  @media screen and (max-width: 768px) {
    height: 40%;
  }
  @media screen and (max-width: 480px) {
    height: 30%;
  }
  .profile-photos {
    position: relative;
    width: 100%;
    height: 80%;
    .cover-photo {
      width: 100%;
      height: 80%;
      position: relative;
      &-image {
        object-fit: cover;
        width: 100%;
        height: 100%;
      }
      @media screen and (max-width: 480px) {
        height: 60%:
      }
    }
    .profile-photo {
      position: absolute;
      bottom: 0;
      width: 200px;
      height: 200px;
      @media screen and (max-width: 768px) {
        width: 175px;
        height: 175px;
      }
      @media screen and (max-width: 480px) {
        width: 150px;
        height: 150px;
      }
      border: 5px solid #0089a8;
      border-radius: 100%;
      margin-left: 5%;
      overflow: hidden;
      z-index: 5;
      &-image {
        width: 100%;
        height: 100%;
      }
    }
  }
  .profile-names {
    width: 70%;
    margin-left: 20px;
    margin-bottom: 10px;
    margin-top: 10px;
    &-name {
      font-size: 36px;
      @media screen and (max-width: 768px) {
        font-size: 30px;
      }
      @media screen and (max-width: 480px) {
        font-size: 24px;
      }
    }
    &-id {
      max-width: 50%;
      text-overflow: ellipsis;
      overflow: hidden;
      color: rgb(105, 105, 105);
      font-size: 24px;
      @media screen and (max-width: 768px) {
        font-size: 20px;
      }
      @media screen and (max-width: 480px) {
        font-size: 18px;
      }
    }
  }
`;

export default ScProfileHeader;
