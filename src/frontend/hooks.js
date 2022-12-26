import { useEffect } from 'react';

// eslint-disable-next-line import/prefer-default-export
export const useClickOutsideAlert = (ref, callback) => {
  useEffect(() => {
    const handleClickOutside = e => {
      if (ref.current && !ref.current.contains(e.target)) {
        callback();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref]);
};
