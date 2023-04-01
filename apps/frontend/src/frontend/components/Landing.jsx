import React from 'react';
import styled from 'styled-components';
import { theme } from '../constants';
import LandingGif from '../assets/landing.gif';
import { ReactComponent as NFTAOTextLogo } from '../assets/nftao-text.svg';

const ScLanding = styled.div`
  position: relative;

  .nftao-text-logo {
    max-height: 170px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    @media screen and (max-width: 768px) {
      width: 80%;
    }

    @media screen and (max-width: 480px) {
      height: 80px;
      width: auto;
    }

    background: transparent;
    > g {
      fill: none;
      stroke: ${theme.blue};
      stroke-width: 100px;
    }
  }
  .landing-gif {
    @media screen and (max-width: 480px) {
      height: 270px;
    }
    max-height: 350px;
    min-width: 100%;
  }
`;

const Landing = () => (
  <ScLanding>
    <img alt="landing-gif" src={LandingGif} className="landing-gif" />
    <NFTAOTextLogo className="nftao-text-logo" />
  </ScLanding>
);

export default Landing;
