import {
  LOGIN_SUCCESS,
  LOGIN_ERROR,
  LOGIN_LOADING,
  RESET_DATA,
  LOGOUT_ADMIN,
} from '../actions/loginActions';

const initialState = {
  success: false,
  loading: false,
  error: {
    username: null,
    password: null,
  },
};

const loginReducer = function (state = initialState, action) {
  switch (action.type) {
    case LOGIN_LOADING: {
      return {
        ...state,
        loading: true,
      };
    }
    case LOGIN_SUCCESS: {
      return {
        ...state,
        success: true,
        loading: false,
      };
    }

    case LOGIN_ERROR: {
      return {
        success: false,
        loading: false,
        error: action.data,
      };
    }

    case LOGOUT_ADMIN: {
      return initialState;
    }

    case RESET_DATA: {
      return initialState;
    }

    default: {
      return state;
    }
  }
};

export default loginReducer;
