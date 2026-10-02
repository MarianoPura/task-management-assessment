import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <NavLink to="/tasks" className="brand-logo" onClick={closeMenu}>
            <span className="brand-name">To Do</span>
          </NavLink>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          className="navbar-toggle-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? 'Close' : 'Menu'}
        </button>

        {/* Desktop and mobile navigation links */}
        <nav className={`navbar-menu ${mobileMenuOpen ? 'is-open' : ''}`}>
          <div className="nav-links">
            <NavLink
              to="/tasks"
              className={({ isActive }) =>
                `nav-link ${isActive ? 'active' : ''}`
              }
              onClick={closeMenu}
            >
              Tasks
            </NavLink>
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `nav-link ${isActive ? 'active' : ''}`
              }
              onClick={closeMenu}
            >
              Profile
            </NavLink>
          </div>

          <div className="nav-user-actions">
            {user && (
              <span className="user-greeting">
                Hello, <strong>{user.firstName}</strong>
              </span>
            )}
            <button
              type="button"
              className="btn btn-logout"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}
