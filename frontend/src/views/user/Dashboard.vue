<template>
  <div class="dashboard">
    <!-- Promotional Banners -->
    <div 
      class="promo-banners"
      v-animateonscroll="{ enterClass: 'fadeinup', threshold: 0.1 }"
    >
      <Card class="promo-banner promo-banner-primary">
        <div class="promo-content">
          <div class="promo-text">
            <h3 class="promo-title">🌟 Explore the World of Stories</h3>
            <p class="promo-description">Over 1000+ amazing stories waiting for you to discover!</p>
            <Button 
              label="Explore Now" 
              icon="pi pi-arrow-right"
              class="promo-button"
              @click="scrollToStories"
            />
          </div>
          <div class="promo-icon">
            <i class="pi pi-book" />
          </div>
        </div>
      </Card>

      <div class="promo-banners-grid">
        <Card class="promo-mini-banner promo-mini-1">
          <div class="promo-mini-content">
            <i class="pi pi-star promo-mini-icon" />
            <div>
              <h4>Featured Stories</h4>
              <p>Most loved stories</p>
            </div>
          </div>
        </Card>

        <Card class="promo-mini-banner promo-mini-2">
          <div class="promo-mini-content">
            <i class="pi pi-heart promo-mini-icon" />
            <div>
              <h4>Favorites</h4>
              <p>Save your favorite stories</p>
            </div>
          </div>
        </Card>

        <Card class="promo-mini-banner promo-mini-3">
          <div class="promo-mini-content">
            <i class="pi pi-bell promo-mini-icon" />
            <div>
              <h4>Notifications</h4>
              <p>New updates every day</p>
            </div>
          </div>
        </Card>
      </div>
    </div>

    <div v-animateonscroll="{ enterClass: 'fadeinup', threshold: 0.1 }">
      <Card class="banner-card" v-if="featuredStories.length > 0 && !loading">
        <Carousel 
          :value="featuredStories" 
          :numVisible="1" 
          :numScroll="1"
          :autoplayInterval="4000"
          :circular="true"
          :showIndicators="true"
          :showNavigators="true"
        >
          <template #item="slotProps">
            <div class="carousel-item">
              <img :src="slotProps.data.imageUrl" :alt="slotProps.data.title" class="carousel-image" />
              <div class="carousel-overlay">
                <div class="carousel-content">
                  <h2 class="carousel-title">{{ slotProps.data.title }}</h2>
                  <p class="carousel-author">Author: {{ slotProps.data.author }}</p>
                  <p class="carousel-description">{{ slotProps.data.description }}</p>
                  <div class="carousel-stats">
                    <span><i class="pi pi-eye" /> {{ formatNumber(slotProps.data.views) }}</span>
                    <span><i class="pi pi-heart" /> {{ formatNumber(slotProps.data.likes) }}</span>
                  </div>
                  <Button 
                    label="Read Now" 
                    icon="pi pi-book"
                    class="carousel-button"
                    @click="viewStory(slotProps.data.id)"
                  />
                </div>
              </div>
            </div>
          </template>
        </Carousel>
      </Card>
      
      <Card class="banner-card" v-if="loading">
        <div class="carousel-skeleton">
          <Skeleton width="100%" height="400px" />
        </div>
      </Card>
    </div>

    <div 
      class="stats-grid" 
      v-animateonscroll="{ enterClass: 'fadeinup', threshold: 0.1, delay: 100 }"
    >
      <Card 
        v-for="(stat, index) in statsList" 
        :key="index"
        class="stat-card"
        :class="`stat-card-${index + 1}`"
      >
        <template #content>
          <div v-if="!loading" class="stat-content">
            <div class="stat-icon">
              <i :class="stat.icon" />
            </div>
            <div class="stat-info">
              <h3 class="stat-value">{{ formatNumber(stat.value) }}</h3>
              <p class="stat-label">{{ stat.label }}</p>
            </div>
          </div>
          <div v-else class="stat-content">
            <Skeleton shape="circle" size="60px" />
            <div class="stat-info">
              <Skeleton width="80px" height="2.5rem" class="mb-2" />
              <Skeleton width="100px" height="1rem" />
            </div>
          </div>
        </template>
      </Card>
    </div>

    <div 
      class="dashboard-grid"
      v-animateonscroll="{ enterClass: 'fadeinup', threshold: 0.1, delay: 200 }"
    >
      <Card class="dashboard-card recent-card">
        <template #header>
          <div class="card-header-title">
            <i class="pi pi-clock" />
            <span>Recent Stories</span>
          </div>
        </template>
        <template #content>
          <div class="recent-list">
            <div 
              v-for="story in recentStories" 
              :key="story.id" 
              class="recent-item"
              v-animateonscroll="{ enterClass: 'fadeinright', threshold: 0.1 }"
            >
              <img :src="story.imageUrl" :alt="story.title" class="recent-image" />
              <div class="recent-info">
                <h4 class="recent-title">{{ story.title }}</h4>
                <p class="recent-meta">{{ story.author }} • {{ formatDate(story.createdAt) }}</p>
              </div>
              <Button 
                icon="pi pi-arrow-right" 
                text 
                rounded
                severity="secondary"
                @click="viewStory(story.id)"
              />
            </div>
            
            <template v-if="loading">
              <div v-for="n in 3" :key="`skeleton-${n}`" class="recent-item">
                <Skeleton width="60px" height="80px" />
                <div class="recent-info">
                  <Skeleton width="150px" height="1.2rem" class="mb-2" />
                  <Skeleton width="120px" height="0.85rem" />
                </div>
                <Skeleton shape="circle" size="2rem" />
              </div>
            </template>
            
            <div v-if="recentStories.length === 0 && !loading" class="empty-state">
              <i class="pi pi-inbox" />
              <p>No stories yet</p>
            </div>
          </div>
        </template>
      </Card>

      <Card class="dashboard-card popular-card">
        <template #header>
          <div class="card-header-title">
            <i class="pi pi-star" />
            <span>Popular</span>
          </div>
        </template>
        <template #content>
          <div class="popular-list">
            <div 
              v-for="(story, index) in popularStories" 
              :key="story.id" 
              class="popular-item"
              v-animateonscroll="{ enterClass: 'fadeinleft', threshold: 0.1 }"
            >
              <div class="popular-rank">{{ index + 1 }}</div>
              <img :src="story.imageUrl" :alt="story.title" class="popular-image" />
              <div class="popular-info">
                <h4 class="popular-title">{{ story.title }}</h4>
                <div class="popular-stats">
                  <span><i class="pi pi-eye" /> {{ formatNumber(story.views) }}</span>
                  <span><i class="pi pi-heart" /> {{ formatNumber(story.likes) }}</span>
                </div>
              </div>
            </div>
            
            <template v-if="loading">
              <div v-for="n in 5" :key="`popular-skeleton-${n}`" class="popular-item">
                <Skeleton shape="circle" size="40px" />
                <Skeleton width="50px" height="70px" />
                <div class="popular-info">
                  <Skeleton width="140px" height="1.2rem" class="mb-2" />
                  <div class="popular-stats">
                    <Skeleton width="60px" height="0.85rem" />
                    <Skeleton width="60px" height="0.85rem" />
                  </div>
                </div>
              </div>
            </template>
            
            <div v-if="popularStories.length === 0 && !loading" class="empty-state">
              <i class="pi pi-inbox" />
              <p>No stories yet</p>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <Card 
      class="dashboard-card all-stories-card"
      v-animateonscroll="{ enterClass: 'fadeinup', threshold: 0.1, delay: 300 }"
    >
      <template #header>
        <div class="card-header-title">
            <i class="pi pi-book" />
            <span>All Stories ({{ allStories.length }})</span>
        </div>
      </template>
      <template #content>
        <div v-if="loading" class="stories-grid">
          <div v-for="n in 12" :key="`skeleton-story-${n}`" class="story-card-skeleton">
            <Skeleton width="100%" height="280px" class="mb-3" />
            <Skeleton width="80%" height="1.5rem" class="mb-2" />
            <Skeleton width="60%" height="1rem" />
          </div>
        </div>
        <div v-else-if="allStories.length > 0" class="stories-grid">
          <div 
            v-for="story in (showAllStories ? allStories : allStories.slice(0, 12))" 
            :key="story.id" 
            class="story-card"
            @click="viewStory(story.id)"
          >
            <div class="story-card-image-wrapper">
              <img :src="story.imageUrl" :alt="story.title" class="story-card-image" />
              <div class="story-card-overlay">
                <div class="story-card-badge" v-if="story.isFeatured">
                  <i class="pi pi-star" />
                  <span>Featured</span>
                </div>
                <div class="story-card-category">{{ story.category || 'Uncategorized' }}</div>
              </div>
            </div>
            <div class="story-card-content">
              <h3 class="story-card-title">{{ story.title }}</h3>
              <p class="story-card-author">
                <i class="pi pi-user" />
                {{ story.author || 'Unknown author' }}
              </p>
              <p class="story-card-description">{{ story.description || 'No description' }}</p>
              <div class="story-card-footer">
                <div class="story-card-stats">
                  <span class="stat-item">
                    <i class="pi pi-eye" />
                    {{ formatNumber(story.views) }}
                  </span>
                  <span class="stat-item">
                    <i class="pi pi-heart" />
                    {{ formatNumber(story.likes) }}
                  </span>
                </div>
                <span class="story-card-date">{{ formatDate(story.createdAt) }}</span>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="empty-state">
          <i class="pi pi-inbox" />
          <p>No stories yet</p>
        </div>
        <div v-if="allStories.length > 12" class="show-more-container">
          <Button 
            :label="showAllStories ? 'Show Less' : `Show More (${allStories.length - 12})`"
            icon="pi pi-angle-down"
            :iconPos="showAllStories ? 'left' : 'right'"
            severity="secondary"
            outlined
            class="show-more-btn"
            @click="showAllStories = !showAllStories"
          />
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Carousel from 'primevue/carousel'
import Skeleton from 'primevue/skeleton'
import { userStoryService } from '@/api/user/storyService'
import { useTokenRefresh } from '@/composables/useTokenRefresh'
import { cookieUtils } from '@/utils/cookie'

const router = useRouter()
const { stopAutoRefresh } = useTokenRefresh()

const user = ref(null)
const loading = ref(true)
const stats = ref({
  totalStories: 0,
  totalViews: 0,
  totalLikes: 0,
  totalUsers: 0
})

const featuredStories = ref([])
const recentStories = ref([])
const popularStories = ref([])
const allStories = ref([])
const showAllStories = ref(false)

const statsList = computed(() => [
  { icon: 'pi pi-book', value: stats.value.totalStories, label: 'Stories' },
  { icon: 'pi pi-eye', value: stats.value.totalViews, label: 'Views' },
  { icon: 'pi pi-heart', value: stats.value.totalLikes, label: 'Likes' },
  { icon: 'pi pi-users', value: stats.value.totalUsers, label: 'Users' }
])

onMounted(() => {
  loadData()
})

const loadData = async () => {
  loading.value = true
  try {
    const statsData = await userStoryService.getStats()
    stats.value = statsData

    const featured = await userStoryService.getAll(true)
    featuredStories.value = featured.slice(0, 5)

    const allStoriesData = await userStoryService.getAll()
    recentStories.value = allStoriesData.slice(0, 5)

    const popular = await userStoryService.getPopular(5)
    popularStories.value = popular

    allStories.value = allStoriesData
  } catch (error) {
    alert('Failed to load data. Please try again.')
  } finally {
    loading.value = false
  }
}

const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`
  return date.toLocaleDateString('en-US')
}

const viewStory = (id) => {
}

const scrollToStories = () => {
  const storiesSection = document.querySelector('.all-stories-card')
  if (storiesSection) {
    storiesSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

</script>

<style scoped>
.dashboard {
  padding: 2rem;
  max-width: 1600px;
  margin: 0 auto;
  background: linear-gradient(to bottom, #F9F7F4 0%, #F4E4BC 100%);
  min-height: 100vh;
}


.promo-banners {
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.promo-banner {
  border-radius: 20px;
  overflow: hidden;
  border: none;
  background: linear-gradient(135deg, #8B6F47 0%, #5C4033 100%);
  box-shadow: 0 8px 24px rgba(92, 64, 51, 0.2);
}

:deep(.promo-banner .p-card-body) {
  padding: 0;
}

:deep(.promo-banner .p-card-content) {
  padding: 0;
}

.promo-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2.5rem 3rem;
  background: linear-gradient(135deg, rgba(139, 111, 71, 0.95) 0%, rgba(92, 64, 51, 0.95) 100%);
  position: relative;
  overflow: hidden;
}

.promo-content::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -10%;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(244, 228, 188, 0.2) 0%, transparent 70%);
  border-radius: 50%;
}

.promo-text {
  flex: 1;
  z-index: 1;
  position: relative;
}

.promo-title {
  font-size: 2rem;
  font-weight: 700;
  color: #F4E4BC;
  margin: 0 0 0.75rem 0;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.promo-description {
  font-size: 1.1rem;
  color: rgba(244, 228, 188, 0.9);
  margin: 0 0 1.5rem 0;
}

.promo-button {
  background: linear-gradient(135deg, #F4E4BC 0%, #E8D5B7 100%);
  border: none;
  color: #5C4033;
  font-weight: 600;
  padding: 0.75rem 2rem;
  border-radius: 12px;
  font-size: 1rem;
}

:deep(.promo-button:hover) {
  background: linear-gradient(135deg, #E8D5B7 0%, #F4E4BC 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.promo-icon {
  font-size: 6rem;
  color: rgba(244, 228, 188, 0.3);
  z-index: 0;
  position: relative;
  animation: floatIcon 3s ease-in-out infinite;
}

@keyframes floatIcon {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-10px) rotate(5deg);
  }
}

.promo-banners-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.promo-mini-banner {
  border-radius: 16px;
  border: 2px solid rgba(139, 111, 71, 0.2);
  transition: all 0.3s ease;
  cursor: pointer;
  overflow: hidden;
  background: white;
}

.promo-mini-banner:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(92, 64, 51, 0.2);
  border-color: #8B6F47;
}

:deep(.promo-mini-banner .p-card-body) {
  padding: 1.5rem;
}

:deep(.promo-mini-banner .p-card-content) {
  padding: 0;
}

.promo-mini-content {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.promo-mini-icon {
  font-size: 2.5rem;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  flex-shrink: 0;
}

.promo-mini-1 .promo-mini-icon {
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  color: #5C4033;
}

.promo-mini-2 .promo-mini-icon {
  background: linear-gradient(135deg, #FF6B6B 0%, #EE5A6F 100%);
  color: white;
}

.promo-mini-3 .promo-mini-icon {
  background: linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%);
  color: white;
}

.promo-mini-content h4 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #5C4033;
  margin: 0 0 0.25rem 0;
}

.promo-mini-content p {
  font-size: 0.9rem;
  color: #8B6F47;
  margin: 0;
}

.banner-card {
  margin-bottom: 2rem;
  border-radius: 16px;
  overflow: hidden;
  border: none;
  box-shadow: 0 8px 24px rgba(92, 64, 51, 0.15);
}

:deep(.banner-card .p-card-body) {
  padding: 0;
}

:deep(.banner-card .p-card-content) {
  padding: 0;
}

.carousel-skeleton {
  padding: 0;
}

.carousel-item {
  position: relative;
  height: 400px;
  overflow: hidden;
}

.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.carousel-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(92, 64, 51, 0.8));
  display: flex;
  align-items: center;
  padding: 3rem;
}

.carousel-content {
  max-width: 600px;
  color: white;
}

.carousel-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
}

.carousel-author {
  font-size: 1.2rem;
  margin-bottom: 1rem;
  opacity: 0.9;
}

.carousel-description {
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  opacity: 0.95;
}

.carousel-stats {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  font-size: 1rem;
}

.carousel-stats i {
  margin-right: 0.5rem;
}

.carousel-button {
  background: linear-gradient(135deg, #8B6F47 0%, #5C4033 100%);
  border: none;
  color: #F4E4BC;
  font-weight: 600;
  padding: 0.75rem 2rem;
  border-radius: 12px;
}

:deep(.carousel-button:hover) {
  background: linear-gradient(135deg, #5C4033 0%, #8B6F47 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  border-radius: 16px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: none;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 24px rgba(92, 64, 51, 0.2);
}

.stat-card-1 {
  background: linear-gradient(135deg, #8B6F47 0%, #A0826D 100%);
}

.stat-card-2 {
  background: linear-gradient(135deg, #5C4033 0%, #6B4F3F 100%);
}

.stat-card-3 {
  background: linear-gradient(135deg, #D4A574 0%, #C8966A 100%);
}

.stat-card-4 {
  background: linear-gradient(135deg, #8B6F47 0%, #7A5F3F 100%);
}

:deep(.stat-card .p-card-body) {
  padding: 1.5rem;
}

:deep(.stat-card .p-card-content) {
  padding: 0;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: #F4E4BC;
  flex-shrink: 0;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: #F4E4BC;
  margin: 0 0 0.25rem 0;
  line-height: 1;
}

.stat-label {
  font-size: 0.95rem;
  color: rgba(244, 228, 188, 0.9);
  margin: 0;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.dashboard-card {
  border-radius: 16px;
  border: 1px solid rgba(139, 111, 71, 0.2);
  box-shadow: 0 4px 6px rgba(92, 64, 51, 0.1);
}

:deep(.dashboard-card .p-card-header) {
  background: linear-gradient(135deg, #F4E4BC 0%, #E8D5B7 100%);
  padding: 1.25rem 1.5rem;
  border-bottom: 2px solid rgba(139, 111, 71, 0.1);
}

:deep(.dashboard-card .p-card-body) {
  padding: 0;
}

:deep(.dashboard-card .p-card-content) {
  padding: 1.5rem;
}

.card-header-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: #5C4033;
}

.card-header-title i {
  font-size: 1.25rem;
}

.recent-list,
.popular-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.recent-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #F9F7F4;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.recent-item:hover {
  background: #F4E4BC;
  transform: translateX(5px);
}

.recent-image {
  width: 60px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  flex-shrink: 0;
}

.recent-info {
  flex: 1;
}

.recent-title {
  font-size: 1rem;
  font-weight: 600;
  color: #5C4033;
  margin: 0 0 0.25rem 0;
}

.recent-meta {
  font-size: 0.85rem;
  color: #8B6F47;
  margin: 0;
}

.popular-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #F9F7F4;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.popular-item:hover {
  background: #F4E4BC;
  transform: translateX(5px);
}

.popular-rank {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8B6F47 0%, #5C4033 100%);
  color: #F4E4BC;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.popular-image {
  width: 50px;
  height: 70px;
  object-fit: cover;
  border-radius: 8px;
  flex-shrink: 0;
}

.popular-info {
  flex: 1;
}

.popular-title {
  font-size: 1rem;
  font-weight: 600;
  color: #5C4033;
  margin: 0 0 0.5rem 0;
}

.popular-stats {
  display: flex;
  gap: 1rem;
  font-size: 0.85rem;
  color: #8B6F47;
}

.popular-stats i {
  margin-right: 0.25rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #8B6F47;
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state p {
  margin: 0;
  font-size: 1rem;
}

@keyframes fadein {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeinup {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeinright {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeinleft {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.fadein {
  animation: fadein 0.6s ease forwards;
}

.fadeinup {
  animation: fadeinup 0.6s ease forwards;
}

.fadeinright {
  animation: fadeinright 0.6s ease forwards;
}

.fadeinleft {
  animation: fadeinleft 0.6s ease forwards;
}

:deep(.p-skeleton) {
  background: linear-gradient(90deg, #F4E4BC 25%, #E8D5B7 50%, #F4E4BC 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease-in-out infinite;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.mb-2 {
  margin-bottom: 0.5rem;
}

@media (max-width: 768px) {
  .dashboard {
    padding: 1rem;
  }
  
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .welcome-text {
    font-size: 1.5rem;
  }

  .promo-content {
    flex-direction: column;
    padding: 2rem 1.5rem;
    text-align: center;
  }

  .promo-icon {
    font-size: 4rem;
  }

  .promo-title {
    font-size: 1.5rem;
  }

  .promo-description {
    font-size: 1rem;
  }

  .promo-banners-grid {
    grid-template-columns: 1fr;
  }

  .carousel-item {
    height: 300px;
  }

  .carousel-overlay {
    padding: 2rem 1.5rem;
  }

  .carousel-title {
    font-size: 1.75rem;
  }

  .carousel-author {
    font-size: 1rem;
  }

  .carousel-description {
    font-size: 0.9rem;
  }
}

.all-stories-card {
  margin-top: 2rem;
}

.stories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
  padding: 1rem 0;
}

.story-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(92, 64, 51, 0.12);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  height: 100%;
  border: 2px solid transparent;
}

.story-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 12px 32px rgba(92, 64, 51, 0.25);
  border-color: #8B6F47;
}

.story-card-image-wrapper {
  position: relative;
  width: 100%;
  height: 320px;
  overflow: hidden;
  background: linear-gradient(135deg, #F4E4BC 0%, #E8D5B7 100%);
}

.story-card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.story-card:hover .story-card-image {
  transform: scale(1.1);
}

.story-card-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 100%);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1rem;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.story-card:hover .story-card-overlay {
  opacity: 1;
}

.story-card-badge {
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  color: #5C4033;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.story-card-badge i {
  font-size: 0.9rem;
}

.story-card-category {
  background: rgba(255, 255, 255, 0.95);
  color: #5C4033;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.story-card-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 0.75rem;
}

.story-card-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #5C4033;
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.story-card-author {
  font-size: 0.9rem;
  color: #8B6F47;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
}

.story-card-author i {
  font-size: 0.85rem;
}

.story-card-description {
  font-size: 0.9rem;
  color: #6B5B4F;
  line-height: 1.6;
  margin: 0;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.story-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(139, 111, 71, 0.1);
  margin-top: auto;
}

.story-card-stats {
  display: flex;
  gap: 1rem;
}

.stat-item {
  font-size: 0.85rem;
  color: #8B6F47;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-weight: 500;
}

.stat-item i {
  font-size: 0.8rem;
}

.story-card-date {
  font-size: 0.8rem;
  color: #A0826D;
  font-weight: 500;
}

.story-card-skeleton {
  background: white;
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 4px 16px rgba(92, 64, 51, 0.12);
}

.show-more-container {
  display: flex;
  justify-content: center;
  padding-top: 2rem;
  margin-top: 1rem;
}

.show-more-btn {
  min-width: 200px;
  height: 3rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 12px;
}

:deep(.show-more-btn) {
  border: 2px solid #8B6F47;
  color: #8B6F47;
}

:deep(.show-more-btn:hover) {
  background: rgba(139, 111, 71, 0.1);
  border-color: #5C4033;
  color: #5C4033;
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .carousel-item {
    height: 250px;
  }

  .stories-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .story-card-image-wrapper {
    height: 240px;
  }
}

@media (max-width: 768px) {
  .stories-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 1.5rem;
  }
}

@media (min-width: 1400px) {
  .stories-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
}
</style>
