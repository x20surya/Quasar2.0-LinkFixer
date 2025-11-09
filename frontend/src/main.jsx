import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { useMyContext } from "@/context/context";
import "./index.css";
import SignIn from "./Auth/SignIn";
import SignUp from "./Auth/SignUP";
import Dashboard from "./page/dashboard";
import { MyContextProvider } from "./context/context";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ProtectedRoute from "./context/protected";
const router = createBrowserRouter([
  {
    element: <ProtectedRoute />,
    children: [
      { path: "/", element: <Dashboard /> },
    ],
  },
  { path: "/signin", element: <SignIn /> },
  { path: "/signup", element: <SignUp /> },
]);
createRoot(document.getElementById("root")).render(
  <MyContextProvider>
    <RouterProvider router={router} />
  </MyContextProvider>
);
