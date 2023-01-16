const canvas = document.querySelector('#game');
const game = canvas.getContext('2d');
const btnUp = document.querySelector('#up');
const btnLeft = document.querySelector('#left');
const btnRight = document.querySelector('#right');
const btnDown = document.querySelector('#down');
const spanLives = document.querySelector('#lives');
const spanTime = document.querySelector('#time');
const spanRecord = document.querySelector('#record');
const pResult = document.querySelector('#result');

let canvasSize;
let elementsSize;
let level = 0;
let lives = 3;

let timeStart;
let timePlayer;
let timeInterval;

const playerPositionMultiplier = {
    x: undefined,
    y: undefined,
};

const gifPosition = {
    x: undefined,
    y: undefined,
};

let enemiesPosition = [];

window.addEventListener('load', setCanvasSize);
window.addEventListener('resize', setCanvasSize);

function setCanvasSize() {
    if (window.innerHeight > window.innerWidth) {
        canvasSize = window.innerWidth * 0.7;
    } else {
        canvasSize = window.innerHeight * 0.7;
    }

    canvas.setAttribute('width', canvasSize);
    canvas.setAttribute('height', canvasSize);

    elementsSize = canvasSize / 10;
    startGame();
}

function startGame() {

    game.font = elementsSize + 'px Verdana';
    game.textAlign = 'end';

    const map = maps[level];

    if (!map) {
        gameWin();
        return;
    }

    if (!timeStart) {
        timeStart = Date.now();
        timeInterval = setInterval(showTime, 100);
        showRecord();
    }

    const mapRows = map.trim().split('\n');
    const mapRowCols = mapRows.map(row => row.trim().split(''));

    showLives();

    enemiesPosition = [];

    mapRowCols.forEach((row, rowI) => {
        row.forEach((col, colI) => {
            const emoji = emojis[col];
            const posX = elementsSize * (colI + 1);
            const posY = elementsSize * (rowI + 1);

            if (col == 'O') {
                if (!playerPositionMultiplier.x) {
                    playerPositionMultiplier.x = posX / elementsSize;
                    playerPositionMultiplier.y = posY / elementsSize;
                }
            } else if (col == 'I') {
                gifPosition.x = posX;
                gifPosition.y = posY;
            } else if (col == 'X') {
                enemiesPosition.push({
                    x: posX,
                    y: posY,
                });
            }

            game.fillText(emoji, posX, posY);
        })
    });

    movePlayer();
}

function movePlayer() {
    const gifCollisionX = calculatePlayerPosition(playerPositionMultiplier.x).toFixed(3) == gifPosition.x.toFixed(3);
    const gifCollisionY = calculatePlayerPosition(playerPositionMultiplier.y).toFixed(3) == gifPosition.y.toFixed(3);
    const gifCollision = gifCollisionX && gifCollisionY;

    if (gifCollision) {
        levelWin();
    }

    const enemyCollision = enemiesPosition.find(enemy => {
        const enemyCollisionX = enemy.x == calculatePlayerPosition(playerPositionMultiplier.x);
        const enemyCollisionY = enemy.y == calculatePlayerPosition(playerPositionMultiplier.y);
        return enemyCollisionX && enemyCollisionY;
    });

    if (enemyCollision) {
        levelFail();
    }

    game.fillText(emojis['PLAYER'], calculatePlayerPosition(playerPositionMultiplier.x), calculatePlayerPosition(playerPositionMultiplier.y));
}

function levelWin() {
    console.log('Subiste de nivel!');
    level++;
    setCanvasSize();
}

function levelFail() {
    lives--;

    if (lives == 0) {
        level = 0;
        lives = 3;
        timeStart = undefined;
    }

    playerPositionMultiplier.x = undefined;
    playerPositionMultiplier.y = undefined;
    setCanvasSize();
}

function showLives() {
    spanLives.innerHTML = emojis['HEART'].repeat(lives);
}

function showRecord() {
    spanRecord.innerHTML = localStorage.getItem('record_time');
}

function showTime() {
    spanTime.innerHTML = Date.now() - timeStart;
}

function gameWin() {
    game.fillText(`¡Muy bien, ganaste!`, canvasSize, canvasSize / 2);
    clearInterval(timeInterval);

    const recordTime = localStorage.getItem('record_time');
    const playerTime = Date.now() - timeStart;

    if (recordTime) {
        if (recordTime >= playerTime) {
            localStorage.setItem('record_time', playerTime);
            pResult.innerHTML = 'Superaste el record!';
        } else {
            pResult.innerHTML = 'Lo siento, no superaste el record!';
        }
    } else {
        localStorage.setItem('record_time', playerTime);
        spanRecord.innerHTML = playerTime;
        pResult.innerHTML = 'Has establecido un nuevo record!';
    }
    console.log('recordTime: ', recordTime);
    console.log('PlayerTime: ', playerTime);
}

window.addEventListener('keydown', moveByKeys);
btnUp.addEventListener('click', moveUp);
btnLeft.addEventListener('click', moveLeft);
btnRight.addEventListener('click', moveRight);
btnDown.addEventListener('click', moveDown);

function moveByKeys(event) {
    if (event.key == 'ArrowUp') moveUp();
    if (event.key == 'ArrowLeft') moveLeft();
    if (event.key == 'ArrowRight') moveRight();
    if (event.key == 'ArrowDown') moveDown();
}

function moveUp() {
    if ((calculatePlayerPosition(playerPositionMultiplier.y) - elementsSize) >= elementsSize) {
        playerPositionMultiplier.y--;
        setCanvasSize();
    }
}

function moveLeft() {
    if ((calculatePlayerPosition(playerPositionMultiplier.x) - elementsSize) >= elementsSize) {
        playerPositionMultiplier.x--;
        setCanvasSize();
    }
}

function moveRight() {
    if ((calculatePlayerPosition(playerPositionMultiplier.x) + elementsSize) <= canvasSize) {
        playerPositionMultiplier.x++;
        setCanvasSize();
    }
}

function moveDown() {
    if ((calculatePlayerPosition(playerPositionMultiplier.y) + elementsSize) <= canvasSize) {
        playerPositionMultiplier.y++;
        setCanvasSize();
    }
}

function calculatePlayerPosition(multiplier) {
    return elementsSize * multiplier;
}