document.addEventListener('DOMContentLoaded', () => {
    const datasetUrl = 'data/player_stats.csv'; // Replace with your dataset path

    function fetchData(url, callback) {
        Papa.parse(url, {
            download: true,
            header: true,
            complete: (results) => {
                callback(results.data);
            },
        });
    }

    function setupSearch(inputId, suggestionId, statsId) {
        const input = document.getElementById(inputId);
        const suggestions = document.getElementById(suggestionId);
        const stats = document.getElementById(statsId);

        input.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            if (query) {
                const filteredPlayers = players.filter(player =>
                    player.Name.toLowerCase().includes(query)
                );
                renderSuggestions(filteredPlayers, suggestions, stats);
            } else {
                suggestions.innerHTML = '';
            }
        });
    }

    function renderSuggestions(players, container, statsContainer) {
        container.innerHTML = '';
        players.forEach(player => {
            const li = document.createElement('li');
            li.textContent = player.Name;
            li.addEventListener('click', () => {
                displayPlayerStats(player, statsContainer);
                container.innerHTML = '';
            });
            container.appendChild(li);
        });
    }

    function displayPlayerStats(player, container) {
        container.innerHTML = `
            <h3>${player.Name}</h3>
            <p><strong>Team:</strong> ${player.Team}</p>
            <p><strong>Goals:</strong> ${player.Goals}</p>
            <p><strong>Assists:</strong> ${player.Assists}</p>
            <p><strong>Passes:</strong> ${player.Passes}</p>
            <p><strong>Tackles:</strong> ${player.Tackles}</p>
        `;
    }

    let players = [];
    fetchData(datasetUrl, (data) => {
        players = data;
        setupSearch('player1Search', 'player1Suggestions', 'player1Stats');
        setupSearch('player2Search', 'player2Suggestions', 'player2Stats');
    });
});
