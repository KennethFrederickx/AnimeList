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
    animes.forEach((anime, index) => {
        const animeDiv = document.createElement('div');
        animeDiv.classList.add('animeItem');
        animeDiv.setAttribute('draggable', true);
        animeDiv.setAttribute('id', `anime-${index}`);
        animeDiv.setAttribute('data-position', index);
        animeDiv.innerHTML = `
            <span class="animeName">${anime.name}</span><br>
            <span class="animeRating">Position: ${index + 1}</span><br>
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
        animeDiv.addEventListener('dragstart', (ev) => {
            ev.dataTransfer.setData("text", ev.target.id);
            ev.target.classList.add('dragging');
        });
        animeDiv.addEventListener('dragend', (ev) => {
            ev.target.classList.remove('dragging');
            const droppedIndex = Array.from(ev.target.parentNode.children).indexOf(ev.target);
            const updatedAnimes = updateAnimePosition(originalAnimes, ev.target.dataset.position, droppedIndex);
            ipcRenderer.send('update-anime-position', updatedAnimes);
            updateAnimePositions();
        });
    });
}

function updateAnimePosition(animes, startingIndex, endingIndex) {
    const updatedAnimes = [...animes];
    const [movedAnime] = updatedAnimes.splice(startingIndex, 1);
    updatedAnimes.splice(endingIndex, 0, movedAnime);
    return updatedAnimes;
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

function allowDrop(ev) {
    ev.preventDefault();
}

function drop(ev) {
    ev.preventDefault();
    const data = ev.dataTransfer.getData("text");
    const droppedElement = document.getElementById(data);
    const targetElement = ev.target.closest('.animeItem');
    if (targetElement) {
        const droppedIndex = Array.from(droppedElement.parentNode.children).indexOf(droppedElement);
        const targetIndex = Array.from(targetElement.parentNode.children).indexOf(targetElement);
        if (droppedIndex < targetIndex) {
            targetElement.parentNode.insertBefore(droppedElement, targetElement.nextSibling);
        } else {
            targetElement.parentNode.insertBefore(droppedElement, targetElement);
        }
    } else {
        ev.target.appendChild(droppedElement);
    }
}

function updateAnimePositions() {
    const animeItems = document.querySelectorAll('.animeItem');
    animeItems.forEach((item, index) => {
        const positionElement = item.querySelector('.animeRating');
        positionElement.textContent = `Position: ${index + 1}`;
        item.setAttribute('data-position', index);
    });
}