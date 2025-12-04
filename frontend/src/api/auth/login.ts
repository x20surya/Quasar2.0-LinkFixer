import api from "../instance"
type SignInUser = (email: string, password: string) => Promise<boolean>



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
