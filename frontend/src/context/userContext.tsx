import { createContext, useContext, useState } from "react"
import { validator } from "../utils/validator"

type userContextType = {
  email?: string
  id?: string
  updateUser: (email: string, id: string) => boolean
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
      return true
    }
    return false
  }

  const value: userContextType = {
    email,
    id,
    updateUser,
  }
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export const useUserContext = () => {
  return useContext(UserContext)
}
