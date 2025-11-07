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

        // Acumular la energía producida
        console.log(
          `${accumulatedEnergy} + ${Number(
            (powerData[powerIndex].value * segundosEnHoras).toFixed(2),
          )}`,
        );

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
    <div class="current-time">
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
  </div>
{/if}

<style>
  .main-container {
    width: 98vw;
    height: 100vh;
    min-height: 100vh;
    display: flex;
    overflow-x: hidden;
    overflow-y: auto;
    padding-bottom: 20px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: #f8fafc;
    font-family: "Inter", system-ui, sans-serif;
    box-sizing: border-box;
  }

  .current-time {
    font-size: 3.2rem;
    font-weight: 700;
    text-align: center;
    color: #0f172a;
    margin-bottom: 100px;
    letter-spacing: -1px;
    font-family: "Inter", system-ui, sans-serif;
  }

  .divided-by-two {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: stretch;
    gap: 2vw;
    width: 100%;
    height: 83%;
  }

  .title {
    margin-top: -90px;
  }

  .mt-10 {
    margin-top: -20px;
  }

  .data-container {
    width: 45%;
    height: fit-content;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 1.2vh;
  }

  .chart-section {
    flex: 1.8;
    background: #ffffff;
    border-radius: 18px;
    padding: 18px;
    max-width: 900px;
    max-height: fit-content;
    box-shadow: 0 4px 16px rgba(15, 23, 42, 0.07);
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    transition: all 0.3s ease;
  }

  .chart-section:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 22px rgba(0, 0, 0, 0.08);
  }

  .info-section {
    display: grid;
    grid-template-columns: 33fr 33fr 33fr;
    justify-content: space-between;
    align-items: stretch;
    gap: 1vw;
  }

  .info-section :global(.card) {
    flex: 1;
    background: #ffffff;
    border-radius: 16px;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 18px;
    transition:
      transform 0.25s ease,
      box-shadow 0.25s ease;
  }

  .info-section :global(.card:hover) {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  }

  @media (max-width: 1200px) {
    .divided-by-two {
      margin: 30px 0;
      flex-direction: column;
      align-items: center;
      height: auto;
    }

    .title {
      margin: 40px 0;
    }

    .data-container {
      width: 90%;
    }

    .chart-section {
      height: 45vh;
    }

    .info-section {
      flex-wrap: wrap;
      justify-content: center;
    }
  }

  @media (max-width: 768px) {
    .main-container {
      padding: 20px;
      height: auto;
    }

    .divided-by-two {
      flex-direction: column;
      height: auto;
    }

    .title {
      margin: 10px 0;
    }

    .chart-section {
      padding: 14px;
    }

    .info-section {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
  }
</style>
