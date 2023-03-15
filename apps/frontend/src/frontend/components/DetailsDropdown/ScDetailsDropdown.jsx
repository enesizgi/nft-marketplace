import styled from 'styled-components';

const ScDetailsDropdown = styled.div`
  margin-bottom: 20px;
  border-radius: 10px;
  border: 1px solid rgba(35, 37, 42, 0.3);
  width: 100%;

  .details-dropdown-button {
    display: flex;
    width: 100%;
    border: 0;
    align-items: center;
    background: #fff;
    cursor: pointer;
    font-size: 24px;
    font-weight: 600;
    padding: 20px;
    border-radius: 10px;

    &-icon {
      position: relative;
      margin-left: auto;
      color: rgb(35, 37, 42);
      > svg {
        stroke: rgb(35, 37, 42);
        position: absolute;
        transform: translate(-50%, -50%);
      }
    }
  }

  .details-dropdown-content {
    height: 100%;
    transition: 0.3s height ease;
    width: 100%;
    font-size: 14px;
    border-top: 1px solid rgba(35, 37, 42, 0.3);
  }
`;

export default ScDetailsDropdown;
