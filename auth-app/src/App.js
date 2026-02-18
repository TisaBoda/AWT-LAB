import React, { createContext, useContext, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";

/* ================= AUTH CONTEXT ================= */
const AuthContext = createContext();

const fakeUsers = [
  { username: "admin", password: "admin123", role: "admin", name: "Admin User" },
  { username: "user", password: "user123", role: "user", name: "Common User" },
];

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("auth")) || null);

  const login = (username, password) => {
    const foundUser = fakeUsers.find(
      (u) => u.username === username && u.password === password
    );
    if (!foundUser) return false;

    localStorage.setItem("auth", JSON.stringify(foundUser));
    setUser(foundUser);
    return true;
  };

  const logout = () => {
    localStorage.removeItem("auth");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

/* ================= PROTECTED ROUTE ================= */
const ProtectedRoute = ({ role, children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/unauthorized" />;
  return children;
};

/* ================= LOGIN ================= */
const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const success = login(username, password);
    if (!success) return setError("Invalid username or password");

    if (user?.role === "admin") navigate("/admin");
    else navigate("/user");
  };

  return (
    <div style={styles.center}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h2>Secure Login</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <input placeholder="Username" onChange={(e) => setUsername(e.target.value)} required />
        <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} required />
        <button>Login</button>
        <p style={{ fontSize: "12px" }}>Admin / User role based redirection</p>
      </form>
    </div>
  );
};

/* ================= DASHBOARDS ================= */
const AdminDashboard = () => {
  const { logout, user } = useAuth();
  return (
    <div style={styles.dashboard}>
      <h1>Admin Dashboard</h1>
      <p>Welcome, {user.name}</p>
      <ul>
        <li>✔ Manage Users</li>
        <li>✔ View Reports</li>
        <li>✔ System Settings</li>
      </ul>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

const UserDashboard = () => {
  const { logout, user } = useAuth();
  return (
    <div style={styles.dashboard}>
      <h1>User Dashboard</h1>
      <p>Hello, {user.name}</p>
      <ul>
        <li>✔ View Profile</li>
        <li>✔ Access Services</li>
      </ul>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

const Unauthorized = () => (
  <div style={styles.center}>
    <h2>403 - Unauthorized Access</h2>
  </div>
);

/* ================= APP ================= */
export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user"
            element={
              <ProtectedRoute role="user">
                <UserDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

/* ================= BASIC STYLES ================= */
const styles = {
  center: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    background: "#f4f6f8",
  },
  card: {
    background: "#fff",
    padding: "30px",
    width: "300px",
    borderRadius: "10px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
  },
  dashboard: {
    padding: "40px",
  },
};