/* Obstacle */
let obstacleInterval;
let animationFrameIds = [];
let animationFrameIdss = [];
timetofire=false;
const obstacleWidth = 80; // obstacle width
const gapHeight = 150; // obstacle gap

function createObstacle() {
    console.log("Creating obstacle with width:", obstacleWidth);

    const obstacle = document.createElementNS("http://www.w3.org/2000/svg", "g");
    obstacle.setAttribute("class", "obstacle");

    const upperHeight = Math.random() * 100 + 50;
    const lowerY = upperHeight + gapHeight;
    const lowerHeight = 400 - lowerY;

    const upperObstacle = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    upperObstacle.setAttribute("width", obstacleWidth);
    upperObstacle.setAttribute("height", upperHeight);
    upperObstacle.setAttribute("fill", "#000000");

    const lowerObstacle = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    lowerObstacle.setAttribute("width", obstacleWidth);
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
    let hasScored = false;

    function move() {
        xPos -= speed;
        obstacle.setAttribute("transform", `translate(${xPos}, 0)`);

        if (xPos + obstacleWidth < playerX && !hasScored) {
            updateScore();
            hasScored = true;
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
    velocity = jumpPower;
}



/* During game */
let gameStarted = false;
let score = 0;

/**/ 


function createBullet(y_index=100) {

    const bullet = document.createElementNS("http://www.w3.org/2000/svg", "g");
    bullet.setAttribute("class", "bullet");

    const Bullet = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    Bullet.setAttribute("width", 10);
    Bullet.setAttribute("height", 10);
    Bullet.setAttribute("y", y_index);
    Bullet.setAttribute("x", 40);
    Bullet.setAttribute("fill", "yellow");

    bullet.appendChild(Bullet);

    document.querySelector("svg").appendChild(bullet);

    return bullet;
}

function animateBullet(bullet) {
    let xx = 40;
    const speed = 2;
    alreadyhit=false;

    function moveBullet() {
        xx += speed;
        bullet.setAttribute("transform", `translate(${xx}, 0)`);
        const obstacles = document.querySelectorAll(".obstacle rect"); 

        for (let i = 0; i < obstacles.length; i +=1){
            const ObstacleRec = obstacles[i].getBoundingClientRect();
            if(  (alreadyhit==false) && (xx>ObstacleRec.left)){
                
                
                
            }
        }

        if (xx <1000) {
            let requestIdd = requestAnimationFrame(moveBullet);
            animationFrameIdss.push(requestIdd);
        } else {
            bullet.remove();
        }
    }
    requestAnimationFrame(moveBullet);
}






/* */

function updateScore() {
    score += 1; 
    document.getElementById('score').textContent = score;
}

function startGame() {
    document.getElementById('waitingStart-container').style.display = 'none';
    document.getElementById('gameover-container').style.display = 'none';

    document.querySelectorAll('svg .obstacle').forEach(obstacle => obstacle.remove());

    document.querySelectorAll('svg .bullet').forEach(bullet => bullet.remove());

    document.getElementById('player').setAttribute('transform', 'translate(30, 160)');
    gameStarted = true;
    score = 0;
    document.getElementById('score').textContent = score;

    gravityInterval = setInterval(updatePlayer, 20);

    bInterval = setInterval(() => {
        if(timetofire==true){
            const newBullet = createBullet(playerY+10);
            animateBullet(newBullet);
            timetofire=false;
            
        }
    }, 20); 





    obstacleInterval = setInterval(() => {
        const newObstacle = createObstacle();
        animateObstacle(newObstacle);
    }, 1000); // obstacle frequency
    checkGameover();

    


   
}


function endGame() {
    clearInterval(gravityInterval);
    clearInterval(obstacleInterval);
    animationFrameIds.forEach(id => cancelAnimationFrame(id));
    animationFrameIds = [];
   
    document.getElementById('final-score').textContent = document.getElementById('score').textContent;
    document.getElementById('gameover-container').style.display = 'block';

    gameStarted = false;
}

function checkGameover() {

    if (!gameStarted) return;

    const playerRect = $("#player")[0].getBoundingClientRect();
    const obstacles = document.querySelectorAll(".obstacle rect"); 

    for (let i = 0; i < obstacles.length; i += 2) {
        const upperObstacleRect = obstacles[i].getBoundingClientRect();
        const lowerObstacleRect = obstacles[i + 1].getBoundingClientRect();

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

        if (e.keyCode == 70) { // Space key
            timetofire=true;
        }else
        {
            timetofire=false;
        }


    });
});