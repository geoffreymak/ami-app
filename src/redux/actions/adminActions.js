import firestore from '@react-native-firebase/firestore';

export const RESET_DATA = 'RESET_DATA';
export const SET_ADMIN_DATA = 'SET_ADMIN_DATA';
export const SET_ADMIN_LIST_DATA = 'SET_ADMIN_LIST_DATA';
export const REMOVE_ADMIN_DATA = 'REMOVE_ADMIN_DATA';
export const ADMIN_LOGGED_OUT = 'ADMIN_LOGGED_OUT';
export const ADD_ADMIN_LOADING = 'ADD_ADMIN_LOADING';
export const ADD_ADMIN_SUCCESS = 'ADD_ADMIN_SUCCESS';
export const ADD_ADMIN_ERROR = 'ADD_ADMIN_ERROR';
export const REMOVE_ADMIN_UPDATING = 'REMOVE_ADMIN_UPDATING';
export const SET_ADMIN_UPDATING = 'SET_ADMIN_UPDATING';
export const RESET_LOADING_STATE = 'RESET_LOADING_STATE';
export const SET_ADMINS_TRANSACTION_DATA = 'SET_ADMINS_TRANSACTION_DATA';
export const SET_ADMIN_TRANSACTION_ERROR = 'SET_ADMIN_TRANSACTION_ERROR';
export const ADD_ADMIN = 'ADD_ADMIN';

export const UPDATE_ADMIN = 'UPDATE_ADMIN';

export function setAdminData(admin) {
  return (dispatch) => {
    dispatch({
      type: SET_ADMIN_DATA,
      data: admin,
    });
  };
}

export function resetLoading() {
  return (dispatch) => {
    dispatch({
      type: RESET_LOADING_STATE,
    });
  };
}

export function setAdminUpdate(admin) {
  return (dispatch) => {
    dispatch({
      type: SET_ADMIN_UPDATING,
      data: admin,
    });
  };
}

export function removeAdminUpdate() {
  return (dispatch) => {
    dispatch({
      type: REMOVE_ADMIN_UPDATING,
    });
  };
}

export function logoutAdmin() {
  return (dispatch) => {
    dispatch({
      type: ADMIN_LOGGED_OUT,
    });
  };
}

export function addAdmin(admin) {
  return (dispatch) => {
    dispatch({
      type: ADD_ADMIN_LOADING,
    });
    const db = firestore();
    const adminRef = db.collection('admins');

    adminRef
      .where('username', '==', admin.username)
      .limit(1)
      .get()
      .then((querySnapshot) => {
        if (querySnapshot.empty) {
          adminRef
            .add(admin)
            .then((docRef) => {
              console.log('Document written with ID: ', docRef.id);

              const countersRef = db.collection('counters').doc('counters');
              const increment = firestore.FieldValue.increment(1);

              return countersRef.get().then((doc) => {
                const count = doc.exists && doc.data().admins;
                return countersRef.update({admins: increment}).then(() => {
                  return docRef.update({
                    id: `${admin.attribut}${count + 1}`,
                    code: docRef.id,
                  });
                });
              });
            })
            .then(() => {
              dispatch({
                type: ADD_ADMIN_SUCCESS,
              });
            });
        } else {
          dispatch({
            type: ADD_ADMIN_ERROR,
            data: {username: "Ce nom d'utilisateur existe déja !"},
          });
        }
      })
      .catch((error) => {
        console.error('Error adding document: ', error);
        dispatch({
          type: ADD_ADMIN_ERROR,
          data: error,
        });
      });
  };
}

export function updateAdmin(admin, newData, selfData = false) {
  return (dispatch) => {
    if (!admin) return;

    dispatch({
      type: ADD_ADMIN_LOADING,
    });

    const db = firestore();

    db.collection('admins')
      .doc(admin.code)
      .update(newData)
      .then(() => {
        console.log('Document successfully added!');
        dispatch({
          type: ADD_ADMIN_SUCCESS,
        });
      })
      .catch((error) => {
        console.error('Error adding document: ', error);
        dispatch({
          type: ADD_ADMIN_ERROR,
          data: error,
        });
      });
  };
}

export function getAdminsTransaction(admin) {
  return (dispatch) => {
    const db = firestore();

    dispatch({
      type: ADD_ADMIN_LOADING,
    });

    const transactionRef = db.collection('transactions');
    let query = db.collection('admins');

    if (admin.attribut === 'A3') {
      query = query.where('code', '==', admin.code);
    }

    if (admin.attribut === 'A2') {
      query = query.where('attribut', '!=', 'A1');
    }

    query
      .get()
      .then((querySnapshot) => {
        let transactions = {};
        const promises = [];

        querySnapshot.forEach((adminDoc) => {
          promises.push(
            transactionRef
              .where('code_admin', '==', adminDoc.id)
              .get()
              .then((querySnapshot) => {
                if (!querySnapshot.empty) {
                  const transaction = querySnapshot.docs.map(function (doc) {
                    return doc.data();
                  });
                  transactions = {
                    ...transactions,
                    [adminDoc.id]: {admin: adminDoc.data(), transaction},
                  };
                }
              }),
          );
        });

        return Promise.all(promises).then(() => {
          dispatch({
            type: SET_ADMINS_TRANSACTION_DATA,
            data: Object.values(transactions),
          });

          dispatch({
            type: ADD_ADMIN_SUCCESS,
          });
        });
      })
      .catch((error) => {
        dispatch({
          type: SET_ADMIN_TRANSACTION_ERROR,
        });

        dispatch({
          type: ADD_ADMIN_ERROR,
          data: error,
        });
        console.log(error);
      });
  };
}

/* export function getAdmins(admin = {}) {
  return (dispatch) => {
    const db = firestore();
    let query = db.collection('admins');

    if (admin.attribut === 'A3') {
      return;
    }

    if (admin.attribut === 'A2') {
      query = query.where('attribut', '!=', 'A1');
    }

    query
      .get()
      .then((querySnapshot) => {
        const admins = querySnapshot.docs
          .map((doc) => doc.data())
          .filter((v) => v.code !== admin.code);
        dispatch({
          type: SET_ADMIN_LIST_DATA,
          data: admins,
        });
      })
      .catch((error) => {
        console.log(error);
      });
  };
} */

export function getAdmins() {
  return (dispatch, getState) => {
    const db = firestore();
    const {data: admin} = getState().admin;
    if (!admin) return;

    let query = db.collection('admins');

    if (admin.attribut === 'A3') {
      return;
    }

    if (admin.attribut === 'A2') {
      query = query.where('attribut', '==', 'A3');
    }

    query.onSnapshot(
      (querySnapshot) => {
        const admins = querySnapshot.docs
          .map((doc) => doc.data())
          .filter((v) => v.code !== admin.code);
        dispatch({
          type: SET_ADMIN_LIST_DATA,
          data: admins,
        });
      },
      (error) => {
        console.log(error);
      },
    );
  };
}

export function deleteAdmin(admin) {
  return (dispatch) => {
    if (!admin) return;

    dispatch({
      type: ADD_ADMIN_LOADING,
    });

    const db = firestore();
    db.collection('admins')
      .doc(admin.code)
      .delete()
      .then(() => {
        console.log('Document successfully deleted!');
        dispatch({
          type: ADD_ADMIN_SUCCESS,
        });
      })
      .catch((error) => {
        console.error('Error deleting document: ', error);
      });
  };
}
