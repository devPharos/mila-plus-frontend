import { takeLatest, call, put, all } from "redux-saga/effects";
// import { toast } from "react-toastify";

import api from "~/services/api";

import { updateProfileSuccess, updateProfileFailure } from "./actions";

export function* updateProfile({ payload }) {
  const {
    nome,
    email,
    avatar_id,
    language,
    id,
    oldEmail,
    filialDefault,
    filial,
    ...rest
  } = payload.data;
  let data = {};

  try {
    if (avatar_id && avatar_id !== "undefined") {
      const { data2 } = yield call(api.get, `s3files/${avatar_id}`);
      data = data2;
    }

    const profile = Object.assign(
      {
        nome,
        email,
        avatar_id,
        language,
        id,
        oldEmail,
        avatar: data,
        filialDefault,
        filial
      },
      rest.oldPassword ? rest : {}
    );

    const response = yield call(api.put, "users", profile);

    // toast.success(lang.profile.p9);

    yield put(updateProfileSuccess(response.data));
  } catch (err) {
    switch (err.response.data.error) {
      case "email-already-used":
        // toast.error(lang.errors.e2, { className: "error" });
        break;
      case "user-does-not-exist":
        // toast.error(lang.errors.e3, { className: "error" });
        break;
      case "passwords-do-not-match":
        // toast.error(lang.errors.e4, { className: "error" });
        break;
      case "wrong-password":
        // toast.error(lang.errors.e5, { className: "error" });
        break;
      default:
      // toast.error(lang.errors.e1, { className: "error" });
    }
    yield put(updateProfileFailure());
  }
}

export default all([takeLatest("@user/UPDATE_PROFILE_REQUEST", updateProfile)]);
