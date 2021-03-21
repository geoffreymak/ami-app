import {useEffect} from 'react';
import {useSelector, useDispatch} from 'react-redux';

import {getMembersTransaction} from '../../redux/actions/membersActions';
import {getAdminsTransaction} from '../../redux/actions/adminActions';

function useMembersData() {
  const dispatch = useDispatch();

  const admin = useSelector((state) => state.admin.data);

  const membersTransaction = useSelector(
    (state) => state.members.membersTransaction,
  );

  const adminsTransaction = useSelector(
    (state) => state.admin.adminsTransaction,
  );

  const transactions = useSelector((state) => state.transactions.data);

  useEffect(() => {
    dispatch(getMembersTransaction(admin));
    dispatch(getAdminsTransaction(admin));
  }, [admin, transactions]);

  return {membersTransaction, adminsTransaction};
}

export default useMembersData;
