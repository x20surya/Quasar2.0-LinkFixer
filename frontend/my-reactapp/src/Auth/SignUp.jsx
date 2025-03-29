import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Lock, User } from "lucide-react";
import { useState } from "react";
import axios from "axios";
export default function SignUp() {
  const [username, SetUsername] = useState("");
  const [email, SetEmail] = useState("");
  const [password, SetPassword] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/register",
        {
          username,
          email,
          password,
        }
      );
      console.log(response.data);
      alert("successfully registered!,verify your email");
    } catch (error) {
      console.error("Error registering user:", error);
      if (error.response) {
        const { status, data } = error.response;

        if (status === 400) {
          alert(data.message || "Invalid request. Please check your inputs.");
        } else if (status === 409) {
          alert("Email ID already exists. Please use a different email.");
        } else {
          alert("Something went wrong. Please try again later.");
        }
      } else {
        alert("Network error. Please check your internet connection.");
      }
    }
  };
  return (
    <div className="flex justify-center items-center h-screen bg-black">
      <Card className="w-96 p-6 shadow-lg rounded-2xl bg-black border border-yellow-500 hover:shadow-[0_0_20px_4px_rgba(255,215,0,0.5)] transition-shadow">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold text-white">
            Sign Up
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-500" />
              <Input
                type="text"
                value={username}
                onChange={(e) => SetUsername(e.target.value)}
                placeholder="Username"
                className="pl-10 border border-yellow-500 bg-black text-white focus:ring-yellow-500 focus:border-yellow-500 focus:outline-none hover:shadow-[0_0_10px_3px_rgba(255,255,255,0.4)]"
              />
            </div>
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
                min={8}
                value={password}
                onChange={(e) => SetPassword(e.target.value)}
                type="password"
                placeholder="Password"
                className="pl-10 border border-yellow-500 bg-black text-white focus:ring-yellow-500 focus:border-yellow-500 focus:outline-none hover:shadow-[0_0_10px_3px_rgba(255,255,255,0.4)]"
              />
            </div>
            <Button
              className="w-full bg-white text-black hover:bg-yellow-500 hover:text-black transition"
              onClick={handleSubmit}
            >
              Sign Up
            </Button>
            <p className="text-center text-sm text-white">
              Already have an account?{" "}
              <a href="#" className="text-yellow-500 hover:underline">
                Sign In
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
