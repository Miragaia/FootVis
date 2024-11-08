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
            } else {
                showError("Player not found.");
            }
        },
        error: function() {
            showError("Failed to load player data.");
        }
    });
}

// Function to render player details on the page dynamically
function renderPlayerDetails(player) {
    // Display common player info
    displayCommonPlayerInfo(player);

    // Iterate over headersMapping and populate each section with tab-specific info
    Object.keys(headersMapping).forEach(category => {
        const section = document.getElementById(category);
        section.innerHTML = ''; // Clear existing content

        // Add a header for each section
        const categoryHeader = document.createElement("h2");
        categoryHeader.innerText = category.charAt(0).toUpperCase() + category.slice(1).replace(/([A-Z])/g, ' $1');
        section.appendChild(categoryHeader);

        // Add the data for this category
        headersMapping[category].forEach(key => {
            if (player[key]) {
                const infoDiv = document.createElement("div");
                infoDiv.innerHTML = `<strong>${key}:</strong> ${player[key]}`;
                section.appendChild(infoDiv);
            }
        });
    });

    // Show the default section (e.g., 'general')
    showSection('general');
}

// Function to display common player information (always visible)
function displayCommonPlayerInfo(player) {
    const commonInfoDiv = document.getElementById('commonPlayerInfo');
    commonInfoDiv.innerHTML = `
        <p><strong>Player:</strong> ${player.Player || ''}</p>
        <p><strong>Nation:</strong> ${player.Nation || ''}</p>
        <p><strong>Position:</strong> ${player.Position || ''}</p>
        <p><strong>Squad:</strong> ${player.Squad || ''}</p>
        <p><strong>Comp:</strong> ${player.Comp || ''}</p>
        <p><strong>Age:</strong> ${player.Age || ''}</p>
    `;
}

// Function to display an error message if player data fails to load
function showError(message) {
    const errorDiv = document.createElement("div");
    errorDiv.style.color = "red";
    errorDiv.innerText = message;
    document.body.appendChild(errorDiv);
}

// Function to switch between tabs and show the relevant section
function showSection(section) {
    // Hide all sections first
    const sections = document.querySelectorAll('.player-section');
    sections.forEach(s => s.style.display = 'none');
    
    // Show the selected section
    document.getElementById(section).style.display = 'block';
    
    // Update the active tab
    const tabs = document.querySelectorAll('.tab-button');
    tabs.forEach(tab => tab.classList.remove('active'));
    const activeTab = document.querySelector(`[data-section="${section}"]`);
    if (activeTab) activeTab.classList.add('active');
}

// Main execution: Get player ID and load player data
const playerId = getPlayerIdFromUrl();
if (playerId) {
    loadPlayerData(playerId);
} else {
    showError("No player ID provided.");
}
