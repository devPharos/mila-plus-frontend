import { takeLatest, call, put, all } from "redux-saga/effects";
import { toast } from "react-toastify";
import api from "~/services/api";
import {
    updateProfileSuccess,
    updateProfileFailure,
} from "./actions";
import { getFileUrl } from "~/services/firebase";

function* updateProfile({ payload }) {
    try {
        const { data } = payload;

        const response = yield call(api.patch, "/users/me", data);

        let profileWithAvatar = { ...response.data };
        if (profileWithAvatar.avatar?.key) {
            const avatarUrl = yield call(getFileUrl, profileWithAvatar.avatar.key);
            profileWithAvatar.avatar.url = avatarUrl;
        }

        toast.success("Profile updated with success!");
        yield put(updateProfileSuccess(profileWithAvatar));
    } catch (err) {
        switch (err.response.data.error) {
            case "email-already-used":
                toast.error("Email is already used.")
                break;
            case "user-does-not-exist":
                toast.error("User does not exist.")
                break;
            default:
                toast.error("Error on try update your profile. Try again.");
        }

        yield put(updateProfileFailure());
    }
}

export default all([takeLatest("@user/UPDATE_PROFILE_REQUEST", updateProfile)]);