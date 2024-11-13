let playerData = [];

function getPlayerIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("id");
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

// Function to load and parse the CSV data for a player
function loadPlayerData(playerId) {
  Papa.parse("data/player_stats.csv", {
    download: true,
    header: true,
    complete: function (results) {
      const playerData = results.data.find((player) => player.id === playerId);
      if (playerData) {
        renderPlayerDetails(playerData);
        searchPlayer(playerData.Player);
        getPlayerMetrics(playerData);
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

function getPlayerMetrics(playerDataRow) {
  const playerMetrics = [
    // Métricas ofensivas
    { axis: "Goals", value: (playerDataRow.Goals) || 0 },
    { axis: "Shots", value: (playerDataRow.Shots) || 0 },
    { axis: "SoT%", value: (playerDataRow["SoT%"]) || 0 },
    { axis: "Assists", value: (playerDataRow['Assists/90']) || 0 },
    { axis: "PasAss", value: (playerDataRow.PasAss) || 0 },
    { axis: "ScaDrib", value: (playerDataRow.ScaDrib) || 0 },
    { axis: "GCA", value: (playerDataRow.GCA) || 0 },

    // Métricas defensivas
    { axis: "Tkl", value: (playerDataRow['Tkl/90']) || 0 },
    { axis: "TklWon", value: (playerDataRow.TklWon) || 0 },
    { axis: "Int", value: (playerDataRow['Int/90']) || 0 },
    { axis: "Blocks", value: (playerDataRow.Blocks) || 0 },
    { axis: "Clr", value: (playerDataRow.Clr) || 0 },
    { axis: "CrdY", value: (playerDataRow['CrdY/90']) || 0 },
    { axis: "CrdR", value: (playerDataRow)['CrdR/90'] || 0 },

    // Métricas de posse de bola
    { axis: "PasTotCmp%", value: (playerDataRow["PasTotCmp%"]) || 0 },
    { axis: "PasProg", value: (playerDataRow.PasProg) || 0 },
    { axis: "Pas3rd", value: (playerDataRow.Pas3rd) || 0 },
    { axis: "Carries", value: (playerDataRow.Carries) || 0 },
    { axis: "CarTotDist", value: (playerDataRow.CarTotDist) || 0 },
    { axis: "Rec", value: (playerDataRow.Rec) || 0 },
    { axis: "RecProg", value: (playerDataRow.RecProg) || 0 },
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
    });
}

function displayCommonPlayerInfo(player) {
  const commonInfoDiv = document.getElementById("commonPlayerInfo");
  commonInfoDiv.innerHTML = `
            <hr>
        <p><strong>Player:</strong> ${player.Player || ""}</p>
        <p><strong>Nation:</strong> ${player.Nation || ""}</p>
        <p><strong>Position:</strong> ${player.Position || ""}</p>
        <p><strong>Age:</strong> ${player.Age || ""}</p>
        <hr>
        <p><strong>Competion:</strong> ${player.Comp || ""}</p>
        <p><strong>Squad:</strong> ${player.Squad || ""}</p>
        <p><strong>Matches Played:</strong> ${player.MP || ""}</p>
        <p><strong>Minutes Played:</strong> ${player.Min || ""}</p>
        <hr>
    `;
}

function showError(message) {
  const errorDiv = document.createElement("div");
  errorDiv.style.color = "red";
  errorDiv.innerText = message;
  document.body.appendChild(errorDiv);
}

const playerId = getPlayerIdFromUrl();
if (playerId) {
  loadPlayerData(playerId);
} else {
  showError("No player ID provided.");
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