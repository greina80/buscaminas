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
let isMine = [];



/**
 * EVENT HANDLERS
 */

document.addEventListener("DOMContentLoaded", function() {    
    document.addEventListener("keydown", onDocumentKeydown);
    
    if (window.matchMedia("(hover: none)").matches) {
        // When hover is not supported:
        $(".menu .item > span").forEach(menuItem => menuItem.addEventListener("click", onMenuItemClick));
        document.addEventListener("click", onDocumentClick);    
    } // if

    setLevel(0);
});

function onDocumentClick(_event) {    
    $(".menu .item.expanded")[0]?.classList.remove("expanded");
}

function onDocumentKeydown(event) {
    if (event.key === "F2") startNewGame();
}

function onMenuItemClick(event) {
    if (event.currentTarget.parentElement.matches(".expanded")) return;

    $(".menu .item.expanded")[0]?.classList.remove("expanded");
    event.currentTarget.parentElement.classList.add("expanded");
    event.stopPropagation();
}



/**
 * GAME LOGIC
 */

function setLevel(newLevel) {
    if (newLevel === currentLevel) return;

    $(".level")[currentLevel]?.classList.remove("selected");
    $(".level")[newLevel].classList.add("selected");
    currentLevel = newLevel;
    startNewGame();
}

function startNewGame() {
    let level = LEVEL[currentLevel];    

    $(".game-board table")[0].replaceChildren();    
    for (let r = 0; r < level.rows; r++) {
        let row = document.createElement("tr");
        for (let c = 0; c < level.cols; c++) row.appendChild(document.createElement("td"));
        $(".game-board table")[0].appendChild(row);
    } // for
    
    isMine = Array.from({length: level.rows}, () => Array(level.cols).fill(false));
    for (let i = 0; i < level.mines; i++) {
        let position = Math.floor(Math.random() * ((level.rows * level.cols) - i));
        while (isMine[Math.floor(position / level.cols)][position % level.cols]) position++;
        isMine[Math.floor(position / level.cols)][position % level.cols] = true;
    } // for
}