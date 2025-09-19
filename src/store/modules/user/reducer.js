const INITIAL_STATE = {
    profile: null,
    loading: false,
};

export default function user(state = INITIAL_STATE, action) {
    switch (action.type) {
        case "@user/UPDATE_PROFILE_REQUEST": {
            return { ...state, loading: true };
        }
        case "@user/UPDATE_PROFILE_SUCCESS": {
            return { ...state, profile: action.payload.profile, loading: false };
        }
        case "@user/UPDATE_PROFILE_FAILURE": {
            return { ...state, loading: false };
        }
        default:
            return state;
    }
}