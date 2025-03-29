import { createContext,useState,useEffect,useContext } from "react";
const MyContext = createContext();

export const MyContextProvider = ({ children }) => {
 
    const [islogin, setislogin] = useState(() => JSON.parse(localStorage.getItem('islogin')) || false);
    const [token, settoken] = useState(() => localStorage.getItem('token') || '');


  useEffect(() => {
    localStorage.setItem('islogin', JSON.stringify(islogin));
    localStorage.setItem('token', token);

  }, [islogin,token]);
  
  const contextValue = {
    islogin,
    setislogin,
    token,
    settoken,
  };

  return (
    <MyContext.Provider value={contextValue} >
      {children}
    </MyContext.Provider>
  );
};

export const useMyContext = () => useContext(MyContext);