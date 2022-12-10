import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { PAGE_LINKS, PAGE_NAMES } from '../../constants';
import { ReactComponent as CloseIcon } from '../../assets/close-icon.svg';

const ScLeftPanel = styled.div`
  width: 90%;
  height: 100%;
  position: absolute;
  display: flex;
  flex-direction: column;
  background-color: var(--button-background);
  z-index: 999;
  ${({ isLeftPanelOpened }) => (isLeftPanelOpened ? 'left: 0;' : 'left: -90%;')}
  transition: all .5s ease;
  .close-icon {
    fill: #fff;
    align-self: flex-end;
    margin: 5px;
    transition: transform 0.3s ease-in-out;
    &:hover {
      transform: rotate(360deg);
    }
  }
  .pageLink {
    width: 100%;
    height: 100px;
    display: flex;
    justify-content: center;
    align-items: center;
    & > p {
      display: inline-block;
      text-decoration: none;
      color: #fff;
      font-size: 24px;
    }
    &:hover {
      background: #fff;
      transition: 0.3s ease;
      & > p {
        color: var(--button-background);
      }
    }
  }
`;

/* eslint-disable react/prop-types */
// TODO @Enes: Remove above eslint disable

/* eslint-disable jsx-a11y/no-static-element-interactions,jsx-a11y/click-events-have-key-events */
// TODO @Emre: Remove above eslint disable
const LeftPanel = ({ nodeRef, isLeftPanelOpened, toggleLeftPanel }) => {
  const navigate = useNavigate();
  const handleNavigateToPage = pageLink => {
    navigate(`/${pageLink}`);
    toggleLeftPanel();
  };

  return (
    <ScLeftPanel ref={nodeRef} isLeftPanelOpened={isLeftPanelOpened}>
      <CloseIcon className="close-icon" onClick={toggleLeftPanel} />
      {Object.values(PAGE_LINKS).map(pageLink => (
        <div className="pageLink" key={pageLink} onClick={() => handleNavigateToPage(pageLink)}>
          <p>{PAGE_NAMES[pageLink]}</p>
        </div>
      ))}
    </ScLeftPanel>
  );
};

LeftPanel.propTypes = {};

LeftPanel.defaultProps = {};

export default LeftPanel;
