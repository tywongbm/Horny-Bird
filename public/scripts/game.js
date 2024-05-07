const Game = (function() {


    return { };
})();



function animateObstacle(startPos) {
    const obstacle = document.getElementById("obstacle");
    // let startPos = 1000;
    const endPos = -120;
    const speed = 1;

    function frame() {
        startPos -= speed;
        if (startPos > endPos) {
            obstacle.style.transform = `translateX(${startPos}px)`;
            animationFrameId = requestAnimationFrame(frame);
        }
    }
    animationFrameId = requestAnimationFrame(frame);
}

function makeObstacle() {

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


function checkGameover() {
    const playerRect = $("#player")[0].getBoundingClientRect();
    const upperObstacleRect = $("#upperObstacle")[0].getBoundingClientRect();
    const lowerObstacleRect = $("#lowerObstacle")[0].getBoundingClientRect();

    if ((playerRect.top < upperObstacleRect.bottom && playerRect.left > upperObstacleRect.left && playerRect.right < upperObstacleRect.right) ||
        (playerRect.bottom > lowerObstacleRect.top && playerRect.left > lowerObstacleRect.left && playerRect.right < lowerObstacleRect.right) ) {  
            Gameover();
    } else {
        setTimeout(checkGameover, 10);
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






/*
$(document).ready(function() {
    
});
*/

$(function () {

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
            setTimeout(Socket.sendEnterGameRequest, 1000);
            console.log("socket connect success 2");
        }
        
        // enterGame();
    },
    () => 
    {   // sign-in failure
        console.log("Log in failure");
    });

});

function enterGame() {
    setUpGameArea();
    startGame(1000, 160);
}