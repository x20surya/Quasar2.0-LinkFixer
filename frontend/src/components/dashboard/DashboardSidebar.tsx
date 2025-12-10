import { useDashboardContext } from "../../context/dashboardContext"

const DashboardSidebar = () => {
  const dashboardContext = useDashboardContext()

    return (
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
    )
}

export default DashboardSidebar