// Function to parse the query string to get the player ID
function getPlayerIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// Define the headers mapping for categorizing data
const headersMapping = {
    general: ["MP", "Min", "Goals", "Assists", "Shots", "SoT", "Int", "TklWon", "Recov", "Fls", "CrdY", "CrdR"],
    gameInfo: ["MP", "Min", "Goals", "Assists"],
    offensive: ["Goals", "Shots", "SoT", "Assists"],
    defensive: ["Int", "TklWon", "Recov", "Fls", "CrdY", "CrdR"],
};

// Function to load and parse the CSV data for a player
function loadPlayerData(playerId) {
    Papa.parse("data/player_stats.csv", {
        download: true,
        header: true,
        complete: function(results) {
            const playerData = results.data.find(player => player.id === playerId);
            if (playerData) {
                renderPlayerDetails(playerData);
                searchPlayer(playerData.Player);
            } else {
                showError("Player not found.");
            }
        },
        error: function() {
            showError("Failed to load player data.");
        }
    });
}

function renderPlayerDetails(player) {
    displayCommonPlayerInfo(player);
}


function searchPlayer(playerName) {
    playerName = playerName.replace(' ', '_');
    const url = `https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?p=${playerName}`;
    console.log(url);
    fetch(url)
        .then(response => response.json())
        .then(data => {
            const player = data.player[0].strCutout;
            const playerImage = document.getElementById('playerImage');
            playerImage.src = player;
            playerImage.alt = playerName + " image";
        })
        .catch(error => {
            console.error("Error fetching player data:", error);
        });
}

function displayCommonPlayerInfo(player) {
    const commonInfoDiv = document.getElementById('commonPlayerInfo');
    commonInfoDiv.innerHTML = `
            <hr>
        <p><strong>Player:</strong> ${player.Player || ''}</p>
        <p><strong>Nation:</strong> ${player.Nation || ''}</p>
        <p><strong>Position:</strong> ${player.Position || ''}</p>
        <p><strong>Age:</strong> ${player.Age || ''}</p>
        <hr>
        <p><strong>Competion:</strong> ${player.Comp || ''}</p>
        <p><strong>Squad:</strong> ${player.Squad || ''}</p>
        <p><strong>Matches Played:</strong> ${player.MP || ''}</p>
        <p><strong>Minutes Played:</strong> ${player.Min || ''}</p>
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


