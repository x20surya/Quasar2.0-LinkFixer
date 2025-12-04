import axios from "axios"
import links from "../../common/links.json"

type SignInUser = (email: string, password: string) => Promise<boolean>

export const logInUser: SignInUser = async (email, password) => {
  try {
    const res = await axios.post(links.BACKEND_LOGIN, {
      body: {
        email,
        password,
      }
    })
    console.log(res.data)
    alert(res.data)
    return true
  } catch (err) {
    console.log(err)
  }
  return false
}
