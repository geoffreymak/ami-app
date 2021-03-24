import firestore from '@react-native-firebase/firestore';

export const RESET_DATA = 'RESET_DATA';
export const SET_TRANSACTION_DATA = 'SET_TRANSACTION_DATA';
export const ADD_TRANSACTION_LOADING = 'ADD_TRANSACTION_LOADING';
export const ADD_TRANSACTION_SUCCESS = 'ADD_TRANSACTION_SUCCESS';
export const ADD_TRANSACTION_ERROR = 'ADD_TRANSACTION_ERROR';
export const ADD_TRANSACTION = 'ADD_TRANSACTION';
export const SET_TRANSACTIONS = 'SET_TRANSACTIONS';
export const DELETE_TRANSACTION = 'DELETE_TRANSACTION';

const MISE_PREFIX_E = 'MS1';
const MISE_PREFIX_C = 'MS2';
export function setMembersData(data) {
  return (dispatch) => {
    dispatch({
      type: SET_MEMBERS_DATA,
      data,
    });
  };
}

export function watchTransactions() {
  return (dispatch, getState) => {
    const db = firestore();
    const {data: admin} = getState().admin;
    if (!admin) return;

    let query = db.collection('transactions_v2');
    //query = query.where('compte', '==', member.compte);
    if (admin.attribut === 'A3') {
      query = query.where('code_admin', '==', admin.code);
    }
    query.onSnapshot(
      (querySnapshot) => {
        const transaction = querySnapshot.docs.map(function (doc) {
          return doc.data();
        });
        dispatch({
          type: SET_TRANSACTION_DATA,
          data: transaction,
        });
      },
      (error) => {},
    );
  };
}

export function getTransaction(member, transCategory) {
  return (dispatch) => {
    if (!member || !transCategory) return null;
    const db = firestore();
    let query = db.collection('transactions');
    query = query.where('compte', '==', member.compte);
    query = query.where('category', '==', transCategory);
    query
      .get()
      .then((querySnapshot) => {
        const transaction = querySnapshot.docs
          .map(function (doc) {
            return doc.data();
          })
          .sort((a, b) => b.addTimestamp - a.addTimestamp);

        dispatch({
          type: SET_TRANSACTION_DATA,
          data: {[member.compte]: transaction},
        });
      })
      .catch((e) => {
        dispatch({
          type: ADD_TRANSACTION_ERROR,
          data: e,
        });
      });
  };
}

export function getTransactions(admin, transCategory) {
  return (dispatch) => {
    if (!admin || !transCategory) return null;
    const db = firestore();
    dispatch({
      type: ADD_TRANSACTION_LOADING,
    });

    let query = db.collection('transactions');
    if (admin.attribut === 'A3') {
      query = query.where('code_admin', '==', admin.code);
    }

    query = query.where('category', '==', transCategory);

    query
      .get()
      .then((querySnapshot) => {
        const transaction = querySnapshot.docs
          .map(function (doc) {
            return doc.data();
          })
          .sort((a, b) => b.addTimestamp - a.addTimestamp);

        dispatch({
          type: SET_TRANSACTIONS,
          data: transaction,
        });
        dispatch({
          type: ADD_TRANSACTION_SUCCESS,
        });
      })
      .catch((e) => {
        dispatch({
          type: ADD_TRANSACTION_ERROR,
          data: e,
        });
      });
  };
}

export function addMise(mise) {
  return (dispatch) => {
    dispatch({
      type: ADD_TRANSACTION_LOADING,
    });
    const db = firestore();
    db.collection('transactions_v2')
      .add(mise)
      .then((docRef) => {
        console.log('add mise...');
        return docRef.update({
          code: docRef.id,
          date_firebase: firestore.FieldValue.serverTimestamp(),
        });
      })
      .then(() => {
        dispatch({
          type: ADD_TRANSACTION_SUCCESS,
        });
      })
      .catch((error) => {
        console.error('Error adding mise: ', error);
        dispatch({
          type: ADD_TRANSACTION_ERROR,
          data: error,
        });
      });
  };
}

export function addTransaction(data) {
  return (dispatch) => {
    dispatch({
      type: ADD_TRANSACTION_LOADING,
    });

    const db = firestore();
    db.collection('transactions_v2')
      .doc(data.code)
      .update(data)
      .then(() => {
        console.log('Document successfully added!');
        dispatch({
          type: ADD_TRANSACTION_SUCCESS,
        });
      })
      .catch((error) => {
        console.error('Error adding document: ', error);
        dispatch({
          type: ADD_TRANSACTION_ERROR,
          data: error,
        });
      });
  };
}

export function deleteTransaction(transaction) {
  return (dispatch) => {
    if (!transaction) return;

    dispatch({
      type: ADD_TRANSACTION_LOADING,
    });

    const db = firestore();
    db.collection('transactions')
      .doc(transaction.code)
      .delete()
      .then(() => {
        console.log('Document successfully deleted!');
        dispatch({
          type: ADD_TRANSACTION_SUCCESS,
        });
        dispatch({
          type: DELETE_TRANSACTION,
          data: transaction,
        });
      })
      .catch((error) => {
        console.error('Error deleting document: ', error);
        dispatch({
          type: ADD_TRANSACTION_ERROR,
          data: error,
        });
      });
  };
}

export function updateTransaction(admin, transaction, newData) {
  return (dispatch) => {
    if (!admin || !transaction) return;

    dispatch({
      type: ADD_TRANSACTION_LOADING,
    });

    const db = firestore();
    db.collection('transactions')
      .doc(transaction.code)
      .update(newData)
      .then(() => {
        console.log('Document successfully added!');
        dispatch({
          type: ADD_TRANSACTION_SUCCESS,
        });
      })
      .catch((error) => {
        console.error('Error adding document: ', error);
        dispatch({
          type: ADD_TRANSACTION_ERROR,
          data: error,
        });
      });
  };
}
