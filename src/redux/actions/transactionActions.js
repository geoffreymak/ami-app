import firestore from '@react-native-firebase/firestore';

export const RESET_DATA = 'RESET_DATA';
export const SET_TRANSACTION_DATA = 'SET_TRANSACTION_DATA';
export const ADD_TRANSACTION_LOADING = 'ADD_TRANSACTION_LOADING';
export const ADD_TRANSACTION_SUCCESS = 'ADD_TRANSACTION_SUCCESS';
export const ADD_TRANSACTION_ERROR = 'ADD_TRANSACTION_ERROR';
export const ADD_TRANSACTION = 'ADD_TRANSACTION';
export const SET_TRANSACTIONS = 'SET_TRANSACTIONS';
export const DELETE_TRANSACTION = 'DELETE_TRANSACTION';

export function setMembersData(data) {
  return (dispatch) => {
    dispatch({
      type: SET_MEMBERS_DATA,
      data,
    });
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

export function addTransaction(transaction) {
  return (dispatch) => {
    dispatch({
      type: ADD_TRANSACTION_LOADING,
    });
    const db = firestore();
    db.collection('transactions')
      .add(transaction)
      .then((docRef) => {
        return db
          .collection('members')
          .doc(transaction.compte)
          .update({isActive: true})
          .then(() => {
            return docRef.update({
              code: docRef.id,
              timestamp: new Date().getTime(),
              date_firebase: firestore.FieldValue.serverTimestamp(),
            });
          })
          .then(() => {
            return db
              .collection('transactions')
              .doc(docRef.id)
              .get()
              .then((doc) => {
                if (doc.exists) {
                  dispatch({
                    type: ADD_TRANSACTION,
                    data: doc.data(),
                  });
                }
              });
          });
      })
      .then(() => {
        if (transaction.type === 'D') {
          db.collection('transactions_admin')
            .add(transaction)
            .then((docRef) => {
              return docRef.update({
                code: docRef.id,
                timestamp: new Date().getTime(),
                date_firebase: firestore.FieldValue.serverTimestamp(),
              });
            });
        }
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
