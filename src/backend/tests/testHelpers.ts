import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { port, url } from "../config.json";

const SERVER_URL = `${url}:${port}`;

// this is useless
async function requestHelper(
  method: string,
  path: string,
  payload: Record<string, any> = {},
  headers: Record<string, string> = {}
) {
  const url = `${SERVER_URL}${path}`;
  const options: AxiosRequestConfig = {
    method: method.toUpperCase(),
    url,
    headers: {
      ...headers,
    },
    data: ["POST", "PUT", "PATCH"].includes(method.toUpperCase()) ? payload : undefined,
    params: ["GET", "DELETE"].includes(method.toUpperCase()) ? payload : undefined,
  };

  try {
    const res: AxiosResponse = await axios(options);
    return {
      data: res.data,
      statusCode: res.status,
    };
  } catch (err: any) {
    return {
      error: err.message,
    };
  }
}

export async function requestRegister(email: string, username: string, password: string) {
  return await requestHelper("POST", "/register", { email, username, password });
}
