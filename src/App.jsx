import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./AuthContext";
import AppRoutes from "./AppRoutes"; // new file ideal

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
