/**
 * GLOBAL UTILS
 */

// GAME LEVELS:
const LEVEL_LIST = [
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

// VARIABLES:
let currentLevel = -1;
let timer = null;
let start = null;

// METHODS:
const $ = document.querySelectorAll.bind(document);
const level = () => LEVEL_LIST[currentLevel];



/**
 * GLOBAL EVENT HANDLERS
 */

document.addEventListener("DOMContentLoaded", function() {
    document.addEventListener("contextmenu", (event) => event.preventDefault());
    document.addEventListener("keydown", (event) => event.key === "F2" && newGame());

    // Game initialization:
    setLevel(0);
});



/**
 * MENU COMPONENT
 */

// INITIALIZATION:

document.addEventListener("DOMContentLoaded", function() {
    document.addEventListener("click", () => $(".menu > .item.expanded")[0]?.classList.remove("expanded"));

    $(".menu > .item").forEach(menuItem => {
        menuItem.addEventListener("click", onMenuItemClick);        
        menuItem.addEventListener("mouseenter", onMenuItemMouseEnter); 
    });
});

// EVENT HANDLERS:

function onMenuItemClick(event) {
    if (event.currentTarget.matches(".expanded")) return;
    $(".menu > .item.expanded")[0]?.classList.remove("expanded");
    event.currentTarget.classList.add("expanded");
    event.stopPropagation();
}

function onMenuItemMouseEnter(event) {
    if ($(".menu > .item.expanded").length && !event.currentTarget.matches(".expanded")) onMenuItemClick(event);
}



/**
 * SCORE BOARD COMPONENT
 */

// UTILS:

const setCounterValue = (counterId, intValue) => $("#" + counterId)[0].innerText = intValue.toString().padStart(3, "0");
const getCounterValue = (counterId)           => parseInt($("#" + counterId)[0]?.innerText);



/**
 * GAME BOARD COMPONENT
 */

// EVENT HANDLERS:

function onCellMouseDown(event) {
    if (event.button !== 0) return;
    if (event.currentTarget.matches(".flagged")) return;
    $("#main-button")[0].classList.add("surprise");
}

function onCellRightClick(event) {
    if (!event.currentTarget.matches(".flagged") && getCounterValue("num-mines") === 0) return;
    event.currentTarget.classList.toggle("flagged");
    setCounterValue("num-mines", level().mines - $(".game-board .cell.flagged").length);
}

function onCellLeftClick(event) {
    $("#main-button")[0].classList.remove("surprise");
    if (event.currentTarget.matches(".flagged")) return;
    if (event.currentTarget.matches(".mine")) return gameLost(event.currentTarget);
    showCell(parseInt(event.currentTarget.dataset.row), parseInt(event.currentTarget.dataset.col));
    if ($(".game-board .cell:not(.shown)").length === level().mines) gameWon();
}

// UTILS:

const cellAt = (row, col) => $(`.game-board .cell[data-row="${row}"][data-col="${col}"]`)[0];
const isMine = (row, col) => cellAt(row, col)?.matches(".mine");



/**
 * GAME FUNCTIONALITIES
 */

function setLevel(newLevel) {
    if (newLevel === currentLevel) return;

    $(`#menuItemLevel${currentLevel}`)[0]?.classList.remove("selected");
    $(`#menuItemLevel${newLevel}`)[0].classList.add("selected");
    currentLevel = newLevel;

    $(".game-board table")[0].replaceChildren();
    for (let r = 0; r < level().rows; r++) {
        let row = document.createElement("tr");

        for (let c = 0; c < level().cols; c++) {
            let cell = document.createElement("td");
            cell.setAttribute("data-row", r);
            cell.setAttribute("data-col", c);
            row.appendChild(cell);
        } // for

        $(".game-board table")[0].appendChild(row);
    } // for

    newGame();
}

function newGame() {
    clearInterval(timer);
    timer = null;

    setCounterValue("num-mines", level().mines);
    setCounterValue("num-seconds", 0);
    $("#main-button")[0].className = "";

    let minePositions = [];
    for (let i = 0; i < level().mines; i++) {
        let position = Math.floor(Math.random() * (level().rows * level().cols - i));
        while (minePositions.includes(position)) position++;
        minePositions.push(position);
    } // for
    
    $(".game-board table td").forEach((cell, index) => {
        cell.addEventListener("mousedown", onCellMouseDown);
        cell.addEventListener("contextmenu", onCellRightClick);
        cell.addEventListener("click", onCellLeftClick);
        cell.className = "cell" + (minePositions.includes(index) ? " mine" : "");
    });
}

function showCell(row, col) {
    let cell = cellAt(row, col);
    if (!cell || cell.matches(".shown") || cell.matches(".flagged")) return;

    cell.classList.add("shown");
    cell.removeEventListener("mousedown", onCellMouseDown);
    cell.removeEventListener("contextmenu", onCellRightClick);
    cell.removeEventListener("click", onCellLeftClick);

    let minesAround = 
        (isMine(row - 1, col - 1) ? 1 : 0) +
        (isMine(row - 1, col    ) ? 1 : 0) +
        (isMine(row - 1, col + 1) ? 1 : 0) +
        (isMine(row    , col - 1) ? 1 : 0) +
        (isMine(row    , col + 1) ? 1 : 0) +
        (isMine(row + 1, col - 1) ? 1 : 0) +
        (isMine(row + 1, col    ) ? 1 : 0) +
        (isMine(row + 1, col + 1) ? 1 : 0);

    if (minesAround === 0) {
        showCell(row - 1, col - 1);
        showCell(row - 1, col    );
        showCell(row - 1, col + 1);
        showCell(row    , col - 1);
        showCell(row    , col + 1);
        showCell(row + 1, col - 1);
        showCell(row + 1, col    );
        showCell(row + 1, col + 1);
    } // if
    else cell.classList.add("n" + minesAround);

    if (!timer) {
        start = Date.now();
        timer = setInterval(() => setCounterValue("num-seconds", Math.floor((Date.now() - start) / 1000)), 50);
    } // if
}

function gameLost(lastCell) {
    $("#main-button")[0].classList.add("looser");
    $(".game-board .cell.mine:not(.flagged)").forEach(cell => cell.classList.add("shown"));
    $(".game-board .cell.flagged:not(.mine)").forEach(cell => cell.classList.add("shown", "error"));
    lastCell.classList.add("exploded");
    endGame();
}

function gameWon() {
    $("#main-button")[0].classList.add("winner");
    $(".game-board .cell.mine:not(.flagged)").forEach(cell => cell.classList.add("flagged"));
    setCounterValue("num-mines", 0);
    endGame();
}

function endGame() {
    clearInterval(timer);
    timer = null;
    
    $(".game-board .cell:not(.shown)").forEach(cell => {
        cell.removeEventListener("mousedown", onCellMouseDown);
        cell.removeEventListener("contextmenu", onCellRightClick);
        cell.removeEventListener("click", onCellLeftClick);
    });
}