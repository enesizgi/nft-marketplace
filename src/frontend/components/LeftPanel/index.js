import React, { useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useClickOutsideAlert } from '../../hooks';
import { PAGE_LINKS, PAGE_NAMES } from '../../constants';
import { ReactComponent as CloseIcon } from '../../assets/close-icon.svg';
import { getIsLeftPanelOpened } from '../../store/selectors';
import { setLeftPanelOpened } from '../../store/uiSlice';

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

const LeftPanel = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const nodeRef = useRef();

  const isLeftPanelOpened = useSelector(getIsLeftPanelOpened);

  const toggleLeftPanel = () => dispatch(setLeftPanelOpened(!isLeftPanelOpened));

  const handleNavigateToPage = pageLink => {
    navigate(`/${pageLink}`);
    toggleLeftPanel();
  };

  useClickOutsideAlert(
    nodeRef,
    _isLeftPanelOpened => {
      if (_isLeftPanelOpened) {
        dispatch(setLeftPanelOpened(false));
      }
    },
    [isLeftPanelOpened]
  );

  return (
    <ScLeftPanel ref={nodeRef} isLeftPanelOpened={isLeftPanelOpened}>
      <CloseIcon className="close-icon" onClick={toggleLeftPanel} />
      {Object.values(PAGE_LINKS).map(pageLink => (
        <button type="button" className="pageLink" key={pageLink} onClick={() => handleNavigateToPage(pageLink)}>
          <p>{PAGE_NAMES[pageLink]}</p>
        </button>
      ))}
    </ScLeftPanel>
  );
};

export default LeftPanel;
