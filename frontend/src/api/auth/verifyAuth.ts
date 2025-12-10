import api from "../instance"

type VerifyAuthOutput = {
  authenticated: boolean,
      user: {
        id: string,
        username: string,
        email : string,
        emailVerified: boolean,
      }
}

type VerifyAuth = () => Promise<VerifyAuthOutput | null>

export const verifyAuthUser: VerifyAuth = async () => {
  try {
    console.log("Sending verification request")
    const res = await api.get(
      "/auth/verifyAuth", 
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
