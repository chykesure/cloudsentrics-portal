import api from "./api";

interface LoginPayload {
  email: string;
  password: string;
}

export const login = async (data: LoginPayload) => {
  return api.post("/auth/login", data);
};
