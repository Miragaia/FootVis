let selectedPlayer1 = null;
let selectedPlayer2 = null;
let playerData = []; // Store the complete player data from CSV

function loadPlayers() {
  Papa.parse('./data/player_stats.csv', {
    download: true,
    header: true,
    complete: (results) => {
      console.log(results.data);
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
      <p><strong>Team:</strong> ${player.Team}</p>
      <p><strong>Goals:</strong> ${player.Goals}</p>
      <p><strong>Assists:</strong> ${player.Assists}</p>
      <p><strong>Matches:</strong> ${player.Matches}</p>
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
});
