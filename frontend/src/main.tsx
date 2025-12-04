import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { createBrowserRouter, RouterProvider } from "react-router"
import "./index.css"
import App from "./App.tsx"
import Home from "./pages/Home/Home.tsx"
import Login from "./pages/Login/Login.tsx"
import Dashboard from "./pages/Dashboard/dashboard.tsx"

const router = createBrowserRouter([
  {
    path: "/app",
    element: <App />,
  },
  {
    path : "/",
    element : <Home/>
  }, {
    path : "/login",
    element : <Login/>
  },  {
    path : "/dashboard",
    element : <Dashboard/>
  }
])

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
)
