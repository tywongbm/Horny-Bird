function animateObstacle() {
    const obstacle = document.getElementById("obstacle");
    let startPos = 1000;
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

function startGame() {
    animateObstacle();
    gravityInterval = setInterval(updatePlayer, 20);
    setInterval(createObstacle, obstacleInterval);
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
            clearInterval(gravityInterval);
            cancelAnimationFrame(animationFrameId);
            alert("gameover")
    } else {
        setTimeout(checkGameover, 10);
    }
}

$(document).ready(function() {
    $("#gamearea").on('click', jump);
    startGame();
});

$(function () {
    // Handle the spacebar key for controlling the player
    $(document).on("keydown", function(e) {
        // The player jumps if the spacebar key is down
        if (e.keyCode == 32)
            jump();
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
    setTimeout(makeObstacle, Math.random() * 2000);

    // Start the game over checking
    setTimeout(checkGameover, 100);
});