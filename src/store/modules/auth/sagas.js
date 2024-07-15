import { takeLatest, call, put, all } from "redux-saga/effects";
import { toast } from "react-toastify";

import history from "~/services/history";
import api from "~/services/api";

import { loginSuccess, loginFailure, registerFailure } from "./actions";

export function* login({ payload }) {
  try {
    const { email, password } = payload;

    const { data } = yield call(api.post, "sessions", {
      email,
      password
    });

    const { token, user } = data;

    api.defaults.headers.authorization = `Bearer ${token}`;

    const { data: accesses } = yield call(api.get, "MenuHierarchy/user/" + user.id)

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
      provider: true
    });

    history.push("/");
  } catch (err) {
    toast.error("Falha no cadastro, verifique os dados!");

    yield put(registerFailure());
  }
}

export function setToken({ payload }) {
  if (!payload) return;

  console.log(api.defaults.headers.authorization)

  const { token } = payload.auth;

  if (token) {
    api.defaults.headers.Authorization = `Bearer ${token}`;
  }
}

export function setFilial({ payload }) {
  if (!payload) return;

}

export function setDepartment({ payload }) {
  console.log('setDepartment', payload)
}

export default all([
  takeLatest("persist/REHYDRATE", setToken),
  takeLatest("@auth/LOGIN_REQUEST", login),
  takeLatest("@auth/REGISTER_REQUEST", register),
  takeLatest("@auth/DEPARTMENT_CHANGE", setDepartment),
  takeLatest("@auth/FILIAL_CHANGE", setFilial),
  takeLatest("@auth/LOGOUT", logout)
]);
