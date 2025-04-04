
export const setUser = (token) => {
    localStorage.setItem("user", token);
};
  
export const getUser = () => {
    return localStorage.getItem("user");
};
  
export const clearUser = () => {
    localStorage.removeItem("user");
};
  