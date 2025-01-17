import axios from "axios";
import { logout } from "~/store/modules/auth/actions";

const api = axios.create({
  baseURL:
    process.env.NODE_ENV === "production"
      ? process.env.REACT_APP_BACKEND_URL
      : "http://localhost:3333",
});

let store;

export const injectStore = (_store) => {
  store = _store;
};

api.interceptors.request.use(
  function (config) {
    config.headers.Filial =
      (store.getState().auth &&
        store.getState().auth.filial &&
        store.getState().auth.filial.id) ||
      null;
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (!error.response) {
      console.log(error);
    }
    if (error.response.status === 401) {
      // window.location.href = "/401";

      window.location.href = "/login";

      store.dispatch(logout());
    }
    if (error.response.status === 404) {
      // window.location.href = "/404";
    }
    if (error.response.status === 500) {
      // window.location.href = "/500";
    }
    return Promise.reject(error);
  }
);

export default api;
