/**
 * CONSTANTS
 */

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



/**
 * GLOBAL VARIABLES
 */

let currentLevel = -1;
let minePositions = [];



/**
 * EVENT HANDLERS
 */

document.addEventListener("DOMContentLoaded", function() {    
    document.addEventListener("keydown", (event) => event.key === "F2" && startNewGame());
    document.addEventListener("contextmenu", (event) => event.preventDefault());
    
    if (window.matchMedia("(hover: none)").matches) {
        // When hover is not supported:
        $(".menu .item > span").forEach(menuItem => menuItem.addEventListener("click", onMenuItemClick));
        document.addEventListener("click", () => $(".menu .item.expanded")[0]?.classList.remove("expanded"));    
    } // if

    setLevel(0);
});

function onMenuItemClick(event) {
    if (event.currentTarget.parentElement.matches(".expanded")) return;

    $(".menu .item.expanded")[0]?.classList.remove("expanded");
    event.currentTarget.parentElement.classList.add("expanded");
    event.stopPropagation();
}

function onCellLeftClick(event) {
    if (event.currentTarget.matches(".flagged")) return;
    if (minePositions.includes(event.currentTarget.dataset.position)) return gameLost();

    console.log(`Clicked cell at position ${event.currentTarget.dataset.position}!`)

    event.currentTarget.classList.add("shown");
    event.currentTarget.removeEventListener("click", onCellLeftClick);
    event.currentTarget.removeEventListener("contextmenu", onCellRightClick);
}

function onCellRightClick(event) {
    if (!event.currentTarget.matches(".flagged") && getCounterValue("num-mines") === 0) return;

    event.currentTarget.classList.toggle("flagged");
    setCounterValue("num-mines", LEVEL[currentLevel].mines - $(".game-board td.flagged").length);    
}



/**
 * UTILS
 */

const setCounterValue = (counterId, intValue) => $("#" + counterId)[0].innerText = intValue.toString().padStart(3, "0");
const getCounterValue = (counterId) => parseInt($("#" + counterId)[0]?.innerText);



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

        for (let c = 0; c < level.cols; c++) {
            let col = document.createElement("td");
            col.setAttribute("data-position", r * level.cols + c);
            col.addEventListener("click", onCellLeftClick);
            col.addEventListener("contextmenu", onCellRightClick);
            row.appendChild(col);
        } // for
        
        $(".game-board table")[0].appendChild(row);
    } // for
    
    minePositions = [];
    for (let i = 0; i < level.mines; i++) {
        let position = Math.floor(Math.random() * (level.rows * level.cols - i));
        while (minePositions.includes(position)) position++;
        minePositions.push(position);
    } // for

    setCounterValue("num-mines", level.mines);
    setCounterValue("num-seconds", 0);
}

function gameLost() {
    console.log("Game lost :(");
}