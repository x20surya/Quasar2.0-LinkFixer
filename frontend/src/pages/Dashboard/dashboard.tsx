import { useEffect } from "react"
import { useDashboardContext } from "../../context/dashboardContext"
import { useUserContext } from "../../context/userContext"

function Dashboard() {
  const dashboardContext = useDashboardContext()
  const userContext = useUserContext()

  return (
    <div className=" h-screen w-screen flex">
      <div className=" bg-gray-900 w-96 flex flex-col">
        {dashboardContext?.websites.map((web) => {
            console.log(web)
          return (
            <div key={web.id}>
              <h1>{web.domain}</h1>
              <h1>{web.updatedAt}</h1>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Dashboard
