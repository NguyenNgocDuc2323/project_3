<template>
  <div class="announcement-bar">
    <div class="announcement-content">
      <div class="announcement-track" :style="{ animationDuration: `${duration}s` }">
        <div 
          v-for="(item, index) in duplicatedItems" 
          :key="`item-${index}`"
          class="announcement-item"
        >
          <i :class="item.icon" class="announcement-icon"></i>
          <span class="announcement-text">{{ item.text }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  items: {
    type: Array,
    default: () => [
      { text: '🌟 Discover amazing stories from talented authors', icon: 'pi pi-book' },
      { text: '✨ New stories added every week', icon: 'pi pi-star' },
      { text: '📚 Join thousands of readers worldwide', icon: 'pi pi-users' },
      { text: '🔥 Featured stories trending now', icon: 'pi pi-fire' }
    ]
  },
  speed: {
    type: Number,
    default: 50
  }
})

const duplicatedItems = computed(() => {
  // Duplicate items để tạo infinite scroll effect
  return [...props.items, ...props.items, ...props.items]
})

const duration = computed(() => {
  // Tính toán duration dựa trên số lượng items và speed
  const itemWidth = 300 // estimated width per item
  const totalWidth = duplicatedItems.value.length * itemWidth
  return totalWidth / props.speed
})
</script>

<style scoped>
.announcement-bar {
  background: linear-gradient(135deg, rgba(139, 111, 71, 0.95) 0%, rgba(92, 64, 51, 0.95) 100%);
  border-bottom: 2px solid rgba(244, 228, 188, 0.2);
  border-top: 1px solid rgba(244, 228, 188, 0.1);
  overflow: hidden;
  position: relative;
  padding: 0.75rem 0;
  z-index: 999;
}

.announcement-bar::before,
.announcement-bar::after {
  content: '';
  position: absolute;
  top: 0;
  width: 100px;
  height: 100%;
  z-index: 2;
  pointer-events: none;
}

.announcement-bar::before {
  left: 0;
  background: linear-gradient(to right, rgba(139, 111, 71, 0.95), transparent);
}

.announcement-bar::after {
  right: 0;
  background: linear-gradient(to left, rgba(139, 111, 71, 0.95), transparent);
}

.announcement-content {
  overflow: hidden;
  width: 100%;
  position: relative;
}

.announcement-track {
  display: flex;
  gap: 4rem;
  animation: scroll infinite linear;
  will-change: transform;
  white-space: nowrap;
}

@keyframes scroll {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-33.333%);
  }
}

.announcement-item {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1.5rem;
  background: rgba(244, 228, 188, 0.1);
  border-radius: 20px;
  border: 1px solid rgba(244, 228, 188, 0.2);
  flex-shrink: 0;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.announcement-item:hover {
  background: rgba(244, 228, 188, 0.15);
  border-color: rgba(244, 228, 188, 0.3);
  transform: scale(1.05);
}

.announcement-icon {
  font-size: 1rem;
  color: #F4E4BC;
  animation: iconPulse 2s ease-in-out infinite;
}

@keyframes iconPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}

.announcement-text {
  color: #F4E4BC;
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: 0.3px;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

@media (max-width: 768px) {
  .announcement-bar {
    padding: 0.5rem 0;
  }
  
  .announcement-track {
    gap: 2rem;
  }
  
  .announcement-item {
    padding: 0.4rem 1rem;
    gap: 0.5rem;
  }
  
  .announcement-text {
    font-size: 0.8rem;
  }
  
  .announcement-icon {
    font-size: 0.9rem;
  }
}
</style>

