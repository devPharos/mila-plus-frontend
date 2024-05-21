import { produce } from 'immer';

const INITIAL_STATE = {
  filial: {
    code: '',
    name: '',
    active: true
  },
    profile: null,
  }

export default function user(state = INITIAL_STATE, action) {
  return produce(state, draft => {
  switch (action.type) {
    case '@auth/LOGIN_SUCCESS': {
      draft.profile = action.payload.user;
      break;
    }
    case '@user/UPDATE_PROFILE_SUCCESS': {
      draft.profile = action.payload.profile;
      break;
    }
    case '@auth/LOGOUT': {
      draft.profile = null;
      break;
    }
    default:
  }
});
}