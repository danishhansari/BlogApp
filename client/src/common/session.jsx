const storeInSession = (key) => {
  return sessionStorage.setItem(key);
};
const lookInSession = (key) => {
  return sessionStorage.getItem(key);
};
const deleteSession = (key) => {
  return sessionStorage.removeItem(key);
};
const logOutUser = () => {
  return sessionStorage.clear();
};

export {storeInSession, lookInSession, deleteSession, logOutUser}
