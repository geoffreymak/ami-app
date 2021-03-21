import {
  RESET_DATA,
  SET_MEMBERS_DATA,
  ADD_MEMBER_LOADING,
  ADD_MEMBER_ERROR,
  ADD_MEMBER_SUCCESS,
  SET_MEMBER_UPDATING,
  REMOVE_MEMBER_UPDATING,
  SET_MEMBERS_TRANSACTION_DATA,
  ADD_MEMBER,
  UPDATE_MEMBER,
} from '../actions/membersActions';

const initialState = {
  data: [],
  updatedMember: null,
  membersTransaction: null,
  adding: {
    loading: false,
    success: false,
    error: null,
  },
};

const membersReducer = function (state = initialState, action) {
  switch (action.type) {
    case SET_MEMBERS_DATA: {
      return {
        ...state,
        data: [...action.data],
      };
    }

    case ADD_MEMBER: {
      return {
        ...state,
        data: [action.data, ...state.data],
      };
    }

    case UPDATE_MEMBER: {
      return {
        ...state,
        data: state.data.map((member) => {
          if (member.code === action.data.code) return action.data;
          return member;
        }),
      };
    }

    case SET_MEMBERS_TRANSACTION_DATA: {
      return {
        ...state,
        membersTransaction: action.data,
      };
    }

    case SET_MEMBER_UPDATING: {
      return {
        ...state,
        updatedMember: action.data,
      };
    }

    case REMOVE_MEMBER_UPDATING: {
      return {
        ...state,
        updatedMember: null,
      };
    }

    case ADD_MEMBER_LOADING: {
      return {
        ...state,
        adding: {loading: true},
      };
    }

    case ADD_MEMBER_ERROR: {
      return {
        ...state,
        adding: {error: action.data},
      };
    }

    case ADD_MEMBER_SUCCESS: {
      return {
        ...state,
        adding: {success: true, loading: false},
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

export default membersReducer;
