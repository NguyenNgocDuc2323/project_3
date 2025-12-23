<template>
  <div class="admin-dashboard">
    <div class="dashboard-header">
      <h1>Admin Dashboard</h1>
      <p>Manage your platform</p>
    </div>

    <Card class="stories-carousel-card" v-if="featuredStories.length > 0">
      <template #header>
        <div class="carousel-header">
          <h3>Featured Stories</h3>
        </div>
      </template>
      <template #content>
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
            <div class="story-carousel-item" @click="navigateToStoryEdit(slotProps.data.id)">
              <div class="story-carousel-image-wrapper">
                <img :src="slotProps.data.imageUrl" :alt="slotProps.data.title" class="story-carousel-image" />
                <div class="story-carousel-overlay">
                  <Tag v-if="slotProps.data.isFeatured" value="Featured" severity="success" />
                </div>
              </div>
              <div class="story-carousel-content">
                <h4 class="story-carousel-title">{{ slotProps.data.title }}</h4>
                <p class="story-carousel-author">{{ slotProps.data.author }}</p>
                <div class="story-carousel-stats">
                  <span><i class="pi pi-eye" /> {{ formatNumber(slotProps.data.views) }}</span>
                  <span><i class="pi pi-heart" /> {{ formatNumber(slotProps.data.likes) }}</span>
                </div>
              </div>
            </div>
          </template>
        </Carousel>
      </template>
    </Card>

    <div class="charts-grid">
      <Card class="chart-card">
        <template #header>
          <div class="chart-header">
            <h3>Views & Likes (Last 7 Days)</h3>
          </div>
        </template>
        <template #content>
          <Line :data="viewsLikesChartData" :options="chartOptions" />
        </template>
      </Card>

      <Card class="chart-card">
        <template #header>
          <div class="chart-header">
            <h3>Stories by Category</h3>
          </div>
        </template>
        <template #content>
          <Bar :data="categoryChartData" :options="chartOptions" />
        </template>
      </Card>

      <Card class="chart-card">
        <template #header>
          <div class="chart-header">
            <h3>User Distribution</h3>
          </div>
        </template>
        <template #content>
          <Pie :data="userDistributionData" :options="pieChartOptions" />
        </template>
      </Card>

      <Card class="chart-card">
        <template #header>
          <div class="chart-header">
            <h3>Revenue (Last 30 Days)</h3>
          </div>
        </template>
        <template #content>
          <Line :data="revenueChartData" :options="revenueChartOptions" />
        </template>
      </Card>
    </div>

    <div class="management-grid">
      <Card class="management-card" @click="navigateToStories">
        <template #content>
          <div class="management-content">
            <div class="management-icon">
              <i class="pi pi-book" />
            </div>
            <h3>Manage Stories</h3>
            <p>View, edit, and delete stories</p>
            <Button label="Go to Stories" icon="pi pi-arrow-right" class="management-btn" />
          </div>
        </template>
      </Card>

      <Card class="management-card" @click="navigateToUsers">
        <template #content>
          <div class="management-content">
            <div class="management-icon">
              <i class="pi pi-users" />
            </div>
            <h3>Manage Users</h3>
            <p>View and manage user accounts</p>
            <Button label="Go to Users" icon="pi pi-arrow-right" class="management-btn" />
          </div>
        </template>
      </Card>

      <Card class="management-card" @click="navigateToAddStory">
        <template #content>
          <div class="management-content">
            <div class="management-icon">
              <i class="pi pi-plus-circle" />
            </div>
            <h3>Add New Story</h3>
            <p>Create a new story</p>
            <Button label="Add Story" icon="pi pi-arrow-right" class="management-btn" />
          </div>
        </template>
      </Card>

      <Card class="management-card" @click="navigateToCategories">
        <template #content>
          <div class="management-content">
            <div class="management-icon">
              <i class="pi pi-tags" />
            </div>
            <h3>Manage Categories</h3>
            <p>Manage story categories</p>
            <Button label="Go to Categories" icon="pi pi-arrow-right" class="management-btn" />
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Carousel from 'primevue/carousel'
import Tag from 'primevue/tag'
import { Line, Bar, Pie } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { adminStoryService } from '@/api/admin/storyService'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const router = useRouter()

const stats = ref({
  totalStories: 0,
  totalUsers: 0,
  totalViews: 0,
  totalLikes: 0
})

const featuredStories = ref([])
const loading = ref(true)

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

onMounted(() => {
  loadStats()
  loadFeaturedStories()
  generateFakeChartData()
})

const loadStats = async () => {
  try {
    const data = await adminStoryService.getStats()
    stats.value = data
  } catch (error) {
    console.error('Failed to load stats:', error)
  }
}

const loadFeaturedStories = async () => {
  loading.value = true
  try {
    const stories = await adminStoryService.getAll()
    featuredStories.value = stories.filter(s => s.isFeatured).slice(0, 6)
    if (featuredStories.value.length === 0) {
      featuredStories.value = stories.slice(0, 6)
    }
  } catch (error) {
    console.error('Failed to load featured stories:', error)
  } finally {
    loading.value = false
  }
}

const formatNumber = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

const generateFakeChartData = () => {
  const last7Days = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    last7Days.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
  }

  viewsLikesChartData.value = {
    labels: last7Days,
    datasets: [
      {
        label: 'Views',
        data: [1200, 1900, 3000, 2500, 2800, 3200, 3500],
        fill: false,
        borderColor: '#8B6F47',
        tension: 0.4
      },
      {
        label: 'Likes',
        data: [80, 120, 150, 130, 140, 180, 200],
        fill: false,
        borderColor: '#dc3545',
        tension: 0.4
      }
    ]
  }

  categoryChartData.value = {
    labels: ['Adventure', 'Mystery', 'Romance', 'Fantasy', 'Sci-Fi', 'Drama'],
    datasets: [
      {
        label: 'Stories',
        data: [5, 4, 6, 3, 4, 2],
        backgroundColor: [
          '#8B6F47',
          '#5C4033',
          '#D4A574',
          '#A0826D',
          '#7A5F3F',
          '#6B4F3F'
        ]
      }
    ]
  }

  userDistributionData.value = {
    labels: ['Admin', 'Users'],
    datasets: [
      {
        data: [2, 48],
        backgroundColor: ['#dc3545', '#8B6F47']
      }
    ]
  }

  const last30Days = []
  const revenueData = []
  for (let i = 29; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    if (i % 5 === 0) {
      last30Days.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
    } else {
      last30Days.push('')
    }
    revenueData.push(Math.floor(Math.random() * 500) + 200)
  }

  revenueChartData.value = {
    labels: last30Days,
    datasets: [
      {
        label: 'Revenue ($)',
        data: revenueData,
        fill: true,
        borderColor: '#28a745',
        backgroundColor: 'rgba(40, 167, 69, 0.1)',
        tension: 0.4
      }
    ]
  }
}

const viewsLikesChartData = ref({})
const categoryChartData = ref({})
const userDistributionData = ref({})
const revenueChartData = ref({})

const chartOptions = computed(() => {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          usePointStyle: true
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }
})

const pieChartOptions = computed(() => {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true
        }
      }
    }
  }
})

const revenueChartOptions = computed(() => {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '$' + value
          }
        }
      }
    }
  }
})

const navigateToStories = () => {
  router.push('/admin/stories/list')
}

const navigateToUsers = () => {
  router.push('/admin/users/list')
}

const navigateToAddStory = () => {
  router.push('/admin/stories/create')
}

const navigateToCategories = () => {
  router.push('/admin/categories/list')
}

const navigateToStoryEdit = (id) => {
  router.push(`/admin/stories/edit/${id}`)
}
</script>

<style scoped>
.admin-dashboard {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  min-height: calc(100vh - 200px);
}

.dashboard-header {
  margin-bottom: 2rem;
}

.dashboard-header h1 {
  font-size: 2rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
}

.dashboard-header p {
  color: #666;
  font-size: 1rem;
}


.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.chart-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

:deep(.chart-card .p-card-header) {
  padding: 1.5rem 1.5rem 0.5rem;
  border-bottom: 1px solid #e0e0e0;
}

:deep(.chart-card .p-card-body) {
  padding: 0;
}

:deep(.chart-card .p-card-content) {
  padding: 1.5rem;
  height: 350px;
}

.chart-header h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.stories-carousel-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 2rem;
}

:deep(.stories-carousel-card .p-card-header) {
  padding: 1.5rem 1.5rem 0.5rem;
  border-bottom: 1px solid #e0e0e0;
}

:deep(.stories-carousel-card .p-card-body) {
  padding: 0;
}

:deep(.stories-carousel-card .p-card-content) {
  padding: 1.5rem;
}

.carousel-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.story-carousel-item {
  padding: 0.5rem;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.story-carousel-item:hover {
  transform: translateY(-5px);
}

.story-carousel-image-wrapper {
  position: relative;
  width: 100%;
  height: 200px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 1rem;
  background: #f5f5f5;
}

.story-carousel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.story-carousel-item:hover .story-carousel-image {
  transform: scale(1.1);
}

.story-carousel-overlay {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
}

.story-carousel-content {
  text-align: center;
}

.story-carousel-title {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 0.5rem 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.story-carousel-author {
  font-size: 0.85rem;
  color: #666;
  margin: 0 0 0.75rem 0;
}

.story-carousel-stats {
  display: flex;
  justify-content: center;
  gap: 1rem;
  font-size: 0.85rem;
  color: #8B6F47;
}

.story-carousel-stats i {
  margin-right: 0.25rem;
}

.management-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.management-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.management-card:hover {
  border-color: #8B6F47;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

:deep(.management-card .p-card-body) {
  padding: 1.5rem;
}

:deep(.management-card .p-card-content) {
  padding: 0;
}

.management-content {
  text-align: center;
}

.management-icon {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: #8B6F47;
  margin: 0 auto 1rem;
}

.management-content h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 0.5rem 0;
}

.management-content p {
  font-size: 0.9rem;
  color: #666;
  margin: 0 0 1rem 0;
}

.management-btn {
  width: 100%;
}

@media (max-width: 768px) {
  .admin-dashboard {
    padding: 1rem;
  }

  .charts-grid {
    grid-template-columns: 1fr;
  }

  :deep(.chart-card .p-card-content) {
    height: 300px;
  }

  .management-grid {
    grid-template-columns: 1fr;
  }
}
</style>
