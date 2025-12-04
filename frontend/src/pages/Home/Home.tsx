import React, { useEffect, useRef, useState } from "react"
import { Sparkles, Zap, Shield, FileText } from "lucide-react"
import BubbleCleaner from "../../components/background/BubbleCleaner"
import GradientButton from "../../components/button/GradientButton"

type CursorPosition = {
  x: number
  y: number
  id?: number
}
export type HandleSubmit = {
  (e: React.FormEvent<HTMLFormElement>): void
}

interface AnalyzePayload {
  url: string
}

const Home = () => {
  const [url, setUrl] = useState("")
  const containerRef = useRef<HTMLDivElement>(null)
  const [cursorTrail, setCursorTrail] = useState<CursorPosition[]>([])
  const colorIndex = useRef<number>(0)
  const colors: string[] = ["#ff0000", "#00ff00", "#0000ff"]

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        const newPos: CursorPosition = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        }

        // Add to trail with timestamp
        setCursorTrail((prev) => {
          const newTrail = [
            ...prev,
            { ...newPos, id: Date.now() + Math.random() },
          ]
          return newTrail.slice(-10) // Keep last 15 positions for longer trail
        })
      }
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener("mousemove", handleMouseMove)
      return () => container.removeEventListener("mousemove", handleMouseMove)
    }
  }, [])

  useEffect(() => {
    if (cursorTrail.length === 0) {
      colorIndex.current = (colorIndex.current + 1) % colors.length
      return
    }

    const timeout = setTimeout(() => {
      setCursorTrail((prev) => prev.slice(1))
    }, 50) // Remove one trail point every 50ms

    return () => clearTimeout(timeout)
  }, [cursorTrail])


  const handleSubmit: HandleSubmit = (e) => {
    e.preventDefault()
    const payload: AnalyzePayload = { url }
    console.log("Analyzing URL:", payload.url)
    // Add your analysis logic here
  }

  return (
    <div
      ref={containerRef}
      className={`min-h-screen transition-colors duration-300 relative overflow-hidden
          bg-linear-to-br from-pink-50 via-purple-50 to-blue-50`}
    >
      <svg
        className="absolute pointer-events-none"
        style={{
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 100,
        }}
      >
        {cursorTrail.length > 1 &&
          cursorTrail.slice(1).map((pos, index) => {
            const prevPos = cursorTrail[index]

            return (
              <line
                key={`${pos.id}-${index}`}
                x1={prevPos.x}
                y1={prevPos.y}
                x2={pos.x}
                y2={pos.y}
                stroke={colors[colorIndex.current]}
                strokeWidth={6}
                opacity={1}
                strokeLinecap="round"
              />
            )
          })}
      </svg>

      <BubbleCleaner>
        <div className="relative flex flex-col items-center justify-center min-h-screen px-4 py-20">
          <div className="mb-8 inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md">
            <Sparkles className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium text-green-800">
              AI-Powered Website Analysis
            </span>
          </div>

          <h1
            className={`text-5xl md:text-7xl font-bold text-center mb-4 text-gray-900`}
          >
            Website Health
          </h1>
          <h1 className="text-5xl md:text-7xl font-bold text-center mb-6 [text-shadow:-5px_-5px_0px_rgba(0,0,0,0.8)] hover:[text-shadow:0px_0px_0px_rgba(0,0,0,0)] bg-linear-to-r from-green-500 via-yellow-300 to-green-500 bg-clip-text text-transparent duration-100">
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
                className="flex-1 px-6 py-4 rounded-xl border-2 border-gray-200 focus:border-green-400 focus:outline-none bg-white/80 backdrop-blur-sm shadow-lg transition-all"
              />
              <GradientButton 
                message="Get Started"
                isForm={true}
                hover={true}
                className="duration-50"
                icon={<Sparkles className="w-5 h-5" />}
              />
            </div>
          </form>

          {/* Feature badges */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <div className="flex items-center gap-2 px-5 py-3 bg-white/80 backdrop-blur-sm rounded-full shadow-md">
              <Zap className="w-5 h-5 text-green-500" />
              <span className={`text-sm font-medium text-gray-700`}>
                Instant Results
              </span>
            </div>

            <div className="flex items-center gap-2 px-5 py-3 bg-white/80 backdrop-blur-sm rounded-full shadow-md">
              <Shield className="w-5 h-5 text-orange-500" />
              <span className={`text-sm font-medium text-gray-700`}>
                Secure Analysis
              </span>
            </div>

            <div className="flex items-center gap-2 px-5 py-3 bg-white/80 backdrop-blur-sm rounded-full shadow-md">
              <FileText className="w-5 h-5 text-yellow-400" />
              <span className={`text-sm font-medium text-gray-700`}>
                Detailed Reports
              </span>
            </div>
          </div>
        </div>
      </BubbleCleaner>
      <div className=" h-screen"></div>
    </div>
  )
}

export default Home
