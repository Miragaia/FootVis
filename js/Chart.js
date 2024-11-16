// Initialize empty player data
let allPlayerData = [];

Papa.parse("./data/player_stats.csv", {
  download: true,
  header: true,
  complete: function (results) {
    allPlayerData = results.data;
    console.log("Player Data Loaded:", allPlayerData);

    // Call the functions to display the charts
    displayTopScorersChart();
    displayAssistsLeadersChart();
    displayOtherStatsChart();
  }
});

// Function to display the top scorers chart
function displayTopScorersChart() {
  const topScorers = allPlayerData
    .map(player => ({ name: player.Player, goals: parseFloat(player.Goals) }))
    .sort((a, b) => b.goals - a.goals)
    .slice(0, 10);

  const margin = { top: 20, right: 30, bottom: 40, left: 40 };
  const width = 600 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  const svg = d3.select("#top-scorers-chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  const x = d3.scaleBand()
    .domain(topScorers.map(player => player.name))
    .range([0, width])
    .padding(0.1);

  const y = d3.scaleLinear()
    .domain([0, d3.max(topScorers, player => player.goals)])
    .nice()
    .range([height, 0]);

  svg.selectAll(".bar")
    .data(topScorers)
    .enter().append("rect")
    .attr("class", "bar")
    .attr("x", player => x(player.name))
    .attr("y", player => y(player.goals))
    .attr("width", x.bandwidth())
    .attr("height", player => height - y(player.goals))
    .attr("fill", "#42a5f5");

  svg.append("g")
    .selectAll(".x-axis")
    .data([0])
    .enter()
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  svg.append("g")
    .selectAll(".y-axis")
    .data([0])
    .enter()
    .append("g")
    .call(d3.axisLeft(y));
}

// Function to display the top assists chart
function displayAssistsLeadersChart() {
  const assistsLeaders = allPlayerData
    .map(player => ({ name: player.Player, assists: parseFloat(player.Assists) }))
    .sort((a, b) => b.assists - a.assists)
    .slice(0, 10);

  const margin = { top: 20, right: 30, bottom: 40, left: 40 };
  const width = 600 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  const svg = d3.select("#assists-leaders-chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  const x = d3.scaleBand()
    .domain(assistsLeaders.map(player => player.name))
    .range([0, width])
    .padding(0.1);

  const y = d3.scaleLinear()
    .domain([0, d3.max(assistsLeaders, player => player.assists)])
    .nice()
    .range([height, 0]);

  svg.selectAll(".bar")
    .data(assistsLeaders)
    .enter().append("rect")
    .attr("class", "bar")
    .attr("x", player => x(player.name))
    .attr("y", player => y(player.assists))
    .attr("width", x.bandwidth())
    .attr("height", player => height - y(player.assists))
    .attr("fill", "#66bb6a");

  svg.append("g")
    .selectAll(".x-axis")
    .data([0])
    .enter()
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  svg.append("g")
    .selectAll(".y-axis")
    .data([0])
    .enter()
    .append("g")
    .call(d3.axisLeft(y));
}

// Function to display other statistics chart (Passes and Tackles)
function displayOtherStatsChart() {
  const otherStats = allPlayerData
    .map(player => ({ name: player.Player, passes: parseFloat(player.PasTotAtt), tackles: parseFloat(player.TklWon) }))
    .slice(0, 10);

    console.log("Other Stats:", otherStats);

  const margin = { top: 20, right: 30, bottom: 40, left: 40 };
  const width = 600 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  const svg = d3.select("#other-stats-chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  const x = d3.scaleBand()
    .domain(otherStats.map(player => player.name))
    .range([0, width])
    .padding(0.1);

  const y = d3.scaleLinear()
    .domain([0, d3.max(otherStats, player => Math.max(player.passes, player.tackles))])
    .nice()
    .range([height, 0]);

  svg.selectAll(".bar-passes")
    .data(otherStats)
    .enter().append("rect")
    .attr("class", "bar-passes")
    .attr("x", player => x(player.name))
    .attr("y", player => y(player.passes))
    .attr("width", x.bandwidth() / 2)
    .attr("height", player => height - y(player.passes))
    .attr("fill", "#ff7043");

  svg.selectAll(".bar-tackles")
    .data(otherStats)
    .enter().append("rect")
    .attr("class", "bar-tackles")
    .attr("x", player => x(player.name) + x.bandwidth() / 2)
    .attr("y", player => y(player.tackles))
    .attr("width", x.bandwidth() / 2)
    .attr("height", player => height - y(player.tackles))
    .attr("fill", "#ffa726");

  svg.append("g")
    .selectAll(".x-axis")
    .data([0])
    .enter()
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  svg.append("g")
    .selectAll(".y-axis")
    .data([0])
    .enter()
    .append("g")
    .call(d3.axisLeft(y));
}
