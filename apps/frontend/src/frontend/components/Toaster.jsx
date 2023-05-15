import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useToast } from '@chakra-ui/react';
import { useDispatch, useSelector } from 'react-redux';
import { getToastInfo } from '../store/selectors';
import { setToast } from '../store/uiSlice';

const Toaster = () => {
  const toastInfo = useSelector(getToastInfo);
  const toast = useToast();
  const [toasts, setToasts] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    if (toastInfo) {
      setToasts(prev => [...prev, toastInfo.id]);
      const duration = toastInfo.duration ?? 2000;
      setTimeout(() => {
        dispatch(setToast(''));
        setToasts(prev => prev.filter(tid => tid !== toastInfo.id));
      }, duration);
    }
  }, [toastInfo?.id]);

  const action =
    toastInfo && !toasts.find(tid => tid === toastInfo.id)
      ? toast({
          title: toastInfo.title,
          description: toastInfo.description,
          status: toastInfo.status,
          duration: toastInfo.duration ?? 2000,
          position: 'top-right',
          isClosable: true
        })
      : null;

  return createPortal(action, document.getElementById('toast-root'));
};

export default Toaster;
