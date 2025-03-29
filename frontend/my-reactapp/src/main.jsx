import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import SignIn from "./Auth/SignIn";
import SignUp from "./Auth/SignUP";
import Dashboard from "./page/dashboard";
import { MyContextProvider } from "./context/context";
import App from "./App.jsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

const router = createBrowserRouter([
  { path: "/", element: <App /> },
  { path: "/dashboard", element: <Dashboard /> },

  { path: "/signin", element: <SignIn /> },
  { path: "/signup", element: <SignUp /> },
]);
createRoot(document.getElementById("root")).render(
  <MyContextProvider>
    <RouterProvider router={router} />
  </MyContextProvider>
);
