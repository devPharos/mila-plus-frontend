export function loginRequest(email, password) {
  return {
    type: "@auth/LOGIN_REQUEST",
    payload: { email, password }
  };
}

export function loginSuccess(token, user, accesses, firstFilial) {
  return {
    type: "@auth/LOGIN_SUCCESS",
    payload: { token, user, accesses, firstFilial }
  };
}

export function loginFailure() {
  return {
    type: "@auth/LOGIN_FAILURE"
  };
}

export function registerRequest(name, email, password) {
  return {
    type: "@auth/REGISTER_REQUEST",
    payload: { name, email, password }
  };
}

export function registerFailure(name, email, password) {
  return {
    type: "@auth/REGISTER_REQUEST",
    payload: { name, email, password }
  };
}

export function filial_change(filial) {
  return {
    type: "@auth/FILIAL_CHANGE",
    payload: { filial }
  };
}

export function department_change(department) {
  return {
    type: "@auth/DEPARTMENT_CHANGE",
    payload: { department }
  };
}

export function logout() {
  return {
    type: "@auth/LOGOUT",
  };
}
