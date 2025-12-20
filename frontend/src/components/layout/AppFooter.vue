<template>
  <footer class="footer">
    <div class="footer-background"></div>
    <div class="footer-pattern"></div>
    <div class="container">
      <div class="footer-content">
        <div class="footer-section left">
          <div class="brand-section">
            <div class="brand-icon">
              <span class="book-emoji">📖</span>
              <div class="icon-glow"></div>
            </div>
            <div class="brand-info">
              <div class="title">Story Reader</div>
              <div class="subtitle">Great Stories</div>
            </div>
          </div>
          <div class="description">
            Where you can immerse yourself in great stories. Discover the world of amazing stories.
          </div>
          <div class="social-links">
            <a href="#" class="social-link" aria-label="Facebook">
              <i class="pi pi-facebook"></i>
            </a>
            <a href="#" class="social-link" aria-label="Twitter">
              <i class="pi pi-twitter"></i>
            </a>
            <a href="#" class="social-link" aria-label="Instagram">
              <i class="pi pi-instagram"></i>
            </a>
            <a href="#" class="social-link" aria-label="Youtube">
              <i class="pi pi-youtube"></i>
            </a>
          </div>
        </div>

        <div class="footer-section middle">
          <h3 class="section-title">Quick Links</h3>
          <div class="links">
            <router-link to="/dashboard" class="link">
              <i class="pi pi-home"></i>
              <span>Home</span>
            </router-link>
            <router-link to="/about" class="link">
              <i class="pi pi-info-circle"></i>
              <span>About Us</span>
            </router-link>
            <a href="#" class="link">
              <i class="pi pi-envelope"></i>
              <span>Contact</span>
            </a>
            <a href="#" class="link">
              <i class="pi pi-file"></i>
              <span>Terms</span>
            </a>
          </div>
        </div>

        <div class="footer-section right">
          <h3 class="section-title">Information</h3>
          <div class="info-list">
            <div class="info-item">
              <i class="pi pi-phone"></i>
              <span>Hotline: 1900 1234</span>
            </div>
            <div class="info-item">
              <i class="pi pi-envelope"></i>
              <span>Email: contact@storyreader.com</span>
            </div>
            <div class="info-item">
              <i class="pi pi-map-marker"></i>
              <span>123 Book Street, HCMC</span>
            </div>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <div class="copyright">
          <i class="pi pi-copyright"></i>
          <span>{{ year }} Story Reader. All rights reserved.</span>
        </div>
        <div class="divider"></div>
        <div class="footer-links">
          <a href="#" class="footer-link">Privacy Policy</a>
          <span class="separator">•</span>
          <a href="#" class="footer-link">Terms of Service</a>
          <span class="separator">•</span>
          <a href="#" class="footer-link">Cookie Policy</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
const year = new Date().getFullYear()
</script>

<style scoped>
.footer {
  background: linear-gradient(135deg, #5C4033 0%, #6B4F3F 50%, #5C4033 100%);
  color: #F4E4BC;
  border-top: 3px solid rgba(139, 111, 71, 0.5);
  margin-top: auto;
  position: relative;
  overflow: hidden;
}

.footer-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 30%, rgba(212, 165, 116, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(139, 111, 71, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

.footer-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(244, 228, 188, 0.03) 2px, rgba(244, 228, 188, 0.03) 4px);
  pointer-events: none;
}

.container {
  max-width: 1600px;
  margin: 0 auto;
  padding: 4rem 2rem 2rem;
  position: relative;
  z-index: 1;
}

.footer-content {
  display: grid;
  grid-template-columns: 2fr 1.5fr 1.5fr;
  gap: 4rem;
  margin-bottom: 3rem;
}

.footer-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.brand-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.brand-icon {
  position: relative;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(244, 228, 188, 0.2) 0%, rgba(244, 228, 188, 0.1) 100%);
  border-radius: 16px;
  border: 2px solid rgba(244, 228, 188, 0.3);
  overflow: hidden;
}

.book-emoji {
  font-size: 2rem;
  position: relative;
  z-index: 2;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
  animation: bookBounce 3s ease-in-out infinite;
}

@keyframes bookBounce {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-5px) rotate(5deg);
  }
}

.icon-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(244, 228, 188, 0.3) 0%, transparent 70%);
  animation: iconPulse 2s ease-in-out infinite;
}

@keyframes iconPulse {
  0%, 100% {
    opacity: 0.5;
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    opacity: 0.8;
    transform: translate(-50%, -50%) scale(1.2);
  }
}

.brand-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.title {
  font-weight: 800;
  font-size: 1.5rem;
  background: linear-gradient(135deg, #F4E4BC 0%, #E8D5B7 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.subtitle {
  font-size: 0.85rem;
  color: rgba(244, 228, 188, 0.7);
  font-weight: 500;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.description {
  font-size: 0.95rem;
  color: rgba(244, 228, 188, 0.85);
  line-height: 1.7;
  max-width: 400px;
}

.social-links {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
}

.social-link {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: rgba(244, 228, 188, 0.1);
  color: rgba(244, 228, 188, 0.9);
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid rgba(244, 228, 188, 0.2);
  font-size: 1.2rem;
}

.social-link:hover {
  background: rgba(244, 228, 188, 0.2);
  color: #F4E4BC;
  transform: translateY(-3px) scale(1.1);
  box-shadow: 0 4px 16px rgba(244, 228, 188, 0.3);
  border-color: rgba(244, 228, 188, 0.4);
}

.section-title {
  font-weight: 700;
  font-size: 1.1rem;
  color: #F4E4BC;
  margin-bottom: 1rem;
  position: relative;
  padding-bottom: 0.75rem;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 40px;
  height: 3px;
  background: linear-gradient(90deg, #F4E4BC 0%, transparent 100%);
  border-radius: 2px;
}

.links {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.link {
  color: rgba(244, 228, 188, 0.85);
  text-decoration: none;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
  border-radius: 8px;
  position: relative;
  padding-left: 0.5rem;
}

.link::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 0;
  background: linear-gradient(135deg, #F4E4BC 0%, #E8D5B7 100%);
  border-radius: 2px;
  transition: height 0.3s ease;
}

.link:hover::before {
  height: 60%;
}

.link:hover {
  color: #F4E4BC;
  transform: translateX(5px);
  padding-left: 1rem;
}

.link i {
  font-size: 0.9rem;
  transition: transform 0.3s ease;
}

.link:hover i {
  transform: scale(1.2);
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: rgba(244, 228, 188, 0.85);
  font-size: 0.95rem;
  transition: all 0.3s ease;
  padding: 0.5rem 0;
}

.info-item:hover {
  color: #F4E4BC;
  transform: translateX(5px);
}

.info-item i {
  font-size: 1.1rem;
  color: rgba(244, 228, 188, 0.7);
  transition: all 0.3s ease;
}

.info-item:hover i {
  color: #F4E4BC;
  transform: scale(1.2);
}

.footer-bottom {
  padding-top: 2rem;
  border-top: 1px solid rgba(244, 228, 188, 0.2);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  align-items: center;
}

.copyright {
  font-size: 0.9rem;
  color: rgba(244, 228, 188, 0.7);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.divider {
  width: 100px;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(244, 228, 188, 0.5), transparent);
}

.footer-links {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

.footer-link {
  color: rgba(244, 228, 188, 0.7);
  text-decoration: none;
  font-size: 0.85rem;
  transition: all 0.3s ease;
}

.footer-link:hover {
  color: #F4E4BC;
  text-decoration: underline;
}

.separator {
  color: rgba(244, 228, 188, 0.5);
  font-size: 0.85rem;
}

@media (max-width: 1024px) {
  .footer-content {
    grid-template-columns: 1fr 1fr;
    gap: 3rem;
  }

  .footer-section.left {
    grid-column: 1 / -1;
  }
}

@media (max-width: 720px) {
  .container {
    padding: 3rem 1.5rem 2rem;
  }

  .footer-content {
    grid-template-columns: 1fr;
    gap: 2.5rem;
  }

  .footer-section.left {
    grid-column: 1;
  }

  .footer-bottom {
    text-align: center;
  }

  .footer-links {
    flex-direction: column;
    gap: 0.5rem;
  }

  .separator {
    display: none;
  }
}

@media (max-width: 480px) {
  .brand-section {
    flex-direction: column;
    align-items: flex-start;
  }

  .social-links {
    flex-wrap: wrap;
  }
}
</style>


