import axios from "axios";
import { useDispatch } from "react-redux";
import { logout } from '~/store/modules/auth/actions';
// import { redirect } from "react-router-dom";

const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' ? 'https://milaplus.pharosit.com.br/' : 'http://localhost:3333'
});

let store

export const injectStore = _store => {
  store = _store
}

// Add a request interceptor
api.interceptors.request.use(function (config) {
  config.headers.Filial = store.getState().auth && store.getState().auth.filial && store.getState().auth.filial.id || null
  return config;
}, function (error) {
  // Do something with request error
  return Promise.reject(error);
});

api.interceptors.response.use(response => {
  return response
}, error => {
  if (!error.response) {
    console.log(error)
  }
  if (error.response.status === 401) {
    // window.location.href = "/401";
  }
  if (error.response.status === 404) {
    window.location.href = "/404";
  }
  return Promise.reject(error)
})

export default api;
