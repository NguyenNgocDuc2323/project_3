<template>
  <div class="home">
    <h1>Welcome to Home Page</h1>
    <p>This is the home page of your Vue 3 application.</p>
    
    <div class="api-section">
      <h2>API Test</h2>
      <button @click="loadData" :disabled="loading">Load Data</button>
      <button @click="createData" :disabled="loading">Create Data</button>
      
      <div v-if="loading" class="loading">Loading...</div>
      <div v-if="error" class="error">{{ error }}</div>
      
      <div v-if="examples.length > 0" class="data-list">
        <h3>Examples ({{ examples.length }})</h3>
        <div v-for="example in examples" :key="example.id" class="example-item">
          <strong>{{ example.name }}</strong>
          <p>{{ example.description || 'No description' }}</p>
          <small>Created: {{ new Date(example.createdAt).toLocaleString() }}</small>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import exampleService from '@/api/services/exampleService'

const examples = ref([])
const loading = ref(false)
const error = ref('')

const loadData = async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await exampleService.getAll()
    examples.value = response.data
  } catch (err) {
    error.value = err.response?.data?.message || err.message || 'Error loading data'
    console.error('Error:', err)
  } finally {
    loading.value = false
  }
}

const createData = async () => {
  loading.value = true
  error.value = ''
  try {
    const newExample = {
      name: `Example ${Date.now()}`,
      description: 'Created from frontend'
    }
    await exampleService.create(newExample)
    await loadData()
  } catch (err) {
    error.value = err.response?.data?.message || err.message || 'Error creating data'
    console.error('Error:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.home {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.home h1 {
  color: #2c3e50;
  margin-bottom: 1rem;
  text-align: center;
}

.home > p {
  color: #7f8c8d;
  font-size: 1.1rem;
  text-align: center;
  margin-bottom: 2rem;
}

.api-section {
  margin-top: 2rem;
  padding: 1.5rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.api-section h2 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.api-section button {
  background: #42b983;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  margin-right: 0.5rem;
  margin-bottom: 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.api-section button:hover:not(:disabled) {
  background: #35a372;
}

.api-section button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.loading {
  color: #42b983;
  font-weight: bold;
  margin: 1rem 0;
}

.error {
  color: #e74c3c;
  background: #ffeaea;
  padding: 0.5rem;
  border-radius: 4px;
  margin: 1rem 0;
}

.data-list {
  margin-top: 1.5rem;
}

.data-list h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.example-item {
  padding: 1rem;
  margin-bottom: 1rem;
  background: #f8f9fa;
  border-left: 4px solid #42b983;
  border-radius: 4px;
}

.example-item strong {
  color: #2c3e50;
  display: block;
  margin-bottom: 0.5rem;
}

.example-item p {
  color: #7f8c8d;
  margin-bottom: 0.5rem;
}

.example-item small {
  color: #95a5a6;
  font-size: 0.85rem;
}
</style>

