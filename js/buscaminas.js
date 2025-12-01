/**
 * LEVELS
 */

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



/**
 * GLOBAL VARIABLES
 */

let currentLevel = -1;
let timer = null;
let start = null;



/**
 * UTILS
 */

const $               = document.querySelectorAll.bind(document);
const level           = ()                    => LEVEL_LIST[currentLevel];
const setCounterValue = (counterId, intValue) => $("#" + counterId)[0].innerText = intValue.toString().padStart(3, "0");
const getCounterValue = (counterId)           => parseInt($("#" + counterId)[0]?.innerText);
const cellAt          = (row, col)            => $(`.game-board table td[data-row="${row}"][data-col="${col}"]`)[0];
const isMine          = (row, col)            => !!cellAt(row, col)?.matches(".mine");



/**
 * DOM EVENTS
 */

document.addEventListener("DOMContentLoaded", function() {
    document.addEventListener("contextmenu", (event) => event.preventDefault());
    document.addEventListener("keydown", (event) => event.key === "F2" && newGame());
    document.addEventListener("click", () => $(".menu > .item.expanded")[0]?.classList.remove("expanded"));

    $(".menu > .item").forEach(menuItem => {
        menuItem.addEventListener("click", onMenuItemClick);        
        menuItem.addEventListener("mouseenter", onMenuItemMouseEnter); 
    });

    setLevel(0);
});

function onMenuItemClick(event) {
    if (event.currentTarget.matches(".expanded")) return;
    $(".menu > .item.expanded")[0]?.classList.remove("expanded");
    event.currentTarget.classList.add("expanded");
    event.stopPropagation();
}

function onMenuItemMouseEnter(event) {
    if ($(".menu > .item.expanded").length && !event.currentTarget.matches(".expanded")) onMenuItemClick(event);
}

function onCellMouseDown(event) {
    if (event.button !== 0) return;
    if (event.currentTarget.matches(".flag")) return;
    $(".scoreboard .main-button button")[0].classList.add("surprise");
}

function onCellRightClick(event) {
    if (!event.currentTarget.matches(".flag") && getCounterValue("num-mines") === 0) return;
    event.currentTarget.classList.toggle("flag");
    setCounterValue("num-mines", level().mines - $(".game-board table td.flag").length);
}

function onCellLeftClick(event) {
    $(".scoreboard .main-button button")[0].classList.remove("surprise");
    if (event.currentTarget.matches(".flag")) return;
    if (event.currentTarget.matches(".mine")) return gameLost(event.currentTarget);
    showCell(parseInt(event.currentTarget.dataset.row), parseInt(event.currentTarget.dataset.col));
    if ($(".game-board table td:not(.show)").length === level().mines) gameWon();
}



/**
 * GAME FUNCTIONALITIES
 */

function setLevel(newLevel) {
    if (newLevel === currentLevel) return;

    $(`.menu #level-${currentLevel}`)[0]?.classList.remove("selected");
    $(`.menu #level-${newLevel}`)[0].classList.add("selected");
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
    $(".scoreboard .main-button button")[0].className = "";

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
        cell.className = minePositions.includes(index) ? "mine" : "";
    });
}

function showCell(row, col) {
    let cell = cellAt(row, col);
    if (!cell || cell.matches(".show") || cell.matches(".flag")) return;

    cell.classList.add("show");
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
    $(".scoreboard .main-button button")[0].classList.add("looser");
    $(".game-board table td.mine:not(.flag)").forEach(cell => cell.classList.add("show"));
    $(".game-board table td.flag:not(.mine)").forEach(cell => cell.classList.add("show", "wrong-flag"));
    lastCell.classList.add("exploded");
    endGame();
}

function gameWon() {
    $(".scoreboard .main-button button")[0].classList.add("winner");
    $(".game-board table td.mine:not(.flag)").forEach(cell => cell.classList.add("flag"));
    setCounterValue("num-mines", 0);
    endGame();
}

function endGame() {
    clearInterval(timer);
    timer = null;
    
    $(".game-board table td:not(.show)").forEach(cell => {
        cell.removeEventListener("mousedown", onCellMouseDown);
        cell.removeEventListener("contextmenu", onCellRightClick);
        cell.removeEventListener("click", onCellLeftClick);
    });
}