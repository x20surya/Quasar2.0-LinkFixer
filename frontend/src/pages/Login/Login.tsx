import { useEffect, useRef, useState } from "react"
import { validator } from "../../utils/validator"
import banner from "../../assets/Untitled design-min.png"
import logo from "../../assets/logo.png"
import { logInUser } from "../../api/auth/login"
import { UserContextProvider, useUserContext } from "../../context/userContext"
import { useNavigate } from "react-router"
// import Typography from "../../components/background/Typography"

function Login() {
  const emailInput = useRef<HTMLInputElement | null>(null)
  const passwordInput = useRef<HTMLInputElement | null>(null)
  const [emailErrorState, setEmailErrorState] = useState<boolean>(false)
  const [emailErrorMessage, setEmailErrorMessage] = useState<string>("Error")
  const [passwordErrorState, setPasswordErrorState] = useState<boolean>(false)
  const [passwordErrorMessage, setPasswordErrorMessage] =
    useState<string>("Error")
  const userContext = useUserContext()
  const navigate = useNavigate()

  useEffect(() => {
    userContext?.checkLogin()  
  }, [])
  useEffect(() => {
    if(userContext?.email !== undefined && userContext.id !== undefined){
      navigate('/dashboard')
    }
  }, [userContext?.email, userContext?.id])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const emailValue = emailInput.current?.value
    const passwordValue = passwordInput.current?.value

    if (!emailValue || typeof emailValue !== "string") {
      setEmailErrorState(true)
      setEmailErrorMessage("Field cannot be empty")
      return
    }
    if (!passwordValue || typeof passwordValue !== "string") {
      setPasswordErrorState(true)
      setPasswordErrorMessage("Field cannot be empty")
      return
    }

    if (!validator(emailValue, "email")) {
      setEmailErrorState(true)
      setEmailErrorMessage("Invalid mail")
      return
    }

    // if (!validator(passwordValue, "password")) {
    //   // trigger global error popup as either password or mail is wrong
    // }
    console.log(emailValue)
    console.log(passwordValue)
    const res = await logInUser(emailValue, passwordValue)
    console.log("setting user context")
    if (res !== null) userContext?.updateUser(res.user.email, res.user.id)
  }

  useEffect(() => {
    const keydownHandler = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        if (document.activeElement === emailInput.current) {
          e.preventDefault()
          emailInput.current?.blur()
          const value = emailInput.current?.value
          if (!value || value.length == 0) {
            return
          }
          const res = validator(value, "email")
          if (res) {
            queueMicrotask(() => {
              passwordInput.current?.focus()
            })
          } else {
            setEmailErrorMessage("Invalid Email")
            setEmailErrorState(true)
          }
        }
        if (document.activeElement === passwordInput.current) {
          e.preventDefault()
          passwordInput.current?.blur()
        }
      }
    }

    const focusoutHandler = (e: FocusEvent) => {
      if (e.target === emailInput.current) {
        const value = emailInput.current?.value
        if (!value || value.length == 0) {
          return
        }
        const res = validator(value, "email")
        if (!res) {
          setEmailErrorMessage("Invalid Email")
          setEmailErrorState(true)
        }
      }
    }

    document.addEventListener("keydown", keydownHandler, { capture: true })
    document.addEventListener("focusout", focusoutHandler)

    return () => {
      document.removeEventListener("keydown", keydownHandler, { capture: true })
      document.removeEventListener("focusout", focusoutHandler)
    }
  }, [])

  return (
      <div
        className=" w-full h-screen flex justify-center md:justify-start "
        style={{
          backgroundImage: `url(${banner})`,
        }}
      >
        <div className=" bg-white shadow-[8px_0px_3px_0px_rgba(0,0,0,0.3)] w-full flex flex-col h-screen items-center px-4 py-10 md:min-w-[300px] md:w-[20%] md:h-screen justify-center relative">
          <img
            src={logo}
            alt="logo"
            className=" w-60 left-5 m-0 p-0 absolute top-10"
          />
          <form className=" w-full" onSubmit={handleSubmit}>
            <label className=" w-full h-5 font-semibold text-md font-sans mb-1">
              Email
            </label>
            <input
              ref={emailInput}
              placeholder="Email"
              onChange={() => {
                if (emailErrorState) {
                  setEmailErrorState(false)
                  setEmailErrorMessage("")
                }
              }}
              className="border-2 w-full h-12 rounded-sm text-md pl-2 font-semibold"
              style={{
                borderColor: !emailErrorState
                  ? `rgba(200,200,200,1)`
                  : `rgba(255, 0, 0, 1)`,
              }}
            />
            {emailErrorState ? (
              <h3 className=" w-full px-3 text-red-500 font-semibold font-mono py-0 text-md">
                {emailErrorMessage}
              </h3>
            ) : (
              <div className=" h-3" />
            )}
            <label className=" w-full h-5 font-semibold text-md font-sans mb-1">
              Password
            </label>

            <input
              ref={passwordInput}
              placeholder="Password"
              type="password"
              className="border-2 w-full h-12 rounded-sm text-md pl-2 font-semibold"
              onChange={() => {
                if (passwordErrorState) {
                  setPasswordErrorState(false)
                  setPasswordErrorMessage("")
                }
              }}
              style={{
                borderColor: !passwordErrorState
                  ? `rgba(200,200,200,1)`
                  : `rgba(255, 0, 0, 1)`,
              }}
            />
            {passwordErrorState ? (
              <h3 className=" w-84 h-6 px-3 text-red-500 font-semibold font-mono py-0 text-md">
                {passwordErrorMessage}
              </h3>
            ) : (
              <div className=" h-3" />
            )}
            <button
              type="submit"
              className=" bg-amber-500 h-12 w-full text-white border-2 border-white translate-1 hover:translate-0 hover:border-black text-lg my-2 font-bold rounded-lg duration-300 transition-all"
            >
              Login
            </button>
          </form>
          <div className=" flex h-3 flex-row w-[85%] items-center gap-2">
            <div className=" w-full bg-[#8f8f8f] h-px" />
            <h1 className=" text-[#8f8f8f]">or</h1>
            <div className=" w-full bg-[#8f8f8f] h-px" />
          </div>
          <button
            onClick={() => {}}
            className=" bg-amber-500 h-12 w-full text-white border-2 border-white translate-1 hover:translate-0 hover:border-black text-lg my-2 font-bold rounded-lg duration-300 transition-all"
          >
            Google
          </button>
        </div>
        {/* <div className=" w-[419px] h-50 bg-[#3bb56c] hidden md:block">
        <Typography
          texts={["Website Health check made easy", "Join now"]}
          className={[
            "hidden md:block font-extrabold font-mono text-5xl ml-10 mt-10 text-white [text-shadow:5px_5px_1px_rgba(0,0,0,0.8)]",
            "hidden md:block font-extrabold font-mono text-5xl ml-10 mt-10 text-white [text-shadow:5px_5px_1px_rgba(0,0,0,0.8)]",
          ]}
        />
      </div> */}
      </div>
  )
}

export default Login
