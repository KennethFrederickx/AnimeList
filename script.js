const { ipcRenderer } = require('electron');


function addAnime() {
    const name = document.getElementById('name').value;
    const link = document.getElementById('link').value;
    const rating = document.getElementById('starRating').value;

    const newAnime = {
        name: name,
        link: link,
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