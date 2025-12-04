type GradientButtonInput = {
  icon?: React.ReactNode
  message: string
  className?: string
  hover?: boolean
  handleClick?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
  isForm: boolean
}

const GradientButton = ({
  icon,
  message,
  className = "",
  hover = false,
  handleClick = undefined,
  isForm,
}: GradientButtonInput) => {
  return (
    <>
      {isForm ? (
        <button
          type="submit"
          className={`px-8 py-4 bg-linear-to-r from-green-400 to-yellow-300 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2 whitespace-nowrap ${className}
      ${
        hover &&
        "shadow-[3px_3px_0px_0px_rgba(0,0,0,0.5)] translate-[-3px] hover:translate-0 hover:shadow-[0px_0px_0px_0px_rgba(0,0,0,0.5)]"
      }`}
        >
          {icon}
          {message}
        </button>
      ) : (
        <button
          onClick={handleClick}
          className={`px-8 py-4 bg-linear-to-r from-green-400 to-yellow-300 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2 whitespace-nowrap ${className}
      ${
        hover &&
        "shadow-[3px_3px_0px_0px_rgba(0,0,0,0.5)] translate-[-3px] hover:translate-0 hover:shadow-[0px_0px_0px_0px_rgba(0,0,0,0.5)]"
      }`}
        >
          {icon}
          {message}
        </button>
      )}
    </>
  )
}

export default GradientButton
