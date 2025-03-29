import { createContext,useState,useEffect,useContext } from "react";
const MyContext = createContext();

export const MyContextProvider = ({ children }) => {
 
    const [islogin, setislogin] = useState(() => JSON.parse(localStorage.getItem('islogin')) || false);
    const [user, setuser] = useState(() => localStorage.getItem('user') || '');


  useEffect(() => {
    localStorage.setItem('islogin', JSON.stringify(islogin));
    localStorage.setItem('user', user);

  }, [islogin,user]);
  
  const contextValue = {
    islogin,
    setislogin,
    user,
    setuser,
  };

  return (
    <MyContext.Provider value={contextValue} >
      {children}
    </MyContext.Provider>
  );
};

export const useMyContext = () => useContext(MyContext);