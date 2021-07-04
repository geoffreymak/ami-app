import firestore from '@react-native-firebase/firestore';

export const RESET_DATA = 'RESET_DATA';
export const SET_MEMBERS_DATA = 'SET_MEMBERS_DATA';
export const ADD_MEMBER_LOADING = 'ADD_MEMBER_LOADING';
export const ADD_MEMBER_SUCCESS = 'ADD_MEMBER_SUCCESS';
export const ADD_MEMBER_ERROR = 'ADD_MEMBER_ERROR';
export const SET_MEMBER_UPDATING = 'SET_MEMBER_UPDATING';
export const SET_MEMBERS_TRANSACTION_DATA = 'SET_MEMBERS_TRANSACTION_DATA';
export const SET_MEMBERS_TRANSACTION_ERROR = 'SET_MEMBERS_TRANSACTION_ERROR';
export const REMOVE_MEMBER_UPDATING = 'REMOVE_MEMBER_UPDATING';
export const ADD_MEMBER = 'ADD_MEMBER';
export const UPDATE_MEMBER = 'UPDATE_MEMBER';

const MEMBERS_PREFIX = 'M1';

export function setMembersData(data) {
  return (dispatch) => {
    dispatch({
      type: SET_MEMBERS_DATA,
      data,
    });
  };
}

export function setMemberUpdate(member) {
  return (dispatch) => {
    dispatch({
      type: SET_MEMBER_UPDATING,
      data: member,
    });
  };
}

export function removeMemberUpdate() {
  return (dispatch) => {
    dispatch({
      type: REMOVE_MEMBER_UPDATING,
    });
  };
}

export function getMembersTransaction(admin) {
  return (dispatch) => {
    const db = firestore();

    dispatch({
      type: ADD_MEMBER_LOADING,
    });

    const transactionRef = db.collection('transactions');
    let query = db.collection('members');
    query = query.where('isActive', '==', true);
    query = query.where('isBlocked', '==', false);

    if (admin.attribut === 'A3') {
      query = query.where('code_admin', '==', admin.code);
    }

    if (admin.attribut === 'A2') {
      query = query.where('isSuper', '==', false);
    }

    query
      .get()
      .then((querySnapshot) => {
        let transactions = {};
        const promises = [];

        querySnapshot.forEach((memberDoc) => {
          promises.push(
            transactionRef
              .where('compte', '==', memberDoc.id)
              .get()
              .then((querySnapshot) => {
                const transaction = querySnapshot.docs.map(function (doc) {
                  return doc.data();
                });
                transactions = {
                  ...transactions,
                  [memberDoc.id]: {member: memberDoc.data(), transaction},
                };
              }),
          );
        });

        return Promise.all(promises).then(() => {
          dispatch({
            type: SET_MEMBERS_TRANSACTION_DATA,
            data: Object.values(transactions),
          });

          dispatch({
            type: ADD_MEMBER_SUCCESS,
          });
        });
      })
      .catch((error) => {
        dispatch({
          type: SET_MEMBERS_TRANSACTION_ERROR,
        });
        dispatch({
          type: ADD_MEMBER_ERROR,
          data: error,
        });
        console.log(error);
      });
  };
}

/* export function getMembers(admin) {
  return (dispatch) => {
    const db = firestore();

    let query = db.collection('members');

    if (admin.attribut === 'A3') {
      query = query.where('code_admin', '==', admin.code);
    }

    if (admin.attribut === 'A2') {
      query = query.where('isSuper', '==', false);
    }

    query = query.where('isBlocked', '==', false);
    query = query.orderBy('nom', 'asc');

    query
      .get()
      .then((querySnapshot) => {
        const members = querySnapshot.docs.map(function (doc) {
          return doc.data();
        });
        dispatch({
          type: SET_MEMBERS_DATA,
          data: members,
        });
      })
      .catch((error) => {
        console.log(error);
      });
  };
}
 */

export function getMembers() {
  return (dispatch, getState) => {
    const db = firestore();
    const {data: admin} = getState().admin;
    if (!admin) return;

    let query = db.collection('members');

    if (admin.attribut === 'A3') {
      query = query.where('code_admin', '==', admin.code);
    }

    if (admin.attribut === 'A2') {
      query = query.where('isSuper', '==', false);
    }

    query = query.where('isBlocked', '==', false);
    query = query.orderBy('nom', 'asc');

    query.onSnapshot(
      (querySnapshot) => {
        const members = querySnapshot.docs.map(function (doc) {
          return doc.data();
        });
        dispatch({
          type: SET_MEMBERS_DATA,
          data: members,
        });
      },
      (error) => {
        console.log(error);
      },
    );
  };
}

export function addMember(member) {
  return (dispatch) => {
    dispatch({
      type: ADD_MEMBER_LOADING,
    });

    const db = firestore();
    db.collection('members')
      .add(member)
      .then((docRef) => {
        console.log('Document written with ID: ', docRef.id);

        const countersRef = db.collection('counters').doc('counters');
        const increment = firestore.FieldValue.increment(1);

        return countersRef.get().then((doc) => {
          const count = doc.exists && doc.data().members;
          return countersRef.update({members: increment}).then(() => {
            return docRef.update({
              id: `${MEMBERS_PREFIX}${count + 1}`,
              compte: docRef.id,
              code: docRef.id,
            });
          });
        });
      })
      .then(() => {
        console.log('Document successfully added!');
        dispatch({
          type: ADD_MEMBER_SUCCESS,
        });
      })
      .catch((error) => {
        console.error('Error adding document: ', error);
        dispatch({
          type: ADD_MEMBER_ERROR,
          data: error,
        });
      });
  };
}

export function updateMember(member, newData, updateTrans = false) {
  return (dispatch) => {
    if (!member) return;

    dispatch({
      type: ADD_MEMBER_LOADING,
    });

    const db = firestore();
    db.collection('members')
      .doc(member.code)
      .update(newData)
      .then(() => {
        console.log('Document Members successfully updated!');
        if (!!updateTrans) {
        }
        dispatch({
          type: ADD_MEMBER_SUCCESS,
        });
      })
      .catch((error) => {
        console.error('Error updating members document: ', error);
        dispatch({
          type: ADD_MEMBER_ERROR,
          data: error,
        });
      });
  };
}

export function deleteMember(member) {
  return (dispatch) => {
    if (!member) return;

    dispatch({
      type: ADD_MEMBER_LOADING,
    });

    const db = firestore();
    db.collection('members')
      .doc(member.code)
      .delete()
      .then(() => {
        console.log('Document successfully deleted!');
        dispatch({
          type: ADD_MEMBER_SUCCESS,
        });
      })
      .catch((error) => {
        console.error('Error deleting document: ', error);
      });
  };
}
