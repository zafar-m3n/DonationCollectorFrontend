import axios from "axios";
import { v4 as uuidv4 } from "uuid";

const getAuthToken = () => localStorage.getItem("donation.token");

const defaultHeaders = (contentType = "application/json") => {
  const authToken = getAuthToken();
  return {
    "X-Request-Id": uuidv4(),
    "Content-Type": contentType,
    Accept: "application/json",
    ...(authToken && { Authorization: `Bearer ${authToken}` }),
  };
};

const publicHeaders = () => {
  return {
    "X-Request-Id": uuidv4(),
    "Content-Type": "application/json",
    Accept: "application/json",
  };
};

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_DONATION_API_BASEURL,
  timeout: 30000,
});

const instance = {
  apiClient,
  defaultHeaders,
  publicHeaders,
};

export default instance;
