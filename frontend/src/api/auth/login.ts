import api from "../instance"

type LoginOutput = {
  msg : string
  success : boolean
  user : {
    email : string
    emailVerified : boolean
    id : string
    username : string
  }
}
type SignInUser = (email: string, password: string) => Promise<LoginOutput | null>

export const logInUser: SignInUser = async (email, password) => {
  try {
    console.log("Sending login request")
    const res = await api.post(
      "/auth/login", 
      { email, password },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
    console.log(res.data)
    return res.data
  } catch (err) {
    console.log(err)
    return null
  }
}
