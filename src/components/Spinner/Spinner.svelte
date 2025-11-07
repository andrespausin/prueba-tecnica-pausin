<script lang="ts">
  let size = 48;
  let color = "#2563eb";
  const message = "Cargando...";
</script>

<div class="spinner-container">
  <svg
    width={size}
    height={size}
    viewBox="0 0 50 50"
    class="spinner"
    aria-label="Cargando"
  >
    <circle
      class="path"
      cx="25"
      cy="25"
      r="20"
      fill="none"
      stroke={color}
      stroke-width="5"
    />
  </svg>

  <p class="spinner-text"><strong>{message}</strong></p>
</div>

<style>
  .spinner-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-top: 20%;
    gap: 0.5rem;
  }

  .spinner {
    animation: rotate 1s linear infinite;
  }

  .spinner-text {
    font-size: 15;
    margin: auto;
    font-family: sans-serif;
  }

  .path {
    stroke-linecap: round;
    animation: dash 1.5s ease-in-out infinite;
  }

  @keyframes rotate {
    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes dash {
    0% {
      stroke-dasharray: 1, 150;
      stroke-dashoffset: 0;
    }
    50% {
      stroke-dasharray: 90, 150;
      stroke-dashoffset: -35;
    }
    100% {
      stroke-dasharray: 90, 150;
      stroke-dashoffset: -124;
    }
  }

  .spinner-text {
    font-size: 0.9rem;
    color: #333;
  }
</style>
