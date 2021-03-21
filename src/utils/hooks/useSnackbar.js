import {useDispatch} from 'react-redux';
/* import {Snackbar} from 'react-native-paper'; */
import {useNetInfo} from '@react-native-community/netinfo';

import {setSnackState} from '../../redux/actions/settingActions';

const useSnackbar = () => {
  const dispatch = useDispatch();
  const {isConnected} = useNetInfo();
  /* const hide = () => dispatch(setSnackState(null)); */
  const checkConnection = () => {
    if (!isConnected) {
      dispatch(setSnackState("Vous n'etes pas connecté à internet !"));
      return false;
    }
    return true;
  };

  const showSnackbar = (text) => dispatch(setSnackState(text));

  return {showSnackbar, checkConnection};
};

export default useSnackbar;
