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
let allPlayerData = [];
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
      const percentage = (
        (d.data.value / d3.sum(data, (d) => d.value)) *
        100
      ).toFixed(1);
      const tooltip = d3.select("#tooltip3");
      tooltip.style("opacity", 1);
      tooltip
        .html(
          `${d.data.label}: ${d.data.value} mins (${percentage}%)<br>Max Possible: ${maxMinutes} mins`
        )
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
    .text((d) =>
      d.data.value > 0
        ? `${((d.data.value / d3.sum(data, (d) => d.value)) * 100).toFixed(1)}%`
        : ""
    )
    .style("fill", "white")
    .style("font-size", "14px")
    .style("pointer-events", "none");

  const legend = svg
    .append("g")
    .attr("transform", `translate(${width - 160}, 40)`); // Desloca para a direita

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


const categoryColors = {
  Attacking: "#49b5ab",  
  Defending: "#f46b5f",  
  Possession: "#f4ca49"  
};



function populatePlayerTable(playerData) {
  d3.select("#table-container").html("");

  const table = d3
    .select("#table-container")
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

  const percentiles = data.map((item) => calculatePercentile(item.dbvalue, item.per90)[0]);
  const maxPercentile = Math.max(...percentiles);
  const minPercentile = Math.min(...percentiles);
  const avgPercentile = (percentiles.reduce((sum, val) => sum + val, 0) / percentiles.length).toFixed(2);


  // Criação da tabela e cabeçalhos
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

  // Corpo da tabela
  const tbody = table.append("tbody");

  // Criação das linhas da tabela
  data.forEach((item) => {
    const row = tbody.append("tr");

    row
    .append("td")
    .style("padding", "5px")
    .style("border", "1px solid #ddd")
    .style("text-align", "left")
    .style("vertical-align", "middle")
    .html(
      `<span style="display: inline-block; width: 12px; height: 12px; background-color: ${categoryColors[item.type]}; border-radius: 50%; margin-right: 8px;"></span>${item.dbvalue}`
    );

    row
      .append("td")
      .text(item.per90)
      .style("padding", "5px")
      .style("border", "1px solid #ddd")
      .style("text-align", "center");

    const [percentileReal, percentileWidth] = calculatePercentile(item.dbvalue, item.per90);

    const percentileCell = row
      .append("td")
      .style("padding", "5px")
      .style("border", "1px solid #ddd")
      .style("text-align", "center");

    percentileCell
      .append("span")
      .text(percentileReal)
      .style("display", "inline-block")
      .style("margin-right", "5px");

    const barWidth = percentileWidth + "%";
    const barColor = getBackgroundColor(percentileReal);

    percentileCell
      .append("div")
      .style("width", barWidth)
      .style("height", "20px")
      .style("background-color", barColor)
      .style("border-radius", "5px")
      .style("display", "inline-block");

    row.select("td:first-child")
      .on("mouseover", function(event) {
        d3.select("#tooltip4")
          .style("opacity", 1)
          .style("cursor", "pointer")
          .html(
            `<strong>Metric:</strong> ${item.metric}<br>
             <strong>Explanation:</strong> ${item.explain}<br>
             <strong>Category:</strong> ${item.type}`
          )
          .style("top", (event.pageY + 10) + "px") 
          .style("left", (event.pageX + 10) + "px");
      })
      .on("mouseout", function() {
        d3.select("#tooltip4").style("opacity", 0);
      });

      row.on("click", () => {
        showModal({
          metric: item.metric,
          explain: item.explain,
          type: item.type,
          per90: item.per90,
          maxPercentile,
          minPercentile,
          avgPercentile,
        });
      });
  });

  // Função de ordenação da tabela
  let sortOrder = "asc";
  function sortTable(column) {
    const sortedData = data.sort((a, b) => {
      if (column === "percentile") {
        const [percentileA] = calculatePercentile(a.dbvalue, a.per90);
        const [percentileB] = calculatePercentile(b.dbvalue, b.per90);
        return sortOrder === "asc" ? percentileB - percentileA : percentileA - percentileB;
      }
      return sortOrder === "asc" ? (a[column] > b[column] ? 1 : -1) : (a[column] < b[column] ? 1 : -1);
    });

    sortOrder = sortOrder === "asc" ? "desc" : "asc";

    tbody.html("");
    sortedData.forEach((item) => {
      const row = tbody.append("tr");

      row
        .append("td")
        .text(item.dbvalue)
        .style("padding", "5px")
        .style("border", "1px solid #ddd")
        .style("text-align", "left");

      row
        .append("td")
        .text(item.per90)
        .style("padding", "5px")
        .style("border", "1px solid #ddd")
        .style("text-align", "center");

      const [percentileReal, percentileWidth] = calculatePercentile(item.dbvalue, item.per90);

      const percentileCell = row
        .append("td")
        .style("padding", "5px")
        .style("border", "1px solid #ddd")
        .style("text-align", "center");

      percentileCell
        .append("span")
        .text(percentileReal)
        .style("display", "inline-block")
        .style("margin-right", "5px");

      const barWidth = percentileWidth + "%";
      const barColor = getBackgroundColor(percentileReal);

      percentileCell
        .append("div")
        .style("width", barWidth)
        .style("height", "20px")
        .style("background-color", barColor)
        .style("border-radius", "5px")
        .style("display", "inline-block");

        row.select("td:first-child")
        .on("mouseover", function(event) {
          d3.select("#tooltip4")
            .style("opacity", 1)
            .style("cursor", "pointer")
            .html(
              `<strong>Metric:</strong> ${item.metric}<br>
               <strong>Explanation:</strong> ${item.explain}<br>
               <strong>Category:</strong> ${item.type}`
            )
            .style("top", (event.pageY + 10) + "px") 
            .style("left", (event.pageX + 10) + "px");
        })
        .on("mouseout", function() {
          d3.select("#tooltip4").style("opacity", 0);
        });
    });
  }
}

function calculatePercentile(metric, value) {
  const allValues = allPlayerData.map((player) => player[metric]);

  allValues.sort((a, b) => a - b);

  const rank = allValues.indexOf(value) + 1;

  const percentile = (rank / allValues.length) * 100;

  const adjustedPercentile = (percentile / 100) * 85;
  return [Math.round(percentile), Math.round(adjustedPercentile)];
}

function getBackgroundColor(number) {
  if (number >= 90) return "#4CAF50"; 
  else if (number >= 70) return "#8BC34A"; 
  else if (number >= 50) return "#CDDC39"; 
  else if (number >= 30) return "#FFC107"; 
  else if (number >= 15) return "#FF5722"; 
  else return "#F44336"; 
}

function calculatePercentileForRadar(metric, value) {
  const allValues = allPlayerData.map((player) => player[metric]);

  allValues.sort((a, b) => a - b);

  const rank = allValues.indexOf(value) + 1;

  const percentile = (rank / allValues.length) * 100;

  return Math.round(percentile);
}

function getPlayerMetrics(playerData) {
  const data = [
    { axis: "Shots/90", value: calculatePercentileForRadar("Shots/90", playerData["Shots/90"]), category: "Attacking", metric: "Shots", explain: "Shots per 90 minutes" },
    { axis: "SoT/90", value: calculatePercentileForRadar("SoT/90", playerData["SoT/90"]), category: "Attacking", metric: "Shots on Target", explain: "Shots on Target per 90 minutes" },
    { axis: "Goals/90", value: calculatePercentileForRadar("Goals/90", playerData["Goals/90"]), category: "Attacking", metric: "Goals", explain: "Goals per 90 minutes" },
    { axis: "Assists/90", value: calculatePercentileForRadar("Assists/90", playerData["Assists/90"]), category: "Attacking", metric: "Assists", explain: "Assists per 90 minutes" },
    { axis: "SCA", value: calculatePercentileForRadar("SCA", playerData["SCA"]), category: "Attacking", metric: "Shot Creating Actions", explain: "Shot Creating Actions per 90 minutes" },
    { axis: "Int/90", value: calculatePercentileForRadar("Int/90", playerData["Int/90"]), category: "Defending", metric: "Interceptions", explain: "Interceptions per 90 minutes" },
    { axis: "TklWon/90", value: calculatePercentileForRadar("TklWon/90", playerData["TklWon/90"]), category: "Defending", metric: "Tackles Won", explain: "Tackles Won per 90 minutes" },
    { axis: "Recov/90", value: calculatePercentileForRadar("Recov/90", playerData["Recov/90"]), category: "Defending", metric: "Recoveries", explain: "Recoveries per 90 minutes" },
    { axis: "Fls/90", value: calculatePercentileForRadar("Fls/90", playerData["Fls/90"]), category: "Defending", metric: "Fouls", explain: "Fouls per 90 minutes" },
    { axis: "Clr", value: calculatePercentileForRadar("Clr", playerData["Clr"]), category: "Defending", metric: "Clearances", explain: "Clearances per 90 minutes" },
    { axis: "PasTotAtt", value: calculatePercentileForRadar("PasTotAtt", playerData["PasTotAtt"]), category: "Possession", metric: "Passes Attempted", explain: "Passes Attempted per 90 minutes" },
    { axis: "PasTotCmp%", value: calculatePercentileForRadar("PasTotCmp%", playerData["PasTotCmp%"]), category: "Possession", metric: "Pass Completion %", explain: "Pass Completion % per 90 minutes" },
    { axis: "ToSuc", value: calculatePercentileForRadar("ToSuc", playerData["ToSuc"]), category: "Possession", metric: "Take-Ons Successful", explain: "Dribbling Defender Successful per 90 minutes" }
  ];
  
  renderHeatmap(playerData);
  renderRadarChart(data);
}
function renderRadarChart(playerData) {
  const width = 400;  
  const height = 400; 
  const outerWidth = 520; 
  const outerHeight = 500; 
  const innerRadius = 0;
  const outerRadius = Math.min(width, height) / 2;

  const svg = d3
    .select("#radarChart")
    .append("svg")
    .attr("width", outerWidth)
    .attr("height", outerHeight)
    .append("g")
    .attr("transform", `translate(${outerWidth / 2}, ${outerHeight / 2})`); 

  const radarData = playerData;

  const allMetrics = radarData.map((d) => d.axis);
  const values = radarData.map((d) => d.value);

  const angleScale = d3
    .scaleBand()
    .domain(allMetrics)
    .range([0, 2 * Math.PI])
    .padding(0.1);

  const radiusScale = d3
    .scaleLinear()
    .domain([0, 100])
    .range([innerRadius, outerRadius]);

  const numCircles = 5;
  const circleData = d3.range(1, numCircles + 1).map((level) => {
    return allMetrics.map((metric) => {
      return {
        axis: metric,
        value: (level / numCircles) * 100,
      };
    });
  });

  svg
    .selectAll(".grid-circle")
    .data(circleData)
    .join("path")
    .attr("class", "grid-circle")
    .attr("d", (d) => {
      return d
        .map((point, i) => {
          const angle = angleScale(point.axis);
          const radius = radiusScale(point.value);
          const x = radius * Math.cos(angle);
          const y = radius * Math.sin(angle);
          return `${i === 0 ? "M" : "L"} ${x} ${y}`;
        })
        .join(" ") + " Z";
    })
    .attr("fill", "none")
    .attr("stroke", "#ccc")
    .attr("stroke-width", 1);

    svg
    .selectAll(".slice")
    .data(radarData)
    .join("path")
    .attr("class", "slice")
    .attr("d", (d, i) => {
      const angle = angleScale(d.axis);
      const nextAngle = angleScale(allMetrics[i + 1] || allMetrics[0]);
      const radius = radiusScale(d.value);
      const x0 = radius * Math.cos(angle);
      const y0 = radius * Math.sin(angle);
      const x1 = radius * Math.cos(nextAngle);
      const y1 = radius * Math.sin(nextAngle);
      return `
        M 0 0
        L ${x0} ${y0}
        A ${radius} ${radius} 0 0 1 ${x1} ${y1}
        L 0 0
      `;
    })
    .style("stroke", "#fff")
    .style("stroke-width", 1)
    .attr("fill", (d) => categoryColors[d.category])
    .on("mouseover", function(event, d) {
      
      d3.select(this)
        .style("cursor", "pointer")
        .style("opacity", 0.8);
      
      d3.select("#tooltip4")
        .style("opacity", 1)  
        .html(
          `${d.axis} - ${d.explain}<br>
           ${d.metric} - ${d.value}%`
        )
        .style("top", (event.pageY + 10) + "px")  
        .style("left", (event.pageX + 10) + "px");
    })
    .on("mouseout", function() {
      d3.select(this)
        .style("opacity", 1)
        .style("stroke", "none");  
      
      d3.select("#tooltip4")
        .style("opacity", 0);
    });

    svg
      .selectAll(".metric-label")
      .data(radarData)
      .join("text")
      .attr("class", "metric-label")
      .attr("x", (d) => {
        const angle = angleScale(d.axis) + angleScale.bandwidth() / 2;
        const labelRadius = outerRadius + 10;
        return labelRadius * Math.cos(angle);
      })
      .attr("y", (d) => {
        const angle = angleScale(d.axis) + angleScale.bandwidth() / 2;
        const labelRadius = outerRadius + 10;
        return labelRadius * Math.sin(angle);
      })
      .style("text-anchor", "middle")
      .attr("dy", "1em")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .text((d) => `${d.axis} (${d.value}%)`);

      const legendData = [
        { category: "Attacking", color: categoryColors["Attacking"] },
        { category: "Defending", color: categoryColors["Defending"] },
        { category: "Possession", color: categoryColors["Possession"] },
      ];
    
      const legend = svg
        .append("g")
        .attr("transform", "translate(0, -10)"); // Ajustando a posição para cima
    

        legend
          .selectAll(".legend-circle")
          .data(legendData)
          .join("circle")
          .attr("class", "legend-circle")
          .attr("cx", (d, i) => -100 + i * 100)  // Espaço entre as bolinhas
          .attr("cy", -outerRadius - 30)  // Posição vertical no topo
          .attr("r", 8)
          .attr("fill", (d) => d.color);

        legend
          .selectAll(".legend-text")
          .data(legendData)
          .join("text")
          .attr("class", "legend-text")
          .attr("x", (d, i) => -80 + i * 100)  // Alinhando com as bolinhas
          .attr("y", -outerRadius - 26)  // Posição do texto próximo às bolinhas
          .style("text-anchor", "start")
          .style("font-size", "12px")
          .style("font-weight", "bold")
          .text((d) => d.category);

      
}

function renderHeatmap(playerData, metricType = "tackles") {  // Define default metricType as "tackles"
  const svg = d3.select("#field2");
  const width = +svg.attr("width");
  const height = +svg.attr("height");

  // Prepare data for tackles and touches
  const metricsData = {
    tackles: {
      TklDef3rd: playerData.TklDef3rd || 0,
      TklMid3rd: playerData.TklMid3rd || 0,
      TklAtt3rd: playerData.TklAtt3rd || 0,
    },
    touches: {
      TchDef3rd: playerData.TouDef3rd || 0,
      TchMid3rd: playerData.TouMid3rd || 0,
      TchAtt3rd: playerData.TouAtt3rd || 0,
    }
  };

  // Function to get the data based on selected metric
  function getMetricData(metricType) {
    const metric = metricsData[metricType];
    return [
      { name: "Defensive", value: metric[`TklDef3rd`] || metric[`TchDef3rd`] },
      { name: "Middfield", value: metric[`TklMid3rd`] || metric[`TchMid3rd`] },
      { name: "Attacking", value: metric[`TklAtt3rd`] || metric[`TchAtt3rd`] }
    ];
  }

  // Function to render the heatmap
  function render() {
    const thirdData = getMetricData(metricType);

    // Calculate the maximum value for the color scale
    const maxMetric = d3.max(thirdData, (d) => d.value);

    // Define the color scale (Inverted: lower values = green, higher values = red)
    const colorScale = d3
      .scaleLinear()
      .domain([0, maxMetric / 2, maxMetric || 1])
      .range(["#00ff00", "#ffff00", "#ff0000"]); // Green to yellow to red

    svg.selectAll("*").remove(); // Clear previous elements

    // Draw football field layout (same as before)
    drawField(svg, width, height);

    // Apply heatmap to the vertical thirds
    const thirdWidth = width / 3;
    thirdData.forEach((third, i) => {
      svg
        .append("rect")
        .attr("x", i * thirdWidth + 10) // Avoid overlap with field lines
        .attr("y", 10) // Avoid overlap with field lines
        .attr("width", thirdWidth - 20) // Avoid overlap with field lines
        .attr("height", height - 20)
        .attr("fill", colorScale(third.value))
        .attr("opacity", 0.7);

      // Add labels
      svg
        .append("text")
        .attr("x", i * thirdWidth + thirdWidth / 2)
        .attr("y", height / 2)
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")
        .text(`${third.name}`)
        .style("fill", "#000")
        .style("font-size", "14px")
        .style("font-weight", "bold");

      // Add the value text
      svg
        .append("text")
        .attr("x", i * thirdWidth + thirdWidth / 2)
        .attr("y", height / 2 + 20)
        .attr("text-anchor", "middle")
        .text(`${third.value}`)
        .style("fill", "#000")
        .style("font-size", "14px")
        .style("font-weight", "bold");
    });

    // Render the scale
    renderIndicativeScale(maxMetric);

    // Update the title based on the selected metric
    updateTitle(metricType);
  }

  // Function to render field layout
  function drawField(svg, width, height) {
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
  }

  // Function to render the scale
  function renderIndicativeScale(maxMetric) {
    const scaleSvg = d3.select("#indicative-scale");
    const width = +scaleSvg.attr("width");
    const height = +scaleSvg.attr("height");

    scaleSvg.selectAll("*").remove();

    const gradient = scaleSvg
      .append("defs")
      .append("linearGradient")
      .attr("id", "scaleGradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "0%");

    gradient.append("stop").attr("offset", "0%").attr("stop-color", "#00ff00"); // Green
    gradient.append("stop").attr("offset", "50%").attr("stop-color", "#ffff00"); // Yellow
    gradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#ff0000"); // Red

    scaleSvg
      .append("rect")
      .attr("x", 10)
      .attr("y", 10)
      .attr("width", width - 20)
      .attr("height", 20)
      .style("fill", "url(#scaleGradient)")
      .attr("stroke", "#000");

    // Add scale labels
    scaleSvg
      .append("text")
      .attr("x", 10)
      .attr("y", 45)
      .attr("text-anchor", "start")
      .text("0")
      .style("fill", "#000")
      .style("font-size", "12px");

    scaleSvg
      .append("text")
      .attr("x", width - 10)
      .attr("y", 45)
      .attr("text-anchor", "end")
      .text(`${maxMetric}`)
      .style("fill", "#000")
      .style("font-size", "12px");
  }

  // Function to update the title based on the selected metric
  function updateTitle(metricType) {
    const title = metricType === "tackles" ? "Tackles Heatmap" : "Touches Heatmap";
    d3.select("#heatmap-title")
      .text(title) // Set the new title based on metric
      .style("font-size", "18px")
      .style("font-weight", "bold")
      .style("text-anchor", "middle")
      .style("fill", "#000");
  }

  // Event listener for metric dropdown change
  d3.select("#metric-dropdown").on("change", function() {
    const selectedMetric = this.value;
    renderHeatmap(playerData, selectedMetric); // Re-render heatmap based on selection
  });

  // Initial render with default metric (tackles)
  render();
}

function showModal(data) {
  console.log("showModal called with data:", data);

  if (!d3.select("#modal").node()) {
    console.error("#modal element is missing in the DOM.");
  }
  
  if (!d3.select("#modal-overlay").node()) {
    console.error("#modal-overlay element is missing in the DOM.");
  }

  d3.select("#modal-content").html(`
    <p><strong>Metric:</strong> ${data.metric}</p>
    <p><strong>Description:</strong> ${data.explain}</p>
    <p><strong>Category:</strong> ${data.type}</p>
    <p><strong>Per 90:</strong> ${data.per90}</p>
    <p><strong>Max Percentile:</strong> ${data.maxPercentile}</p>
    <p><strong>Min Percentile:</strong> ${data.minPercentile}</p>
    <p><strong>Average Percentile:</strong> ${data.avgPercentile}</p>
  `);

  d3.select("#modal").style("display", "block");
  d3.select("#modal-overlay").style("display", "block");

  d3.select("#modal-close").on("click", function () {
    d3.select("#modal").style("display", "none");
    d3.select("#modal-overlay").style("display", "none");
  });
  
  d3.select("#modal-overlay").on("click", function () {
    d3.select("#modal").style("display", "none");
    d3.select("#modal-overlay").style("display", "none");
  });
}


