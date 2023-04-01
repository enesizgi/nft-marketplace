import styled from 'styled-components';
import { theme } from '../../constants';

const ScDetailsDropdown = styled.div`
  margin-bottom: 20px;
  border-radius: 10px;
  width: 100%;
  height: auto;
  transition: 0.2s ease;

  .details-dropdown-button {
    display: flex;
    width: 100%;
    border: 0;
    align-items: center;
    background: ${theme.secondaryBlue};
    cursor: pointer;
    font-size: 24px;
    font-weight: 600;
    padding: 10px 20px;
    border-radius: 10px;
    ${({ opened }) => (opened ? 'border-bottom-right-radius: 0; border-bottom-left-radius: 0;' : '')};
    &-icon {
      position: relative;
      margin-left: auto;
      color: #fff;
      > svg {
        stroke: rgb(35, 37, 42);
        position: absolute;
        transform: translate(-50%, -50%);
      }
    }
  }

  .details-dropdown-content {
    display: ${({ opened }) => (opened ? 'block' : 'none')};
    transition: 0.2s ease;
    height: 100%;
    width: 100%;
    font-size: 14px;
    border: 1px solid ${theme.secondaryBlue};
    border-radius: 10px;
    border-top: 0;
    border-top-left-radius: 0;
    border-top-right-radius: 0;
  }
`;

export default ScDetailsDropdown;
