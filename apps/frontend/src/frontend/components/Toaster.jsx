import { createPortal } from 'react-dom';
import { useToast } from '@chakra-ui/react';
import { useDispatch, useSelector } from 'react-redux';
import { getToastInfo } from '../store/selectors';
import { setToast } from '../store/uiSlice';

const Toaster = () => {
  const toastInfo = useSelector(getToastInfo);
  const toast = useToast();
  const dispatch = useDispatch();

  setTimeout(() => dispatch(setToast('')), 2000);

  const action = toastInfo
    ? toast({
        title: toastInfo.title,
        description: toastInfo.description,
        status: toastInfo.status,
        duration: 2000,
        position: 'top-right',
        isClosable: true
      })
    : null;

  return createPortal(action, document.getElementById('toast-root'));
};

export default Toaster;
