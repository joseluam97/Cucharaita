import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const session = localStorage.getItem('admin_session');
  return session ? <Outlet /> : <Navigate to="/login-admin" />;
};
export default ProtectedRoute;