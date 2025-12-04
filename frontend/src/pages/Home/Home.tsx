import React, { useEffect, useRef, useState } from "react"
import { Sparkles, Zap, Shield, FileText } from "lucide-react"
import BubbleCleaner from "../../components/background/BubbleCleaner"

interface CursorPosition {
  x: number
  y: number
  id?: number
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
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-600">
              AI-Powered Website Analysis
            </span>
          </div>

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
              <span className={`text-sm font-medium text-gray-700`}>
                Instant Results
              </span>
            </div>

            <div className="flex items-center gap-2 px-5 py-3 bg-white/80 backdrop-blur-sm rounded-full shadow-md">
              <Shield className="w-5 h-5 text-blue-500" />
              <span className={`text-sm font-medium text-gray-700`}>
                Secure Analysis
              </span>
            </div>

            <div className="flex items-center gap-2 px-5 py-3 bg-white/80 backdrop-blur-sm rounded-full shadow-md">
              <FileText className="w-5 h-5 text-pink-500" />
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
