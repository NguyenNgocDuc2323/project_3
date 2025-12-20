<template>
  <div class="about-page">
    <!-- Hero Section with Carousel -->
    <section class="hero-section" v-animateonscroll="{ enterClass: 'fadein', threshold: 0.1 }">
      <div class="hero-content">
        <h1 class="hero-title">
          <span class="title-line">Welcome to</span>
          <span class="title-main">Story Reader</span>
        </h1>
        <p class="hero-subtitle">Where great stories are told</p>
      </div>
    </section>

    <!-- Featured Stories Carousel -->
    <section class="carousel-section" v-animateonscroll="{ enterClass: 'fadeinup', threshold: 0.1 }">
      <div class="section-header">
        <h2 class="section-title">
          <i class="pi pi-star"></i>
          Featured Stories
        </h2>
        <p class="section-subtitle">Discover the most loved stories</p>
      </div>
      
      <Card class="carousel-card" v-if="featuredStories.length > 0">
        <Carousel 
          :value="featuredStories" 
          :numVisible="3" 
          :numScroll="1"
          :autoplayInterval="4000"
          :circular="true"
          :showIndicators="true"
          :showNavigators="true"
          :responsiveOptions="responsiveOptions"
        >
          <template #item="slotProps">
            <div class="carousel-story-card" @click="viewStory(slotProps.data.id)">
              <div class="story-image-wrapper">
                <img :src="slotProps.data.imageUrl" :alt="slotProps.data.title" />
                <div class="story-overlay">
                  <Button 
                    label="Read Now" 
                    icon="pi pi-book"
                    class="read-button"
                  />
                </div>
              </div>
              <div class="story-info">
                <h3 class="story-title">{{ slotProps.data.title }}</h3>
                <p class="story-author">{{ slotProps.data.author }}</p>
                <div class="story-stats">
                  <span><i class="pi pi-eye"></i> {{ formatNumber(slotProps.data.views) }}</span>
                  <span><i class="pi pi-heart"></i> {{ formatNumber(slotProps.data.likes) }}</span>
                </div>
              </div>
            </div>
          </template>
        </Carousel>
      </Card>
    </section>

    <!-- About Content -->
    <section class="about-content">
      <div class="content-grid">
        <div class="content-card" v-animateonscroll="{ enterClass: 'fadeinleft', threshold: 0.2 }">
          <div class="card-icon">
            <i class="pi pi-book"></i>
          </div>
          <h3 class="card-title">Rich Story Collection</h3>
          <p class="card-description">
            Thousands of diverse stories across genres await your discovery. From adventure to romance, from mystery to science fiction.
          </p>
        </div>

        <div class="content-card" v-animateonscroll="{ enterClass: 'fadeinup', threshold: 0.2, delay: 100 }">
          <div class="card-icon">
            <i class="pi pi-users"></i>
          </div>
          <h3 class="card-title">Active Community</h3>
          <p class="card-description">
            Join thousands of readers who love stories. Share, rate and discover new stories every day.
          </p>
        </div>

        <div class="content-card" v-animateonscroll="{ enterClass: 'fadeinright', threshold: 0.2, delay: 200 }">
          <div class="card-icon">
            <i class="pi pi-heart"></i>
          </div>
          <h3 class="card-title">Great Experience</h3>
          <p class="card-description">
            Beautiful interface, easy to use. Read stories anytime, anywhere on any device. The perfect reading experience.
          </p>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="stats-section" v-animateonscroll="{ enterClass: 'fadeinup', threshold: 0.2 }">
      <div class="stats-grid">
        <div class="stat-item" v-for="(stat, index) in statsList" :key="index">
          <div class="stat-icon-wrapper">
            <i :class="stat.icon"></i>
          </div>
          <div class="stat-value">{{ formatNumber(stat.value) }}</div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Card from 'primevue/card'
import Carousel from 'primevue/carousel'
import Button from 'primevue/button'
import { userStoryService } from '@/api/user/storyService'

const router = useRouter()
const featuredStories = ref([])
const stats = ref({
  totalStories: 0,
  totalViews: 0,
  totalLikes: 0,
  totalUsers: 0
})

const responsiveOptions = [
  {
    breakpoint: '1400px',
    numVisible: 3,
    numScroll: 1
  },
  {
    breakpoint: '1024px',
    numVisible: 2,
    numScroll: 1
  },
  {
    breakpoint: '768px',
    numVisible: 1,
    numScroll: 1
  }
]

const statsList = [
  { icon: 'pi pi-book', value: stats.value.totalStories, label: 'Stories' },
  { icon: 'pi pi-eye', value: stats.value.totalViews, label: 'Views' },
  { icon: 'pi pi-heart', value: stats.value.totalLikes, label: 'Likes' },
  { icon: 'pi pi-users', value: stats.value.totalUsers, label: 'Users' }
]

onMounted(async () => {
  try {
    const featured = await userStoryService.getAll(true)
    featuredStories.value = featured.slice(0, 6)
    
    const statsData = await userStoryService.getStats()
    stats.value = statsData
  } catch (error) {
  }
})

const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

const viewStory = (id) => {
  router.push(`/dashboard`)
}
</script>

<style scoped>
.about-page {
  min-height: 100vh;
  background: linear-gradient(to bottom, #F9F7F4 0%, #F4E4BC 100%);
}

.hero-section {
  background: linear-gradient(135deg, rgba(92, 64, 51, 0.95) 0%, rgba(139, 111, 71, 0.95) 100%);
  padding: 6rem 2rem;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.hero-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 30% 50%, rgba(244, 228, 188, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 70% 50%, rgba(212, 165, 116, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

.hero-content {
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.hero-title {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.title-line {
  font-size: 1.5rem;
  color: rgba(244, 228, 188, 0.9);
  font-weight: 500;
  letter-spacing: 2px;
  text-transform: uppercase;
}

.title-main {
  font-size: 4rem;
  font-weight: 800;
  background: linear-gradient(135deg, #F4E4BC 0%, #E8D5B7 50%, #D4A574 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  letter-spacing: -1px;
}

.hero-subtitle {
  font-size: 1.3rem;
  color: rgba(244, 228, 188, 0.9);
  font-weight: 400;
}

.carousel-section {
  padding: 5rem 2rem;
  max-width: 1600px;
  margin: 0 auto;
}

.section-header {
  text-align: center;
  margin-bottom: 3rem;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #5C4033;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.section-title i {
  color: #8B6F47;
  font-size: 2rem;
}

.section-subtitle {
  font-size: 1.1rem;
  color: #8B6F47;
}

.carousel-card {
  border-radius: 24px;
  box-shadow: 0 12px 40px rgba(92, 64, 51, 0.15);
  border: none;
  overflow: hidden;
}

:deep(.carousel-card .p-card-body) {
  padding: 0;
}

:deep(.carousel-card .p-card-content) {
  padding: 2rem;
}

:deep(.p-carousel .p-carousel-indicators) {
  padding: 1rem 0;
}

:deep(.p-carousel .p-carousel-indicator button) {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(139, 111, 71, 0.3);
  transition: all 0.3s ease;
}

:deep(.p-carousel .p-carousel-indicator.p-highlight button) {
  background: #8B6F47;
  width: 32px;
  border-radius: 6px;
}

.carousel-story-card {
  margin: 0.5rem;
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(92, 64, 51, 0.12);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.carousel-story-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 32px rgba(92, 64, 51, 0.25);
}

.story-image-wrapper {
  position: relative;
  width: 100%;
  height: 300px;
  overflow: hidden;
}

.story-image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.carousel-story-card:hover .story-image-wrapper img {
  transform: scale(1.1);
}

.story-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, transparent 0%, rgba(92, 64, 51, 0.8) 100%);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 2rem;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.carousel-story-card:hover .story-overlay {
  opacity: 1;
}

.read-button {
  background: linear-gradient(135deg, #8B6F47 0%, #5C4033 100%);
  border: none;
  color: #F4E4BC;
  font-weight: 600;
  padding: 0.75rem 2rem;
  border-radius: 12px;
}

.story-info {
  padding: 1.5rem;
}

.story-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #5C4033;
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

.story-author {
  font-size: 0.9rem;
  color: #8B6F47;
  margin-bottom: 0.75rem;
}

.story-stats {
  display: flex;
  gap: 1rem;
  font-size: 0.85rem;
  color: #8B6F47;
}

.story-stats i {
  margin-right: 0.35rem;
}

.about-content {
  padding: 5rem 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2.5rem;
}

.content-card {
  background: white;
  padding: 3rem 2rem;
  border-radius: 24px;
  box-shadow: 0 8px 24px rgba(92, 64, 51, 0.1);
  text-align: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid transparent;
}

.content-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(92, 64, 51, 0.2);
  border-color: rgba(139, 111, 71, 0.3);
}

.card-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
  background: linear-gradient(135deg, #F4E4BC 0%, #E8D5B7 100%);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  color: #5C4033;
  box-shadow: 0 4px 16px rgba(92, 64, 51, 0.15);
}

.card-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #5C4033;
  margin-bottom: 1rem;
}

.card-description {
  font-size: 1rem;
  color: #6B5B4F;
  line-height: 1.7;
}

.stats-section {
  padding: 5rem 2rem;
  background: linear-gradient(135deg, rgba(92, 64, 51, 0.05) 0%, rgba(139, 111, 71, 0.05) 100%);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.stat-item {
  background: white;
  padding: 2.5rem 2rem;
  border-radius: 20px;
  text-align: center;
  box-shadow: 0 4px 16px rgba(92, 64, 51, 0.1);
  transition: all 0.3s ease;
}

.stat-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(92, 64, 51, 0.2);
}

.stat-icon-wrapper {
  width: 70px;
  height: 70px;
  margin: 0 auto 1.5rem;
  background: linear-gradient(135deg, #8B6F47 0%, #5C4033 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: #F4E4BC;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 800;
  color: #5C4033;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 1rem;
  color: #8B6F47;
  font-weight: 500;
}

@media (max-width: 768px) {
  .hero-section {
    padding: 4rem 1.5rem;
  }

  .title-main {
    font-size: 2.5rem;
  }

  .title-line {
    font-size: 1.2rem;
  }

  .hero-subtitle {
    font-size: 1.1rem;
  }

  .carousel-section,
  .about-content,
  .stats-section {
    padding: 3rem 1.5rem;
  }

  .section-title {
    font-size: 2rem;
  }

  .content-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>

