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
    upperObstacle.setAttribute("fill", "#fdf3e9");    
    upperObstacle.setAttribute("rx", "10");
    upperObstacle.setAttribute("ry", "10");


    const lowerObstacle = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    lowerObstacle.setAttribute("width", obstacleWidth);
    lowerObstacle.setAttribute("height", lowerHeight.toString());
    lowerObstacle.setAttribute("y", lowerY+10);
    lowerObstacle.setAttribute("fill", "#fdf3e9");
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


/* Shooting */
document.addEventListener('keydown', function(event) {
    if (event.key === 'k') {
        Socket.sendFireBulletEvent(playerX, playerY);
        //shootBullet(playerY);
    }
});

function shootBullet(playerX, playerY) {
    const bullet = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    bullet.setAttribute("x", playerX + 10);
    bullet.setAttribute("y", playerY + 10);
    bullet.setAttribute("width", "10");
    bullet.setAttribute("height", "10");
    bullet.setAttribute("fill", "red");
    document.querySelector("svg").appendChild(bullet);
    animateBullet(bullet);
}

function animateBullet(bullet) {
    let xPos = parseInt(bullet.getAttribute("x"), 10);
    const speed = 5;

    function move() {
        xPos += speed;
        bullet.setAttribute("x", xPos);

        // Check for collision with obstacles
        if (checkCollisionWithObstacles(xPos, parseInt(bullet.getAttribute("y"), 10))) {
            bullet.remove(); // remove bullet if it hits an obstacle
        } else if (xPos < 1000) {
            requestAnimationFrame(move);
        } else {
            bullet.remove(); // remove bullet when it goes off screen
        }
    }

    requestAnimationFrame(move);
}

function checkCollisionWithObstacles(bulletX, bulletY) {
    const obstacles = document.querySelectorAll(".obstacle");
    for (let obstacle of obstacles) {
        const upperObstacle = obstacle.children[0];
        const lowerObstacle = obstacle.children[1];
        const obstacleX = parseInt(obstacle.getAttribute("transform").match(/translate\(([^,]+),/)[1]);

        // 假设障碍物宽度为50
        if (bulletX > obstacleX && bulletX < obstacleX + 80) {
            // 检查子弹是否击中上面的柱子
            const upperObstacleHeight = parseInt(upperObstacle.getAttribute("height"));
            if (bulletY >= 0 && bulletY <= upperObstacleHeight) {
                upperObstacle.remove(); // 如果击中，移除上面的柱子
                return true; // 返回碰撞为真
            }

            // 检查子弹是否击中下面的柱子
            const lowerObstacleY = parseInt(lowerObstacle.getAttribute("y"));
            const lowerObstacleHeight = parseInt(lowerObstacle.getAttribute("height"));
            if (bulletY >= lowerObstacleY && bulletY <= lowerObstacleY + lowerObstacleHeight) {
                lowerObstacle.remove(); // 如果击中，移除下面的柱子
                return true; // 返回碰撞为真
            }
        }
    }
    return false; // 如果没有任何碰撞，返回假
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

function enableCheatMode() {
    enterPressed = true;
    $("#player").css('opacity', '0.5');
}

function disableCheatMode() {
    enterPressed = false;
    $("#player").css('opacity', '1'); 
}


document.addEventListener('keydown', function(event) {
    if (event.key === "Enter") {
        Socket.sendEnableCheatModeEvent();
    }
});

document.addEventListener('keyup', function(event) {
    if (event.key === "Enter") {
        Socket.sendDisableCheatModeEvent();
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
    /* ********************************************** */
    /* Shoule be Modified, request date from server */
    /* ********************************************** */
    document.getElementById('jump-number').textContent = 0;
    document.getElementById('shoot-number').textContent = 0;
    document.getElementById('no1-user').textContent = "Alice";
    document.getElementById('no1-score').textContent = 250;
    document.getElementById('no2-user').textContent = "Alice";
    document.getElementById('no2-score').textContent = 250;
    document.getElementById('no3-user').textContent = "Alice";
    document.getElementById('no3-score').textContent = 250;
    /* ********************************************** */

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




const GamePage = (function() {
    // This function initializes the UI
    const initialize = function() {
        hide();
    };

    const connect = function() {
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
    }

    // This function shows the form
    const show = function() {
        connect();
        document.getElementById("game-container").style.display = "block";
        //$("game-container").fadeIn(500);
    };

    // This function hides the form
    const hide = function() {
        document.getElementById("game-container").style.display = "none";
        //$("game-container").fadeOut(500);
    };

    return { initialize, show, hide };
})();

const FrontPage = (function() {
    // This function initializes the UI
    const initialize = function() {
        hide();
        document.getElementById("sign-in-button").onclick = function() {
            clickSignInPage();
        };
        document.getElementById("register-button").onclick = function() {
            clickRegisterPage();
        };
    };

    const clickSignInPage = function() {
        hide();
        SignInPage.show();
    }

    const clickRegisterPage = function() {
        hide();
        RegisterPage.show();
    }

    // This function shows the form
    const show = function() {
        // $("#front-page").fadeIn(500);
        document.getElementById("front-page").style.display = "block";
    };

    // This function hides the form
    const hide = function() {
        //$("#front-page").fadeOut(500);
        document.getElementById("front-page").style.display = "none";
    };

    return { initialize, clickSignInPage, clickRegisterPage, show, hide };
})();

const SignInPage = (function() {
    // This function initializes the UI
    const initialize = function() {
        hide();
        //$("#sign-in-page").hide();

        document.getElementById("sign-in-page-back-button").onclick = function() {
            $("#sign-in-page").hide();
            FrontPage.show();
        };

        $("#sign-in-form").on("submit", (e) => {
            // Do not submit the form
            e.preventDefault();

            // Get the input fields
            const username = $("#sign-in-username").val().trim();
            const password = $("#sign-in-password").val().trim();

            // Send a signin request
            Authentication.signin(username, password,
                () => {
                    hide();
                    GamePage.show();
                },
                (error) => { 
                    console.log("Log in failure");
                    $("#signin-message").text(error); 
                }
            );
        });
    };

    // This function shows the form
    const show = function() {
        document.getElementById("sign-in-page").style.display = "block";
        //$("#sign-in-page").fadeIn(500);
    };

    // This function hides the form
    const hide = function() {
        document.getElementById("sign-in-page").style.display = "none";
        //$("#sign-in-page").fadeOut(500);
    };

    return { initialize, show, hide };
})();

const RegisterPage = (function() {
    // This function initializes the UI
    const initialize = function() {
        $("#register-page").hide();
        $("#register-redirect-page").hide();

        document.getElementById("register-redirect-page-back-button").onclick = function() {
            $("#register-redirect-page").hide();
            SignInPage.show();
        };

        document.getElementById("register-page-back-button").onclick = function() {
            $("#register-page").hide();
            FrontPage.show();
        };

        $("#register-form").on("submit", (e) => {
            // Do not submit the form
            e.preventDefault();

            // Get the input fields
            const username = $("#register-username").val().trim();
            const name     = $("#register-name").val().trim();
            const password = $("#register-password").val().trim();
            const confirmPassword = $("#register-confirm").val().trim();

            // Password and confirmation does not match
            if (password != confirmPassword) {
                $("#register-message").text("Passwords do not match.");
                return;
            }

            // Send a register request
            Registration.register(username, name, password,
                () => {
                    $("#register-form").get(0).reset();
                    $("#register-page").hide();
                    $("#register-redirect-page").show();
                },
                (error) => { $("#register-message").text(error); }
            );
        });
    };

    // This function shows the form
    const show = function() {
        document.getElementById("register-page").style.display = "block";
        //$("#register-page").fadeIn(500);
    };

    // This function hides the form
    const hide = function() {
        document.getElementById("register-page").style.display = "none";
        // $("#register-page").fadeOut(500);
    };

    return { initialize, show, hide };
})();

const UI = (function() {

    // The components of the UI are put here
    const components = [SignInPage, RegisterPage, FrontPage, GamePage];

    // This function initializes the UI
    const initialize = function() {
        // Initialize the components
        for (const component of components) {
            component.initialize();
        }
    };

    return { initialize };
})();



$(document).ready(function() {

    UI.initialize();
    FrontPage.show();
    //SignInPage.show();

});

