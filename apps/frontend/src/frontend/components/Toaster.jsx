import { createPortal } from 'react-dom';
import { useToast } from '@chakra-ui/react';
import { useSelector } from 'react-redux';
import { getToastInfo } from '../store/selectors';

const Toaster = () => {
  const toastInfo = useSelector(getToastInfo);
  const toast = useToast();

  const action = toastInfo
    ? toast({
        title: toastInfo.title,
        description: toastInfo.title,
        status: toastInfo.status,
        duration: 2000,
        position: 'top-right',
        isClosable: true
      })
    : null;

  return createPortal(action, document.getElementById('toast-root'));
};

export default Toaster;
