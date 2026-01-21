import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import HeaderSearch from "../HeaderSearch/HeaderSearch";
import "./header.css";

export default function Header() {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header>
      <Link className="logo" to="/">
        <img src="./Logo3.png" alt="logo" />
      </Link>
      {isAuthenticated && <HeaderSearch />}
      <div className="header-actions">
        {isAuthenticated ? (
          <>
            <Link className="create-link" to="/new">
              Create Article
            </Link>
            {isAdmin && (
              <Link className="manage-users-link" to="/users">
                Manage Users
              </Link>
            )}
            <span className="user-info">
              {user?.name} ({user?.role})
            </span>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <Link className="create-link" to="/login">
            Login
          </Link>
        )}
      </div>
    </header>
  );
}
