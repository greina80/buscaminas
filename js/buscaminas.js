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

document.addEventListener("DOMContentLoaded", function() {
    document.addEventListener("keydown", (event) => {
        if (event.key === "F2") startNewGame();
    });

    setLevel(0);
});

function setLevel(newLevel) {
    if (newLevel !== currentLevel) {
        $(".level")[currentLevel]?.classList.remove("selected");
        $(".level")[newLevel].classList.add("selected");
        currentLevel = newLevel;
    } // if

    startNewGame();
}

function startNewGame() {
    $(".game-board tbody")[0].replaceChildren();

    for (let r = 0; r < LEVEL[currentLevel].rows; r++) {
        let row = document.createElement("tr");
        $(".game-board tbody")[0].appendChild(row);

        for (let c = 0; c < LEVEL[currentLevel].cols; c++) {
            row.appendChild(document.createElement("td"));
        } // for
    } // for

    // TO-DO
}