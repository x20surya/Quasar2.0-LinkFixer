import React, { useState } from "react"
import { Sparkles, Zap, Shield, FileText, Moon } from "lucide-react"
import BubbleCleaner from "../../components/background/BubbleCleaner"

const Home = () => {
  const [url, setUrl] = useState("")

  interface HandleSubmit {
    (e: React.FormEvent<HTMLFormElement>): void
  }

  interface AnalyzePayload {
    url: string
  }

  const handleSubmit: HandleSubmit = (e) => {
    e.preventDefault()
    const payload: AnalyzePayload = { url }
    console.log("Analyzing URL:", payload.url)
    // Add your analysis logic here
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-300 relative overflow-hidden
          bg-linear-to-br from-pink-50 via-purple-50 to-blue-50`}
    >
      {/* Conic gradient orbs - subtle */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-conic from-purple-400 via-pink-400 to-blue-400 rounded-full opacity-25 blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-gradient-conic from-blue-400 via-purple-400 to-pink-400 rounded-full opacity-25 blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-conic from-pink-300 via-purple-300 to-blue-300 rounded-full opacity-20 blur-3xl animate-pulse"></div>

      {/* Floating orbs with animation - subtle */}
      <div className="absolute top-20 left-8 w-32 h-32 bg-linear-to-br from-purple-300 to-pink-300 rounded-full opacity-35 blur-2xl animate-float"></div>
      <div className="absolute top-40 right-12 w-40 h-40 bg-linear-to-br from-pink-300 to-blue-300 rounded-full opacity-35 blur-2xl animate-float-delayed"></div>
      <div className="absolute bottom-32 right-1/4 w-36 h-36 bg-linear-to-br from-blue-300 to-purple-300 rounded-full opacity-35 blur-2xl animate-float-slow"></div>
      <div className="absolute bottom-40 left-12 w-28 h-28 bg-linear-to-br from-purple-400 to-blue-400 rounded-full opacity-30 blur-2xl animate-float"></div>

      {/* Main content */}
      <BubbleCleaner>
        <div className="relative flex flex-col items-center justify-center min-h-screen px-4 py-20">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-600">
              AI-Powered Website Analysis
            </span>
          </div>

          {/* Heading */}
          <h1
            className={`text-5xl md:text-7xl font-bold text-center mb-4 text-gray-900`}
          >
            Website Health
          </h1>
          <h1 className="text-5xl md:text-7xl font-bold text-center mb-6 bg-linear-to-r from-purple-600 via-pink-500 to-blue-500 bg-clip-text text-transparent">
            Checkup
          </h1>

          {/* Subtitle */}
          <p
            className={`text-center text-lg md:text-xl max-w-3xl mb-12 text-gray-600`}
          >
            Instantly detect broken links and analyze page reachability. Get
            comprehensive insights into your website's sitemap structure.
          </p>

          {/* Input form */}
          <form onSubmit={handleSubmit} className="w-full max-w-2xl mb-12">
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter your website URL (e.g., https://example.com)"
                className="flex-1 px-6 py-4 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none bg-white/80 backdrop-blur-sm shadow-lg transition-all"
              />
              <button
                type="submit"
                className="px-8 py-4 bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <Sparkles className="w-5 h-5" />
                Get Started
              </button>
            </div>
          </form>

          {/* Feature badges */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <div className="flex items-center gap-2 px-5 py-3 bg-white/80 backdrop-blur-sm rounded-full shadow-md">
              <Zap className="w-5 h-5 text-purple-500" />
              <span
                className={`text-sm font-medium text-gray-700`}
              >
                Instant Results
              </span>
            </div>

            <div className="flex items-center gap-2 px-5 py-3 bg-white/80 backdrop-blur-sm rounded-full shadow-md">
              <Shield className="w-5 h-5 text-blue-500" />
              <span
                className={`text-sm font-medium text-gray-700`}
              >
                Secure Analysis
              </span>
            </div>

            <div className="flex items-center gap-2 px-5 py-3 bg-white/80 backdrop-blur-sm rounded-full shadow-md">
              <FileText className="w-5 h-5 text-pink-500" />
              <span
                className={`text-sm font-medium text-gray-700`}
              >
                Detailed Reports
              </span>
            </div>
          </div>
        </div>
      </BubbleCleaner>

      <section className=" h-screen">

      </section>
    </div>
  )
}

export default Home
