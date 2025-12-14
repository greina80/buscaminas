/**
 * GLOBAL UTILS
 */

// GAME LEVELS:
const LEVELS = [
    {
        id: 1,
        description: "Principiante",
        rows: 9,
        cols: 9,
        mines: 10
    },
    {
        id: 2,
        description: "Intermedio",
        rows: 16,
        cols: 16,
        mines: 40
    },
    {
        id: 3,
        description: "Experto", 
        rows: 16,
        cols: 30,
        mines: 99
    }
];

// VARIABLES:
let currentLevel = null;
let minePositions = [];
let timer = null;
let start = null;
let dragInfo = {
    x: 0,
    y: 0,
    dragging: false,
    component: null
};

// METHODS:
const get = document.querySelector.bind(document);
const getAll = document.querySelectorAll.bind(document);



/**
 * GAME LOADING
 */

document.addEventListener("DOMContentLoaded", function() {
    document.addEventListener("contextmenu", (event) => event.preventDefault());    
    
    // Game initialization:
    initializeWindows();
    initializeDragAbility();
    initializeMenu();
    setLevel(1);  
});



/**
 * WINDOW COMPONENT
 */

// INITIALIZER:

function initializeWindows() {
    getAll(".window").forEach(window => {
        // Enabling window scoped hoykeys:
        window.setAttribute("tabindex", "-1");
        window.querySelectorAll("[hotkey]").forEach(hotkeyedComponent => {
            window.addEventListener("keyup", (event) => event.key === hotkeyedComponent.getAttribute("hotKey") && hotkeyedComponent.click());
        });

        // Enablig window dragging:
        window.querySelector(".header").addEventListener("mousedown", (event) => onDraggableComponentMouseDown(event, window));
    });
}



/**
 * DRAG ABILITY
 */

// INITIALIZER:

function initializeDragAbility() {
    document.addEventListener("mousemove", onDocumentMouseMove);
    document.addEventListener("mouseup"  , () => dragInfo.dragging = false);
}

// EVENT HANDLERS:

function onDraggableComponentMouseDown(event, draggableComponent) {
    dragInfo.dragging = true;
    dragInfo.component = draggableComponent || event.currentTarget;
    dragInfo.x = dragInfo.component.offsetLeft - event.clientX;
    dragInfo.y = dragInfo.component.offsetTop - event.clientY;
}

function onDocumentMouseMove(event) {
    if (!dragInfo.dragging) return;

    let mouseX = event.clientX;
    if (mouseX < 0) mouseX = 0;
    if (mouseX > document.body.clientWidth) mouseX = document.body.clientWidth;

    let mouseY = event.clientY;
    if (mouseY < 0) mouseY = 0;
    if (mouseY > document.body.clientHeight) mouseY = document.body.clientHeight;

    dragInfo.component.style.left = mouseX + dragInfo.x + "px";
    dragInfo.component.style.top = mouseY + dragInfo.y + "px";
}



/**
 * MENU COMPONENT
 */

// INITIALIZER:

function initializeMenu() {
    document.addEventListener("click", () => get(".menu > .item.expanded")?.classList.remove("expanded"));

    getAll(".menu > .item").forEach(menuItem => {
        menuItem.addEventListener("click", onMenuItemClick);        
        menuItem.addEventListener("mouseenter", onMenuItemMouseEnter); 
    });

    // Adding level menu items:
    let levelMenuItems = get("#levelMenuItems");
    LEVELS.forEach(level => levelMenuItems.innerHTML += `
        <div class="item" id="menuItemLevel${level.id}" onclick="setLevel(${level.id})">
            <div class="check"></div>
            <div class="label">${level.description}</div>
            <div class="hotkey"></div>
        </div>
    `);
};

// EVENT HANDLERS:

function onMenuItemClick(event) {
    if (event.srcElement.matches(".submenu > .item")) return;
    if (event.currentTarget.matches(".expanded")) return;

    get(".menu > .item.expanded")?.classList.remove("expanded");
    event.currentTarget.classList.add("expanded");
    event.stopPropagation();
}

function onMenuItemMouseEnter(event) {
    if (get(".menu > .item.expanded") && !event.currentTarget.matches(".expanded")) onMenuItemClick(event);
}



/**
 * SCORE BOARD COMPONENT
 */

// UTILS:

const setCounterValue = (counterId, intValue) => get("#" + counterId).innerText = intValue.toString().padStart(3, "0");
const getCounterValue = (counterId)           => parseInt(get("#" + counterId).innerText);



/**
 * GAME BOARD COMPONENT
 */

// EVENT HANDLERS:

function onCellMouseDown(event) {
    if (event.button !== 0) return;
    if (event.currentTarget.matches(".flagged")) return;
    get(".main-button").classList.add("surprise");
}

function onCellRightClick(event) {
    if (!event.currentTarget.matches(".flagged") && getCounterValue("num-mines") === 0) return;
    event.currentTarget.classList.toggle("flagged");
    setCounterValue("num-mines", currentLevel.mines - getAll(".game-board .flagged").length);
}

function onCellLeftClick(event) {
    get(".main-button").classList.remove("surprise");
    if (event.currentTarget.matches(".flagged")) return;
    if (isMine(event.currentTarget.dataset.row, event.currentTarget.dataset.col)) return gameLost(event.currentTarget);
    showCell(parseInt(event.currentTarget.dataset.row), parseInt(event.currentTarget.dataset.col));
    if (getAll(".game-board td:not(.shown)").length === currentLevel.mines) gameWon();
}

// UTILS:

const cellAt = (row, col) => get(`.game-board td[data-row="${row}"][data-col="${col}"]`);
const isMine = (row, col) => cellAt(row, col) && minePositions.includes(currentLevel.cols * parseInt(row) + parseInt(col));



/**
 * MODAL COMPONENT
 */

// UTILS:

function showModal(modalId) {
    let modal = get("#" + modalId);
    modal.classList.add("shown");
    modal.querySelector("[autofocus]")?.focus();
}

function closeModal(modalId) {
    let modal = get("#" + modalId);
    modal.classList.remove("shown");

    // Reset windows position:
    modal.querySelectorAll(".window").forEach(window => {
        window.style.top = "";
        window.style.left = "";
    });
}



/**
 * GAME FUNCTIONALITIES
 */

function setLevel(newLevelId) {
    if (newLevelId === currentLevel?.id) return;

    get("#menuItemLevel" + currentLevel?.id)?.classList.remove("selected");
    get("#menuItemLevel" + newLevelId).classList.add("selected");
    currentLevel = LEVELS.find(level => level.id === newLevelId);

    let gameBoard = get(".game-board");
    gameBoard.replaceChildren();
    for (let r = 0; r < currentLevel.rows; r++) {
        let row = document.createElement("tr");

        for (let c = 0; c < currentLevel.cols; c++) {
            let cell = document.createElement("td");
            cell.setAttribute("data-row", r);
            cell.setAttribute("data-col", c);
            row.appendChild(cell);
        } // for

        gameBoard.appendChild(row);
    } // for

    newGame();
}

function newGame() {
    clearInterval(timer);
    timer = null;

    setCounterValue("num-mines", currentLevel.mines);
    setCounterValue("num-seconds", 0);
    get(".main-button").className = "main-button";

    minePositions = [];
    for (let i = 0; i < currentLevel.mines; i++) {
        let position = Math.floor(Math.random() * (currentLevel.rows * currentLevel.cols - i));
        while (minePositions.includes(position)) position++;
        minePositions.push(position);
    } // for
    
    getAll(".game-board td").forEach(cell => {
        cell.className = "";
        cell.addEventListener("mousedown", onCellMouseDown);
        cell.addEventListener("contextmenu", onCellRightClick);
        cell.addEventListener("click", onCellLeftClick);
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
        timer = setInterval(() => {
            let lapsedSeconds = Math.floor((Date.now() - start) / 1000);
            if (lapsedSeconds < 1000) setCounterValue("num-seconds", lapsedSeconds);
            else clearInterval(timer);
        }, 50);
    } // if
}

function gameLost(lastCell) {
    get(".main-button").classList.add("looser");

    // Revealing hidden mines:
    getAll(".game-board td:not(.shown)").forEach(cell => {
        let _isMine = isMine(cell.dataset.row, cell.dataset.col);
        if (_isMine && !cell.matches(".flagged")) cell.classList.add("shown", "mine");
        else if (!_isMine && cell.matches(".flagged")) cell.classList.add("shown", "error");
    });

    lastCell.classList.add("exploded");
    endGame();
}

function gameWon() {
    get(".main-button").classList.add("winner");
    getAll(".game-board td:not(.shown)").forEach(cell => cell.classList.add("flagged"));
    setCounterValue("num-mines", 0);
    endGame();
    checkNewRecord();
}

function endGame() {
    clearInterval(timer);
    timer = null;
    
    getAll(".game-board td").forEach(cell => {
        cell.removeEventListener("mousedown", onCellMouseDown);
        cell.removeEventListener("contextmenu", onCellRightClick);
        cell.removeEventListener("click", onCellLeftClick);
    });
}

function getHighScores() {
    let highScores = JSON.parse(localStorage.getItem("high-scores"));
    
    if (!highScores) {
        highScores = {};
        LEVELS.forEach(level => {
            highScores["level" + level.id] = {
                levelName: level.description,
                date: "-",
                gamerName: "-",
                score: -1
            };
        });
    } // if

    return highScores;
}

function checkNewRecord() {
    let score = getCounterValue("num-seconds");
    let highScore = getHighScores()["level" + currentLevel.id];
    if (highScore.score >= 0 && highScore.score <= score) return;

    get("#newRecordLevel").innerText = currentLevel.description;
    get("#newRecordScore").innerText = score + " segundos";
    showModal("newRecordModal");
}

function saveNewRecord() {
    let highScores = getHighScores();

    highScores["level" + currentLevel.id] = {
        levelName: currentLevel.description,
        date: (new Date()).toLocaleDateString(),
        gamerName: get("#newRecordName").value.trim() || "Anónimo",
        score: getCounterValue("num-seconds")
    };

    localStorage.setItem("high-scores", JSON.stringify(highScores));
    get("#newRecordModal").classList.remove("shown");
    closeModal("newRecordName");
    showHighScores();
}

function showHighScores() {
    let highScoresTbl = get("#highScoresTable tbody");
    highScoresTbl.replaceChildren();

    Object.values(getHighScores()).forEach(highScore => {
        highScoresTbl.innerHTML += `
            <tr>
                <td>${highScore.levelName}</td>
                <td>${highScore.score < 0 ? "-" : highScore.score + " segundos"} </td>
                <td>${highScore.gamerName}</td>
                <td>${highScore.date}</td>
            </tr>
        `;
    });

    showModal("highScoresModal");
}