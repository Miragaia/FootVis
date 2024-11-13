let playersToTable = [];
let currentPage = 1;
const playersPerPage = 12;
let filteredPlayers = [];

let currentMinAge = 0;
let currentMaxAge = 100;
let currentMinGoals = 0;
let currentMaxGoals = 100;
let currentMinAssists = 0;
let currentMaxAssists = 100;
let currentSearchTerm = "";
let selectedCompetitions = [];
let selectedPositions = [];
let selectedCards = [];
const Cards = ['CrdY', 'CrdR', 'None'];

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

function filterPlayersByGoals(min, max) {
    currentMinGoals = min;
    currentMaxGoals = max;
    applyCombinedFilters();
}

function filterPlayersByAssists(min, max) {
    currentMinAssists = min;
    currentMaxAssists = max;
    applyCombinedFilters();
}
function loadPlayersToTable() {
    selectedCompetitions = [];
    selectedPositions = [];
    selectedCards = [];
    Papa.parse("../data/player_stats.csv", {
        download: true,
        header: true,
        complete: (results) => {
            playersToTable = results.data;
            // calculate min and max age
            const ages = playersToTable.map(player => parseInt(player.Age) || 0).filter(age => age > 0);
            const goals = playersToTable.map(player => parseInt(player.Goals) || 0).filter(goals => goals > 0);
            const assists = playersToTable.map(player=> parseInt(player.Assists) || 0).filter(assists => assists > 0);
            const allCompetitions = [...new Set(playersToTable.map(player => player.Comp).filter(comp => comp))];
            const allPositions = [...new Set(playersToTable.map(player => player.Position).filter(position => position))];

            generateCompetitionCheckboxes(allCompetitions);
            generatepositionCheckboxes(allPositions);
            generateCardsCheckboxes(Cards);

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

            minGoals = 0;
            maxGoals = Math.max(...goals);
            currentMinGoals = minGoals;
            currentMaxGoals = maxGoals
            $("#slider-range1").slider({
                range: true,
                min: minGoals,
                max: maxGoals,
                values: [minGoals, maxGoals],
                slide: function (event, ui) {
                    $("#goals").val(ui.values[0] + " - " + ui.values[1]);
                    filterPlayersByGoals(ui.values[0], ui.values[1]);
                }
            });

            $("#goals").val(minGoals + " - " + maxGoals);

            minAssists = 0;
            maxAssists = Math.max(...assists);
            currentMinAssists = minAssists;
            currentMaxAssists = maxAssists
            $("#slider-range2").slider({
                range: true,
                min: minAssists,
                max: maxAssists,
                values: [minAssists, maxAssists],
                slide: function (event, ui) {
                    $("#assists").val(ui.values[0] + " - " + ui.values[1]);
                    filterPlayersByAssists(ui.values[0], ui.values[1]);
                }
            });

            $("#assists").val(minAssists + " - " + maxAssists);

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

function generateCompetitionCheckboxes(competitions) {
    const checkboxContainer = document.getElementById('competition-checkboxes');
    checkboxContainer.innerHTML = ''; 
    console.log(competitions);
    competitions.forEach(comp => {

        const wrapperDiv = document.createElement('div');
        wrapperDiv.classList.add('checkbox-wrapper-1');
  
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.id = comp; 
        input.classList.add('substituted');
        input.addEventListener('change', () => {
            if (input.checked) {
                input.classList.add('competition-checkbox');
            } else {
                input.classList.remove('competition-checkbox'); 
            }
            filterPlayersByCompetition();
        });
        

        const label = document.createElement('label');
        label.setAttribute('for', comp);  
        label.textContent = comp;  

        wrapperDiv.appendChild(input);
        wrapperDiv.appendChild(label);
        checkboxContainer.appendChild(wrapperDiv);
    });
}


function generatepositionCheckboxes(positions) {
    const checkboxContainer = document.getElementById('position-checkboxes');
    checkboxContainer.innerHTML = ''; 
    console.log(positions);
    positions.forEach(comp => {

        const wrapperDiv = document.createElement('div');
        wrapperDiv.classList.add('checkbox-wrapper-1');
  
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.id = comp; 
        input.classList.add('substituted');
        input.addEventListener('change', () => {
            if (input.checked) {
                input.classList.add('position-checkbox');
            } else {
                input.classList.remove('position-checkbox'); 
            }
            filterPlayersByposition();
        });

        const label = document.createElement('label');
        label.setAttribute('for', comp);  
        label.textContent = comp;  

        wrapperDiv.appendChild(input);
        wrapperDiv.appendChild(label);
        checkboxContainer.appendChild(wrapperDiv);
    });
}

function generateCardsCheckboxes(cards) {
    const checkboxContainer = document.getElementById('cards-checkboxes');
    checkboxContainer.innerHTML = ''; 
    console.log(cards);
    cards.forEach(comp => {

        const wrapperDiv = document.createElement('div');
        wrapperDiv.classList.add('checkbox-wrapper-1');
  
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.id = comp; 
        input.classList.add('substituted');
        input.addEventListener('change', () => {
            if (input.checked) {
                input.classList.add('card-checkbox');
            } else {
                input.classList.remove('card-checkbox'); 
            }
            filterPlayersBycard();
        });

        const label = document.createElement('label');
        label.setAttribute('for', comp);  
        label.textContent = comp;  

        wrapperDiv.appendChild(input);
        wrapperDiv.appendChild(label);
        checkboxContainer.appendChild(wrapperDiv);
    });
}

document.getElementById('playerFilterSearch').addEventListener('input', (event) => {
    currentSearchTerm = event.target.value.trim().toLowerCase();
    console.log(currentSearchTerm);
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

function filterPlayersByCompetition() {
    const checkboxes = document.querySelectorAll('.competition-checkbox');
    selectedCompetitions = [];
    checkboxes.forEach(checkbox => {
        console.log(checkbox);
        if (checkbox) {
            selectedCompetitions.push(checkbox.id);
        }
    });

    applyCombinedFilters();
}

function filterPlayersByposition() {
    const checkboxes = document.querySelectorAll('.position-checkbox');
    selectedPositions = [];
    checkboxes.forEach(checkbox => {
        if (checkbox) {
            selectedPositions.push(checkbox.id);
        }

    });

    applyCombinedFilters();
}

function filterPlayersBycard() {
    const checkboxes = document.querySelectorAll('.card-checkbox');
    selectedCards = [];
    checkboxes.forEach(checkbox => {
        if (checkbox) {
            selectedCards.push(checkbox.id);
        }

    });

    applyCombinedFilters();
}

function applyCombinedFilters() {
    filteredPlayers = playersToTable.filter(player => {
        // Filtrar por idade
        const age = parseInt(player.Age, 10) || 0;
        const withinAgeRange = age >= currentMinAge && age <= currentMaxAge;

        // Filtrar por gols
        const goals = parseInt(player.Goals, 10) || 0;
        const withinGoalsRange = goals >= currentMinGoals && goals <= currentMaxGoals;

        // Filtrar por assistências
        const assists = parseInt(player.Assists, 10) || 0;
        const withinAssistsRange = assists >= currentMinAssists && assists <= currentMaxAssists;

        // Filtrar por texto
        const matchesSearch = player.Player && (
            player.Player.toLowerCase().includes(currentSearchTerm) || 
            player.Nation.toLowerCase().includes(currentSearchTerm) ||
            player.Squad.toLowerCase().includes(currentSearchTerm)
        );

        // Filtrar por competição
        const matchesCompetition = selectedCompetitions.length === 0 || selectedCompetitions.includes(player.Comp);

        // Filtra por posição
        const matchesPosition = selectedPositions.length === 0 || selectedPositions.includes(player.Position);

        // Filtra por cartões
        const matchesCard = selectedCards.length === 0 || (selectedCards.includes('CrdY') && player.CrdY > 0 ) || (selectedCards.includes('CrdR') && player.CrdR > 0) || (selectedCards.includes('None') && player.CrdY == 0 && player.CrdR == 0);
        
        // Retorna somente jogadores que atendem ambos os filtros
        return withinAgeRange && matchesSearch && matchesCompetition && matchesPosition && withinGoalsRange && withinAssistsRange && matchesCard;
    });

    // Atualiza a tabela
    currentPage = 1;
    const currentSection = document.querySelector('.tab-button.active').dataset.section;
    renderPlayers(filteredPlayers, headersMapping[currentSection]);
}


document.getElementById('clear-filters-btn').addEventListener('click', () => {
    currentSearchTerm = "";
    document.getElementById('playerFilterSearch').value = "";
    loadPlayersToTable();
});
