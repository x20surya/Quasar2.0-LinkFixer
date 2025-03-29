import React from "react";
import { Home, ChevronRight, AlignLeftIcon } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

function Navbar() {
  return (
    <div className="h-screen md:w-40 w-16 fixed border-r-2 border-gray-400/50 bg-black flex flex-col ">
      <div className="md:flex flex-col justify-center hidden">
        <div className="h-20 flex flex-col justify-center items-center w-full border-b-2 border-gray-400/40">
          <p className="font-bold text-xl text-orange-500">LOGO.</p>
        </div>
        <ul className="flex flex-col justify-center items-center  bg-gray-400/30 ">
          <li className=" w-full flex justify-start items-center h-10  gap-x-1 hover:bg-orange-500 border-b-2 border-gray-400/40">
            <p className="text-white font-semibold  w-full p-2">Home</p>
            <ChevronRight className="stroke-white" />
          </li>
          <li className=" w-full flex justify-between items-center h-10  pl-2 gap-x-1 hover:bg-orange-500 border-b-2 border-gray-400/40">
            <p className="text-white font-semibold ">Dashboard</p>
            <ChevronRight className="stroke-white" />
          </li>
          <li className=" w-full flex justify-between items-center h-10  pl-2 gap-x-1 hover:bg-orange-500 border-b-2 border-gray-400/40">
            <p className="text-white font-semibold ">Profile</p>
            <ChevronRight className="stroke-white" />
          </li>
          <li className=" w-full flex justify-between items-center h-10  pl-2 gap-x-1 hover:bg-orange-500 border-b-2 border-gray-400/40">
            <p className="text-white font-semibold ">Sign In</p>
            <ChevronRight className="stroke-white" />
          </li>
        </ul>
      </div>
      <Sheet className="flex w-full justify-center items-start md:hidden">
        <SheetTrigger className="flex justify-center items-center p-1 bg-yellow-500 h-12 md:hidden ">
          <AlignLeftIcon className="stroke-black h-7 w-7" />
        </SheetTrigger>
        <SheetContent className="bg-black">
          <SheetHeader>
            <SheetTitle></SheetTitle>
            <SheetDescription className="mt-10">
              <li className=" w-full flex justify-start items-center h-10  gap-x-1 hover:bg-orange-500 border-b-2 border-gray-400/40">
                <p className="text-white font-semibold  w-full p-2">Home</p>
                <ChevronRight className="stroke-white" />
              </li>
              <li className=" w-full flex justify-between items-center h-10  pl-2 gap-x-1 hover:bg-orange-500 border-b-2 border-gray-400/40">
                <p className="text-white font-semibold ">Dashboard</p>
                <ChevronRight className="stroke-white" />
              </li>
              <li className=" w-full flex justify-between items-center h-10  pl-2 gap-x-1 hover:bg-orange-500 border-b-2 border-gray-400/40">
                <p className="text-white font-semibold ">Profile</p>
                <ChevronRight className="stroke-white" />
              </li>
              <li className=" w-full flex justify-between items-center h-10  pl-2 gap-x-1 hover:bg-orange-500 border-b-2 border-gray-400/40">
                <p className="text-white font-semibold ">Sign In</p>
                <ChevronRight className="stroke-white" />
              </li>
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default Navbar;
