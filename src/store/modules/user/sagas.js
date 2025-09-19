import { takeLatest, call, put, all } from "redux-saga/effects";
import { toast } from "react-toastify";
import api from "~/services/api";
import {
    updateProfileSuccess,
    updateProfileFailure,
} from "./actions";

function* updateProfile({ payload }) {
    try {
        const { data } = payload;

        const response = yield call(api.patch, "/users/me", data);

        toast.success("Profile updated with success!");
        yield put(updateProfileSuccess(response.data));
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