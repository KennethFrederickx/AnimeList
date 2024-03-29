const { ipcRenderer } = require('electron');

ipcRenderer.on('load-animes', (event, animes) => {
    const animeList = document.getElementById('name');
    
    animeList.innerHTML = ''; 
    animes.forEach(anime => {
        const animeDiv = document.createElement('div');
        animeDiv.textContent = `${anime.name}`;
        animeList.appendChild(animeDiv);

        const starContainer = document.createElement('div');
        starContainer.classList.add('star-container');
        animeDiv.appendChild(starContainer);

        for (let i = 1; i <= 5; i++) {
            const star = document.createElement('span');
            star.textContent = '★';
            star.classList.add('star');
            starContainer.appendChild(star);
        }
    });
});