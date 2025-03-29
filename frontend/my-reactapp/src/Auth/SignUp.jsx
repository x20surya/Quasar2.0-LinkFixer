import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Lock, User } from "lucide-react";

export default function SignUp() {
  return (
    <div className="flex justify-center items-center h-screen bg-black">
      <Card className="w-96 p-6 shadow-lg rounded-2xl bg-black border border-yellow-500 hover:shadow-[0_0_20px_4px_rgba(255,215,0,0.5)] transition-shadow">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold text-white">Sign Up</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-500" />
              <Input
                type="text"
                placeholder="Username"
                className="pl-10 border border-yellow-500 bg-black text-white focus:ring-yellow-500 focus:border-yellow-500 focus:outline-none hover:shadow-[0_0_10px_3px_rgba(255,255,255,0.4)]"
              />
            </div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-500" />
              <Input
                type="email"
                placeholder="Email"
                className="pl-10 border border-yellow-500 bg-black text-white focus:ring-yellow-500 focus:border-yellow-500 focus:outline-none hover:shadow-[0_0_10px_3px_rgba(255,255,255,0.4)]"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-500" />
              <Input
                min={8}
                type="password"
                placeholder="Password"
                className="pl-10 border border-yellow-500 bg-black text-white focus:ring-yellow-500 focus:border-yellow-500 focus:outline-none hover:shadow-[0_0_10px_3px_rgba(255,255,255,0.4)]"
              />
            </div>
            <Button className="w-full bg-white text-black hover:bg-yellow-500 hover:text-black transition">Sign Up</Button>
            <p className="text-center text-sm text-white">
              Already have an account? <a href="#" className="text-yellow-500 hover:underline">Sign In</a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}