import firestore from '@react-native-firebase/firestore';

export const RESET_DATA = 'RESET_DATA';
export const SET_DATA = 'SET_DATA';
export const SET_SNACK_DATA = 'SET_SNACK_DATA';
export const SET_PREFERENCES_DATA = 'SET_PREFERENCES_DATA';

export function getSettins() {
  return (dispatch) => {
    const db = firestore();

    db.collection('settings')
      .doc('settings')
      .get()
      .then((doc) => {
        const settings = doc.data();
        dispatch({
          type: SET_DATA,
          data: settings,
        });
      })
      .catch((error) => {
        console.error('Error getting setting: ', error);
      });
  };
}

export function setSnackState(state) {
  return (dispatch) => {
    dispatch({
      type: SET_SNACK_DATA,
      data: state,
    });
  };
}

export function setPreferencestate(state) {
  return (dispatch) => {
    dispatch({
      type: SET_PREFERENCES_DATA,
      data: state,
    });
  };
}
