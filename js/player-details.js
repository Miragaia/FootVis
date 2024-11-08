// Function to parse the query string to get the player ID
function getPlayerIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const playerId = urlParams.get('id');
    return playerId;
}

// Function to load and parse the CSV data
function loadPlayerData(playerId) {
    Papa.parse("data/player_stats.csv", {
        download: true,
        header: true,
        complete: function(results) {
            const playerData = results.data.find(player => player.id === playerId);
            console.log(playerData);
            if (playerData) {
                displayPlayerDetails(playerData);
            } else {
                displayError("Player not found.");
            }
        },
        error: function() {
            displayError("Failed to load player data.");
        }
    });
}

// Function to display the player details on the page
function displayPlayerDetails(player) {
    const playerInfoContainer = document.getElementById("player-info");

    // Clear any existing content in the player-info container
    playerInfoContainer.innerHTML = '';

    // Create player details dynamically
    for (const [key, value] of Object.entries(player)) {
        const infoDiv = document.createElement("div");
        infoDiv.innerHTML = `<span>${key}:</span> ${value}`;
        playerInfoContainer.appendChild(infoDiv);
    }
}

// Function to display an error message if player data fails to load
function displayError(message) {
    const playerInfoContainer = document.getElementById("player-info");
    playerInfoContainer.innerHTML = `<p style="color: red;">${message}</p>`;
}

// Main execution: Get player ID and load player data
const playerId = getPlayerIdFromUrl();
if (playerId) {
    loadPlayerData(playerId);
} else {
    displayError("No player ID provided.");
}
