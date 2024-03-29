const { ipcRenderer } = require('electron');

let originalAnimes = [];

ipcRenderer.on('load-animes', (event, animes) => {
    const animeList = document.getElementById('name');
    animeList.innerHTML = '';
    originalAnimes = animes;
    displayAnimeList(animes);
});

function displayAnimeList(animes) {
    const animeList = document.getElementById('name');
    animeList.innerHTML = '';
    animes.forEach(anime => {
        const animeDiv = document.createElement('div');
        animeDiv.classList.add('animeItem');
        animeDiv.innerHTML = `
            <span class="animeName">${anime.name}</span><br>
            <span class="animeRating">Rating: ${anime.rating}</span><br>
        `;
        animeList.appendChild(animeDiv);
        const starContainer = document.createElement('div');
        starContainer.classList.add('star-container');
        animeDiv.appendChild(starContainer);
        for (let i = 1; i <= anime.rating; i++) {
            const star = document.createElement('span');
            star.textContent = '★';
            star.classList.add('star', getStarClass(anime.rating));
            starContainer.appendChild(star);
        }
    });
}

function sortAnimeByRating() {
    const sortedAnimes = [...originalAnimes].sort((a, b) => b.rating - a.rating);
    displayAnimeList(sortedAnimes);
}

function filterAnimeByRating(minRating, maxRating) {
    const filteredAnimes = originalAnimes.filter(anime => anime.rating >= minRating && anime.rating <= maxRating);
    displayAnimeList(filteredAnimes);
}

function resetFilters() {
    displayAnimeList(originalAnimes);
}

function getStarClass(rating) {
    if (rating === 1) return 'one';
    else if (rating === 2) return 'two';
    else if (rating === 3) return 'three';
    else if (rating === 4) return 'four';
    else if (rating === 5) return 'five';
}
