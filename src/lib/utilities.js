const getAuthToken = () => {
  return localStorage.getItem("donation.token");
};

const setAuthToken = (authToken) => {
  localStorage.setItem("donation.token", authToken);
};

const removeAuthToken = () => {
  localStorage.removeItem("donation.token");
};

const getUserData = () => {
  const userData = localStorage.getItem("donation.user");
  if (userData) {
    return JSON.parse(userData);
  }
  return null;
};

const setUserData = (userData) => {
  localStorage.setItem("donation.user", JSON.stringify(userData));
};

const removeUserData = () => {
  localStorage.removeItem("donation.user");
};

const isAuthenticated = () => {
  return !!getAuthToken();
};

const token = {
  getAuthToken,
  setAuthToken,
  removeAuthToken,

  getUserData,
  setUserData,
  removeUserData,

  isAuthenticated,
};

export default token;
