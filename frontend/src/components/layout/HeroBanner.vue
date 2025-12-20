<template>
  <div class="hero-banner">
    <Carousel 
      :value="banners" 
      :numVisible="1" 
      :numScroll="1"
      :autoplayInterval="5000"
      :circular="true"
      :showIndicators="true"
      :showNavigators="true"
      class="hero-carousel"
    >
      <template #item="slotProps">
        <div class="banner-slide">
          <div class="banner-image-wrapper">
            <img 
              :src="slotProps.data.imageUrl" 
              :alt="slotProps.data.title"
              class="banner-image"
            />
            <div class="banner-overlay"></div>
            <div class="banner-content">
              <div class="banner-content-inner">
                <h2 class="banner-title">{{ slotProps.data.title }}</h2>
                <p class="banner-subtitle">{{ slotProps.data.subtitle }}</p>
                <p class="banner-description">{{ slotProps.data.description }}</p>
                <div class="banner-actions">
                  <Button 
                    :label="slotProps.data.buttonText || 'Explore Now'"
                    icon="pi pi-arrow-right"
                    class="banner-button"
                    @click="handleBannerClick(slotProps.data)"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </Carousel>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Carousel from 'primevue/carousel'
import Button from 'primevue/button'

const router = useRouter()

const banners = ref([
  {
    id: 1,
    title: 'Discover Amazing Stories',
    subtitle: 'Welcome to Story Reader',
    description: 'Explore thousands of captivating stories from talented authors around the world',
    imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1600&h=600&fit=crop&q=80',
    buttonText: 'Start Reading',
    link: '/dashboard'
  },
  {
    id: 2,
    title: 'Featured Stories Collection',
    subtitle: 'Curated for You',
    description: 'Handpicked stories that will take you on incredible journeys',
    imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=1600&h=600&fit=crop&q=80',
    buttonText: 'View Stories',
    link: '/dashboard'
  },
  {
    id: 3,
    title: 'Join Our Community',
    subtitle: 'Share Your Story',
    description: 'Connect with readers and writers who love great stories',
    imageUrl: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1600&h=600&fit=crop&q=80',
    buttonText: 'Get Started',
    link: '/register'
  },
  {
    id: 4,
    title: 'New Stories Every Week',
    subtitle: 'Fresh Content',
    description: 'Discover new adventures and experiences updated regularly',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1600&h=600&fit=crop&q=80',
    buttonText: 'Explore Now',
    link: '/dashboard'
  }
])

const handleBannerClick = (banner) => {
  if (banner.link) {
    router.push(banner.link)
  }
}
</script>

<style scoped>
.hero-banner {
  width: 100%;
  position: relative;
  margin-bottom: 0;
  overflow: hidden;
}

.hero-carousel {
  width: 100%;
}

:deep(.p-carousel) {
  background: transparent;
  border: none;
}

:deep(.p-carousel-content) {
  padding: 0;
}

:deep(.p-carousel-container) {
  border-radius: 0;
}

:deep(.p-carousel-prev),
:deep(.p-carousel-next) {
  background: rgba(244, 228, 188, 0.9);
  color: #5C4033;
  border: 2px solid rgba(244, 228, 188, 0.5);
  width: 50px;
  height: 50px;
  border-radius: 50%;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

:deep(.p-carousel-prev:hover),
:deep(.p-carousel-next:hover) {
  background: #F4E4BC;
  transform: scale(1.1);
  box-shadow: 0 4px 16px rgba(92, 64, 51, 0.3);
}

:deep(.p-carousel-indicators) {
  padding: 1.5rem 0;
  gap: 0.75rem;
}

:deep(.p-carousel-indicator button) {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(244, 228, 188, 0.4);
  border: 2px solid rgba(244, 228, 188, 0.6);
  transition: all 0.3s ease;
}

:deep(.p-carousel-indicator.p-highlight button) {
  background: #F4E4BC;
  width: 32px;
  border-radius: 6px;
  border-color: #F4E4BC;
  box-shadow: 0 2px 8px rgba(244, 228, 188, 0.5);
}

.banner-slide {
  position: relative;
  width: 100%;
  height: 500px;
  overflow: hidden;
}

.banner-image-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.banner-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 8s ease;
}

.banner-slide:hover .banner-image {
  transform: scale(1.1);
}

.banner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(92, 64, 51, 0.85) 0%,
    rgba(139, 111, 71, 0.75) 50%,
    rgba(92, 64, 51, 0.85) 100%
  );
  z-index: 1;
}

.banner-content {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  padding: 2rem;
}

.banner-content-inner {
  max-width: 800px;
  text-align: center;
  color: #F4E4BC;
  animation: fadeInUp 0.8s ease;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.banner-title {
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 1rem;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  background: linear-gradient(135deg, #F4E4BC 0%, #E8D5B7 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.2;
}

.banner-subtitle {
  font-size: 1.5rem;
  font-weight: 600;
  color: rgba(244, 228, 188, 0.9);
  margin-bottom: 1rem;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  letter-spacing: 1px;
}

.banner-description {
  font-size: 1.1rem;
  color: rgba(244, 228, 188, 0.85);
  margin-bottom: 2rem;
  line-height: 1.6;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.banner-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.banner-button {
  background: linear-gradient(135deg, #F4E4BC 0%, #E8D5B7 100%);
  color: #5C4033;
  border: none;
  font-size: 1.1rem;
  font-weight: 700;
  padding: 1rem 2.5rem;
  border-radius: 50px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.banner-button:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 6px 30px rgba(0, 0, 0, 0.4);
  background: linear-gradient(135deg, #E8D5B7 0%, #F4E4BC 100%);
}

.banner-button:active {
  transform: translateY(-1px) scale(1.02);
}

:deep(.p-button-icon-left) {
  margin-right: 0.5rem;
}

@media (max-width: 1024px) {
  .banner-slide {
    height: 450px;
  }

  .banner-title {
    font-size: 2.5rem;
  }

  .banner-subtitle {
    font-size: 1.3rem;
  }

  .banner-description {
    font-size: 1rem;
  }
}

@media (max-width: 768px) {
  .banner-slide {
    height: 400px;
  }

  .banner-title {
    font-size: 2rem;
  }

  .banner-subtitle {
    font-size: 1.1rem;
  }

  .banner-description {
    font-size: 0.95rem;
    margin-bottom: 1.5rem;
  }

  .banner-button {
    font-size: 0.95rem;
    padding: 0.85rem 2rem;
  }

  .banner-content {
    padding: 1.5rem;
  }

  :deep(.p-carousel-prev),
  :deep(.p-carousel-next) {
    width: 40px;
    height: 40px;
  }
}

@media (max-width: 480px) {
  .banner-slide {
    height: 350px;
  }

  .banner-title {
    font-size: 1.75rem;
  }

  .banner-subtitle {
    font-size: 1rem;
  }

  .banner-description {
    font-size: 0.9rem;
    margin-bottom: 1.25rem;
  }

  .banner-button {
    font-size: 0.85rem;
    padding: 0.75rem 1.75rem;
  }
}
</style>

