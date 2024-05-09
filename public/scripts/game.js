/* Obstacle */
let obstacleInterval;
let animationFrameIds = [];

function createObstacle() {
    const obstacle = document.createElementNS("http://www.w3.org/2000/svg", "g");
    obstacle.setAttribute("class", "obstacle");

    const upperHeight = Math.random() * 100 + 50;
    const gapHeight = Math.random() * 50 + 100;  // 间隙在100到150之间
    const lowerY = upperHeight + gapHeight;
    const lowerHeight = 400 - lowerY;

    const upperObstacle = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    upperObstacle.setAttribute("width", "80");
    upperObstacle.setAttribute("height", upperHeight);
    upperObstacle.setAttribute("fill", "#000000");

    const lowerObstacle = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    lowerObstacle.setAttribute("width", "80");
    lowerObstacle.setAttribute("height", lowerHeight.toString());
    lowerObstacle.setAttribute("y", lowerY);
    lowerObstacle.setAttribute("fill", "#000000");

    obstacle.appendChild(upperObstacle);
    obstacle.appendChild(lowerObstacle);

    document.querySelector("svg").appendChild(obstacle);

    return obstacle;
}

function animateObstacle(obstacle) {
    let xPos = 1000;
    const speed = 2;
    function move() {
        xPos -= speed;
        obstacle.setAttribute("transform", `translate(${xPos}, 0)`);
        if (xPos > -120) {
            let requestId = requestAnimationFrame(move);
            animationFrameIds.push(requestId);
        } else {
            obstacle.remove();
        }
    }
    requestAnimationFrame(move);
}



/* Player */
let gravityInterval;
let velocity = 0;
const gravity = 1;
const jumpPower = -10;
let playerY = 160;

function updatePlayer() {
    velocity += gravity;
    playerY += velocity;
    $("#player").css("transform", `translate(30px, ${playerY}px)`);

    if (playerY > 380) {
        playerY = 380;
        velocity = 0;
    } else if (playerY < 0) {
        playerY = 0;
        velocity = 0;
    }
}

function jump() {
    if (!gameStarted) return;
    velocity = jumpPower;  // 设置向上的初速度
}




/* During game */
let gameStarted = false;

function startGame() {
    $('#waitingStart-container').hide();
    $('#gameover-container').hide();
    document.querySelectorAll('svg .obstacle').forEach(obstacle => obstacle.remove());
    document.getElementById('player').setAttribute('transform', 'translate(30, 160)');
    gameStarted = true;

    gravityInterval = setInterval(updatePlayer, 20);
    obstacleInterval = setInterval(() => {
        const newObstacle = createObstacle();
        animateObstacle(newObstacle);
    }, 1000); 
    checkGameover();
}


function endGame() {
    clearInterval(gravityInterval);
    clearInterval(obstacleInterval);
    animationFrameIds.forEach(id => cancelAnimationFrame(id));
    animationFrameIds = [];
   
    $('#gameover-container').show();
    gameStarted = false;
}


function checkGameover() {

    if (!gameStarted) return;

    const playerRect = $("#player")[0].getBoundingClientRect();
    const obstacles = document.querySelectorAll(".obstacle rect"); 

    for (let i = 0; i < obstacles.length; i += 2) {
        const upperObstacleRect = obstacles[i].getBoundingClientRect();
        const lowerObstacleRect = obstacles[i + 1].getBoundingClientRect();
        console.log(upperObstacleRect)
        console.log(lowerObstacleRect)

        if ((playerRect.top < upperObstacleRect.bottom && playerRect.left > upperObstacleRect.left && playerRect.right < upperObstacleRect.right) ||
            (playerRect.bottom > lowerObstacleRect.top && playerRect.left > lowerObstacleRect.left && playerRect.right < lowerObstacleRect.right) ) {  
                endGame();
        }
    }
    
    setTimeout(checkGameover, 100);
}

$(document).ready(function() {
    $(document).on('keydown', function(e) {
        if (e.keyCode == 32) { // Space key
            if (!gameStarted) {
                startGame();
            } else {
                jump();
            }
        }
    });
});