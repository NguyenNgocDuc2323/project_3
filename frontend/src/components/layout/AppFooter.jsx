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
                <span className="book-emoji">💎</span>
                <div className="icon-glow"></div>
              </div>
              <div className="brand-info">
                <div className="title">Yash Gems & Jewelleries</div>
                <div className="subtitle">Gold and Diamond Elegance</div>
              </div>
            </div>
            <div className="description">
              Discover regal gold and diamond jewelry crafted with brilliance, heritage, and care.
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
              <Link to="/shop" className="link">
                <i className="bi bi-gem"></i>
                <span>Shop</span>
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
                <span>Hotline: +91 98765 43210</span>
              </div>
              <div className="info-item">
                <i className="bi bi-envelope"></i>
                <span>Email: care@yashgems.com</span>
              </div>
              <div className="info-item">
                <i className="bi bi-geo-alt"></i>
                <span>48 Heritage Avenue, Mumbai</span>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="copyright">
            <i className="bi bi-c-circle"></i>
            <span>{year} Yash Gems & Jewelleries. All rights reserved.</span>
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

