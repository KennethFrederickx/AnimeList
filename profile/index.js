const { ipcRenderer } = require('electron');
const { shell } = require('electron');

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
            <span class="animeRating">${index + 1}. </span>
            <span class="animeName">${anime.name}</span><br>
            <div class="star-container">
                <!-- Stars go here -->
            </div>
            <img class="remove-button" style="display: none;" src="../images/trash-bin-icon.png" alt="Remove" onclick="removeAnime(${index})">
            <button class="edit-button" style="display: none;" onclick="editAnime(${index})">Edit</button>
            <img class="linkImage" src="../images/link.png" alt="${anime.name}" onclick="openMAL('${anime.name}')">
            <img class="edit-pencil" src="../images/pencil-edit-button.svg" alt="Edit" onclick="showEditButtons(${index})">
            <button class="show-details-button" onclick="showDetails(${index})">Show Details</button>
            <div id="details-${index}" class="anime-details"></div>
        `;
        animeList.appendChild(animeDiv);
        const starContainer = animeDiv.querySelector('.star-container');
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
        console.log(item);
        const positionElement = item.querySelector('.animeRating');
        positionElement.textContent = `${index + 1}. `;
        item.setAttribute('data-position', index);
    });
}

function removeAnime(index) {
    const updatedAnimes = [...originalAnimes];
    updatedAnimes.splice(index, 1);
    ipcRenderer.send('update-anime-list', updatedAnimes);
    window.location.reload();
}

function editAnime(index) {
    const animeDiv = document.getElementById(`anime-${index}`);
    const isEditing = animeDiv.classList.contains('editing');

    // If already editing, return to prevent duplication
    if (isEditing) {
        return;
    }

    // Mark the anime div as editing
    animeDiv.classList.add('editing');

    // Get the current name and rating of the anime
    const currentName = originalAnimes[index].name;
    const currentRating = originalAnimes[index].rating;

    // Create input fields for new name and rating
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.value = currentName; // Set the initial value to the current name
    const ratingInput = document.createElement('input');
    ratingInput.type = 'number';
    ratingInput.min = 1;
    ratingInput.max = 5;
    ratingInput.value = currentRating;

    // Create submit button
    const submitButton = document.createElement('button');
    submitButton.textContent = 'Done';
    submitButton.onclick = () => {
        const newName = nameInput.value;
        const newRating = parseInt(ratingInput.value);
        if (newName && !isNaN(newRating) && newRating >= 1 && newRating <= 5) {
            const updatedAnimes = [...originalAnimes];
            updatedAnimes[index].name = newName;
            updatedAnimes[index].rating = newRating;
            ipcRenderer.send('update-anime-list', updatedAnimes);
            window.location.reload();

        } else {
            alert("Invalid input. Please enter a valid name and rating.");
        }
        // Remove editing flag and input fields
        animeDiv.classList.remove('editing');
        nameInput.remove();
        ratingInput.remove();
        submitButton.remove();
    };

    // Append input fields and submit button to the anime div
    animeDiv.appendChild(nameInput);
    animeDiv.appendChild(ratingInput);
    animeDiv.appendChild(submitButton);
}

// Function to show edit buttons for a specific anime item
function showEditButtons(index) {
    // Hide edit buttons for all anime items
    hideEditButtons();

    // Get the corresponding anime item
    const animeItem = document.getElementById(`anime-${index}`);

    // Show edit buttons for the clicked anime item
    const editButton = animeItem.querySelector('.edit-button');
    const removeButton = animeItem.querySelector('.remove-button');
    editButton.style.display = 'block';
    removeButton.style.display = 'block';
}

// Function to hide edit buttons for all anime items
function hideEditButtons() {
    const editButtons = document.querySelectorAll('.edit-button');
    const removeButtons = document.querySelectorAll('.remove-button');

    editButtons.forEach(button => {
        button.style.display = 'none';
    });

    removeButtons.forEach(button => {
        button.style.display = 'none';
    });
}

// Function to fetch and display details when "Show Details" button is clicked
async function showDetails(index) {
    const animeName = originalAnimes[index].name;
    const detailsButton = document.querySelector(`#anime-${index} .show-details-button`);
    try {
        const response = await fetch(`https://api.jikan.moe/v4/anime?q=${animeName}&sfw`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        const animeDetailsDiv = document.getElementById(`details-${index}`);
        animeDetailsDiv.innerHTML = `
            <img src="${data.data[0].images.jpg.large_image_url}" alt="${data.data[0].titles[0].title}">
            <p>${data.data[0].rating}, ${data.data[0].studios[0].name}</p>
            <h1>${data.data[0].title_japanese}</h1>
            <p>${data.data[0].synopsis}</p><br>
            <p>Genres: ${data.data[0].genres.map(genre => genre.name).join(', ')}</p>
            <p>Themes: ${data.data[0].themes.map(theme => theme.name).join(', ')}</p>
        
        `;
        // Toggle show/hide details button
        if (detailsButton.textContent === 'Show Details') {
            detailsButton.textContent = 'Hide Details';
        } else {
            detailsButton.textContent = 'Show Details';
            animeDetailsDiv.innerHTML = ''; // Clear details when hiding
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}


async function openMAL(animeName) {
    try {
        const response = await fetch(`https://api.jikan.moe/v4/anime?q=${animeName}&sfw`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        shell.openExternal(data.data[0].url);

    } catch (error) {
        console.error('Error fetching data:', error);
    }
}
//fetching data from the api
async function fetchData(animeName) {
    try {
        const response = await fetch(`https://api.jikan.moe/v4/anime?q=${animeName}&sfw`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        shell.openExternal(data.data[0].url);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}
