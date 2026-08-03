import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useUser from "../hooks/useUser";
import logo from "../assets/imgs/logo_reducido.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, loading, error } = useUser();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const user = await login(email, password);
    if (user) {
      navigate("/administration");
    }
  };

  return (
    <div className="min-h-screen bg-brand-cream/30 flex items-center justify-center p-6">
      <div className="bg-white p-10 rounded-[2rem] shadow-2xl w-full max-w-md border border-brand-light">
        
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img src={logo} alt="Cucharaita" className="w-32" />
        </div>

        <h2 className="font-cooper text-3xl text-brand-dark text-center mb-8">
          Acceso Administrador
        </h2>

        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-6 text-sm text-center">
            Credenciales incorrectas
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-bold text-brand-dark mb-1 ml-1">Email</label>
            <input
              type="email"
              className="w-full p-4 rounded-xl border-2 border-brand-light focus:border-brand-primary outline-none transition-all"
              placeholder="admin@cucharaita.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-brand-dark mb-1 ml-1">Contraseña</label>
            <input
              type="password"
              className="w-full p-4 rounded-xl border-2 border-brand-light focus:border-brand-primary outline-none transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full bg-brand-primary text-white py-4 rounded-xl font-bold text-lg hover:bg-brand-secondary transition-all shadow-lg"
          >
            {loading ? "Verificando..." : "Entrar al Panel"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;