import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage } from "@/components/ui/avatar";

function Profilecard(props) {
  return (
    <div className="flex flex-col items-center space-y-6 bg-black p-8 rounded-2xl border border-yellow-500 hover:shadow-[0_0_12px_2px_rgba(255,215,0,0.3)] transition-shadow w-80">
      <div className="rounded-full hover:shadow-[0_0_12px_3px_rgba(255,215,0,0.4)] transition transform hover:scale-105">
        <Avatar className="w-28 h-28 border-4 border-yellow-500 shadow-md rounded-full">
          <AvatarImage src={props.imageSrc} alt={props.name} className="rounded-full" />
        </Avatar>
      </div>
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold">{props.name}</h1>
        <p className="text-yellow-300 text-sm">{props.email}</p>
      </div>
      <div className="rounded-full hover:shadow-[0_0_12px_3px_rgba(255,215,0,0.3)] transition transform hover:scale-105">
        <Button className="bg-white text-black px-4 py-2 text-base font-semibold rounded-full shadow-md hover:bg-yellow-500 hover:text-black transition-all">
          Logout
        </Button>
      </div>
    </div>
  );
}

export default Profilecard;