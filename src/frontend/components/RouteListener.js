import { useLocation } from 'react-router';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setCurrentPath } from '../store/uiSlice';

const RouteListener = () => {
  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setCurrentPath(location.pathname));
  }, [location.pathname]);

  return null;
};

export default RouteListener;
