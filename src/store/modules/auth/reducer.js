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
  return produce(state, draft => {
    switch (action.type) {
      case "@auth/LOGIN_REQUEST": {
        draft.loading = true;
        break;
      }
      case "@auth/LOGIN_SUCCESS": {
        draft.token = action.payload.token;
        draft.profile = action.payload.profile;
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
        draft.token = null;
        draft.signed = false;
        draft.loading = false;
        draft.department = null;
        draft.filial = null;
        break;
      }
      default:
    }
  });
}
