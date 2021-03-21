import firestore from '@react-native-firebase/firestore';

import {setAdminData} from './adminActions';

export const RESET_DATA = 'RESET_DATA';
export const LOGOUT_ADMIN = 'LOGOUT_ADMIN';
export const LOGIN_ERROR = 'LOGIN_ERROR';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_LOADING = 'LOGIN_LOADING';

export function loginAdmin({username, password}) {
  return (dispatch) => {
    dispatch({
      type: LOGIN_LOADING,
    });

    const db = firestore();
    db.collection('admins')
      .where('username', '==', username)
      .limit(1)
      .get()
      .then((querySnapshot) => {
        if (querySnapshot.empty) {
          dispatch({
            type: LOGIN_ERROR,
            data: {username: "nom d'utilisateur incorect !"},
          });
        } else {
          const admin = querySnapshot.docs.map(function (doc) {
            return doc.data();
          });

          if (admin[0].password === password) {
            dispatch(setAdminData(admin[0]));
            dispatch({
              type: LOGIN_SUCCESS,
            });
            console.log('login success !');
          } else {
            dispatch({
              type: LOGIN_ERROR,
              data: {password: 'mot de passe incorect !'},
            });
          }
        }
      })
      .catch((e) => {
        return dispatch({
          type: LOGIN_ERROR,
          data: {
            username: 'Nous avons rencotré un problème lors de la connexion !',
            password: 'Nous avons rencotré un problème lors de la connexion !',
          },
        });
      });
  };
}

export function logoutAdmin() {
  return (dispatch) => {
    dispatch({
      type: RESET_DATA,
    });
  };
}
