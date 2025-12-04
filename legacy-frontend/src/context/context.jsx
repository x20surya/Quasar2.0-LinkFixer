import { createContext, useState, useEffect, useContext } from "react";
const MyContext = createContext();

export const MyContextProvider = ({ children }) => {
  const [islogin, setislogin] = useState(
    () => JSON.parse(localStorage.getItem("islogin")) || false
  );
  const [token, settoken] = useState(() => localStorage.getItem("token") || "");
  const [username, setusername] = useState(
    () => localStorage.getItem("username") || ""
  );
  const [Email, setEmail] = useState(() => localStorage.getItem("Email") || "");

  useEffect(() => {
    localStorage.setItem("islogin", JSON.stringify(islogin));
    localStorage.setItem("token", token);
    localStorage.setItem("username", username);
    localStorage.setItem("Email", Email);
  }, [islogin, token, username,Email]);

  const contextValue = {
    islogin,
    setislogin,
    token,
    settoken,
    username,
    setusername,
    Email,
    setEmail,
  };

  return (
    <MyContext.Provider value={contextValue}>{children}</MyContext.Provider>
  );
};

export const useMyContext = () => useContext(MyContext);
