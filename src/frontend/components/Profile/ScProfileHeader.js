import styled from 'styled-components';

const ScProfileHeader = styled.div`
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  height: 400px;
    .cover-photo {
      width: 100%;
      height: 300px;
    }
    .profile-info {
       position: absolute;
       bottom: 0;
       width: 100%;
       height: 250px;
       display: flex;
       flex-direction: row;
       align-items: end;
      .profile-photo {
        width: 200px;
        height: 200px;
        border: 4px solid #000;
        border-radius: 100%;
        margin-left: 5%;
      }
      .profile-names {
        margin-left: 20px;
        margin-bottom: 10px;
        &-name {
          font-size: 48px;
        }
        &-id {
          color: rgb(105, 105, 105);
        }
      }
    }
    
  
`;

export default ScProfileHeader;
