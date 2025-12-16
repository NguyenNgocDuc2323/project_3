<template>
  <div class="hello-world">
    <h2>{{ title }}</h2>
    <p>{{ message }}</p>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  props: {
    title: {
      type: String,
      default: 'Hello World'
    },
    message: {
      type: String,
      default: 'This is a sample component'
    }
  }
}
</script>

<style scoped>
.hello-world {
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin: 1rem 0;
}

.hello-world h2 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
}
</style>

