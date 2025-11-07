<script lang="ts">
  let { title, description = undefined, value, unidad = undefined } = $props();
</script>

<div class="card-container">
  <div class="card">
    <div class="card-header">
      <div class="card-title"><strong>{title}</strong></div>
      {#if description}
        <div class="card-description">{description}</div>
      {/if}
    </div>

    <div class="card-body">
      <div class="card-value">
        {value}
        {#if unidad}
          <span class="card-unit">{unidad}</span>
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  .card-container {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 20px;
    margin-top: 20px;
    width: 100%;
  }

  .card {
    background-color: #ffffff;
    border-radius: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    padding: 24px;
    text-align: left;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    transition: all 0.25s ease;
    width: 70%;
    max-width: 300px;
    min-width: 200px;
  }

  .card:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  }

  .card-title {
    font-size: 1em;
    color: #1e293b;
    text-transform: uppercase;
    font-weight: 600;
    margin-bottom: 8px;
  }

  .card-description {
    color: #64748b;
    font-size: 0.9em;
    margin-bottom: 12px;
  }

  .card-value {
    font-size: 2rem;
    font-weight: 700;
    color: #0f172a;
  }

  /* --------- Responsive Design --------- */

  @media (max-width: 1024px) {
    .card {
      flex: 1 1 45%;
      max-width: none;
    }
  }

  @media (max-width: 600px) {
    .card {
      width: 100%;
      max-width: 90%;
      text-align: center;
    }

    .card-value {
      font-size: 1.6rem;
    }
  }
</style>
