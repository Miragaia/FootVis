let allPlayerData = [];

Papa.parse("./data/player_stats.csv", {
  download: true,
  header: true,
  complete: function (results) {
    allPlayerData = results.data;
    console.log("Player Data Loaded:", allPlayerData);


    displayPlayerStatsChart("top-scorers");
    displayOtherStatsChart();
    displayPositionDonutChart();
  }
});

function displayPlayerStatsChart(chartType) {
  const chartContainer = d3.select("#player-stats-chart");
  chartContainer.html(""); 

  const margin = { top: 40, right: 30, bottom: 40, left: 60 };
  const width = 750 - margin.left - margin.right;
  const height = 330 - margin.top - margin.bottom;

  const data =
    chartType === "top-scorers"
      ? allPlayerData
          .map(player => ({ name: player.Player, value: parseFloat(player.Goals) }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 10)
      : allPlayerData
          .map(player => ({ name: player.Player, value: parseFloat(player.Assists) }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 10);

  const svg = chartContainer
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left*2  + "," + margin.top + ")");

  const x = d3.scaleBand()
    .domain(data.map(player => player.name))
    .range([0, width])
    .padding(0.1);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, player => player.value)])
    .nice()
    .range([height, 0]);

  const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .style("background-color", "#333")
    .style("color", "#fff")
    .style("padding", "5px")
    .style("border-radius", "5px")
    .style("font-size", "12px")
    .style("pointer-events", "none");

  svg.selectAll(".bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", player => x(player.name))
    .attr("y", player => y(player.value))
    .attr("width", x.bandwidth())
    .attr("height", player => height - y(player.value))
    .attr("fill", chartType === "top-scorers" ? "#78a798" : "#d69fa1")
    .style("cursor", "pointer") 
    .on("mouseover", function(event, player) {
      d3.select(this).style("opacity", 1); 

      tooltip.style("visibility", "visible")
        .html(`${player.name} - ${player.value}`)
        .style("top", (event.pageY - 20) + "px") 
        .style("left", (event.pageX + 10) + "px"); 

      svg.selectAll(".bar")
        .filter(function(d) { return d !== player; })
        .style("opacity", 0.7);
    })

    .on("mouseout", function() {
      d3.select(this).style("opacity", 1); 
      tooltip.style("visibility", "hidden"); 

      svg.selectAll(".bar")
        .style("opacity", 1);
    });

  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "rotate(15)")
    .style("text-anchor", "start");

  svg.append("g").call(d3.axisLeft(y));

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", 10)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("font-weight", "bold")
    .text(chartType === "top-scorers" ? "Top Scorers" : "Top Assists");
}

document.getElementById("chartSelector").addEventListener("change", (event) => {
  const selectedChart = event.target.value;
  displayPlayerStatsChart(selectedChart);
});

function displayOtherStatsChart() {
  const otherStats = allPlayerData
    .map(player => ({ name: player.Player, passes: parseFloat(player.PasTotAtt), tackles: parseFloat(player.TklWon) }))
    .slice(0, 10);

  console.log("Other Stats:", otherStats);

  const margin = { top: 40, right: 30, bottom: 40, left: 60 };
  const width = 750 - margin.left - margin.right;
  const height = 330 - margin.top - margin.bottom;

  const svg = d3.select("#other-stats-chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left*2  + "," + margin.top + ")");

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", -margin.top / 2) 
    .attr("text-anchor", "middle")
    .style("font-size", "18px")
    .style("font-weight", "bold")
    .text("Top 10 Player Stats: Passes & Tackles");

  const x = d3.scaleBand()
    .domain(otherStats.map(player => player.name))
    .range([0, width])
    .padding(0.1);

  const y = d3.scaleLinear()
    .domain([0, d3.max(otherStats, player => Math.max(player.passes, player.tackles))])
    .nice()
    .range([height, 0]);

  const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .style("background-color", "#333")
    .style("color", "#fff")
    .style("padding", "5px")
    .style("border-radius", "5px")
    .style("font-size", "12px")
    .style("pointer-events", "none");

  svg.selectAll(".bar-passes")
    .data(otherStats)
    .enter().append("rect")
    .attr("class", "bar-passes")
    .attr("x", player => x(player.name))
    .attr("y", player => y(player.passes))
    .attr("width", x.bandwidth() / 2)
    .attr("height", player => height - y(player.passes))
    .attr("fill", "#e5835e")
    .on("mouseover", function(event, player) {
      d3.select(this).style("opacity", 0.7); 
      tooltip.style("visibility", "visible")
        .html(`${player.name}<br>Passes: ${player.passes}<br>Tackles: ${player.tackles}`)
        .style("top", (event.pageY - 10) + "px") 
        .style("left", (event.pageX + 10) + "px"); 
    })
    .on("mouseout", function() {
      d3.select(this).style("opacity", 1); 
      tooltip.style("visibility", "hidden"); 
    });

  svg.selectAll(".bar-tackles")
    .data(otherStats)
    .enter().append("rect")
    .attr("class", "bar-tackles")
    .attr("x", player => x(player.name) + x.bandwidth() / 2)
    .attr("y", player => y(player.tackles))
    .attr("width", x.bandwidth() / 2)
    .attr("height", player => height - y(player.tackles))
    .attr("fill", "#6aaa96")
    .on("mouseover", function(event, player) {
      d3.select(this).style("opacity", 0.7); 
      tooltip.style("visibility", "visible")
        .html(`${player.name}<br>Passes: ${player.passes}<br>Tackles: ${player.tackles}`)
        .style("top", (event.pageY - 10) + "px") 
        .style("left", (event.pageX + 10) + "px"); 
    })
    .on("mouseout", function() {
      d3.select(this).style("opacity", 1);
      tooltip.style("visibility", "hidden"); 
    });

  svg.append("g")
    .selectAll(".x-axis")
    .data([0])
    .enter()
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "rotate(15)")
    .style("text-anchor", "start");

  svg.append("g")
    .selectAll(".y-axis")
    .data([0])
    .enter()
    .append("g")
    .call(d3.axisLeft(y));
}


function displayPositionDonutChart() {
  const positions = allPlayerData.flatMap(player => player.Position);

  const positionCount = d3.rollup(positions, v => v.length, d => d);
  const data = Array.from(positionCount, ([position, count]) => ({
    position,
    count
  }));

  const totalPlayers = d3.sum(data, d => d.count);

  const width = 400;
  const height = 330;
  const margin = 40;

  const radius = Math.min(width, height) / 2 - margin;

  const color = d3.scaleOrdinal()
    .domain(data.map(d => d.position))
    .range(d3.quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), data.length));

  const svg = d3.select("#player-pie-chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  function drawDonutChart(selectedPositions) {
    svg.selectAll("*").remove(); 

    const filteredData = data.filter(d => selectedPositions.includes(d.position)); 

    const arc = d3.arc()
      .innerRadius(radius - 60) 
      .outerRadius(radius);

    const pie = d3.pie()
      .value(d => d.count)
      .sort(null);

    const arcs = svg.selectAll("arc")
      .data(pie(filteredData))
      .enter()
      .append("g")
      .attr("class", "arc");

    arcs.append("path")
      .attr("d", arc)
      .attr("fill", d => color(d.data.position))
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .style("cursor", "pointer");

    arcs.append("text")
      .attr("transform", function(d) {
        return "translate(" + arc.centroid(d) + ")";
      })
      .attr("dy", "0.35em")
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "bold");

    svg.append("text")
      .attr("x", 0)
      .attr("y", -radius - 10)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text("Player Position Distribution");

    const tooltip = d3.select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background-color", "#333")
      .style("color", "#fff")
      .style("padding", "5px")
      .style("border-radius", "5px")
      .style("font-size", "12px")
      .style("pointer-events", "none");

    arcs.on("mouseover", function(event, d) {
      d3.select(this).select("path").style("opacity", 0.7); 
      tooltip.style("visibility", "visible")
        .html(`${d.data.position} <br>
          ${Math.round((d.data.count / totalPlayers) * 100)}% - #${d.data.count}`)
        .style("top", (event.pageY - 20) + "px") 
        .style("left", (event.pageX + 10) + "px"); 
    })
    .on("mouseout", function() {
      d3.select(this).select("path").style("opacity", 1); 
      tooltip.style("visibility", "hidden"); 
    });
  }

  const selectedPositions = data.map(d => d.position);

  drawDonutChart(selectedPositions);

  const buttonContainer = d3.select("#position-buttons-container");
  buttonContainer.html(""); 

  data.forEach((d, i) => {
    const button = buttonContainer.append("div")
      .attr("class", "position-button")
      .style("display", "flex")
      .style("align-items", "center")
      .style("margin", "5px 0");

    button.append("input")
      .attr("type", "checkbox")
      .attr("id", `position-${i}`)
      .attr("checked", true)
      .style("margin-right", "10px")
      .on("change", function(event) {
        const isChecked = event.target.checked;
        if (isChecked) {
          selectedPositions.push(d.position);
        } else {
          const index = selectedPositions.indexOf(d.position);
          if (index > -1) selectedPositions.splice(index, 1); 
        }
        drawDonutChart(selectedPositions); 
      });

    button.append("span")
      .style("background-color", color(d.position))
      .style("width", "15px")
      .style("height", "15px")
      .style("border-radius", "50%")
      .style("display", "inline-block");

    button.append("span")
      .style("margin-left", "10px")
      .text(d.position);
  });
}
