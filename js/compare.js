let selectedPlayer1 = null;
let selectedPlayer2 = null;
let playerData = []; 
let combinedData = [];

function loadPlayers() {
  Papa.parse('./data/player_stats.csv', {
    download: true,
    header: true,
    complete: (results) => {
      playerData = results.data;
      players = results.data.map(row => row.Player);  
      document.getElementById('chartType').value = 'goals';
      document.getElementById('comparison-select').value = 'aerials_vs_aerialsWon';
    },
    error: (error) => {
      console.error("Error loading CSV:", error);
    }
  });

}

loadPlayers();


function displayPlayerStats(playerName, statsId) {
  const player = playerData.find(row => row.Player === playerName);
  const statsContainer = document.getElementById(statsId);

  if (player) {
    statsContainer.innerHTML = `
      <p><strong>Player:</strong> ${player.Player}</p>
      <p><strong>Nation:</strong> ${player.Nation}</p>
      <p><strong>Position:</strong> ${player.Position}</p>
      <p><strong>Age:</strong> ${player.Age}</p>
      <p><strong>Competition:</strong> ${player.Comp}</p>
      <p><strong>Team:</strong> ${player.Squad}</p>
      <p><strong>Matches:</strong> ${player.MP}</p>
      <p><strong>Minutes:</strong> ${player.Min}</p>

    `;
  } else {
    statsContainer.innerHTML = `<p>No data available for ${playerName}</p>`;
  }
}

document.getElementById('compareButton').addEventListener('click', () => {
  const player1Input = document.getElementById('playerSearch').value;
  const player2Input = document.getElementById('playerSearch2').value;

  if (!player1Input || !player2Input) {
    alert('Please select two players before comparing.');
    return;
  }

  selectedPlayer1 = player1Input;
  selectedPlayer2 = player2Input;

  displayPlayerStats(selectedPlayer1, 'player1Stats');
  displayPlayerStats(selectedPlayer2, 'player2Stats');
  searchPlayer(selectedPlayer1, 'playerImage');
  searchPlayer(selectedPlayer2, 'playerImage2'); 
  getPlayerMetrics(selectedPlayer1, selectedPlayer2, '#radarChart');
  createScatterPlot(selectedPlayer1, selectedPlayer2, playerData, 'scatterChart');
  createBarChart(selectedPlayer1, selectedPlayer2, 'goals', 'barChartContainer');
});

function searchPlayer(playerName, imageId) {
  playerName = playerName.replace(" ", "_");
  const url = `https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?p=${playerName}`;
  console.log(url);
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      const player = data.player[0].strCutout;
      const playerImage = document.getElementById(imageId);
      playerImage.src = player;
      playerImage.alt = playerName + " image";

      playerImage.closest('.player-image-container').style.display = 'block';
    })
    .catch((error) => {
      console.error("Error fetching player data:", error);
      const playerImage = document.getElementById(imageId);
      playerImage.src = "./assets/no-image-available.jpg";
      playerImage.alt = "No image available";

      playerImage.closest('.player-image-container').style.display = 'block';
    });
}


function calculateStats(playerData, allPlayerData) {
  const statValues = {};
  const statsList = [
    "Shots/90", "SoT/90", "Goals/90", "Assists/90", "SCA",
    "Int/90", "TklWon/90", "Recov/90", "Fls/90", "Clr",
    "PasTotAtt", "PasTotCmp%", "ToSuc"
  ];

  statsList.forEach(stat => {
    const playerValue = playerData[stat];
    const allValues = allPlayerData.map(p => p[stat]);
    const percentile = calculatePercentile(playerValue, allValues);
    statValues[stat] = percentile;
  });

  return statValues;
}

function calculatePercentile(value, allValues) {
  const sortedValues = allValues.sort((a, b) => a - b);
  const rank = sortedValues.indexOf(value) + 1;
  const percentile = (rank / sortedValues.length) * 100;
  return percentile.toFixed(2) + "%";
}

function createScatterPlot(playerName1, playerName2, allPlayerData, containerId, comparisonType) {
  const scatter = document.getElementById('scatter-controls');
  scatter.style.display = 'flex';
  comparisonType = comparisonType ? comparisonType : 'aerials_vs_aerialsWon';
  const player1Metrics = allPlayerData.find((row) => row.Player === playerName1);
  const player2Metrics = allPlayerData.find((row) => row.Player === playerName2);

  let xMetric, yMetric, comparisonTitle;

  switch (comparisonType) {
    case 'tackles_vs_tacklesWon':
      xMetric = 'Tkl';
      yMetric = 'TklWon';
      comparisonTitle = 'Tackles vs Tackles Won';
      break;
    case 'aerials_vs_aerialsWon':
      xMetric = 'Aer';
      yMetric = 'AerWon';
      comparisonTitle = 'Aerials vs Aerials Won';
      break;
    case 'toAtt_vs_toSuc':
      xMetric = 'ToAtt';
      yMetric = 'ToSuc';
      comparisonTitle = 'Total Attempts vs Total Success';
      break;
    case 'pasTotCmp_vs_pasTotAtt':
      xMetric = 'PasTotAtt';
      yMetric = 'PasTotCmp';
      comparisonTitle = 'Total Pass Attempts vs Total Pass Completions';
      break;
  }

  const minX = Math.min(player1Metrics[xMetric], player2Metrics[xMetric]);
  const maxX = Math.max(player1Metrics[xMetric], player2Metrics[xMetric]);

  const minY = Math.min(player1Metrics[yMetric], player2Metrics[yMetric]);
  const maxY = Math.max(player1Metrics[yMetric], player2Metrics[yMetric]);

  const margin = { top: 40, right: 50, bottom: 70, left: 40 };
  const width = 550 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  d3.select(`#${containerId} svg`).remove();

  const svg = d3
    .select(`#${containerId}`)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const padding = 2;
  const xScale = d3.scaleLinear()
    .domain([Math.max(0, minX - padding), maxX + padding])
    .range([0, width]);

  const yScale = d3.scaleLinear()
    .domain([Math.max(0, minY - padding), maxY + padding])
    .range([height, 0]);

  svg
    .append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(xScale));

  svg.append("g").call(d3.axisLeft(yScale));

  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", height + margin.bottom - 10)
    .style("text-anchor", "middle")
    .text(xMetric);

  svg
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -margin.left + 10)
    .style("text-anchor", "middle")
    .text(yMetric);

  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", -margin.top / 2)
    .style("text-anchor", "middle")
    .style("font-size", "16px")
    .style("font-weight", "bold")
    .text(comparisonTitle);

    const tooltip = d3.select("body")
    .append("div")
    .attr("class", "scatter-tooltip")
    .style("position", "absolute")
    .style("background", "white")
    .style("border", "1px solid #ccc")
    .style("border-radius", "5px")
    .style("padding", "8px")
    .style("font-size", "12px")
    .style("pointer-events", "none")
    .style("display", "none");

svg
    .selectAll(".dot")
    .data(allPlayerData)
    .enter()
    .append("circle")
    .attr("cx", (d) => Math.min(width, Math.max(0, xScale(d[xMetric]))))  
    .attr("cy", (d) => Math.min(height, Math.max(0, yScale(d[yMetric]))))  
    .attr("r", 4)
    .style("fill", "gray");

if (player1Metrics) {
    const player1Circle = svg
        .append("circle")
        .attr("cx", Math.min(width, Math.max(0, xScale(player1Metrics[xMetric]))))  
        .attr("cy", Math.min(height, Math.max(0, yScale(player1Metrics[yMetric]))))  
        .attr("r", 8)
        .style("fill", "#ff794a")
        .style("stroke", "black")
        .style("stroke-width", 1.5);

    player1Circle
        .on("mouseover", function(event, d) {
            tooltip.style("display", "block");
            tooltip
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 20) + "px")
                .html(`
                    <strong>Player:</strong> ${playerName1}<br>
                    <strong>${xMetric}:</strong> ${player1Metrics[xMetric]}<br>
                    <strong>${yMetric}:</strong> ${player1Metrics[yMetric]}
                `);
        })
        .on("mousemove", function(event, d) {
            tooltip
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 20) + "px")
                .html(`
                    <strong>Player:</strong> ${playerName1}<br>
                    <strong>${xMetric}:</strong> ${player1Metrics[xMetric]}<br>
                    <strong>${yMetric}:</strong> ${player1Metrics[yMetric]}
                `);
        })
        .on("mouseout", function() {
            tooltip.style("display", "none");
        });
}

if (player2Metrics) {
    const player2Circle = svg
        .append("circle")
        .attr("cx", Math.min(width, Math.max(0, xScale(player2Metrics[xMetric]))))  
        .attr("cy", Math.min(height, Math.max(0, yScale(player2Metrics[yMetric]))))  
        .attr("r", 8)
        .style("fill", "#384d81")
        .style("stroke", "black")
        .style("stroke-width", 1.5);

    player2Circle
        .on("mouseover", function(event, d) {
            tooltip.style("display", "block");
            tooltip
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 20) + "px")
                .html(`
                    <strong>Player:</strong> ${playerName2}<br>
                    <strong>${xMetric}:</strong> ${player2Metrics[xMetric]}<br>
                    <strong>${yMetric}:</strong> ${player2Metrics[yMetric]}
                `);
        })
        .on("mousemove", function(event, d) {
            tooltip
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 20) + "px")
                .html(`
                    <strong>Player:</strong> ${playerName2}<br>
                    <strong>${xMetric}:</strong> ${player2Metrics[xMetric]}<br>
                    <strong>${yMetric}:</strong> ${player2Metrics[yMetric]}
                `);
        })
        .on("mouseout", function() {
            tooltip.style("display", "none");
        });
}
  const legend = svg.append("g").attr("transform", `translate(${width - 100}, ${height + margin.bottom - 20})`);

  legend
    .append("circle")
    .attr("cx", 0)
    .attr("cy", 0)
    .attr("r", 6)
    .style("fill", "#ff794a");

  legend
    .append("text")
    .attr("x", 15)
    .attr("y", 5)
    .style("font-size", "12px")
    .text(playerName1);

  legend
    .append("circle")
    .attr("cx", 0)
    .attr("cy", 20)
    .attr("r", 6)
    .style("fill", "#384d81");

  legend
    .append("text")
    .attr("x", 15)
    .attr("y", 25)
    .style("font-size", "12px")
      .text(playerName2);

}


document.getElementById("comparison-select").addEventListener("change", () => {
  const comparisonType = document.getElementById("comparison-select").value;
  createScatterPlot(selectedPlayer1, selectedPlayer2, playerData, 'scatterChart', comparisonType);
});


function calculatePercentileForRadar(metric, value) {
  const allValues = playerData.map((player) => player[metric]);

  allValues.sort((a, b) => a - b);

  const rank = allValues.indexOf(value) + 1;

  const percentile = (rank / allValues.length) * 100;

  return Math.round(percentile);
}

const data = [
  { axis: "Shots/90", metric: "Shots", explain: "Shots per 90 minutes", category: "Attacking" },
  { axis: "SoT/90", metric: "Shots on Target", explain: "Shots on Target per 90 minutes", category: "Attacking" },
  { axis: "Goals/90", metric: "Goals", explain: "Goals per 90 minutes", category: "Attacking" },
  { axis: "Assists/90", metric: "Assists", explain: "Assists per 90 minutes", category: "Attacking" },
  { axis: "SCA", metric: "Shot Creating Actions", explain: "Shot Creating Actions per 90 minutes", category: "Attacking" },
  { axis: "Int/90", metric: "Interceptions", explain: "Interceptions per 90 minutes", category: "Defending" },
  { axis: "TklWon/90", metric: "Tackles Won", explain: "Tackles Won per 90 minutes", category: "Defending" },
  { axis: "Recov/90", metric: "Recoveries", explain: "Recoveries per 90 minutes", category: "Defending" },
  { axis: "Fls/90", metric: "Fouls", explain: "Fouls per 90 minutes", category: "Defending" },
  { axis: "Clr", metric: "Clearances", explain: "Clearances per 90 minutes", category: "Defending" },
  { axis: "PasTotAtt", metric: "Passes Attempted", explain: "Passes Attempted per 90 minutes", category: "Possession" },
  { axis: "PasTotCmp%", metric: "Pass Completion %", explain: "Pass Completion % per 90 minutes", category: "Possession" },
  { axis: "ToSuc", metric: "Take-Ons Successful", explain: "Dribbling Defender Successful per 90 minutes", category: "Possession" }
];

function getPlayerMetrics(playerName1, playerName2, radarId) {
  const player1Metrics = playerData.find(row => row.Player === playerName1);

  const player1Data = [
    { axis: "Shots/90", value: calculatePercentileForRadar("Shots/90", player1Metrics["Shots/90"]), category: "Attacking", player: playerName1 },
    { axis: "SoT/90", value: calculatePercentileForRadar("SoT/90", player1Metrics["SoT/90"]), category: "Attacking", player: playerName1 },
    { axis: "Goals/90", value: calculatePercentileForRadar("Goals/90", player1Metrics["Goals/90"]), category: "Attacking", player: playerName1 },
    { axis: "Assists/90", value: calculatePercentileForRadar("Assists/90", player1Metrics["Assists/90"]), category: "Attacking", player: playerName1 },
    { axis: "SCA", value: calculatePercentileForRadar("SCA", player1Metrics["SCA"]), category: "Attacking", player: playerName1 },
    { axis: "Int/90", value: calculatePercentileForRadar("Int/90", player1Metrics["Int/90"]), category: "Defending", player: playerName1 },
    { axis: "TklWon/90", value: calculatePercentileForRadar("TklWon/90", player1Metrics["TklWon/90"]), category: "Defending", player: playerName1 },
    { axis: "Recov/90", value: calculatePercentileForRadar("Recov/90", player1Metrics["Recov/90"]), category: "Defending", player: playerName1 },
    { axis: "Fls/90", value: calculatePercentileForRadar("Fls/90", player1Metrics["Fls/90"]), category: "Defending", player: playerName1 },
    { axis: "Clr", value: calculatePercentileForRadar("Clr", player1Metrics["Clr"]), category: "Defending", player: playerName1 },
    { axis: "PasTotAtt", value: calculatePercentileForRadar("PasTotAtt", player1Metrics["PasTotAtt"]), category: "Possession", player: playerName1 },
    { axis: "PasTotCmp%", value: calculatePercentileForRadar("PasTotCmp%", player1Metrics["PasTotCmp%"]), category: "Possession", player: playerName1 },
    { axis: "ToSuc", value: calculatePercentileForRadar("ToSuc", player1Metrics["ToSuc"]), category: "Possession", player: playerName1 }
  ];

  const player2Metrics = playerData.find(row => row.Player === playerName2);

  const player2Data = [
    { axis: "Shots/90", value: calculatePercentileForRadar("Shots/90", player2Metrics["Shots/90"]), category: "Attacking", player: playerName2 },
    { axis: "SoT/90", value: calculatePercentileForRadar("SoT/90", player2Metrics["SoT/90"]), category: "Attacking", player: playerName2 },
    { axis: "Goals/90", value: calculatePercentileForRadar("Goals/90", player2Metrics["Goals/90"]), category: "Attacking", player: playerName2 },
    { axis: "Assists/90", value: calculatePercentileForRadar("Assists/90", player2Metrics["Assists/90"]), category: "Attacking", player: playerName2 },
    { axis: "SCA", value: calculatePercentileForRadar("SCA", player2Metrics["SCA"]), category: "Attacking", player: playerName2 },
    { axis: "Int/90", value: calculatePercentileForRadar("Int/90", player2Metrics["Int/90"]), category: "Defending", player: playerName2 },
    { axis: "TklWon/90", value: calculatePercentileForRadar("TklWon/90", player2Metrics["TklWon/90"]), category: "Defending", player: playerName2 },
    { axis: "Recov/90", value: calculatePercentileForRadar("Recov/90", player2Metrics["Recov/90"]), category: "Defending", player: playerName2 },
    { axis: "Fls/90", value: calculatePercentileForRadar("Fls/90", player2Metrics["Fls/90"]), category: "Defending", player: playerName2 },
    { axis: "Clr", value: calculatePercentileForRadar("Clr", player2Metrics["Clr"]), category: "Defending", player: playerName2 },
    { axis: "PasTotAtt", value: calculatePercentileForRadar("PasTotAtt", player2Metrics["PasTotAtt"]), category: "Possession", player: playerName2 },
    { axis: "PasTotCmp%", value: calculatePercentileForRadar("PasTotCmp%", player2Metrics["PasTotCmp%"]), category: "Possession", player: playerName2 },
    { axis: "ToSuc", value: calculatePercentileForRadar("ToSuc", player2Metrics["ToSuc"]), category: "Possession", player: playerName2 }
  ];

  combinedData = [player1Data, player2Data];

  renderRadarChart(combinedData, radarId, data);
}

function updateRadarChart(category) {
  let filteredData;

  if (category === "All") {
    filteredData = combinedData;
  } else {
    filteredData = combinedData.map((playerData) =>
      playerData.filter((d) => d.category === category)
    );
  }

  renderRadarChart(filteredData, "#radarChart", data);
}

document.getElementById("filter-attacking").addEventListener("click", () => {
  document.querySelectorAll(".button-group button").forEach((button) => button.classList.remove("active"));
  document.getElementById("filter-attacking").classList.add("active");
  updateRadarChart("Attacking");
});

document.getElementById("filter-defending").addEventListener("click", () => {
  document.querySelectorAll(".button-group button").forEach((button) => button.classList.remove("active"));
  document.getElementById("filter-defending").classList.add("active");

  updateRadarChart("Defending");
});

document.getElementById("filter-possession").addEventListener("click", () => {
  document.querySelectorAll(".button-group button").forEach((button) => button.classList.remove("active"));
  document.getElementById("filter-possession").classList.add("active");

  updateRadarChart("Possession");
});

document.getElementById("filter-all").addEventListener("click", () => {
  document.querySelectorAll(".button-group button").forEach((button) => button.classList.remove("active"));
  document.getElementById("filter-all").classList.add("active");

  updateRadarChart("All");
});

function renderRadarChart(playerDataRadar, radarId, data) {
  const barChart = document.getElementsByClassName('button-group')[0];
  barChart.style.display = 'flex';
  const width = 400;
  const height = 400;
  const outerWidth = 520;
  const outerHeight = 500;
  const innerRadius = 0;
  const outerRadius = Math.min(width, height) / 2;

  console.log("Rendering radar chart for", playerDataRadar);

  d3.select(radarId).select("svg").remove();

  const svg = d3
    .select(radarId)
    .append("svg")
    .attr("width", outerWidth)
    .attr("height", outerHeight)
    .append("g")
    .attr("transform", `translate(${outerWidth / 2}, ${outerHeight / 2})`);

  const allMetrics = playerDataRadar[0].map((d) => d.axis);
  const angleSlice = (2 * Math.PI) / allMetrics.length;

  const rScale = d3.scaleLinear().range([innerRadius, outerRadius]).domain([0, 100]);

  const levels = 5;
  for (let i = 0; i < levels; i++) {
    svg
      .append("circle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", (outerRadius / levels) * (i + 1))
      .style("fill", "#CDCDCD")
      .style("stroke", "#CDCDCD")
      .style("fill-opacity", 0.1);
  }

  allMetrics.forEach((axis, i) => {
    const angle = i * angleSlice - Math.PI / 2;

    svg
      .append("line")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", outerRadius * Math.cos(angle))
      .attr("y2", outerRadius * Math.sin(angle))
      .style("stroke", "#CDCDCD")
      .style("stroke-width", "1px");

    svg
      .append("text")
      .attr("x", (outerRadius + 10) * Math.cos(angle))
      .attr("y", (outerRadius + 10) * Math.sin(angle))
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

  const colors = ["#ff794a", "#384d81"]; 

  playerDataRadar.forEach((playerData, index) => {
    svg
      .append("path")
      .datum(playerData)
      .attr("d", radarLine)
      .style("fill", colors[index])
      .style("fill-opacity", 0.5)
      .style("stroke", colors[index])
      .style("stroke-width", 2.5);

    playerData.forEach((metric, i) => {
      const angle = i * angleSlice;
      const x = rScale(metric.value) * Math.cos(angle - Math.PI / 2);
      const y = rScale(metric.value) * Math.sin(angle - Math.PI / 2);

      svg
        .append("circle")
        .attr("cx", x)
        .attr("cy", y)
        .attr("r", 4)
        .style("fill", colors[index])
        .style("stroke", "#fff")
        .style("stroke-width", 1.5);
    });
  });

  const legend = svg
    .append("g")
    .attr("transform", `translate(-${outerWidth / 2 - 20}, -${outerHeight / 2 - 20})`);

  playerDataRadar.forEach((playerData, index) => {
    legend
      .append("rect")
      .attr("x", 0)
      .attr("y", index * 20)
      .attr("width", 10)
      .attr("height", 10)
      .style("fill", colors[index]);

    legend
      .append("text")
      .attr("x", 15)
      .attr("y", index * 20 + 9)
      .style("font-size", "12px")
      .text(playerData[0].player);
  });

    const tooltip = d3.select("body")
    .append("div")
    .attr("class", "radar-tooltip")
    .style("position", "absolute")
    .style("background", "white")
    .style("border", "1px solid #ccc")
    .style("border-radius", "5px")
    .style("padding", "8px")
    .style("font-size", "12px")
    .style("pointer-events", "none")
    .style("display", "none");

  playerDataRadar.forEach((playerData, index) => {
    playerData.forEach((metric, i) => {
      const angle = i * angleSlice;
      const x = rScale(metric.value) * Math.cos(angle - Math.PI / 2);
      const y = rScale(metric.value) * Math.sin(angle - Math.PI / 2);

      svg.append("circle")
        .attr("cx", x)
        .attr("cy", y)
        .attr("r", 6)
        .style("fill", colors[index])
        .style("cursor", "pointer")
        .on("mouseover", (event) => {
          tooltip.style("display", "block");
        })
        .on("mousemove", (event) => {
            tooltip
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 20) + "px")
            .html(`
              <strong>Player:</strong> ${metric.player}<br>
              <strong>Metric:</strong> ${data.find(d => d.axis === metric.axis).metric}<br>
              <strong>Value:</strong> ${metric.value.toFixed(1)}<br>
              <strong>Explanation:</strong> ${data.find(d => d.axis === metric.axis).explain}
              <br><strong>Category:</strong> ${data.find(d => d.axis === metric.axis).category}
            `);
        })
        .on("mouseout", () => {
          tooltip.style("display", "none");
        });
    });
  });

}


function createBarChart(player1, player2, chartType, containerId) {
  const barChart = document.getElementById('barChart');
  barChart.style.display = 'block';

  const player1Data = playerData.find(player => player.Player === player1);
  const player2Data = playerData.find(player => player.Player === player2);

  let player1Goals, player2Goals, player1Assists, player2Assists;

  if (chartType === 'goals') {
    player1Goals = player1Data["Goals"];
    player2Goals = player2Data["Goals"];
  } else if (chartType === 'assists') {
    player1Goals = player1Data["Assists"];
    player2Goals = player2Data["Assists"];
  } else if (chartType === 'combined') {
    player1Goals = +player1Data["Goals"];
    player2Goals = +player2Data["Goals"];
    player1Assists = +player1Data["Assists"];
    player2Assists = +player2Data["Assists"];
  }

  const margin = { top: 20, right: 100, bottom: 40, left: 40 };
  const width = 450 - margin.left - margin.right;
  const height = 300 - margin.top - margin.bottom;

  d3.select(`#${containerId} svg`).remove();

  const svg = d3
    .select(`#${containerId}`)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const xScale = d3.scaleLinear()
    .domain([0, Math.max(player1Goals, player2Goals, (chartType === 'combined' ? Math.max(player1Assists + player1Goals, player2Assists + player2Goals) : 0))])
    .range([0, width]);

  const yScale = d3.scaleBand()
    .domain([player1, player2])
    .range([0, height])
    .padding(0.1);

  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(xScale));

  svg.append("g")
    .call(d3.axisLeft(yScale));

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", -25)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("text-decoration", "underline")
    .text(`${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Comparison`);

  const tooltip = d3.select(".tooltip");

  const addBar = (x, y, width, height, color, tooltipText) => {
    svg.append("rect")
      .attr("x", x)
      .attr("y", y)
      .attr("width", width)
      .attr("height", height)
      .style("fill", color)
      .style("cursor", "pointer")
      .on("mouseover", (event) => {
        tooltip
          .style("display", "block")
          .html(tooltipText);
        d3.select(event.currentTarget).style("opacity", 0.7);
      })
      .on("mousemove", (event) => {
        tooltip
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY + 10) + "px");
      })
      .on("mouseout", (event) => {
        tooltip.style("display", "none");
        d3.select(event.currentTarget).style("opacity", 1);
      });
  };

  if (chartType === 'combined') {
    addBar(0, yScale(player1), xScale(player1Goals), yScale.bandwidth() / 2, "#ff794a", `${player1}:<br> Goals: ${player1Goals}`);
    addBar(xScale(player1Goals), yScale(player1), xScale(player1Assists), yScale.bandwidth() / 2, "#ffcc4a", `${player1}:<br>Assists: ${player1Assists}`);

    addBar(0, yScale(player2), xScale(player2Goals), yScale.bandwidth() / 2, "#384d81", `${player2}: <br> Goals: ${player2Goals}`);
    addBar(xScale(player2Goals), yScale(player2), xScale(player2Assists), yScale.bandwidth() / 2, "#4a90e2", `${player2}:<br>Assists: ${player2Assists}`);
  } else {
    addBar(0, yScale(player1), xScale(player1Goals), yScale.bandwidth(), "#ff794a", `${player1}:<br> ${chartType}: ${player1Goals}`);
    addBar(0, yScale(player2), xScale(player2Goals), yScale.bandwidth(), "#384d81", `${player2}:<br>${chartType}: ${player2Goals}`);
  }
}

document.getElementById("chartType").addEventListener("change", () => {
  const chartType = document.getElementById("chartType").value;
  createBarChart(selectedPlayer1, selectedPlayer2, chartType, "barChartContainer");
});
