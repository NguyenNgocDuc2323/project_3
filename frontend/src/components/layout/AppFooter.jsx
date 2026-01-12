import React from 'react'
import { Link } from 'react-router-dom'
import './AppFooter.css'

const AppFooter = () => {
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer-background"></div>
      <div className="footer-pattern"></div>
      <div className="container">
        <div className="footer-content">
          <div className="footer-section left">
            <div className="brand-section">
              <div className="brand-icon">
                <span className="book-emoji">📖</span>
                <div className="icon-glow"></div>
              </div>
              <div className="brand-info">
                <div className="title">Story Reader</div>
                <div className="subtitle">Great Stories</div>
              </div>
            </div>
            <div className="description">
              Where you can immerse yourself in great stories. Discover the world of amazing stories.
            </div>
            <div className="social-links">
              <a href="#" className="social-link" aria-label="Facebook">
                <i className="bi bi-facebook"></i>
              </a>
              <a href="#" className="social-link" aria-label="Twitter">
                <i className="bi bi-twitter"></i>
              </a>
              <a href="#" className="social-link" aria-label="Instagram">
                <i className="bi bi-instagram"></i>
              </a>
              <a href="#" className="social-link" aria-label="Youtube">
                <i className="bi bi-youtube"></i>
              </a>
            </div>
          </div>

          <div className="footer-section middle">
            <h3 className="section-title">Quick Links</h3>
            <div className="links">
              <Link to="/dashboard" className="link">
                <i className="bi bi-house"></i>
                <span>Home</span>
              </Link>
              <Link to="/about" className="link">
                <i className="bi bi-info-circle"></i>
                <span>About Us</span>
              </Link>
              <a href="#" className="link">
                <i className="bi bi-envelope"></i>
                <span>Contact</span>
              </a>
              <a href="#" className="link">
                <i className="bi bi-file-text"></i>
                <span>Terms</span>
              </a>
            </div>
          </div>

          <div className="footer-section right">
            <h3 className="section-title">Information</h3>
            <div className="info-list">
              <div className="info-item">
                <i className="bi bi-telephone"></i>
                <span>Hotline: 1900 1234</span>
              </div>
              <div className="info-item">
                <i className="bi bi-envelope"></i>
                <span>Email: contact@storyreader.com</span>
              </div>
              <div className="info-item">
                <i className="bi bi-geo-alt"></i>
                <span>123 Book Street, HCMC</span>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="copyright">
            <i className="bi bi-c-circle"></i>
            <span>{year} Story Reader. All rights reserved.</span>
          </div>
          <div className="divider"></div>
          <div className="footer-links">
            <a href="#" className="footer-link">Privacy Policy</a>
            <span className="separator">•</span>
            <a href="#" className="footer-link">Terms of Service</a>
            <span className="separator">•</span>
            <a href="#" className="footer-link">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default AppFooter

