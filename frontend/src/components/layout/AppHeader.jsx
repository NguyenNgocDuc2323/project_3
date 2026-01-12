import React, { useState, useEffect } from 'react'
import { Navbar, Nav, NavDropdown, Container } from 'react-bootstrap'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { isAuthenticated, isAdmin, getCurrentUser, logout } from '../../common/utils'
import { ROUTES } from '../../common/constants'
import './AppHeader.css'

const AppHeader = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [isScrolled, setIsScrolled] = useState(false)
  const [userInfo, setUserInfo] = useState(null)

  const navItems = [
    { to: ROUTES.DASHBOARD, label: 'Home', icon: 'bi bi-house' },
    { to: ROUTES.ABOUT, label: 'About', icon: 'bi bi-info-circle' }
  ]

  const handleScroll = () => {
    setIsScrolled(window.scrollY > 20)
  }

  useEffect(() => {
    setUserInfo(getCurrentUser())
    window.addEventListener('scroll', handleScroll)
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  useEffect(() => {
    setUserInfo(getCurrentUser())
  }, [location])

  const handleLogout = () => {
    logout()
    navigate(ROUTES.LOGIN)
  }

  return (
    <Navbar 
      expand="lg" 
      className={`custom-navbar fixed-top ${isScrolled ? 'navbar-scrolled' : ''}`}
      variant="dark"
    >
      <Container>
        <Navbar.Brand as={Link} to={ROUTES.DASHBOARD} className="d-flex align-items-center">
          <span className="me-2" style={{ fontSize: '1.1rem' }}>📖</span>
          <div>
            <div className="fw-bold" style={{ fontSize: '1rem', lineHeight: '1.2' }}>Story Reader</div>
          </div>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {navItems.map(item => (
              <Nav.Link
                key={item.to}
                as={Link}
                to={item.to}
                active={location.pathname === item.to}
              >
                <i className={`${item.icon} me-1`}></i>
                {item.label}
              </Nav.Link>
            ))}
            {isAuthenticated() && (
              <Nav.Link as={Link} to={ROUTES.DASHBOARD}>
                <i className="bi bi-grid me-1"></i>
                Dashboard
              </Nav.Link>
            )}
            {isAdmin() && (
              <Nav.Link as={Link} to={ROUTES.ADMIN}>
                <i className="bi bi-gear me-1"></i>
                Admin
              </Nav.Link>
            )}
          </Nav>

          <Nav>
            {!isAuthenticated() ? (
              <button
                className="btn btn-outline-light border-0 ms-2"
                onClick={() => navigate(ROUTES.LOGIN)}
              >
                <i className="bi bi-box-arrow-in-right me-1"></i>
                Sign In
              </button>
            ) : (
              <NavDropdown
                title={
                  <span>
                    <i className="bi bi-person-circle me-1"></i>
                    {userInfo?.fullName || userInfo?.username || 'User'}
                  </span>
                }
                id="user-nav-dropdown"
                align="end"
              >
                <NavDropdown.ItemText>
                  <div>
                    <strong>
                      <i className="bi bi-person me-1"></i>
                      {userInfo?.fullName || userInfo?.username || 'User'}
                    </strong>
                    {userInfo?.email && (
                      <div className="text-muted small">{userInfo.email}</div>
                    )}
                  </div>
                </NavDropdown.ItemText>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={() => {}}>
                  <i className="bi bi-person-gear me-2"></i>
                  Update Profile
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout} className="text-danger">
                  <i className="bi bi-box-arrow-right me-2"></i>
                  Sign Out
                </NavDropdown.Item>
              </NavDropdown>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default AppHeader
