import { defineStore } from 'pinia'
import exampleService from '../api/services/exampleService'

export const useExampleStore = defineStore('example', {
  state: () => ({
    items: [],
    loading: false,
    error: null
  }),
  
  getters: {
    itemCount: (state) => state.items.length
  },
  
  actions: {
    async fetchItems() {
      this.loading = true
      this.error = null
      try {
        this.items = await exampleService.getData()
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },
    
    async addItem(item) {
      try {
        const newItem = await exampleService.createData(item)
        this.items.push(newItem)
      } catch (error) {
        this.error = error.message
        throw error
      }
    }
  }
})

