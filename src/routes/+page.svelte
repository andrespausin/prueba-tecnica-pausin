<script lang="ts">
  import { type ObjectData, type GraphicData } from "../lib/models/typesOfData";
  import { parseToJSON } from "$lib/services/parser/parserToJSON";
  import { onMount, onDestroy } from "svelte";
  import { calculateInitialIndex } from "$lib/utils/intialIndex";
  import { tick } from "svelte";

  // IMPORT COMPONENTS
  import LineChart from "../components/Chart/LineChart.svelte";
  import Card from "../components/Card/Card.svelte";
  import Spinner from "../components/Spinner/Spinner.svelte";

  const FILE_PATH = "/data.yml";
  const segundosEnHoras = 0.00139;

  // Estados base.
  let temperatureData = $state<ObjectData[]>([]);
  let powerData = $state<ObjectData[]>([]);

  // Fecha actual e indice tanto de la temperatura como de la energia
  let currentTime = $state(new Date());
  // svelte-ignore state_referenced_locally
  const initialTime = currentTime;
  let temperatureIndex = $state(0);
  let powerIndex = $state(0);

  // Estados de tipo derived, que permiten reflejar los valores actuales en funcion del tiempo
  let currentTemperatureValue = $derived(temperatureData[temperatureIndex]);
  let mediaTemperatureGeneral = $state(0);
  let currentPowerValue = $derived(powerData[powerIndex]);

  // Estado que maneja valores de la gráfica de temperatura
  let graphicTemperatureValues = $state<GraphicData[]>([]);

  // Variables auxiliares para el valor promedio de la temperatura en un minuto desde que empieza y un acumulador
  let temperatureCounter = $state(0);
  let mediaTemperatureValue = $state(0);

  // Variable que almacena la energia acumulado en kWh
  let accumulatedEnergy = $state(0);
  let graphicEnergyValues = $state<GraphicData[]>([]);

  // Estado de carga y error respectivamente, para el manejo adecuado en la interfaz y un contador para saber que ha pasado 1 minuto
  let loading = $state(true);
  let error: string | null = $state(null);

  // Variable de intervalo de tipo número, usado más adelante para actualizar la hora cada segundo
  let interval: number;

  // Temperatura media general
  const mediaGeneralTemperature = (array: GraphicData[]) => {
    let acumulado = 0;
    array.forEach((item) => {
      acumulado += item.value;
    });
    acumulado = parseFloat((acumulado / array.length).toFixed(2));
    return acumulado;
  };

  // Función que carga los datos y calcula los índices iniciales
  const loadData = async () => {
    try {
      const res = await parseToJSON(FILE_PATH);

      temperatureData = res.temperatureData;
      powerData = res.powerData;

      // Esperar un tick para que Svelte reactive el estado antes de calcular el índice
      await tick();

      // Calcular índice inicial solo una vez
      if (temperatureData.length > 0) {
        temperatureIndex = calculateInitialIndex(currentTime, temperatureData);
      }

      if (powerData.length > 0)
        powerIndex = calculateInitialIndex(currentTime, powerData);

      // Toma el valor inicial al momento de cargar los datos
      graphicTemperatureValues.push({
        time: initialTime,
        value: temperatureData[temperatureIndex].value,
      });

      // Valor inicial de la energía acumulada
      accumulatedEnergy = Number(
        (powerData[powerIndex].value * segundosEnHoras).toFixed(2),
      );

      // Agregar el primer valor de la grafica a penas cargue la pagina
      graphicEnergyValues.push({
        time: initialTime,
        value: accumulatedEnergy,
      });
      // Manejo de estado cargando, para modificar la interfaz de que se leyó la Data correctamente
      loading = false;
    } catch (err: any) {
      error = err.message;
      loading = false;
    }
  };

  onMount(() => {
    loadData();

    // Actualizar la hora actual en cada segundo transcurrido
    interval = window.setInterval(() => {
      const now = new Date();
      currentTime = now;

      // Cuando los segundos sean divisibles por 5, entonces se aumenta el índice en 1 para actualizar los datos
      if (now.getSeconds() % 5 == 0) {
        if (temperatureData.length > 0)
          temperatureIndex = (temperatureIndex + 1) % temperatureData.length;
        if (powerData.length > 0)
          powerIndex = (powerIndex + 1) % powerData.length;

        // Acumular el valor de la temperatura para la media y aumentar el contador
        mediaTemperatureValue += temperatureData[temperatureIndex].value;
        temperatureCounter += 1;

        accumulatedEnergy = Number(
          (
            accumulatedEnergy +
            powerData[powerIndex].value * segundosEnHoras
          ).toFixed(2),
        );

        // Agregar la energia al array de valores
        graphicEnergyValues.push({
          time: now,
          value: accumulatedEnergy,
        });
      }

      // Cuando se alcanza el minuto, se calcula el promedio de temperatura en grados celsius y se reinician el contador y el promedio acumulado de la temperatura para cada punto
      if (temperatureCounter === 12) {
        const avg = Number(
          (mediaTemperatureValue / temperatureCounter).toFixed(2),
        );
        graphicTemperatureValues.push({
          time: now,
          value: avg,
        });
        mediaTemperatureGeneral = mediaGeneralTemperature(
          graphicTemperatureValues,
        );
        temperatureCounter = 0;
        mediaTemperatureValue = 0;
      }
    }, 1000);
  });

  // Reiniciamos el contador de clearInterval
  onDestroy(() => clearInterval(interval));
</script>

{#if loading}
  <Spinner />
{:else if error}
  <p>{error}</p>
{:else}
  <div class="main-container">
    <div class="header-container">
      <h1>Dashboard de Monitoreo de Energía y Temperatura</h1>
      <p class="project-description">
        Prueba Técnica – Svelte 5 - Desplegada en Vercel <br />Este dashboard
        consume datos simulados de un archivo YML para visualizar métricas clave
        de un sistema IoT: potencia instantánea, energía acumulada y
        temperatura. Los datos se actualizan dinámicamente cada 5 segundos.
      </p>
      <div class="project-links">
        <a
          href="https://github.com/andrespausin/prueba-tecnica-pausin"
          target="_blank"
          class="link-button"
        >
          Ver Código Fuente
        </a>
        <a
          href="https://www.linkedin.com/in/c%C3%A9sar-andr%C3%A9s-pausin-508b3a261"
          target="_blank"
          class="link-button"
        >
          Mi Perfil en LinkedIn
        </a>
      </div>
    </div>
    <div class="current-time">
      Hora actual:
      {currentTime.getHours() < 10
        ? `0${currentTime.getHours()}`
        : currentTime.getHours()}:{currentTime.getMinutes() < 10
        ? `0${currentTime.getMinutes()}`
        : currentTime.getMinutes()}:{currentTime.getSeconds() < 10
        ? `0${currentTime.getSeconds()}`
        : currentTime.getSeconds()}
    </div>
    <div class="divided-by-two">
      <!-- TEMPERATURA -->
      <div class="data-container">
        <div class="title"><h1>TEMPERATURA</h1></div>
        <div class="chart-section">
          <div class="chart-title"><strong>Temperatura media</strong></div>
          <div class="chart-description">
            Media de la temperatura (°C) calculada en intervalos minutales a
            partir de lecturas en tiempo real
          </div>
          <LineChart
            data={graphicTemperatureValues.slice(-12)}
            {initialTime}
            xDescription="Tiempo (HH:MM:SS)"
            yDescription="Temperatura (°C)"
          />
        </div>

        <div class="info-section">
          <Card
            title="Último registro de tiempo"
            description="Tiempo del último valor recibido"
            value={currentTemperatureValue.time}
          />
          <Card
            title="Temperatura actual"
            description="Valor real en °C"
            value={currentTemperatureValue.value}
            unidad="°C"
          />
          <Card
            title="Temperatura media general"
            description="Media general en °C"
            value={mediaTemperatureGeneral}
            unidad="°C"
          />
        </div>
      </div>
      <!-- ENERGIA -->
      <!-- <div class="title"><h1>ENERGÍA</h1></div> -->
      <div class="data-container">
        <div class="title"><h1>ENERGÍA</h1></div>
        <div class="info-section mt-10">
          <Card
            title="Último registro de tiempo"
            description="Tiempo del último valor recibido"
            value={currentPowerValue.time}
          />
          <Card
            title="Potencia instantánea"
            description="Valor real en kW de la potencia en el último registro de tiempo"
            value={currentPowerValue.value}
            unidad="kW"
          />
          <Card
            title="Energía acumulada"
            description="Energía producida en kWh"
            value={accumulatedEnergy}
            unidad="kWh"
          />
        </div>
        <div class="chart-section">
          <div class="chart-title"><strong>Energía producida</strong></div>
          <div class="chart-description">
            Energía producida en (kWh) basada en los valores actualizados cada 5
            segundos
          </div>
          <LineChart
            data={graphicEnergyValues.slice(-12)}
            {initialTime}
            xDescription="Tiempo (HH:MM:SS)"
            yDescription="Energía (kWh)"
          />
        </div>
      </div>
    </div>
    <footer class="main-footer">
      <p>Desarrollado y diseñado por César Pausin</p>
      <p class="stack-text">
        Stack principal: Svelte 5 (Runes), TypeScript, Vercel
      </p>
      <p class="license-text">© 2025 | Todos los derechos reservados</p>
    </footer>
  </div>
{/if}

<style>
  .main-container {
    width: 98vw;
    min-height: 100vh;
    display: flex;
    overflow-x: hidden;
    overflow-y: auto;
    padding-bottom: 40px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    background: #f8fafc;
    font-family: "Inter", system-ui, sans-serif;
    box-sizing: border-box;
  }

  .header-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    margin-top: 50px;
    margin-bottom: 30px;
    max-width: 900px;
    padding: 0 20px;
  }

  .header-container h1 {
    font-size: 2.8rem;
    font-weight: 900;
    color: #1e293b;
    margin-bottom: 10px;
    line-height: 1.2;
    letter-spacing: -0.5px;
  }

  .project-description {
    font-size: 1rem;
    color: #64748b;
    margin-bottom: 25px;
    line-height: 1.6;
    max-width: 700px;
  }

  .project-links {
    display: flex;
    gap: 15px;
    margin-top: 10px;
    margin-bottom: 10px;
  }

  .link-button {
    background-color: #3b82f6;
    color: white;
    padding: 10px 20px;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 600;
    font-size: 0.95rem;
    transition:
      background-color 0.3s ease,
      transform 0.2s ease;
    border: none;
  }

  .link-button:hover {
    background-color: #2563eb;
    transform: translateY(-1px);
    box-shadow: 0 4px 10px rgba(59, 130, 246, 0.3);
  }

  .current-time {
    font-size: 3.8rem;
    font-weight: 800;
    text-align: center;
    color: #0f172a;
    margin-bottom: 60px;
    letter-spacing: -2px;
    font-family: "Inter", system-ui, sans-serif;
  }

  .divided-by-two {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: flex-start;
    gap: 3vw;
    width: 95%;
    max-width: 1400px;
  }

  .title {
    margin-top: -30px;
  }

  .title h1 {
    font-size: 1.6rem;
    font-weight: 900;
    color: #1c2e4b;
    padding-bottom: 5px;
    margin-bottom: 25px;
    display: inline-block;
  }

  .mt-10 {
    margin-top: 0;
  }

  .data-container {
    width: 60%;
    display: flex;
    flex-direction: column;
    gap: 30px;
  }

  .chart-section {
    background: #ffffff;
    border-radius: 12px;
    padding: 25px;
    box-shadow: 0 6px 20px rgba(15, 23, 42, 0.05);
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    transition: all 0.3s ease;
    border: 1px solid #e2e8f0;
  }

  .chart-section:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  }

  .chart-title {
    font-size: 1.1rem;
    font-weight: 700;
    margin-bottom: 5px;
    color: #1e293b;
  }

  .chart-description {
    font-size: 0.9rem;
    color: #64748b;
    margin-bottom: 15px;
  }

  .info-section {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5vw;
  }

  .info-section :global(.card) {
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.04);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 20px;
    transition:
      transform 0.25s ease,
      box-shadow 0.25s ease;
    border: 1px solid #e2e8f0;
  }

  .info-section :global(.card:hover) {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  }

  .main-footer {
    width: 100%;
    max-width: 1400px;
    margin-top: 50px;
    padding: 30px 20px;
    border-top: 1px solid #e2e8f0;
    text-align: center;
    color: #64748b;
    font-size: 0.85rem;
    line-height: 1.6;
  }

  .main-footer p {
    margin: 0;
    padding: 3px 0;
  }

  .stack-text {
    font-weight: 600;
    color: #3b82f6;
    margin-top: 8px;
  }

  .license-text {
    font-size: 0.75rem;
    color: #94a3b8;
    margin-top: 10px;
  }
  @media (max-width: 1200px) {
    .divided-by-two {
      margin: 30px 0;
      flex-direction: column;
      align-items: center;
      height: auto;
      width: 95%;
      gap: 50px;
    }

    .project-links {
      max-width: 200px;
    }

    .title {
      margin: 20px 0;
    }

    .data-container {
      width: 90%;
    }

    .chart-section {
      height: auto;
    }

    .info-section {
      gap: 20px;
    }
  }

  @media (max-width: 768px) {
    .main-container {
      padding: 20px 10px;
      height: auto;
    }

    .header-container h1 {
      font-size: 2rem;
    }

    .current-time {
      font-size: 2.8rem;
      margin-bottom: 30px;
    }

    .title h1 {
      font-size: 1.4rem;
    }

    .data-container {
      width: 100%;
    }

    .info-section {
      grid-template-columns: 1fr;
    }

    .project-links {
      flex-direction: column;
      align-items: center;
      width: 100%;
    }
    .link-button {
      width: 90%;
      text-align: center;
    }
  }
</style>
