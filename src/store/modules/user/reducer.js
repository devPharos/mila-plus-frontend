import { produce } from "immer";

const INITIAL_STATE = {
  filial: {
    code: "",
    name: "",
    active: true,
  },
  profile: null,
  loading: false,
};

export default function user(state = INITIAL_STATE, action) {
  return produce(state, (draft) => {
    switch (action.type) {
      // case "@auth/LOGIN_SUCCESS": {
      //   draft.profile = action.payload.user;
      //   break;
      // }
      // case "@user/UPDATE_PROFILE_SUCCESS": {
      //   draft.profile = action.payload.profile;
      //   break;
      // }
      // case "@auth/LOGOUT": {
      //   draft.profile = null;
      //   break;
      // }
      case "@auth/UPDATE_PROFILE_REQUEST": {
        console.log("UPDATE_PROFILE_REQUEST");
        draft.loading = true;
        break;
      }
      case "@auth/UPDATE_PROFILE_SUCCESS": {
        console.log("UPDATE_PROFILE_SUCCESS");
        draft.profile = { ...draft.profile, ...action.payload.profile };
        draft.loading = false;
        break;
      }
      case "@auth/UPDATE_PROFILE_FAILURE": {
        console.log("UPDATE_PROFILE_FAILURE");
        draft.loading = false;
        break;
      }
      default:
        return state;
    }
  });
}
