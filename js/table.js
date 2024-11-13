let playersToTable = [];
let currentPage = 1;
const playersPerPage = 12;
let filteredPlayers = [];

let currentMinAge = 0;
let currentMaxAge = 100;
let currentSearchTerm = "";

const headersMapping = {
    general: ["id", "Player", "Nation", "Position", "Squad", "Comp", "Age", "MP", "Min", "Goals", "Assists", "Shots", "SoT", "Int", "TklWon", "Recov", "Fls", "CrdY", "CrdR"],
    playerInfo: ["id", "Player", "Nation", "Position", "Squad", "Comp", "Age"],
    gameInfo: ["id", "Player", "Position", "MP", "Min", "Goals", "Assists"],
    offensive: ["id", "Player", "Position", "Goals", "Shots", "SoT", "Assists"],
    defensive: ["id", "Player", "Position", "Int", "TklWon", "Recov", "Fls", "CrdY", "CrdR"],
};
function filterPlayersByAge(min, max) {
    currentMinAge = min;
    currentMaxAge = max;
    applyCombinedFilters();
}
function loadPlayersToTable() {
    Papa.parse("../data/player_stats.csv", {
        download: true,
        header: true,
        complete: (results) => {
            playersToTable = results.data;
            // calculate min and max age
            const ages = playersToTable.map(player => parseInt(player.Age) || 0).filter(age => age > 0);
            minAge = Math.min(...ages);
            maxAge = Math.max(...ages);
            currentMinAge = minAge;
            currentMaxAge = maxAge;
            $("#slider-range").slider({
                range: true,
                min: minAge,
                max: maxAge,
                values: [minAge, maxAge],
                slide: function (event, ui) {
                    $("#age").val(ui.values[0] + " - " + ui.values[1]);
                    filterPlayersByAge(ui.values[0], ui.values[1]);
                }
            });

            $("#age").val(minAge + " - " + maxAge);

            showSection('general'); 

        },
        error: (error) => {
            console.error("Error loading CSV:", error);
        },
    });
}

function renderPlayers(filteredPlayers, headers) {
    const tbody = document.getElementById('playersTableBody');
    tbody.innerHTML = "";

    const startIndex = (currentPage - 1) * playersPerPage;
    const endIndex = startIndex + playersPerPage;

    const currentPlayers = filteredPlayers.slice(startIndex, endIndex);

    currentPlayers.forEach((player) => {
        const row = document.createElement("tr");
        
        // Add click event to each row
        row.onclick = () => {
            window.location.href = `player-details.html?id=${player.id}`;
        };
 
        headers.forEach(header => {
            const cell = document.createElement("td");
            cell.textContent = player[header] || '';
            row.appendChild(cell);
        });
        
        tbody.appendChild(row);
    });

    document.getElementById("prevButton").disabled = currentPage === 1;
    document.getElementById("nextButton").disabled = endIndex >= filteredPlayers.length; 
    const totalPageCount = Math.ceil(filteredPlayers.length / playersPerPage);
    document.getElementById("pageInfo").textContent = `Página ${currentPage} de ${totalPageCount}`;
}


document.getElementById('playerFilterSearch').addEventListener('input', (event) => {
    currentSearchTerm = event.target.value.trim().toLowerCase();
    applyCombinedFilters();
});

function openModal() {
    document.getElementById("infoModal").style.display = "block";
}

function closeModal() {
    document.getElementById("infoModal").style.display = "none";
}

window.onclick = function(event) {
    const modal = document.getElementById("infoModal");
    if (event.target === modal) {
        closeModal();
    }
}

function showSection(section) {
    const tableHeaderElement = document.getElementById("playersTableHeader");
    
    tableHeaderElement.innerHTML = ""; 

    const headers = headersMapping[section] || [];
    
    headers.forEach(header => {
        const th = document.createElement("th");
        th.textContent = header;
        tableHeaderElement.appendChild(th);
    });

    currentPage = 1; 

    renderPlayers(playersToTable, headers);

    const activeSection = document.querySelector('.tab-button.active');
    if (activeSection) {
        activeSection.classList.remove('active');
    }
    document.querySelector(`[data-section="${section}"]`).classList.add('active');
}

function changePage(direction) {
    currentPage += direction;
    const currentSection = document.querySelector('.tab-button.active').dataset.section; 
    const playersToRender = filteredPlayers.length > 0 ? filteredPlayers : playersToTable;
    renderPlayers(playersToRender, headersMapping[currentSection]);
}

window.onload = function() {
    loadPlayersToTable();
}





function applyCombinedFilters() {
    filteredPlayers = playersToTable.filter(player => {
        // Filtrar por idade
        const age = parseInt(player.Age, 10) || 0;
        const withinAgeRange = age >= currentMinAge && age <= currentMaxAge;

        // Filtrar por texto
        const matchesSearch = player.Player && (
            player.Player.toLowerCase().includes(currentSearchTerm) || 
            player.Comp.toLowerCase().includes(currentSearchTerm) ||
            player.Nation.toLowerCase().includes(currentSearchTerm) ||
            player.Squad.toLowerCase().includes(currentSearchTerm)
        );

        // Retorna somente jogadores que atendem ambos os filtros
        return withinAgeRange && matchesSearch;
    });

    // Atualiza a tabela
    currentPage = 1;
    const currentSection = document.querySelector('.tab-button.active').dataset.section;
    renderPlayers(filteredPlayers, headersMapping[currentSection]);
}