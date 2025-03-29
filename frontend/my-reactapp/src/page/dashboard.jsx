import React from "react";
import Navbar from "@/constants/navbar";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMyContext } from "@/context/context";
import { useNavigate } from "react-router";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useState, useEffect } from "react";
import axios from "axios";

function Dashboard() {
  const [link, setlink] = useState("");
  const navigateto = useNavigate();
  const { token } = useMyContext();
  const [list, setlist] = useState("");
  console.log(token);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5000/api/addWebsite",
        {
          startURL: link,
        },
        {
          headers: {
            "x-auth-token": token,
          },
        }
      );
      console.log(response.data);
      alert("successfully send");
      navigateto(0);
    } catch (error) {
      console.error("Error sending lnk:", error);
      if (error.response) {
        const { status, data } = error.response;

        if (status === 400) {
          alert(data.message || "Invalid request. Please check your inputs.");
        }
      } else {
        alert("Network error. Please check your internet connection.");
      }
    }
  };

  const Getfile = async () => {
    try {
      const response = await axios.get("", {
        headers: {
          "x-auth-token": token,
        },
      });
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(()=>{
    
  },[])
  const handleclick = async () => {
    const response = await axios.post("http://localhost:5000/api/getStatus", {
      websiteID,
    });
    try {
    } catch (error) {
      console.log("Error :", error);
    }
  };

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
            <Accordion
              type="single"
              collapsible
              className="w-fit bg-white/15 rounded-sm px-2 mt-4"
            >
              <AccordionItem value="item-1">
                <AccordionTrigger className="flex justify-between w-fit">
                  <Plus className="stroke-amber-50" />
                  <p className="text-white">Add Links</p>
                </AccordionTrigger>
                <AccordionContent>
                  <form
                    action=""
                    className="flex gap-2 mt-4 "
                    onSubmit={handleSubmit}
                  >
                    <Input
                      placeholder="Enter link"
                      value={link}
                      onChange={(e) => {
                        setlink(e.target.value);
                      }}
                      type="text"
                      className="w-72 text-white bg-slate-400/20"
                    />
                    <Button variant="secondary" type="submit">
                      {" "}
                      Submit
                    </Button>
                  </form>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
        {/* <div className="flex flex-col items-center space-y-4 p-4 bg-black min-h-screen w-full">
          <Card className="w-full max-w-4xl bg-black border border-green-500 shadow-xl p-2 rounded-md">
            <CardHeader className="pt-1 pb-1">
              <CardTitle className="text-green-400 text-2xl font-bold text-center">
                Checked Links
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white scrollbar-track-black px-2 ${
                  checkedLinks.length > 3 ? "max-h-40" : ""
                }`}
              >
                {checkedLinks.map((link, index) => (
                  <div
                    key={index}
                    className="text-green-400 py-1 flex justify-between items-center shadow-md text-lg border-b border-green-500 last:border-b-0"
                  >
                    <span className="truncate max-w-[65%]">{link.url}</span>
                    <span className="font-bold">
                      {link.status} : {link.message}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="w-full max-w-4xl bg-black border border-red-500 shadow-xl p-2 rounded-md">
            <CardHeader className="pt-1 pb-1">
              <CardTitle className="text-red-400 text-2xl font-bold text-center">
                Broken Links
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white scrollbar-track-black px-2 ${
                  brokenLinks.length > 3 ? "max-h-40" : ""
                }`}
              >
                {brokenLinks.map((link, index) => (
                  <div
                    key={index}
                    className="text-red-400 py-1 flex justify-between items-center shadow-md text-lg border-b border-red-500 last:border-b-0"
                  >
                    <span className="truncate max-w-[65%]">{link.url}</span>
                    <span className="font-bold">
                      {link.status} : {link.message}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div> */}
      </div>
    </div>
  );
}

export default Dashboard;
