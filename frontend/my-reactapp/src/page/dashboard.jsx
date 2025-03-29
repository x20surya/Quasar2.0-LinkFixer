import React from "react";
import Navbar from "@/constants/navbar";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

function Dashboard() {
  return (
    <div>
      <Navbar></Navbar>
      <div className="pl-16 md:pl-40 h-screen w-full bg-black">
        <div className="w-full flex flex-col">
          <div className="p-4">
            <h1 className="text-white font-bold text-4xl">DASHBOARD</h1>
            <hr className="border-none h-1 bg-yellow-500 w-56 mt-1" />
            <p className="text-white mt-1 w-4/6">
              You can submit website links for analysis, and if any links are
              broken, the system will provide detailed error reports, including
              HTTP status codes, recommendations for resolution, and insights
              into other related issues.
            </p>
            <Accordion type="single" collapsible className="w-fit bg-white/15 rounded-sm px-2 mt-4">
              <AccordionItem value="item-1">
                <AccordionTrigger className="flex justify-between w-fit">
                  <Plus className="stroke-amber-50" />
                  <p className="text-white">Add Links</p>
                </AccordionTrigger>
                <AccordionContent>
                  <form action="" className="mt-4">
                    <Input type="text" className="w-72 text-white bg-slate-400/20" />
                    <button></button>
                  </form>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
