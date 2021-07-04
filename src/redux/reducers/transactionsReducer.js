import {
  ADD_TRANSACTION_ERROR,
  ADD_TRANSACTION_LOADING,
  ADD_TRANSACTION_SUCCESS,
  SET_TRANSACTION_DATA,
  SET_WAITING_TRANSACTION_DATA,
  RESET_DATA,
  ADD_TRANSACTION,
  SET_TRANSACTIONS,
  DELETE_TRANSACTION,
} from '../actions/transactionActions';

const initialState = {
  data: [],
  waiting: [],
  list: [],
  adding: {
    loading: false,
    success: false,
    error: null,
  },
};

const transactionsReducer = function (state = initialState, action) {
  switch (action.type) {
    case SET_TRANSACTION_DATA: {
      return {
        ...state,
        data: action.data,
      };
    }

    case SET_WAITING_TRANSACTION_DATA: {
      return {
        ...state,
        waiting: action.data,
      };
    }

    case SET_TRANSACTIONS: {
      return {
        ...state,
        list: action.data,
      };
    }

    case DELETE_TRANSACTION: {
      return {
        ...state,
        data: {
          ...state.data,
          [action.data.compte]: state.data[action.data.compte].filter(
            (t) => t.code !== action.data.code,
          ),
        },
      };
    }

    case ADD_TRANSACTION: {
      return {
        ...state,
        data: {
          ...state.data,
          [action.data.compte]: [
            action.data,
            ...state.data[action.data.compte],
          ],
        },
      };
    }

    case ADD_TRANSACTION_LOADING: {
      return {
        ...state,
        adding: {loading: true},
      };
    }

    case ADD_TRANSACTION_SUCCESS: {
      return {
        ...state,
        adding: {success: true, loading: false},
      };
    }

    case ADD_TRANSACTION_ERROR: {
      return {
        ...state,
        adding: {success: false, loading: false, error: action.data},
      };
    }

    case RESET_DATA: {
      return initialState;
    }

    default: {
      return state;
    }
  }
};

export default transactionsReducer;
