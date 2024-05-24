const { ipcRenderer, shell } = require('electron');

document.addEventListener('DOMContentLoaded', (event) => {
    fetchTopAnime();
});

function addAnime() {
    const name = document.getElementById('name').value;
    const rating = document.getElementById('starRating').value;

    const newAnime = {
        name: name,
        rating: parseFloat(rating)
    };

    ipcRenderer.send('write-to-file', newAnime);
}

let stars = document.getElementsByClassName("star");
let output = document.getElementById("currentRating");

// Function to update rating
function gfg(n) {
    remove();
    for (let i = 0; i < n; i++) {
        if (n == 1) cls = "one";
        else if (n == 2) cls = "two";
        else if (n == 3) cls = "three";
        else if (n == 4) cls = "four";
        else if (n == 5) cls = "five";
        stars[i].className = "star " + cls;
    }
    document.getElementById('starRating').value = n;
}

// To remove the pre-applied styling
function remove() {
    for (let i = 0; i < 5; i++) {
        stars[i].className = "star";
    }
}

function fetchTopAnime() {
    fetch('https://api.jikan.moe/v4/top/anime')
        .then(response => response.json())
        .then(data => {
            displayTopAnime(data.data);
        })
        .catch(error => console.error('Error fetching top anime:', error));
}

function displayTopAnime(animeList) {
    const topAnimeList = document.getElementById('topAnimeList');
    topAnimeList.innerHTML = '';

    animeList.forEach(anime => {
        const animeItem = document.createElement('div');
        animeItem.classList.add('anime-item');

        const animeLink = document.createElement('a');
        animeLink.href = '#';
        animeLink.addEventListener('click', (event) => {
            event.preventDefault();
            shell.openExternal(anime.url);
        });

        const animeImage = document.createElement('img');
        animeImage.src = anime.images.jpg.image_url;
        animeImage.alt = anime.title;

        const animeTitle = document.createElement('h3');
        animeTitle.textContent = anime.title;

        animeLink.appendChild(animeImage);
        animeLink.appendChild(animeTitle);

        animeItem.appendChild(animeLink);
        topAnimeList.appendChild(animeItem);
    });
}

function fetchRandomAnime() {
    fetch('https://api.jikan.moe/v4/random/anime')
        .then(response => response.json())
        .then(data => {
            displayRandomAnime(data.data);
        })
        .catch(error => console.error('Error fetching random anime:', error));
}

function displayRandomAnime(anime) {
    const randomAnimeContainer = document.getElementById('randomAnime');
    randomAnimeContainer.innerHTML = '';

    const animeItem = document.createElement('div');
    animeItem.classList.add('anime-item');

    const animeLink = document.createElement('a');
    animeLink.href = '#';
    animeLink.addEventListener('click', (event) => {
        event.preventDefault();
        shell.openExternal(anime.url);
    });

    const animeImage = document.createElement('img');
    animeImage.src = anime.images.jpg.image_url;
    animeImage.alt = anime.title;

    const animeTitle = document.createElement('h3');
    animeTitle.textContent = anime.title;

    const animeSynopsis = document.createElement('p');
    animeSynopsis.textContent = anime.synopsis;

    animeLink.appendChild(animeImage);
    animeLink.appendChild(animeTitle);

    animeItem.appendChild(animeLink);
    animeItem.appendChild(animeSynopsis);
    randomAnimeContainer.appendChild(animeItem);
}
