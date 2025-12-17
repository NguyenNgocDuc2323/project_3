<template>
  <footer class="footer">
    <div class="container">
      <div class="left">
        <div class="title">My Project</div>
        <div class="sub">Base layout: Header + Footer tự động cho mọi page</div>
      </div>

      <div class="right">
        <span>© {{ year }} My Project</span>
      </div>
    </div>
  </footer>
</template>

<script setup>
const year = new Date().getFullYear()
</script>

<style scoped>
.footer {
  background: #ffffff;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.title {
  font-weight: 800;
  color: #2c3e50;
}

.sub {
  margin-top: 0.25rem;
  font-size: 0.9rem;
  color: #64748b;
}

.right {
  font-size: 0.9rem;
  color: #64748b;
}

@media (max-width: 720px) {
  .container {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>


