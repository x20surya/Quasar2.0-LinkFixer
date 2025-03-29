import { useState } from 'react'
import axios from 'axios'
import { useEffect } from 'react'
import Navbar from './constants/navbar'
import { CornerDownRight } from 'lucide-react'
function App() {
const[message,setMessage] = useState("")
 useEffect(()=>{
  axios.get('http://localhost:5000/api/message',{message:message})
  .then((response) => {
    if (response.data) {
      setMessage(response.data.message);
      console.log(response.data.message)
    } else {
      console.log("no-data")
    }
  })
  .catch((error) => {
    console.error(error);
  });
},[])
  return (
    <div className="">
      <Navbar></Navbar>
      <div className='md:pl-40 pl-16  bg-black h-screen w-full'>
        <div className='p-4 pt-6 h-[90vh] flex flex-col justify-center'>
          <h1 className='text-white font-bold text-5xl'>Find & Fix Broken <span className='text-yellow-500'><br />Links</span> in Seconds</h1>
          <p className='text-white w-4/6'>Improve SEO, enhance user experience, and keep your website error-free with automated link monitoring. <br /><span className='font-bold'>Why Choose LinkFixer?</span></p>
          <div className="flex flex-row justify-start items-center mt-3">
            <div className="flex justify-center items-center p-2 bg-yellow-500 font-extrabold text-xl rotate-4 z-10">
              1.
            </div>
            <div className=" p-1 pl-4  text-white font-medium relative right-2">
            Automated Link Scanning :  Detect broken links across your entire website with one click.
            </div>
          </div>
          <div className="flex flex-row justify-start items-center mt-3">
            <div className="flex justify-center items-center p-2 bg-yellow-500 font-extrabold text-xl rotate-4 z-10">
              2.
            </div>
            <div className=" p-1 pl-4  text-white font-medium relative right-2">
            Detailed Reports : Get insights on HTTP errors, affected pages, and fix recommendations.
            </div>
          </div>
          <div className="flex flex-row justify-start items-center mt-3">
            <div className="flex justify-center items-center p-2 bg-yellow-500 font-extrabold text-xl rotate-4 z-10">
              3.
            </div>
            <div className=" p-1 pl-4  text-white font-medium relative right-2">
            Real-time Alerts : Stay ahead with instant email and Slack notifications.
            </div>
          </div>
          <div className="flex flex-row justify-start items-center mt-3">
            <div className="flex justify-center items-center p-2 bg-yellow-500 font-extrabold text-xl rotate-4 z-10">
              4.
            </div>
            <div className=" p-1 pl-4  text-white font-medium relative right-2">
            SEO Optimization : Improve rankings by ensuring a flawless user experience.
            </div>
          </div>
          <div className="flex flex-row justify-start items-center mt-3">
            <div className="flex justify-center items-center p-2 bg-yellow-500 font-extrabold text-xl rotate-4 z-10">
              5.
            </div>
            <div className=" p-1 pl-4  text-white font-medium relative right-2">
            Multi-Site Support : Manage multiple websites under one account.
            </div>
          </div>
          <button className='p-2 border-2 border-yellow-500 rounded-sm mt-6 flex justify-center items-center gap-x-1 shadow-md shadow-amber-400/4 w-fit'><CornerDownRight className='stroke-orange-500 '/><p className='text-white font-semibold'>Get Started</p></button>
        </div>
      </div>
    </div>
  )
}

export default App
