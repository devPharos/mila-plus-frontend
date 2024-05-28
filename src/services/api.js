import axios from "axios";
import { redirect } from "react-router-dom";

const api = axios.create({
  baseURL: "https://milaplus.pharosit.com.br/",
});

api.interceptors.response.use(response => {
  return response
}, error => {
  if (error.response.status === 401) {
    window.location.href = "/401";
  }
  return Promise.reject(error)
})

export default api;
