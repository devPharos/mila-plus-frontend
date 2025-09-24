import { produce } from "immer";

const INITIAL_STATE = {
  token: null,
  signed: false,
  loading: false,
  profile: null,
  filial: null,
  department: null,
};

export default function auth(state = INITIAL_STATE, action) {
  return produce(state, (draft) => {
    switch (action.type) {
      case "@auth/LOGIN_REQUEST": {
        draft.loading = true;
        break;
      }
      case "@auth/LOGIN_SUCCESS": {
        draft.token = action.payload.token;
        draft.profile = action.payload.user;
        draft.accesses = action.payload.accesses;
        draft.filial = action.payload.firstFilial;
        draft.signed = true;
        draft.loading = false;
        break;
      }
      case "@auth/FILIAL_CHANGE": {
        draft.token = action.payload.token;
        draft.filial = action.payload.filial;
        break;
      }
      case "@auth/DEPARTMENT_CHANGE": {
        draft.department = action.payload.department;
        break;
      }
      case "@auth/LOGIN_FAILURE": {
        draft.loading = false;
        break;
      }
      case "@auth/LOGOUT": {
        console.log("LOGOUT");
        draft.token = null;
        draft.signed = false;
        draft.loading = false;
        draft.department = null;
        draft.filial = null;
        break;
      }
      case "@auth/UPDATE_PROFILE_REQUEST": {
        console.log("UPDATE_PROFILE_REQUEST");
        draft.loading = true;
        break;
      }
      case "@auth/UPDATE_PROFILE_SUCCESS": {
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
        break;
    }
  });
}
