import axios from "axios";
// import { redirect } from "react-router-dom";

const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' ? 'https://milaplus.pharosit.com.br/' : 'http://localhost:3333'
});

api.interceptors.response.use(response => {
  return response
}, error => {
  if (!error.response) {
    console.log(error)
  }
  if (error.response.status === 401) {
    window.location.href = "/401";
  }
  if (error.response.status === 404) {
    window.location.href = "/404";
  }
  return Promise.reject(error)
})

export default api;
