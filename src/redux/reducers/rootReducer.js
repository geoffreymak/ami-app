import {combineReducers} from 'redux';

import loginReducer from './loginReducer';
import adminReducer from './adminReducer';
import membersReducer from './membersReducer';
import transactionsReducer from './transactionsReducer';
import settingReducer from './settingReducer';

const rootReducer = combineReducers({
  login: loginReducer,
  settings: settingReducer,
  admin: adminReducer,
  members: membersReducer,
  transactions: transactionsReducer,
});

export default rootReducer;
