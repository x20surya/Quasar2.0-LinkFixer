import { Navigate, Outlet } from "react-router-dom";
import { useMyContext } from "./context";
const ProtectedRoute = () => {
  const { islogin } = useMyContext();

  return islogin ? <Outlet /> : <Navigate to="/signin" replace />;
};

export default ProtectedRoute;
