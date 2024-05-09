<<<<<<< Updated upstream
const Game = (function() {

=======
/* Obstacle */
let obstacleInterval;
let animationFrameIds = [];

//const obstacleWidth = 80; // obstacle width
//const gapHeight = 150; // obstacle gap

function createObstacle(obstacleWidth, gapHeight, upperHeight) {
    console.log("Creating obstacle with width:", obstacleWidth);
>>>>>>> Stashed changes

    return { };
})();

<<<<<<< Updated upstream
=======
    //const upperHeight = Math.random() * 100 + 50;
    const lowerY = upperHeight + gapHeight;
    const lowerHeight = 400 - lowerY;
>>>>>>> Stashed changes


function animateObstacle(startPos) {
    const obstacle = document.getElementById("obstacle");
    // let startPos = 1000;
    const endPos = -120;
    const speed = 1;

<<<<<<< Updated upstream
    function frame() {
        startPos -= speed;
        if (startPos > endPos) {
            obstacle.style.transform = `translateX(${startPos}px)`;
            animationFrameId = requestAnimationFrame(frame);
=======
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
            //updateScore();
            Socket.sendUpdateScoreEvent(numObstaclesPassed);
        }

        if (xPos > -120) {
            let requestId = requestAnimationFrame(move);
            animationFrameIds.push(requestId);
        } else {
            obstacle.remove();
>>>>>>> Stashed changes
        }
    }
    animationFrameId = requestAnimationFrame(frame);
}

<<<<<<< Updated upstream
function makeObstacle() {
=======
function createAndAnimateObstacle(obstacleWidth, gapHeight, upperHeight) {
    const newObstacle = createObstacle(obstacleWidth, gapHeight, upperHeight);
    animateObstacle(newObstacle);
}

>>>>>>> Stashed changes

    // You need to show the obstacle and start the animation here
    $("#obstacle").show();
    $("#obstacle").css("animation-name","obstacle-animation" )

}

let gravityInterval;
let velocity = 0;
const gravity = 1;
const jumpPower = -10;  // 跳跃的力量，负值表示向上跳跃
let playerY = 160;

function startGame(obstacleStartPos, playerYPos) {
    playerY = playerYPos;
    animateObstacle(obstacleStartPos);
    gravityInterval = setInterval(updatePlayer, 20);
    // setInterval(createObstacle, obstacleInterval);
    checkGameover();
}

function updatePlayer() {
    velocity += gravity;  // 每次增加重力值到速度中
    playerY += velocity;  // 更新玩家的Y位置
    $("#player").css("transform", `translate(30px, ${playerY}px)`);  // 应用新位置

    // 添加边界检测，避免玩家超出游戏区域
    if (playerY > 380) {  // 假设游戏区域底部是500px
        playerY = 380;
        velocity = 0;
    } else if (playerY < 0) {  // 防止玩家越过顶部
        playerY = 0;
        velocity = 0;
    }
}

function jump() {
    velocity = jumpPower;  // 设置向上的初速度
}


<<<<<<< Updated upstream
=======

/* During game */
let gameStarted = false;
let gameOverState = false;
let score = 0;

function updateScore(s) {
    score = s; 
    document.getElementById('score').textContent = score;
}

function startGame() {
    document.getElementById('waitingStart-container').style.display = 'none';
    document.getElementById('gameover-container').style.display = 'none';

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
    clearInterval(gravityInterval);
    clearInterval(obstacleInterval);
    animationFrameIds.forEach(id => cancelAnimationFrame(id));
    animationFrameIds = [];
   
    document.getElementById('final-score').textContent = document.getElementById('score').textContent;
    document.getElementById('gameover-container').style.display = 'block';

    gameStarted = false;
    gameOverState = true;
}

>>>>>>> Stashed changes
function checkGameover() {
    const playerRect = $("#player")[0].getBoundingClientRect();
    const upperObstacleRect = $("#upperObstacle")[0].getBoundingClientRect();
    const lowerObstacleRect = $("#lowerObstacle")[0].getBoundingClientRect();

<<<<<<< Updated upstream
    if ((playerRect.top < upperObstacleRect.bottom && playerRect.left > upperObstacleRect.left && playerRect.right < upperObstacleRect.right) ||
        (playerRect.bottom > lowerObstacleRect.top && playerRect.left > lowerObstacleRect.left && playerRect.right < lowerObstacleRect.right) ) {  
            Gameover();
    } else {
        setTimeout(checkGameover, 10);
=======
    for (let i = 0; i < obstacles.length; i += 2) {
        const upperObstacleRect = obstacles[i].getBoundingClientRect();
        const lowerObstacleRect = obstacles[i + 1].getBoundingClientRect();

        if ((playerRect.top < upperObstacleRect.bottom && playerRect.left > upperObstacleRect.left && playerRect.right < upperObstacleRect.right) ||
            (playerRect.bottom > lowerObstacleRect.top && playerRect.left > lowerObstacleRect.left && playerRect.right < lowerObstacleRect.right) ) {  
                Socket.sendFinishEvent();
                // endGame();
        }
>>>>>>> Stashed changes
    }
}

function Gameover() {
    clearInterval(gravityInterval);
    cancelAnimationFrame(animationFrameId);
    alert("gameover")
}

function setUpGameArea() {
        // Handle the spacebar key for controlling the player
        $(document).on("keydown", function(e) {
            // The player jumps if the spacebar key is down
            if (e.keyCode == 32)
                //jump();
                Socket.sendJumpEvent();
        });
    
        // The obstacle animation has finished
        $("#obstacle").on("animationend", function() {
    
            // You need to hide the obstacle and stop the animation here
            $("#obstacle").hide();
            $("#obstacle").css("animation-name", "none");
    
            // You will make another obstacle later
            let duration = parseFloat($("#obstacle").css("animation-duration"));
            $("#obstacle").css("animation-duration", (duration*0.8)+"s");
            setTimeout(makeObstacle, Math.random() * 2000);
    
        });
    
        // The player animation has finished
        $("#player").on("animationend", function() {
    
            // You need to stop the animation here
            $("#player").css("animation-name", "none");
    
        });
    
        // Start the obstacle animation
    
        // it seems you are simply "showing" the existing obstacle but not making a new one?
        setTimeout(makeObstacle, Math.random() * 2000);
    
        // Start the game over checking
        setTimeout(checkGameover, 100);
    
        // game area not defined in game.html?
        // $("#gamearea").on('click', jump);
        $("#gamearea").on('click', Socket.sendJumpEvent);
}


function enterGame() {
    startGame();
}






/*
$(document).ready(function() {
<<<<<<< Updated upstream
    
});
*/

$(function () {
=======
>>>>>>> Stashed changes

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
<<<<<<< Updated upstream
            setTimeout(Socket.sendEnterGameRequest, 1000);
=======
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
>>>>>>> Stashed changes
            console.log("socket connect success 2");
        }
        
        // enterGame();
    },
    () => 
    {   // sign-in failure
        console.log("Log in failure");
    });

<<<<<<< Updated upstream
});

function enterGame() {
    setUpGameArea();
    startGame(1000, 160);
}
=======

});


$(function () {

    

});
>>>>>>> Stashed changes
