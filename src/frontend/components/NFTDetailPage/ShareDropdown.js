/* eslint-disable */
import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { FacebookShareButton, LinkedinShareButton, TwitterShareButton, WhatsappShareButton } from 'react-share';
import { FaShareAltSquare, FaFacebook, FaLinkedin, FaTwitterSquare, FaWhatsappSquare } from 'react-icons/fa';

const ShareDropdown = ({ url, title }) => {
  return (
    <Dropdown>
      <Dropdown.Toggle variant="secondary" id="share-dropdown">
        <FaShareAltSquare style={{ fontSize: '20px', color: '#ffffff' }} />
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <Dropdown.Item>
          <FacebookShareButton url={url} quote={title}>
            <button className="btn btn-secondary btn-sm">
              <FaFacebook style={{ fontSize: '20px', color: '#ffffff' }} />
            </button>
          </FacebookShareButton>
        </Dropdown.Item>
        <Dropdown.Item>
          <LinkedinShareButton url={url} title={title}>
            <button className="btn btn-secondary btn-sm">
              <FaLinkedin style={{ fontSize: '20px', color: '#ffffff' }} />
            </button>
          </LinkedinShareButton>
        </Dropdown.Item>
        <Dropdown.Item>
          <TwitterShareButton url={url} title={title}>
            <button className="btn btn-secondary btn-sm">
              <FaTwitterSquare style={{ fontSize: '20px', color: '#ffffff' }} />
            </button>
          </TwitterShareButton>
        </Dropdown.Item>
        <Dropdown.Item>
          <WhatsappShareButton url={url} title={title}>
            <button className="btn btn-secondary btn-sm">
              <FaWhatsappSquare style={{ fontSize: '20px', color: '#ffffff' }} />
            </button>
          </WhatsappShareButton>
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default ShareDropdown;
