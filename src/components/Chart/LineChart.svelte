<script lang="ts">
  import * as d3 from "d3";
  import { type GraphicData } from "$lib/models/typesOfData";

  let {
    initialTime,
    data,
    xDescription,
    yDescription,
    width = 800,
    height = 350,
    marginTop = 20,
    marginRight = 50,
    marginBottom = 60,
    marginLeft = 100,
  } = $props();

  let hoveredPoint: GraphicData | null = $state(null);

  const xFormat = (time: Date) => d3.timeFormat("%H:%M:%S")(time);
  const yFormat = (value: number) => value.toFixed(2);

  const extent = $derived(d3.extent(data, (d: GraphicData) => d.time));
  const minTime = $derived(extent?.[0]);
  const maxTime = $derived(extent?.[1]);

  const xScale = $derived(
    d3
      .scaleTime()
      .domain(
        minTime && maxTime ? [minTime, maxTime] : [initialTime, initialTime],
      )
      .range([marginLeft, width - marginRight]),
  );

  const yExtent = $derived(d3.extent(data, (d: GraphicData) => d.value));
  const yMin = $derived(yExtent?.[0] ?? 0);
  const yMax = $derived(yExtent?.[1] ?? 0);

  const yScale = $derived(
    d3
      .scaleLinear()
      .domain([
        yMin - (yMax - yMin) * 0.5 || 0.5,
        yMax + (yMax - yMin) * 0.5 || 0.5,
      ])
      .range([height - marginBottom, marginTop]),
  );

  const lineGenerator = $derived(
    d3
      .line<GraphicData>()
      .x((d) => xScale(d.time))
      .y((d) => yScale(d.value)),
  );

  const showTooltip = (point: GraphicData) => {
    hoveredPoint = point;
  };

  const hideTooltip = () => {
    hoveredPoint = null;
  };
</script>

<svg {width} {height} style="display: block;">
  <!-- Eje X -->
  <g transform={`translate(0, ${height - marginBottom})`}>
    <line x1={marginLeft} x2={width - marginRight} stroke="gray" />
    {#each data as d (d.time)}
      <g transform={`translate(${xScale(d.time)}, 0)`}>
        <line y2="5" stroke="gray" />
        <text y="20" text-anchor="middle" font-size="10">{xFormat(d.time)}</text
        >
      </g>
    {/each}
    <text
      x={(width - marginLeft - marginRight) / 2 + marginLeft}
      y="40"
      text-anchor="middle"
      font-size="13"
      font-weight="600"
      fill="#333"
    >
      {xDescription}
    </text>
  </g>

  <!-- Eje Y -->
  <g transform={`translate(${marginLeft}, 0)`}>
    <line y1={marginTop} y2={height - marginBottom} stroke="gray" />
    {#each yScale.ticks(5) as tick}
      <g transform={`translate(0, ${yScale(tick)})`}>
        <line x1="-5" x2="0" stroke="gray" />
        <text x="-10" text-anchor="end" font-size="10">{yFormat(tick)}</text>
      </g>
    {/each}
    <text
      x="-80"
      y={(height - marginBottom + marginTop) / 2}
      text-anchor="middle"
      font-size="13"
      font-weight="600"
      fill="#333"
      transform={`rotate(-90, -80, ${(height - marginBottom + marginTop) / 2})`}
    >
      {yDescription}
    </text>
  </g>

  <!-- Línea -->
  {#if data.length > 1}
    <path
      fill="none"
      stroke="#2563eb"
      stroke-width="2"
      d={lineGenerator(data)}
      class="chart-line"
    />
  {/if}

  <!-- Puntos -->
  <g fill="#2563eb" stroke="white" stroke-width="1.5">
    {#each data as d (d.time)}
      <circle
        cx={xScale(d.time)}
        cy={yScale(d.value)}
        r={hoveredPoint === d ? 6 : 3}
        role="button"
        tabindex="0"
        aria-label={`${xFormat(d.time)} - ${yFormat(d.value)} °C`}
        onmouseenter={() => showTooltip(d)}
        onmouseleave={hideTooltip}
        onfocus={() => showTooltip(d)}
        onblur={hideTooltip}
      >
        <animate attributeName="r" from="0" to="3" dur="0.3s" fill="freeze" />
      </circle>
    {/each}
  </g>

  <!-- Tooltip SVG (encima del punto) -->
  {#if hoveredPoint}
    <g
      transform={`translate(${xScale(hoveredPoint.time)}, ${yScale(hoveredPoint.value) - 20})`}
      style="pointer-events: none;"
    >
      <rect
        x="-45"
        y="-35"
        width="90"
        height="32"
        rx="6"
        ry="6"
        fill="rgba(0,0,0,0.15)"
        stroke="#333"
        stroke-width="1"
      />
      <text x="0" y="-20" text-anchor="middle" font-size="10" fill="#000">
        {xFormat(hoveredPoint.time)}
      </text>
      <text
        x="0"
        y="-8"
        text-anchor="middle"
        font-size="12"
        font-weight="600"
        fill="#000"
      >
        {hoveredPoint.value.toFixed(2)} °C
      </text>
    </g>
  {/if}
</svg>

<style>
  svg {
    width: 100%;
    height: auto;
  }

  circle:hover {
    fill: #2563eb;
    cursor: pointer;
  }

  .chart-line {
    transition: d 1.5s ease-in-out;
  }
</style>
