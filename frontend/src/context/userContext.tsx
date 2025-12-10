import { createContext, useContext, useEffect, useState } from "react"
import { validator } from "../utils/validator"
import { verifyAuthUser } from "../api/auth/verifyAuth"

type userContextType = {
  email?: string
  id?: string
  updateUser: (email: string, id: string) => boolean
  checkLogin : () => Promise<void>
}

const UserContext = createContext<userContextType | undefined>(undefined)

export const UserContextProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [email, setEmail] = useState<string | undefined>()
  const [id, setId] = useState<string | undefined>()

  function updateUser(email: string, id: string) {
    if (validator(email, "email")) {
      setEmail(email)
      setId(id)
      console.log("User updated ", email, " ", id)
      return true
    }
    return false
  }
  useEffect(() => {
    checkLogin()
  }, [])
  useEffect(() => {
        console.log("User already logged in : ", email, " ", id)
  }, [email, id])

  async function checkLogin(){
    const res = await verifyAuthUser()
    console.log(res?.authenticated)
    if(!res?.authenticated){
        setEmail(undefined)
        setId(undefined)
    }else{
        console.log(res.user)
        setEmail(res.user.email)
        setId(res.user.id)
    }
  }

  const value: userContextType = {
    email,
    id,
    updateUser,
    checkLogin
  }
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export const useUserContext = () => {
  return useContext(UserContext)
}
