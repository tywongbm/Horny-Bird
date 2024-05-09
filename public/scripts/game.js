/* Obstacle */
let obstacleInterval;
let animationFrameIds = [];

//const obstacleWidth = 80; // obstacle width
//const gapHeight = 150; // obstacle gap

function createObstacle(obstacleWidth, gapHeight, upperHeight) {
    console.log("Creating obstacle with width:", obstacleWidth);

    const obstacle = document.createElementNS("http://www.w3.org/2000/svg", "g");
    obstacle.setAttribute("class", "obstacle");

    //const upperHeight = Math.random() * 100 + 50;
    const lowerY = upperHeight + gapHeight;
    const lowerHeight = 400 - lowerY;

    const upperObstacle = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    upperObstacle.setAttribute("width", obstacleWidth);
    upperObstacle.setAttribute("height", upperHeight);
    upperObstacle.setAttribute("y", -10);
    upperObstacle.setAttribute("fill", "#fffed0");    
    upperObstacle.setAttribute("rx", "10");
    upperObstacle.setAttribute("ry", "10");


    const lowerObstacle = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    lowerObstacle.setAttribute("width", obstacleWidth);
    lowerObstacle.setAttribute("height", lowerHeight.toString());
    lowerObstacle.setAttribute("y", lowerY+10);
    lowerObstacle.setAttribute("fill", "#fffed0");
    lowerObstacle.setAttribute("rx", "10");
    lowerObstacle.setAttribute("ry", "10");


    obstacle.appendChild(upperObstacle);
    obstacle.appendChild(lowerObstacle);

    document.querySelector("svg").appendChild(obstacle);

    return {
        obstacle: obstacle,
        obstacleWidth: obstacleWidth, 
        gapHeight: gapHeight, 
        upperHeight: upperHeight,
        lowerY: lowerY,
        lowerHeight: lowerHeight
    };
}

let numObstaclesPassed = 0;

function animateObstacle(obstacleObj) {

    const {obstacle, obstacleWidth, gapHeight, upperHeight, lowerY, lowerHeight} = obstacleObj;

    let xPos = 1000;
    const speed = 2;
    let hasScored = false;

    function move() {
        xPos -= speed;
        obstacle.setAttribute("transform", `translate(${xPos}, 0)`);

        if (xPos + obstacleWidth < playerX && !hasScored) {
            hasScored = true;
            numObstaclesPassed += 1;
            var scoreSound = document.getElementById('score-sound');
            scoreSound.pause();
            scoreSound.play();
            //updateScore();
            Socket.sendUpdateScoreEvent(numObstaclesPassed);
        }

        if (xPos > -120) {
            let requestId = requestAnimationFrame(move);
            animationFrameIds.push(requestId);
        } else {
            obstacle.remove();
        }
    }
    requestAnimationFrame(move);
}

function createAndAnimateObstacle(obstacleWidth, gapHeight, upperHeight) {
    const newObstacle = createObstacle(obstacleWidth, gapHeight, upperHeight);
    animateObstacle(newObstacle);
}



/* Player */
let gravityInterval;
let velocity = 0;
const gravity = 1;
const jumpPower = -10;
let playerX = 30;
let playerY = 160;

function updatePlayer() {
    velocity += gravity;
    playerY += velocity;
    $("#player").css("transform", `translate(30px, ${playerY}px)`);

    playerY = Math.min(360, Math.max(-40, playerY));
    velocity = (playerY === 0 || playerY === 360) ? 0 : velocity;
}

function jump() {
    if (!gameStarted) return;
    velocity = jumpPower;
}

/* Cheating mode */
let enterPressed = false;

document.addEventListener('keydown', function(event) {
    if (event.key === "Enter") {
        enterPressed = true;
        $("#player").css('opacity', '0.2');
    }
});

document.addEventListener('keyup', function(event) {
    if (event.key === "Enter") {
        enterPressed = false;
        $("#player").css('opacity', '1'); 
    }
});

/* During game */
let gameStarted = false;
let gameOverState = false;
let score = 0;


function updateScore(s) {
    score = s; 
    document.getElementById('score').textContent = score;
}

function startGame() {
    var gameoverSound = document.getElementById('gameover-sound');
    var backgroundSound = document.getElementById('background-sound');
    gameoverSound.pause();
    backgroundSound.play();

    document.getElementById('waitingStart-container').style.display = 'none';
    document.getElementById('gameover-container').style.display = 'none';
    document.getElementById('restart').style.display = 'none';

    document.querySelectorAll('svg .obstacle').forEach(obstacle => obstacle.remove());
    document.getElementById('player').setAttribute('transform', 'translate(30, 160)');
    gameStarted = true;
    score = 0;
    document.getElementById('score').textContent = score;

    gravityInterval = setInterval(updatePlayer, 20);
    /*
    obstacleInterval = setInterval(() => {
        const newObstacle = createObstacle();
        animateObstacle(newObstacle);
    }, 1000); // obstacle frequency
    */
    checkGameover();
}

function endGame() {
    var gameoverSound = document.getElementById('gameover-sound');
    var backgroundSound = document.getElementById('background-sound');
    backgroundSound.pause();
    gameoverSound.play();

    clearInterval(gravityInterval);
    clearInterval(obstacleInterval);
    animationFrameIds.forEach(id => cancelAnimationFrame(id));
    animationFrameIds = [];
   
    document.getElementById('final-score').textContent = document.getElementById('score').textContent;
    document.getElementById('gameover-container').style.display = 'block';
    document.getElementById('restart').style.display = 'block';

    gameStarted = false;
    gameOverState = true;


    score = 0;
    numObstaclesPassed = 0;

    setTimeout(() => {
        gameOverState = false;
    }, 2000);
}

function checkGameover() {

    setTimeout(checkGameover, 100);

    if (!gameStarted || enterPressed) return;

    const playerRect = $("#player")[0].getBoundingClientRect();
    const obstacles = document.querySelectorAll(".obstacle rect"); 

    for (let i = 0; i < obstacles.length; i += 2) {
        const upperObstacleRect = obstacles[i].getBoundingClientRect();
        const lowerObstacleRect = obstacles[i + 1].getBoundingClientRect();

        if ((playerRect.top < upperObstacleRect.bottom && playerRect.left > upperObstacleRect.left && playerRect.right < upperObstacleRect.right) ||
            (playerRect.bottom > lowerObstacleRect.top && playerRect.left > lowerObstacleRect.left && playerRect.right < lowerObstacleRect.right) ) {  
                Socket.sendFinishEvent();
                // endGame();
        }
    }
    
}


function enterGame() {
    startGame();
}




$(document).ready(function() {

    //game_authentication.js
    Authentication.signin("Hihi", "123",  // dummy sign in using a constant username, password
    () => 
    {   // sign-in successful
        console.log("Log in success");
        if (Socket.connect() == true) {
            console.log("socket connect success 1");

            // request entering the game by calling Socket.sendEnterGameRequest(). 
            // need to wait for some time for the connection to get secure.
            // If there is no other player, 
            // will wait till there is one. If another player wishes to enter the game, 
            // the game starts both sides.
            // for now there is only one "bird". Both sides' white key controls the same 
            // "bird"
            // setTimeout(Socket.sendEnterGameRequest, 1000);
            setTimeout(() => {

                $(document).on('keydown', function(e) {
                    if (e.keyCode == 32) { // Space key
                        if (!gameStarted && !gameOverState) {
                            Socket.sendEnterGameRequest();
                        } else {
                            // jump();
                            Socket.sendJumpEvent();
                        }
                    }
                });
            }, 1000);
            console.log("socket connect success 2");
        }
        
        // enterGame();
    },
    () => 
    {   // sign-in failure
        console.log("Log in failure");
    });


});
