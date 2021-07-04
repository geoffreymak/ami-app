import firestore from '@react-native-firebase/firestore';

export const RESET_DATA = 'RESET_DATA';
export const SET_TRANSACTION_DATA = 'SET_TRANSACTION_DATA';
export const ADD_TRANSACTION_LOADING = 'ADD_TRANSACTION_LOADING';
export const ADD_TRANSACTION_SUCCESS = 'ADD_TRANSACTION_SUCCESS';
export const ADD_TRANSACTION_ERROR = 'ADD_TRANSACTION_ERROR';
export const ADD_TRANSACTION = 'ADD_TRANSACTION';
export const SET_TRANSACTIONS = 'SET_TRANSACTIONS';
export const SET_WAITING_TRANSACTION_DATA = 'SET_WAITING_TRANSACTION_DATA';
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
    query = query.where('isBlocked', '==', false);
    query.onSnapshot(
      (querySnapshot) => {
        const transactions = querySnapshot.docs.map(function (doc) {
          return doc.data();
        });
        dispatch({
          type: SET_TRANSACTION_DATA,
          data: transactions,
        });
      },
      (error) => {},
    );
  };
}

export function watchWaitingTransactions() {
  return (dispatch, getState) => {
    const db = firestore();
    const {data: admin} = getState().admin;
    if (!admin) return;

    let query = db.collection('revocations');
    //query = query.where('compte', '==', member.compte);
    if (admin.attribut === 'A3') {
      query = query.where('code_admin', '==', admin.code);
    }
    query = query.where('isBlocked', '==', false);
    query.onSnapshot(
      (querySnapshot) => {
        const waitingTransactions = querySnapshot.docs.map(function (doc) {
          return doc.data();
        });
        dispatch({
          type: SET_WAITING_TRANSACTION_DATA,
          data: waitingTransactions,
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

export function updateWaitingTransaction(data) {
  return (dispatch) => {
    dispatch({
      type: ADD_TRANSACTION_LOADING,
    });

    const db = firestore();
    db.collection('revocations')
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

export function deleteWaitingTransaction(data) {
  return (dispatch) => {
    dispatch({
      type: ADD_TRANSACTION_LOADING,
    });

    const db = firestore();
    db.collection('revocations')
      .doc(data.code)
      .delete()
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

export function addTransactionToTrash(data) {
  return (dispatch) => {
    dispatch({
      type: ADD_TRANSACTION_LOADING,
    });

    const db = firestore();
    db.collection('trash')
      .doc('transactions')
      .collection(data.code)
      .add(data)
      .then((docRef) => {
        console.log('add waiting trans...');
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
        console.error('Error adding waiting trans: ', error);
        dispatch({
          type: ADD_TRANSACTION_ERROR,
          data: error,
        });
      });
  };
}

export function addWaitingTransaction(data) {
  return (dispatch) => {
    dispatch({
      type: ADD_TRANSACTION_LOADING,
    });

    const db = firestore();
    db.collection('revocations')
      .add(data)
      .then((docRef) => {
        console.log('add waiting trans...');
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
        console.error('Error adding waiting trans: ', error);
        dispatch({
          type: ADD_TRANSACTION_ERROR,
          data: error,
        });
      });
  };
}

export function deleteMise(transaction) {
  return (dispatch) => {
    if (!transaction) return;

    dispatch({
      type: ADD_TRANSACTION_LOADING,
    });

    const db = firestore();
    db.collection('transactions_v2')
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

export function archiveTransaction(transaction) {
  return (dispatch) => {
    if (!transaction) return;

    dispatch({
      type: ADD_TRANSACTION_LOADING,
    });

    const db = firestore();
    const batch = db.batch();
    const transactionRef = db.collection('transactions_v2');
    console.log('archiving trans start ');
    const transCode = transaction
      .filter((t) => t.isActive === false)
      .map((t) => t.code);

    if (transCode?.length) {
      transCode.forEach((code) => {
        const ref = transactionRef.doc(code);
        batch.update(ref, {
          isBlocked: true,
          archiveDate: new Date().toISOString(),
        });
      });
    }

    batch
      .commit()
      .then(() => {
        console.log('archiving trans succes ');
        dispatch({
          type: ADD_TRANSACTION_SUCCESS,
        });
      })
      .catch((error) => {
        console.error('Error archiving trans: ', error);
        dispatch({
          type: ADD_TRANSACTION_ERROR,
          data: error,
        });
      });
  };
}

export function updateTransactions(member, newData) {
  return (dispatch, getState) => {
    if (!member || !newData) return;
    const {data: transactions} = getState().transactions;
    dispatch({
      type: ADD_TRANSACTION_LOADING,
    });

    const db = firestore();
    const batch = db.batch();
    const transactionRef = db.collection('transactions_v2');
    console.log('updating trans start ');
    const transCode = transactions
      .filter(
        (t) => t.code_admin === member.code_admin && t.compte === member.compte,
      )
      .map((t) => t.code);

    if (transCode?.length) {
      transCode.forEach((code) => {
        const ref = transactionRef.doc(code);
        batch.update(ref, newData);
      });
    }

    batch
      .commit()
      .then(() => {
        console.log('uptating trans succes ');
        dispatch({
          type: ADD_TRANSACTION_SUCCESS,
        });
      })
      .catch((error) => {
        console.error('Error updating trans: ', error);
        dispatch({
          type: ADD_TRANSACTION_ERROR,
          data: error,
        });
      });
  };
}

export function mergeTransaction() {
  return (dispatch) => {
    const db = firestore();
    const batch = db.batch();
    const transactionRef = db.collection('transactions_v2');
    console.log('starting !');
    let query = db.collection('transactions');

    query = query.where('compte', '==', 'Oed4TPokg08Qc1i59rbQ');
    query = query.where('category', '==', 'C');

    query
      .get()
      .then((querySnapshot) => {
        console.log('update migration !');
        let i = 1;
        const trans = querySnapshot.docs.map((doc) => {
          const e = doc.data();
          return {
            date: e.date,
            id: Math.floor(
              Math.random() * Math.floor(Math.random() * Date.now()),
            ).toString(),
            montant: e.montant,
            time: e.addTimestamp,
            type: e.type,
          };
        });

        transactionRef
          .doc('78l0sGQM4puErSfSMe0f')
          .update({transactions: trans})
          .then(() => console.log('update succesfuly'));

        /* for (const compte in transactionPerMember) {
          if (Object.hasOwnProperty.call(transactionPerMember, compte)) {
            const transactions = transactionPerMember[compte];
            const creditTrans = transactions.filter((t) => t.category === 'C');
            const epargneTrans = transactions.filter((t) => t.category === 'E');

            console.log('creditTrans', creditTrans);
            console.log('epargneTrans', epargneTrans);
            if (!!epargneTrans?.length) {
              const epargneDoc = {
                addDate: epargneTrans[0].date,
                addTimestamp: epargneTrans[0].addTimestamp,
                category: 'E',
                code: epargneTrans[0].code,
                code_admin: epargneTrans[0].code_admin,
                compte: epargneTrans[0].compte,
                date_firebase: epargneTrans[0].date_firebase,
                isActive: true,
                isBlocked: false,
                mise: 1000,
                real_code_admin: epargneTrans[0].code_admin,
                transactions: epargneTrans.map((e) => ({
                  date: e.date,
                  id: new Date().getTime().toString(),
                  montant: e.montant,
                  time: e.addTimestamp,
                  type: e.type,
                })),
              };

              db.collection('transactions_v2')
                .doc(epargneTrans[0].code)
                .set(epargneDoc)
                .then((docRef) => {
                  console.log('add epargneDoc...');
                });
            }

            if (!!creditTrans?.length) {
              const creditDoc = {
                addDate: creditTrans[0].date,
                addTimestamp: creditTrans[0].addTimestamp,
                category: 'C',
                code: creditTrans[0].code,
                code_admin: creditTrans[0].code_admin,
                compte: creditTrans[0].compte,
                dateDebut: creditTrans[0].date,
                dateFin: creditTrans[0].date,
                date_firebase: creditTrans[0].date_firebase,
                interet: 1000,
                isActive: true,
                isBlocked: false,
                mise: 1000,
                real_code_admin: creditTrans[0].code_admin,
                transactions: creditTrans.map((e) => ({
                  date: e.date,
                  id: new Date().getTime().toString(),
                  montant: e.montant,
                  time: e.addTimestamp,
                  type: e.type,
                })),
              };

              db.collection('transactions_v2')
                .doc(creditTrans[0].code)
                .set(creditDoc)
                .then((docRef) => {
                  console.log('add creditDoc...');
                });
            }
          }
        }

        console.log('transactionPerMember', transactionPerMember); */
      })

      .catch((e) => {
        console.log('error on migrate', e);
      });
  };
}
