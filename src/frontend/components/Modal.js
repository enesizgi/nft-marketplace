import React, { useRef } from 'react';
import { node, func } from 'prop-types';
import styled from 'styled-components';
import { createPortal } from 'react-dom';
import { ReactComponent as CloseIcon } from '../assets/close-icon-2.svg';
import { useClickOutsideAlert } from '../hooks';

const ScModal = styled.div`
  position: fixed;
  left: 0px;
  top: 0px;
  width: 100%;
  height: 100%;
  max-height: 100%;
  max-width: 100%;
  z-index: 1000;
  background-color: rgba(35, 37, 42, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;

  .modal-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 90%;
    margin: auto;
    padding: 60px 30px;
    overflow: hidden;
    background: #fff;
    border-radius: 10px;
    position: relative;
    > * {
      max-height: 100%;
      max-width: 100%;
    }
    @keyframes appear {
      0% {
        transform: scale(0);
      }
      50% {
        transform: scale(0.5);
      }
      100% {
        transform: scale(1);
      }
    }
    animation: 0.2s ease-in 1 appear;
    .modal-close {
      display: flex;
      justify-content: center;
      position: absolute;
      top: 20px;
      right: 20px;
      width: 40px;
      height: 40px;
      background: #fff;
      border: 1px solid #fff;
      border-radius: 50%;
      padding: 7px;
      cursor: pointer;
      > svg {
        width: 100%;
        height: 100%;
      }
    }
  }
`;

const Modal = ({ children, onClose }) => {
  const modalRef = useRef();
  useClickOutsideAlert(modalRef, onClose, []);

  return createPortal(
    <ScModal>
      <div className="modal-content" ref={modalRef}>
        <button type="button" onClick={onClose} className="modal-close">
          <CloseIcon />
        </button>
        {children}
      </div>
    </ScModal>,
    document.getElementById('modal-root')
  );
};

Modal.propTypes = {
  children: node.isRequired,
  onClose: func
};

Modal.defaultProps = {
  onClose: f => f
};

export default Modal;
