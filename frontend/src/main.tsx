import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { createBrowserRouter, RouterProvider } from "react-router"
import "./index.css"
import Home from "./pages/Home/Home.tsx"
import Login from "./pages/Login/Login.tsx"
import Dashboard from "./pages/Dashboard/Dashboard.tsx"
import { UserContextProvider } from "./context/userContext.tsx"
import { DashboardContextProvider } from "./context/dashboardContext.tsx"

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <UserContextProvider>
        <Home />
      </UserContextProvider>
    ),
  },
  {
    path: "/login",
    element: (
      <UserContextProvider>
        <Login />
      </UserContextProvider>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <UserContextProvider>
        <DashboardContextProvider>
          <Dashboard />
        </DashboardContextProvider>
      </UserContextProvider>
    ),
  },
])

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
)
