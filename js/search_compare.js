let players = [];
let selectedIndex = -1; 

function loadPlayers() {
  Papa.parse('./data/player_stats.csv', {
    download: true,
    header: true,
    complete: (results) => {
      console.log(results.data); 
      players = results.data.map(row => row.Player); 
      console.log(players); 
    },
    error: (error) => {
      console.error("Error loading CSV:", error);
    }
  });
}

loadPlayers();

function showSuggestions(value, suggestionsId, inputId) {
  const suggestions = document.getElementById(suggestionsId);
  suggestions.innerHTML = '';
  selectedIndex = -1; 

  if (!players.length) {
    console.error("No players loaded");
    return; 
  }

  if (value) {
    const filteredPlayers = players.filter(player => player && player.toLowerCase().includes(value.toLowerCase()));
    
    filteredPlayers.forEach((player, index) => {
      const item = document.createElement('li');
      item.textContent = player;
      item.classList.add('suggestion-item');
      item.onclick = () => {
        selectPlayer(player, inputId, suggestionsId);
      };
      item.onmouseover = () => {
        selectedIndex = index; 
        highlightSelected(suggestions, selectedIndex);
      };
      suggestions.appendChild(item);
    });
  }
}

function selectPlayer(player, inputId, suggestionsId) {
  document.getElementById(inputId).value = player;
  document.getElementById(suggestionsId).innerHTML = '';
}

function highlightSelected(suggestions, index) {
  const items = suggestions.querySelectorAll('.suggestion-item');
  items.forEach((item, idx) => {
    if (idx === index) {
      item.classList.add('selected'); 
    } else {
      item.classList.remove('selected'); 
    }
  });
}

document.getElementById('playerSearch').addEventListener('keydown', (event) => {
  handleKeyNavigation(event, 'playerSearch', 'suggestions');
});

document.getElementById('playerSearch2').addEventListener('keydown', (event) => {
  handleKeyNavigation(event, 'playerSearch2', 'suggestions2');
});

document.getElementById('playerSearch').addEventListener('input', (event) => {
  showSuggestions(event.target.value, 'suggestions', 'playerSearch');
});

document.getElementById('playerSearch2').addEventListener('input', (event) => {
  showSuggestions(event.target.value, 'suggestions2', 'playerSearch2');
});

document.addEventListener('click', (event) => {
  if (!event.target.matches('.search-input')) {
    document.getElementById('suggestions').innerHTML = '';
    document.getElementById('suggestions2').innerHTML = '';
  }
});

function handleKeyNavigation(event, inputId, suggestionsId) {
  const suggestions = document.getElementById(suggestionsId);
  const items = suggestions.querySelectorAll('.suggestion-item');

  if (event.key === 'ArrowDown') {
    selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
    highlightSelected(suggestions, selectedIndex);
    event.preventDefault(); 
  } else if (event.key === 'ArrowUp') {
    selectedIndex = Math.max(selectedIndex - 1, 0);
    highlightSelected(suggestions, selectedIndex);
    event.preventDefault(); 
  } else if (event.key === 'Enter') {
    if (selectedIndex >= 0 && selectedIndex < items.length) {
      selectPlayer(items[selectedIndex].textContent, inputId, suggestionsId); 
    }
  }
}
