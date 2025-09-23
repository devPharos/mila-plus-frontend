import { takeLatest, call, put, all } from "redux-saga/effects";
import { toast } from "react-toastify";

import history from "~/services/history";
import api from "~/services/api";

import { loginSuccess, loginFailure, registerFailure } from "./actions";
import { updateProfileFailure, updateProfileSuccess } from "../auth/actions";

export function* login({ payload }) {
  try {
    const { email, password } = payload;

    const { data } = yield call(api.post, "sessions", {
      email,
      password,
    });

    const { token, user } = data;

    api.defaults.headers.authorization = `Bearer ${token}`;

    const { data: accesses } = yield call(
      api.get,
      "MenuHierarchy/user/" + user.id
    );

    let firstFilial = null;
    if (user.filials.length > 0 && user.filials[0].filial) {
      firstFilial = user.filials[0].filial;
    }

    yield put(loginSuccess(token, user, accesses, firstFilial));
  } catch (err) {
    toast.error("Falha na autenticação, verifique seus dados.");

    yield put(loginFailure());
  }
}

export function logout() {
  api.defaults.headers.Authorization = null;
  history.push("/login");
}

export function* register({ payload }) {
  try {
    const { nome, email, password } = payload;

    yield call(api.post, "users", {
      nome,
      email,
      password,
      provider: true,
    });

    history.push("/");
  } catch (err) {
    toast.error("Falha no cadastro, verifique os dados!");

    yield put(registerFailure());
  }
}

export function setToken({ payload }) {
  if (!payload) return;

  const { token } = payload.auth;

  if (token) {
    api.defaults.headers.Authorization = `Bearer ${token}`;
  }
}

export function setFilial({ payload }) {
  if (!payload) return;
}

export function setDepartment({ payload }) {
  console.log("setDepartment", payload);
}

export function* updateProfile({ payload }) {
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
        toast.error("Email is already used.");
        break;
      case "user-does-not-exist":
        toast.error("User does not exist.");
        break;
      default:
        toast.error("Error on try update your profile. Try again.");
    }

    yield put(updateProfileFailure());
  }
}

export default all([
  takeLatest("persist/REHYDRATE", setToken),
  takeLatest("@auth/LOGIN_REQUEST", login),
  takeLatest("@auth/REGISTER_REQUEST", register),
  takeLatest("@auth/DEPARTMENT_CHANGE", setDepartment),
  takeLatest("@auth/FILIAL_CHANGE", setFilial),
  takeLatest("@auth/LOGOUT", logout),
  takeLatest("@auth/UPDATE_PROFILE_REQUEST", updateProfile),
]);
