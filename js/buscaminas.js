const $ = document.querySelectorAll.bind(document);
const LEVEL = [
    {
        rows: 9,
        cols: 9,
        mines: 10
    },
    {
        rows: 16,
        cols: 16,
        mines: 40
    },
    {
        rows: 16,
        cols: 30,
        mines: 99
    }
];

let currentLevel = -1;



/**
 * EVENT HANDLERS
 */

document.addEventListener("DOMContentLoaded", function() {    
    document.addEventListener("click", onDocumentClick);    
    document.addEventListener("keydown", onDocumentKeydown);

    $(".menu .item").forEach(menuItem => {
        menuItem.addEventListener("mouseenter", onMenuItemMouseEnter);
        menuItem.addEventListener("click", onMenuItemClick);
    });

    setLevel(0);
});

function onDocumentClick(event) {    
    $(".menu")[0].classList.remove("expanded");
}

function onDocumentKeydown(event) {
    if (event.key === "F2") startNewGame();
}

function onMenuItemMouseEnter(event) {
    if (event.sourceCapabilities.firesTouchEvents) return;
    $(".menu .item.active")[0]?.classList.remove("active");
    event.currentTarget.classList.add("active");
}

function onMenuItemClick(event) {
    if (event.currentTarget === $(".menu.expanded .item.active")[0]) $(".menu")[0].classList.remove("expanded");
    else {
        $(".menu .item.active")[0]?.classList.remove("active");
        event.currentTarget.classList.add("active");
        $(".menu")[0].classList.add("expanded");
    } // else

    event.stopPropagation();
}



/**
 * GAME LOGIC
 */

function setLevel(newLevel) {
    console.log(newLevel);
    
    if (newLevel !== currentLevel) {
        $(".level")[currentLevel]?.classList.remove("selected");
        $(".level")[newLevel].classList.add("selected");
        currentLevel = newLevel;
    } // if

    startNewGame();
}

function startNewGame() {
    $(".game-board table")[0].replaceChildren();

    for (let r = 0; r < LEVEL[currentLevel].rows; r++) {
        let row = document.createElement("tr");
        $(".game-board table")[0].appendChild(row);

        for (let c = 0; c < LEVEL[currentLevel].cols; c++) {
            row.appendChild(document.createElement("td"));
        } // for
    } // for

    console.log("TO-DO: Start New Game!");
    // TO-DO
}