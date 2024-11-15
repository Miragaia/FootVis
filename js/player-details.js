let playerData = [];

function getPlayerIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("id");
}
const playerId = getPlayerIdFromUrl();
if (playerId) {
  loadPlayerData(playerId);
} else {
  showError("No player ID provided.");
}

function loadPlayerData(playerId) {
  Papa.parse("./data/player_stats.csv", {
    download: true,
    header: true,
    complete: function (results) {
      allPlayerData = results.data;
      
      const playerData = results.data.find((player) => player.id === playerId);
      if (playerData) {
        renderPlayerDetails(playerData);
        searchPlayer(playerData.Player);
        getPlayerMetrics(playerData);
        playerPosition(playerData);
        drawCharts(playerData);
        populatePlayerTable(playerData);
      } else {
        showError("Player not found.");
      }
    },
    error: function () {
      showError("Failed to load player data.");
    },
  });
}

function renderPlayerDetails(player) {
  displayCommonPlayerInfo(player);
}

function searchPlayer(playerName) {
  playerName = playerName.replace(" ", "_");
  const url = `https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?p=${playerName}`;
  console.log(url);
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      const player = data.player[0].strCutout;
      const playerImage = document.getElementById("playerImage");
      playerImage.src = player;
      playerImage.alt = playerName + " image";
    })
    .catch((error) => {
      console.error("Error fetching player data:", error);
      // quando da erro na busca do jogador, exibe o quadrado cinza, a dizer no meio "No image available"
      const playerImage = document.getElementById("playerImage");
      playerImage.src = "./assets/no-image-available.jpg";
      playerImage.alt = "No image available";
    });
}

function displayCommonPlayerInfo(player) {
  const commonInfoDiv = document.getElementById("commonPlayerInfo");
  commonInfoDiv.innerHTML = `

        <p><strong>Player:</strong> ${player.Player || ""}</p>
        <p><strong>Nation:</strong> ${player.Nation || ""}</p>
        <p><strong>Position:</strong> ${player.Position || ""}</p>
        <p><strong>Age:</strong> ${player.Age || ""}</p>

    `;
  const gameInfoDiv = document.getElementById("GamesPlayerInfo");
  gameInfoDiv.innerHTML = `
  
              <p><strong>Competion:</strong> ${player.Comp || ""}</p>
    <p><strong>Squad:</strong> ${player.Squad || ""}</p>
    <p><strong>Matches Played:</strong> ${player.MP || ""}</p>
    <p><strong>Minutes Played:</strong> ${player.Min || ""}</p>
  
      `;
}

function showError(message) {
  const errorDiv = document.createElement("div");
  errorDiv.style.color = "red";
  errorDiv.innerText = message;
  document.body.appendChild(errorDiv);
}

function playerPosition(player) {
  const width = 325;
  const height = 175;
  const svg = d3.select("#field");
  const tooltip = d3.select("#tooltip");

  svg
    .append("rect")
    .attr("width", width)
    .attr("height", height)
    .attr("class", "field");

  svg
    .append("line")
    .attr("x1", width / 2)
    .attr("y1", 0)
    .attr("x2", width / 2)
    .attr("y2", height)
    .attr("class", "line");

  svg
    .append("circle")
    .attr("cx", width / 2)
    .attr("cy", height / 2)
    .attr("r", 40)
    .attr("class", "line");

  svg
    .append("circle")
    .attr("cx", width / 2)
    .attr("cy", height / 2)
    .attr("r", 2)
    .attr("class", "line");
  svg
    .append("rect")
    .attr("x", 0)
    .attr("y", height / 4)
    .attr("width", 60)
    .attr("height", height / 2)
    .attr("class", "line");

  svg
    .append("rect")
    .attr("x", width - 60)
    .attr("y", height / 4)
    .attr("width", 60)
    .attr("height", height / 2)
    .attr("class", "line");

  svg
    .append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", 10)
    .attr("height", height)
    .attr("class", "line");

  svg
    .append("rect")
    .attr("x", width - 10)
    .attr("y", 0)
    .attr("width", 10)
    .attr("height", height)
    .attr("class", "line");

  svg
    .append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", width)
    .attr("height", 10)
    .attr("class", "line");

  svg
    .append("rect")
    .attr("x", 0)
    .attr("y", height - 10)
    .attr("width", width)
    .attr("height", 10)
    .attr("class", "line");

  const positionCoordinates = [
    { x: 30, y: height / 2, label: "GK" },
    { x: 80, y: height / 4 - 15, label: "DF" },
    { x: 70, y: height / 2 - 20, label: "DF" },
    { x: 70, y: height / 2 + 20, label: "DF" },
    { x: 80, y: (3 * height) / 4 + 15, label: "DF" },
    { x: 170, y: height / 4 + 15, label: "MF" },
    { x: 130, y: height / 2, label: "MF" },
    { x: 170, y: (3 * height) / 4 - 15, label: "MF" },
    { x: 240, y: height / 4, label: "FW" },
    { x: 280, y: height / 2, label: "FW" },
    { x: 240, y: (3 * height) / 4, label: "FW" },
  ];

  const highlightedPositions = player.Position.split(",");
  console.log(highlightedPositions);
  positionCoordinates.forEach((pos) => {
    const isHighlighted = highlightedPositions.includes(pos.label);
    svg
      .append("circle")
      .attr("cx", pos.x)
      .attr("cy", pos.y)
      .attr("r", 10)
      .attr("class", isHighlighted ? "highlight" : "player")
      .on("mouseover", function (event) {
        tooltip
          .style("display", "block")
          .text(isHighlighted ? pos.label + " - " + player.Player : pos.label)
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 15 + "px");
      })
      .on("mousemove", function (event) {
        tooltip
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 15 + "px");
      })
      .on("mouseout", function () {
        tooltip.style("display", "none");
      });
  });
}

function drawCharts(player) {
  const pieData = [
    { label: "Minutes Played", value: player.Min },
    { label: "Minutes on Bench", value: player.MinutesOnBench },
  ];

  drawPieChart(pieData, player.MaxPossibleMinutes);
  drawBarChart(player);
}

function drawPieChart(data, maxMinutes) {
  const svg = d3.select("#pieChart"),
    width = +svg.attr("width"),
    height = +svg.attr("height"),
    radius = Math.min(width, height) / 2.5;

  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", 15)
    .attr("class", "legend-title")
    .style("text-anchor", "middle")
    .style("font-size", "16px")
    .style("font-weight", "bold")
    .text("Minutes Played");

  const g = svg
    .append("g")
    .attr("transform", `translate(${width / 3}, ${height / 2})`);

  const color = d3
    .scaleOrdinal()
    .domain(data.map((d) => d.label))
    .range(["#87bc45", "#ea5545"]);

  const pie = d3.pie().value((d) => d.value);

  const arc = d3.arc().outerRadius(radius).innerRadius(0);

  g.selectAll("path")
    .data(pie(data))
    .join("path")
    .attr("d", arc)
    .attr("fill", (d) => color(d.data.label))
    .attr("class", "slice")
    .on("mouseover", function (event, d) {
      const percentage = ((d.data.value / d3.sum(data, (d) => d.value)) * 100).toFixed(1);
      const tooltip = d3.select("#tooltip3");
      tooltip.style("opacity", 1);
      tooltip.html(`${d.data.label}: ${d.data.value} mins (${percentage}%)<br>Max Possible: ${maxMinutes} mins`)
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY - 20}px`);

      svg.selectAll(".slice").style("opacity", 0.3);
      d3.select(this).style("opacity", 1); 
    })
    .on("mouseout", function () {
      d3.select("#tooltip3").style("opacity", 0); 
      svg.selectAll(".slice").style("opacity", 1);
    });

  g.selectAll("text.pie-label")
    .data(pie(data))
    .join("text")
    .attr("class", "pie-label")
    .attr("transform", (d) => {
      const pos = arc.centroid(d);
      return `translate(${pos})`;
    })
    .attr("text-anchor", "middle")
    .attr("dy", ".35em")
    .text((d) => `${((d.data.value / d3.sum(data, (d) => d.value)) * 100).toFixed(1)}%`)
    .style("fill", "white")
    .style("font-size", "14px")
    .style("pointer-events", "none");

  const legend = svg.append("g").attr("transform", `translate(${width - 160}, 40)`); // Desloca para a direita

  legend
    .selectAll(".legend-circle")
    .data(data)
    .join("circle")
    .attr("class", "legend-circle")
    .attr("cx", 20)
    .attr("cy", (d, i) => 20 + i * 30)
    .attr("r", 8)
    .style("fill", (d) => color(d.label));

  legend
    .selectAll(".legend-text")
    .data(data)
    .join("text")
    .attr("class", "legend-text")
    .attr("x", 40)
    .attr("y", (d, i) => 25 + i * 30)
    .style("font-size", "14px")
    .style("font-weight", "bold")
    .text((d) => `${d.label}`);
}

function drawBarChart(player) {
  const margin = { top: 50, right: 20, bottom: 20, left: 20 };
  const width = 350 - margin.left - margin.right;
  const height = 120 - margin.top - margin.bottom;

  const svg = d3
    .select("#barChart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", 180)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top} )`);

  const x = d3.scaleLinear().domain([0, player.MaxGames]).range([0, width]);

  const y = d3.scaleBand().range([0, height]).padding(0.1);

  const stack = d3
    .stack()
    .keys(["Games Started", "Games Substitute", "Games Not Played"]);

  const layers = stack([
    {
      "Games Started": player.Starts,
      "Games Substitute": player.PlayBySuplente,
      "Games Not Played": player.NotPlayed,
    },
  ]);

  svg
    .selectAll(".serie")
    .data(layers)
    .enter()
    .append("g")
    .attr("class", "serie")
    .attr("fill", (d, i) => {
      return i === 0 ? "#488f31" : i === 1 ? "#f5bc6b" : "#de425b";
    })
    .selectAll(".bar")
    .data((d) => d)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("y", (d) => y(d.data.category))
    .attr("x", (d) => x(d[0]))
    .attr("width", (d) => x(d[1]) - x(d[0]))
    .attr("height", y.bandwidth())
    .on("mouseover", function (event, d) {
      const key = d3.select(this.parentNode).datum().key;
      const tooltip = d3
        .select("#tooltip2")
        .style("opacity", 1)
        .html(`${key}: ${d[1] - d[0]}`);
      tooltip
        .style("left", `${event.pageX - tooltip.node().offsetWidth - 10}px`)
        .style("top", `${event.pageY - 20}px`);
      svg.selectAll(".bar").style("opacity", 0.2);
      d3.select(this).style("opacity", 1);
    })
    .on("mouseout", function () {
      d3.select("#tooltip2").style("opacity", 0);
      svg.selectAll(".bar").style("opacity", 1);
    });

  svg.append("g").call(d3.axisLeft(y)).attr("class", "axis-labels");

  svg
    .append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x).ticks(5).tickFormat(d3.format("d")))
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("class", "axis-labels");

  svg
    .append("text")
    .attr("class", "title")
    .attr("x", width / 2)
    .attr("y", -20)
    .text("Games Played");

  const legend = svg
    .append("g")
    .attr("transform", `translate(0, ${height + 40})`);

  const legendData = [
    { color: "#488f31", label: "Starts" },
    { color: "#f5bc6b", label: "Substitute" },
    { color: "#de425b", label: "Not Played" },
  ];

  legend
    .selectAll(".legend-circle")
    .data(legendData)
    .enter()
    .append("circle")
    .attr("class", "legend-circle")
    .attr("cx", (d, i) => 20 + i * 100)
    .attr("cy", 10)
    .attr("r", 8)
    .style("fill", (d) => d.color);

  legend
    .selectAll(".legend-text")
    .data(legendData)
    .enter()
    .append("text")
    .attr("class", "legend-text")
    .attr("x", (d, i) => 35 + i * 100)
    .attr("y", 15)
    .style("font-size", "14px")
    .style("font-weight", "bold")
    .text((d) => d.label);
}

// Define the headers mapping for categorizing data
const headersMapping = {
  general: [
    "MP",
    "Min",
    "Goals",
    "Assists",
    "Shots",
    "SoT",
    "Int",
    "TklWon",
    "Recov",
    "Fls",
    "CrdY",
    "CrdR",
  ],
  gameInfo: ["MP", "Min", "Goals", "Assists"],
  offensive: ["Goals", "Shots", "SoT", "Assists"],
  defensive: ["Int", "TklWon", "Recov", "Fls", "CrdY", "CrdR"],
};

function getPlayerMetrics(playerDataRow) {
  const playerMetrics = [
    // Métricas ofensivas
    { axis: "Goals", value: playerDataRow.Goals || 0 },
    { axis: "Shots", value: playerDataRow.Shots || 0 },
    { axis: "SoT%", value: playerDataRow["SoT%"] || 0 },
    { axis: "Assists", value: playerDataRow["Assists/90"] || 0 },
    { axis: "PasAss", value: playerDataRow.PasAss || 0 },
    { axis: "ScaDrib", value: playerDataRow.ScaDrib || 0 },
    { axis: "GCA", value: playerDataRow.GCA || 0 },

    // Métricas defensivas
    { axis: "Tkl", value: playerDataRow["Tkl/90"] || 0 },
    { axis: "TklWon", value: playerDataRow.TklWon || 0 },
    { axis: "Int", value: playerDataRow["Int/90"] || 0 },
    { axis: "Blocks", value: playerDataRow.Blocks || 0 },
    { axis: "Clr", value: playerDataRow.Clr || 0 },
    { axis: "CrdY", value: playerDataRow["CrdY/90"] || 0 },
    { axis: "CrdR", value: playerDataRow["CrdR/90"] || 0 },

    // Métricas de posse de bola
    { axis: "PasTotCmp%", value: playerDataRow["PasTotCmp%"] || 0 },
    { axis: "PasProg", value: playerDataRow.PasProg || 0 },
    { axis: "Pas3rd", value: playerDataRow.Pas3rd || 0 },
    { axis: "Carries", value: playerDataRow.Carries || 0 },
    { axis: "CarTotDist", value: playerDataRow.CarTotDist || 0 },
    { axis: "Rec", value: playerDataRow.Rec || 0 },
    { axis: "RecProg", value: playerDataRow.RecProg || 0 },
  ];

  playerData = [
    {
      name: playerDataRow.Player,
      metrics: playerMetrics,
    },
  ];

  // Render the radar chart
  renderRadarChart(playerData);
}

function renderRadarChart(playerData) {
  const width = 500;
  const height = 500;
  const margin = { top: 50, right: 50, bottom: 50, left: 50 };
  const radius = Math.min(width, height) / 2 - margin.top;

  const svg = d3
    .select("#radarChart")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`);

  const maxValue = 1; // Escala para os dados
  const allAxis = playerData[0].metrics.map((i) => i.axis); // Eixos das métricas
  const angleSlice = (2 * Math.PI) / allAxis.length; // Ângulo entre cada métrica

  const rScale = d3.scaleLinear().range([0, radius]).domain([0, maxValue]);

  // Círculos concêntricos de fundo
  const levels = 5;
  for (let i = 0; i < levels; i++) {
    svg
      .append("circle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", (radius / levels) * (i + 1))
      .style("fill", "#CDCDCD")
      .style("stroke", "#CDCDCD")
      .style("fill-opacity", 0.1);
  }

  // Eixos das métricas
  allAxis.forEach((axis, i) => {
    const angle = i * angleSlice;

    svg
      .append("line")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", radius * Math.cos(angle))
      .attr("y2", radius * Math.sin(angle))
      .style("stroke", "#CDCDCD")
      .style("stroke-width", "1px");

    svg
      .append("text")
      .attr("x", (radius + 10) * Math.cos(angle))
      .attr("y", (radius + 10) * Math.sin(angle))
      .attr("dy", "0.35em")
      .style("font-size", "11px")
      .style("text-anchor", "middle")
      .text(axis);
  });

  const radarLine = d3
    .lineRadial()
    .radius((d) => rScale(d.value))
    .angle((d, i) => i * angleSlice)
    .curve(d3.curveLinearClosed);

  svg
    .append("path")
    .datum(playerData[0].metrics)
    .attr("d", radarLine)
    .style("fill", "#66bb6a")
    .style("fill-opacity", 0.5)
    .style("stroke", "#66bb6a")
    .style("stroke-width", 2);

  playerData[0].metrics.forEach((d, i) => {
    const angle = i * angleSlice;
    const x = rScale(d.value) * Math.cos(angle - Math.PI / 2);
    const y = rScale(d.value) * Math.sin(angle - Math.PI / 2);

    svg
      .append("circle")
      .attr("cx", x)
      .attr("cy", y)
      .attr("r", 4)
      .style("fill", "#66bb6a")
      .style("stroke", "#fff")
      .style("stroke-width", 1.5);
  });
}

function populatePlayerTable(playerData) {
  // Clear any existing table content
  d3.select("#table-container").html("");

  // Select the container and create a table
  const table = d3.select("#table-container")
                  .append("table")
                  .style("border-collapse", "collapse")
                  .style("width", "100%");

  // Define the data to display as key-value pairs
  const data = [
    { metric: "Shots", per90: playerData["Shots/90"]},
    { metric: "Goals", per90: playerData["Goals/90"]},
    { metric: "Assists", per90: playerData["Assists/90"]},
    { metric: "Shots on Target", per90: playerData["SoT/90"]},
    { metric: "Interceptions", per90: playerData["Int/90"]},
    { metric: "Takles Won", per90: playerData["TklWon/90"]},
    { metric: "Recoveries", per90: playerData["Recov/90"]},
    { metric: "Fouls", per90: playerData["Fls/90"]},
    { metric: "Yellow Cards", per90: playerData["CrdY/90"]},
    { metric: "Red Cards", per90: playerData["CrdR/90"]},
  ];
    

  // Add table headers (Metric and Value columns)
  const header = table.append("thead").append("tr");
  header.append("th")
        .text("Statistic")
        .style("padding", "10px")
        .style("border", "1px solid #ddd")
        .style("background-color", "#f4f4f4");

  header.append("th")
        .text("Per 90")
        .style("padding", "10px")
        .style("border", "1px solid #ddd")
        .style("background-color", "#f4f4f4");
  
  header.append("th")
        .text("Percentile")
        .style("padding", "10px")
        .style("border", "1px solid #ddd")
        .style("background-color", "#f4f4f4");

  // Add rows for each metric-value pair
  const tbody = table.append("tbody");

  data.forEach(item => {
    const row = tbody.append("tr");
    row.append("td")
       .text(item.metric)
       .style("padding", "8px")
       .style("border", "1px solid #ddd")
       .style("text-align", "left");

    row.append("td")
       .text(item.per90)
       .style("padding", "8px")
       .style("border", "1px solid #ddd")
       .style("text-align", "center")
       .style("background-color", getBackgroundColor(item.value)); // Conditional formatting
  });
}

// Function to get background color based on percentile
function getBackgroundColor(value) {
  const number = parseFloat(value);
  if (number >= 90) return "#4CAF50"; // Top percentile
  else if (number >= 70) return "#8BC34A";
  else if (number >= 50) return "#CDDC39";
  else if (number >= 30) return "#FFC107";
  else if (number >= 10) return "#FF5722";
  else return "#F44336"; // Lower percentile
}
