import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { createBrowserRouter, RouterProvider } from "react-router"
import "./index.css"
import App from "./App.tsx"
import Home from "./pages/Home/Home.tsx"
import Login from "./pages/Login/Login.tsx"
import Dashboard from "./pages/Dashboard/dashboard.tsx"
import { UserContextProvider } from "./context/userContext.tsx"

const router = createBrowserRouter([
  {
    path: "/app",
    element: <App />,
  },
  {
    path: "/",
    element:
    <UserContextProvider><Home /></UserContextProvider> ,
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
    element: <Dashboard />,
  },
])

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
)
