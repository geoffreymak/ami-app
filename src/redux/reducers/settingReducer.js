import {
  SET_DATA,
  RESET_DATA,
  SET_SNACK_DATA,
  SET_PREFERENCES_DATA,
} from '../actions/settingActions';

const initialState = {
  box_number: 31,
  snackbarText: '',
  themeName: '',
  primaryColor: '',
  toggleTheme: () => {},
  changePrimaryColor: () => {},
  preferencesIsMounted: false,
};

const settingReducer = function (state = initialState, action) {
  switch (action.type) {
    case SET_DATA: {
      return {
        ...state,
        ...action.data,
      };
    }

    case SET_SNACK_DATA: {
      return {
        ...state,
        snackbarText: action.data,
      };
    }

    case SET_PREFERENCES_DATA: {
      return {
        ...state,
        ...action.data,
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

export default settingReducer;
