import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Lock } from "lucide-react";
import { useState,useContext } from "react";
import { useMyContext } from "@/context/context";
import Axios from "axios";
export default function SignIn() {
  const [email, SetEmail] = useState("");
  const [password, SetPassword] = useState("");
  const { islogin, setislogin } = useMyContext();
  const { token,settoken  } = useMyContext();

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!email || !password || password.length < 8) {
      alert("Please fill in both fields. Length of password must be grater than 8 .");
      return;
    }

    try {
      const response = await Axios.post(
        "http://localhost:5000/api/auth/login",
        {
          email,
          password,
        }
      );
      console.log("Response:", response.data);
      if(response.data.user.emailVerified){
          setislogin(true);
          settoken(response.data.token);
      }else{
        alert("Verify your email!")
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };
  console.log(token)

  return (
    <div className="flex justify-center items-center h-screen bg-black">
      <Card className="w-96 p-6 shadow-lg rounded-2xl bg-black border border-yellow-500 hover:shadow-[0_0_20px_4px_rgba(255,215,0,0.5)] transition-shadow">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold text-white">
            Sign In
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-500" />
              <Input
                type="email"
                value={email}
                onChange={(e) => SetEmail(e.target.value)}
                placeholder="Email"
                className="pl-10 border border-yellow-500 bg-black text-white focus:ring-yellow-500 focus:border-yellow-500 focus:outline-none hover:shadow-[0_0_10px_3px_rgba(255,255,255,0.4)]"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-500" />
              <Input
                value={password}
                onChange={(e) => SetPassword(e.target.value)}
                type="password"
                placeholder="Password"
                className="pl-10 border border-yellow-500 bg-black text-white focus:ring-yellow-500 focus:border-yellow-500 focus:outline-none hover:shadow-[0_0_10px_3px_rgba(255,255,255,0.4)]"
              />
            </div>
            <Button
              className="w-full bg-white text-black hover:bg-yellow-500 hover:text-black transition "
              onClick={handleSubmit}
            >
              Sign In
            </Button>
            <p className="text-center text-sm text-white">
              Don't have an account?{" "}
              <a href="#" className="text-yellow-500 hover:underline">
                Sign Up
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
