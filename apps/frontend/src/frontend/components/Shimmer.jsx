import React from 'react';
import styled from 'styled-components';
import { theme } from '../constants';

const ScShimmer = styled.div`
  background: linear-gradient(to right, ${theme.background} 10%, ${theme.secondaryBlue} 20%, ${theme.background} 30%);
  height: 100%;
  width: 100%;
  @keyframes shimmer {
    0% {
      background-position: -1000px;
    }

    100% {
      background-position: 1000px;
    }
  }
  animation: shimmer 3s linear infinite;
`;

const Shimmer = () => <ScShimmer />;

export default Shimmer;
