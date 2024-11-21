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

  displayPlayerStats(selectedPlayer1, 'player1Stats');
  displayPlayerStats(selectedPlayer2, 'player2Stats');
  searchPlayer(selectedPlayer1, 'playerImage');
  searchPlayer(selectedPlayer2, 'playerImage2'); 
  getPlayerMetrics(selectedPlayer1, selectedPlayer2, '#radarChart');
  createScatterPlot(selectedPlayer1, selectedPlayer2, playerData, 'scatterChart');
});


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

function createScatterPlot(playerName1, playerName2, allPlayerData, containerId) {
  // Extract data for the two players
  const player1Metrics = allPlayerData.find((row) => row.Player === playerName1);
  const player2Metrics = allPlayerData.find((row) => row.Player === playerName2);

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

  // Highlight Player 1's point in red
  if (player1Metrics) {
    svg
      .append("circle")
      .attr("cx", xScale(player1Metrics.Tkl))
      .attr("cy", yScale(player1Metrics.TklWon))
      .attr("r", 6)
      .style("fill", "red")
      .style("stroke", "black")
      .style("stroke-width", 1.5)
      .attr("class", "highlight");
  }

  // Highlight Player 2's point in blue
  if (player2Metrics) {
    svg
      .append("circle")
      .attr("cx", xScale(player2Metrics.Tkl))
      .attr("cy", yScale(player2Metrics.TklWon))
      .attr("r", 6)
      .style("fill", "blue")
      .style("stroke", "black")
      .style("stroke-width", 1.5)
      .attr("class", "highlight");
  }
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

function getPlayerMetrics(playerName1, playerName2, radarId) {
  // Get metrics for the first player
  const player1Metrics = playerData.find(row => row.Player === playerName1);
  console.log("Getting metrics for player 1:", playerName1, player1Metrics);

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

  // Get metrics for the second player
  const player2Metrics = playerData.find(row => row.Player === playerName2);
  console.log("Getting metrics for player 2:", playerName2, player2Metrics);

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

  // Combine data for both players
  const combinedData = [player1Data, player2Data];

  // Render radar chart with combined data
  renderRadarChart(combinedData, radarId);
}


function renderRadarChart(playerDataRadar, radarId) {
  const width = 400;
  const height = 400;
  const outerWidth = 520;
  const outerHeight = 500;
  const innerRadius = 0;
  const outerRadius = Math.min(width, height) / 2;

  console.log("Rendering radar chart for", playerDataRadar);

  // Clear the previous chart if it exists
  d3.select(radarId).select("svg").remove();

  const svg = d3
    .select(radarId)
    .append("svg")
    .attr("width", outerWidth)
    .attr("height", outerHeight)
    .append("g")
    .attr("transform", `translate(${outerWidth / 2}, ${outerHeight / 2})`);

  // Get the unique axes (metrics) from the first player's data
  const allMetrics = playerDataRadar[0].map((d) => d.axis);
  const angleSlice = (2 * Math.PI) / allMetrics.length;

  // Create a scale for the radius
  const rScale = d3.scaleLinear().range([innerRadius, outerRadius]).domain([0, 100]);

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

  // Draw the axes and labels
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

  // Define the radar line function
  const radarLine = d3
    .lineRadial()
    .radius((d) => rScale(d.value))
    .angle((d, i) => i * angleSlice)
    .curve(d3.curveLinearClosed);

  // Define colors for players
  const colors = ["#66bb6a", "#1f77b4", "#ff7f0e"]; // Extend for more players

  // Draw radar areas and points for each player
  playerDataRadar.forEach((playerData, index) => {
    // Draw the radar area
    svg
      .append("path")
      .datum(playerData)
      .attr("d", radarLine)
      .style("fill", colors[index])
      .style("fill-opacity", 0.5)
      .style("stroke", colors[index])
      .style("stroke-width", 2);

    // Draw data points
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

  // Add legend
  const legend = svg
    .append("g")
    .attr("transform", `translate(-${outerWidth / 2 - 20}, -${outerHeight / 2 - 20})`);

  playerDataRadar.forEach((_, index) => {
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
      .text(`Player ${index + 1}`);
  });
}
