let selectedPlayer1 = null;
let selectedPlayer2 = null;
let playerData = []; // Store the complete player data from CSV

function loadPlayers() {
  Papa.parse('./data/player_stats.csv', {
    download: true,
    header: true,
    complete: (results) => {
      playerData = results.data;
      players = results.data.map(row => row.Player);  
      
    },
    error: (error) => {
      console.error("Error loading CSV:", error);
    }
  });

}

loadPlayers();

function displayPlayerStats(playerName, statsId, scatterId) {
  const player = playerData.find(row => row.Player === playerName);
  const statsContainer = document.getElementById(statsId);

  // createScatterPlot(player, playerData, `${scatterId}`);

  //ativar e resolver bugs
  populatePlayerTable(player, playerData, statsId);
  // renderRadarChart(player, playerData, '#radarChart1');
  // renderRadarChart(player, playerData, '#radarChart2');

  if (player) {
    statsContainer.innerHTML = `
      <p><strong>Player:</strong> ${player.Player}</p>
      <p><strong>Nation:</strong> ${player.Nation}</p>
      <p><strong>Position:</strong> ${player.Position}</p>
      <p><strong>Age:</strong> ${player.Age}</p>
      <p><strong>Competition:</strong> ${player.Comp}</p>
      <p><strong>Team:</strong> ${player.Squad}</p>
      <p><strong>Goals:</strong> ${player.Goals}</p>
      <p><strong>Assists:</strong> ${player.Assists}</p>
      <p><strong>Matches:</strong> ${player.MP}</p>
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

  displayPlayerStats(selectedPlayer1, 'player1Stats', 'player1ScatterContainer');
  displayPlayerStats(selectedPlayer2, 'player2Stats', 'player2ScatterContainer');
  searchPlayer(selectedPlayer1, 'playerImage');
  searchPlayer(selectedPlayer2, 'playerImage2'); 
  getPlayerMetrics(selectedPlayer1, '#radarChart1');
  getPlayerMetrics(selectedPlayer2, '#radarChart2');
});

function populatePlayerTable(playerData, allPlayerData, playerId) {
  const statValues = calculateStats(playerData, allPlayerData);

  // Determine which player's table to update based on playerId
  const tableContainerId = playerId === 'player1' ? '#player1TableContainer' : '#player2TableContainer';
  console.log("Updating table for player", playerId);

  d3.select(tableContainerId).html(""); // Clear any existing table

  const table = d3
    .select(tableContainerId)
    .append("table")
    .style("border-collapse", "collapse")
    .style("width", "100%");

  const data = [
    {
      dbvalue: "Shots/90",
      type: "Attacking",
      metric: "Shots",
      per90: playerData["Shots/90"],
      explain: "Shots per 90 minutes",
    },
    {
      dbvalue: "SoT/90",
      type: "Attacking",
      metric: "Shots on Target",
      per90: playerData["SoT/90"],
      explain: "Shots on Target per 90 minutes",
    },
    {
      dbvalue: "Goals/90",
      type: "Attacking",
      metric: "Goals",
      per90: playerData["Goals/90"],
      explain: "Goals per 90 minutes",
    },
    {
      dbvalue: "Assists/90",
      type: "Attacking",
      metric: "Assists",
      per90: playerData["Assists/90"],
      explain: "Assists per 90 minutes",
    },
    {
      dbvalue: "SCA",
      type: "Attacking",
      metric: "Shot Creating Actions",
      per90: playerData["SCA"],
      explain: "Shot Creating Actions per 90 minutes",
    },
    {
      dbvalue: "Int/90",
      type: "Defending",
      metric: "Interceptions",
      per90: playerData["Int/90"],
      explain: "Interceptions per 90 minutes",
    },
    {
      dbvalue: "TklWon/90",
      type: "Defending",
      metric: "Tackles Won",
      per90: playerData["TklWon/90"],
      explain: "Tackles Won per 90 minutes",
    },
    {
      dbvalue: "Recov/90",
      type: "Defending",
      metric: "Recoveries",
      per90: playerData["Recov/90"],
      explain: "Recoveries per 90 minutes",
    },
    {
      dbvalue: "Fls/90",
      type: "Defending",
      metric: "Fouls",
      per90: playerData["Fls/90"],
      explain: "Fouls per 90 minutes",
    },
    {
      dbvalue: "Clr",
      type: "Defending",
      metric: "Clearances",
      per90: playerData["Clr"],
      explain: "Clearances per 90 minutes",
    },
    {
      dbvalue: "PasTotAtt",
      type: "Possession",
      metric: "Passes Attempted",
      per90: playerData["PasTotAtt"],
      explain: "Passes Attempted per 90 minutes",
    },
    {
      dbvalue: "PasTotCmp%",
      type: "Possession",
      metric: "Pass Completion %",
      per90: playerData["PasTotCmp%"],
      explain: "Pass Completion % per 90 minutes",
    },
    {
      dbvalue: "ToSuc",
      type: "Possession",
      metric: "Take-Ons Successful",
      per90: playerData["ToSuc"],
      explain: "Dribbling defender Successful per 90 minutes",
    },
  ];

  // Create table headers
  const header = table.append("thead").append("tr");
  header
    .append("th")
    .text("Statistic")
    .style("padding", "8px")
    .style("border", "1px solid #ddd")
    .style("width", "30%")
    .style("text-align", "center")
    .style("background-color", "#f4f4f4")
    .style("cursor", "pointer")
    .on("click", () => sortTable("metric"));

  header
    .append("th")
    .text("Per 90")
    .style("width", "20%")
    .style("text-align", "center")
    .style("padding", "8px")
    .style("border", "1px solid #ddd")
    .style("background-color", "#f4f4f4")
    .style("cursor", "pointer")
    .on("click", () => sortTable("per90"));

  header
    .append("th")
    .text("Percentile")
    .style("text-align", "center")
    .style("padding", "8px")
    .style("border", "1px solid #ddd")
    .style("background-color", "#f4f4f4")
    .style("cursor", "pointer")
    .on("click", () => sortTable("percentile"));

  // Append data rows to the table
  const rows = table.append("tbody").selectAll("tr").data(data).enter().append("tr");

  rows
    .append("td")
    .text((d) => d.metric)
    .style("padding", "8px")
    .style("border", "1px solid #ddd")
    .style("text-align", "center");

  rows
    .append("td")
    .text((d) => d.per90)
    .style("padding", "8px")
    .style("border", "1px solid #ddd")
    .style("text-align", "center");

  rows
    .append("td")
    .text((d) => statValues[d.dbvalue])
    .style("padding", "8px")
    .style("border", "1px solid #ddd")
    .style("text-align", "center");
}

// Calculate Percentile for the player
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

function createScatterPlot(playerData, allPlayerData, containerId) {
  console.log("Creating scatter plot for", playerData.Tkl, playerData.TklWon);

  // Set dimensions for the scatter plot
  const margin = { top: 20, right: 20, bottom: 40, left: 40 };
  const width = 400 - margin.left - margin.right;
  const height = 300 - margin.top - margin.bottom;

  // Remove existing SVG if present
  d3.select(`#${containerId} svg`).remove();

  // Create SVG container
  const svg = d3
    .select(`#${containerId}`)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Create scales with fixed domains
  const xScale = d3.scaleLinear().domain([0, 10]).range([0, width]);
  const yScale = d3.scaleLinear().domain([0, 100]).range([height, 0]);

  // Add axes
  svg
    .append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(xScale));
  svg.append("g").call(d3.axisLeft(yScale));

  // Add labels
  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", height + margin.bottom - 10)
    .style("text-anchor", "middle")
    .text("Tackles (Tkl)");

  svg
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -margin.left + 10)
    .style("text-anchor", "middle")
    .text("Tackles Won (TklWon)");

  // Plot all points
  svg
    .selectAll(".dot")
    .data(allPlayerData)
    .enter()
    .append("circle")
    .attr("cx", (d) => xScale(d.Tkl))
    .attr("cy", (d) => yScale(d.TklWon))
    .attr("r", 4)
    .style("fill", "gray");

  // Highlight the selected player's point in red
  svg
    .append("circle")
    .attr("cx", xScale(playerData.Tkl))
    .attr("cy", yScale(playerData.TklWon))
    .attr("r", 6)
    .style("fill", "red");
}

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
      // quando da erro na busca do jogador, exibe o quadrado cinza, a dizer no meio "No image available"
      const playerImage = document.getElementById(imageId);
      playerImage.src = "./assets/no-image-available.jpg";
      playerImage.alt = "No image available";

      playerImage.closest('.player-image-container').style.display = 'block';
    });
}

function calculatePercentileForRadar(metric, value) {
  const allValues = playerData.map((player) => player[metric]);

  allValues.sort((a, b) => a - b);

  const rank = allValues.indexOf(value) + 1;

  const percentile = (rank / allValues.length) * 100;

  return Math.round(percentile);
}

function getPlayerMetrics(playerName, radarId) {
  const playerInMet = playerData.find(row => row.Player === playerName);
  console.log("Getting metrics for player", playerInMet);
  const data = [
    { axis: "Shots/90", value: calculatePercentileForRadar("Shots/90", playerInMet["Shots/90"]), category: "Attacking", metric: "Shots", explain: "Shots per 90 minutes" },
    { axis: "SoT/90", value: calculatePercentileForRadar("SoT/90", playerInMet["SoT/90"]), category: "Attacking", metric: "Shots on Target", explain: "Shots on Target per 90 minutes" },
    { axis: "Goals/90", value: calculatePercentileForRadar("Goals/90", playerInMet["Goals/90"]), category: "Attacking", metric: "Goals", explain: "Goals per 90 minutes" },
    { axis: "Assists/90", value: calculatePercentileForRadar("Assists/90", playerInMet["Assists/90"]), category: "Attacking", metric: "Assists", explain: "Assists per 90 minutes" },
    { axis: "SCA", value: calculatePercentileForRadar("SCA", playerInMet["SCA"]), category: "Attacking", metric: "Shot Creating Actions", explain: "Shot Creating Actions per 90 minutes" },
    { axis: "Int/90", value: calculatePercentileForRadar("Int/90", playerInMet["Int/90"]), category: "Defending", metric: "Interceptions", explain: "Interceptions per 90 minutes" },
    { axis: "TklWon/90", value: calculatePercentileForRadar("TklWon/90", playerInMet["TklWon/90"]), category: "Defending", metric: "Tackles Won", explain: "Tackles Won per 90 minutes" },
    { axis: "Recov/90", value: calculatePercentileForRadar("Recov/90", playerInMet["Recov/90"]), category: "Defending", metric: "Recoveries", explain: "Recoveries per 90 minutes" },
    { axis: "Fls/90", value: calculatePercentileForRadar("Fls/90", playerInMet["Fls/90"]), category: "Defending", metric: "Fouls", explain: "Fouls per 90 minutes" },
    { axis: "Clr", value: calculatePercentileForRadar("Clr", playerInMet["Clr"]), category: "Defending", metric: "Clearances", explain: "Clearances per 90 minutes" },
    { axis: "PasTotAtt", value: calculatePercentileForRadar("PasTotAtt", playerInMet["PasTotAtt"]), category: "Possession", metric: "Passes Attempted", explain: "Passes Attempted per 90 minutes" },
    { axis: "PasTotCmp%", value: calculatePercentileForRadar("PasTotCmp%", playerInMet["PasTotCmp%"]), category: "Possession", metric: "Pass Completion %", explain: "Pass Completion % per 90 minutes" },
    { axis: "ToSuc", value: calculatePercentileForRadar("ToSuc", playerInMet["ToSuc"]), category: "Possession", metric: "Take-Ons Successful", explain: "Dribbling Defender Successful per 90 minutes" }
  ];
  
  // renderHeatmap(playerData);
  renderRadarChart(data, radarId);
}


function renderRadarChart(playerDataRadar, radarId) {
  const width = 400;  
  const height = 400; 
  const outerWidth = 520; 
  const outerHeight = 500; 
  const innerRadius = 0;
  const outerRadius = Math.min(width, height) / 2;

  console.log("Rendering radar chart for", playerDataRadar);

  const svg = d3
    .select(radarId)
    .append("svg")
    .attr("width", outerWidth)
    .attr("height", outerHeight)
    .append("g")
    .attr("transform", `translate(${outerWidth / 2}, ${outerHeight / 2})`); 

  // Extract axis names and values from playerData
  const allMetrics = playerDataRadar.map((d) => d.axis);
  const values = playerDataRadar.map((d) => d.value);
  console.log(values);

  // Define the angle between each axis
  const angleSlice = (2 * Math.PI) / allMetrics.length;

  // Create a scale for the radius based on the percentile values
  const rScale = d3.scaleLinear().range([innerRadius, outerRadius]).domain([0, 100]); // Assuming values range from 0 to 100
  
  // Draw the background concentric circles
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

  // Draw axes and axis labels
  allMetrics.forEach((axis, i) => {
    const angle = i * angleSlice;

    // Draw axis lines
    svg
      .append("line")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", outerRadius * Math.cos(angle))
      .attr("y2", outerRadius * Math.sin(angle))
      .style("stroke", "#CDCDCD")
      .style("stroke-width", "1px");

    // Add axis labels (metric names)
    svg
      .append("text")
      .attr("x", (outerRadius + 10) * Math.cos(angle))
      .attr("y", (outerRadius + 10) * Math.sin(angle))
      .attr("dy", "0.35em")
      .style("font-size", "11px")
      .style("text-anchor", "middle")
      .text(axis);
  });

  // Define the radar line function to draw the chart area
  const radarLine = d3
    .lineRadial()
    .radius((d) => rScale(d.value))  // Use the value for scaling
    .angle((d, i) => i * angleSlice)
    .curve(d3.curveLinearClosed);

  // Draw the radar chart area (the filled area representing the metrics)
  svg
    .append("path")
    .datum(playerDataRadar)  // Use the playerData as the input
    .attr("d", radarLine)
    .style("fill", "#66bb6a")
    .style("fill-opacity", 0.5)
    .style("stroke", "#66bb6a")
    .style("stroke-width", 2);

  // Draw the data points (percentiles) on the radar chart
  playerDataRadar.forEach((metric, i) => {
    const angle = i * angleSlice;
    const x = rScale(metric.value) * Math.cos(angle - Math.PI / 2);
    const y = rScale(metric.value) * Math.sin(angle - Math.PI / 2);

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
