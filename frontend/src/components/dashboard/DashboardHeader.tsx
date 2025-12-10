import { Link } from "react-router"
import logo from "../../assets/logo.png"
import { useEffect, useState } from "react"

const DashboardHeader = () => {
  const [isScrolled, setIsScrolled] = useState<boolean>(false)
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])
  return (
    <header
      className={`fixed top-0 left-0 right-0 z-9999 transition-all duration-300 ${
        isScrolled
          ? "bg-[#4b4b4b] backdrop-blur-md shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="transition-all active:scale-95">
            <img
              src={logo}
              alt="logo_makora"
              style={{
                width: 130,
              }}
            />
          </Link>
          <div className=" flex flex-row justify-center items-center gap-2">
            <div className=" w-10 h-10 bg-black rounded-full" />
            <div className=" w-11 h-11 bg-black rounded-full" />
          </div>
        </div>
      </div>
    </header>
  )
}

export default DashboardHeader
