type cardInput = {
  logo?: React.ReactNode
  heading: string
  subHeading?: string
  text: string
}

export default function Card({
  logo = undefined,
  heading,
  subHeading,
  text
}: cardInput) {
  return <div>

    {logo}
    <h1>{heading}</h1>
    <h2>{subHeading}</h2>
    <p>{text}</p>
  </div>
}
