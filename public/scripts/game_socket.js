const Socket = (function() {
    // This stores the current Socket.IO socket
    let socket = null;

    // This function gets the socket from the module
    const getSocket = function() {
        return socket;
    };

    // This function connects the server and initializes the socket
    const connect = function() {
        socket = io();

        // Wait for the socket to connect successfully
        socket.on("connect", () => {
            // Get the online user list
            socket.emit("get users");

        });

        // Set up the users event
        socket.on("users", (onlineUsers) => {
            onlineUsers = JSON.parse(onlineUsers);

            // Show the online users
            //OnlineUsersPanel.update(onlineUsers);
        });

        // Set up the add user event
        socket.on("add user", (user) => {
            user = JSON.parse(user);

            // Add the online user
            //OnlineUsersPanel.addUser(user);
        });

        // Set up the remove user event
        socket.on("remove user", (user) => {
            user = JSON.parse(user);

            // Remove the online user
            //OnlineUsersPanel.removeUser(user);
        });

        socket.on("someone jump", (message) => {
            message = JSON.parse(message);
            const {user} = message;
            const {username, name} = user;
            jump();
        });

        socket.on("someone shoot", (message) => {
            message = JSON.parse(message);
            const {user} = message;
            const {username, name} = user;
            // shoot
        });

        socket.on("someone update score", (message) => {
            message = JSON.parse(message);
            const {user, score} = message;
            const {username, name} = user;
            updateScore(score);
        });

        socket.on("someone finish", (message) => {
            message = JSON.parse(message);
            const {user} = message;
            const {username, name} = user;
            endGame();
        });

        socket.on("start game", (message) => {
            message = JSON.parse(message);
            const {user} = message;
            const {username, name} = user;
            console.log("start game");
            enterGame();
        });

        socket.on("create obstacle", (m) => {
            m = JSON.parse(m);
            // const {...} = message;

            const {obstacleWidth, gapHeight, upperHeight} = m;
            console.log("create obstacle");

            // create obstacle...
            createAndAnimateObstacle(obstacleWidth, gapHeight, upperHeight);

        });

        socket.on("enable cheat mode", () => {
            enableCheatMode();
        });

        socket.on("disable cheat mode", () => {
            disableCheatMode();
        });

        return true;
    };

    // This function disconnects the socket from the server
    const disconnect = function() {
        socket.disconnect();
        socket = null;
    };


    const sendEnterGameRequest = function () {
        console.log("request enter game 0");
        if (socket && socket.connected) {
            socket.emit("request enter game");
            console.log("request enter game 1");
        }
    }


    const sendJumpEvent = function() {
        if (socket && socket.connected) {
            socket.emit("jump");
        }
    };

    const sendShootEvent = function() {
        if (socket && socket.connected) {
            socket.emit("shoot");
        }
    };

    const sendUpdateScoreEvent = function(score) {
        if (socket && socket.connected) {
            socket.emit("update score", score);
        }
    };

    const sendFinishEvent = function() {
        if (socket && socket.connected) {
            socket.emit("finish");
        }
    };

    

    ///aaa

    const sendEnableCheatModeEvent = function() {
        if (socket && socket.connected) {
            socket.emit("request enable cheat mode");
        }
    }

    const sendDisableCheatModeEvent = function() {
        if (socket && socket.connected) {
            socket.emit("request disable cheat mode");
        }
    }

    return { getSocket, connect, disconnect, sendEnterGameRequest, sendJumpEvent, sendShootEvent ,sendUpdateScoreEvent, sendFinishEvent, sendFireBulletEvent, sendEnableCheatModeEvent, sendDisableCheatModeEvent };
})();