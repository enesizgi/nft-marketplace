import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { theme } from '../constants';
import LandingGif from '../assets/landing.gif';
import LandingWebp from '../assets/landing.webp';
import LandingAvif from '../assets/landing.avif';
import { ReactComponent as NFTAOTextLogo } from '../assets/nftao-text.svg';

const ScLanding = styled.div`
  position: relative;
  @media screen and (max-width: 480px) {
    height: 200px;
  }
  max-height: 300px;
  min-width: 100%;
  overflow: hidden;

  .nftao-text-logo {
    max-height: 170px;
    position: absolute;
    top: calc(50% + 25px);
    left: 50%;
    transform: translate(-50%, -50%);

    @media screen and (max-width: 768px) {
      width: 80%;
    }

    @media screen and (max-width: 480px) {
      height: calc(50% - 40px);
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
    width: 100%;
    max-height: 350px;
    @media screen and (max-width: 480px) {
      height: 100%;
    }
  }
`;

const Landing = () => {
  const [imageSrc, setImageSrc] = useState(null);
  useEffect(() => {
    const isSupported = src =>
      new Promise((resolve, reject) => {
        // reject(new Error('Failed to load image'));
        try {
          const img = new Image();
          img.onload = () => resolve(src);
          img.onerror = () => reject(new Error('Failed to load image'));
          img.src = src;
        } catch (e) {
          reject(e);
        }
      });

    const load = async images => {
      try {
        const src = await isSupported(LandingAvif);
        setImageSrc(src);
      } catch (e) {
        if (images.length > 0) {
          images.shift();
          load(images);
        } else {
          console.log('Failed to load image');
        }
      }
    };

    load([LandingAvif, LandingWebp, LandingGif]);
  }, []);

  return (
    <ScLanding>
      <img alt="landing-gif" src={imageSrc} className="landing-gif" />
      {/* <img alt="landing-gif" src={LandingAvif} className="landing-gif" /> */}
      {/* <img alt="landing-gif" src={LandingWebp} className="landing-gif" /> */}
      <NFTAOTextLogo className="nftao-text-logo" />
    </ScLanding>
  );
};

export default Landing;
