const express = require("express");

const bcrypt = require("bcrypt");
const fs = require("fs");
const session = require("express-session");

// Create the Express app
const app = express();

// Use the 'public' folder to serve static files
app.use(express.static("public"));

// Use the json middleware to parse JSON data
app.use(express.json());

// Use the session middleware to maintain sessions
const chatSession = session({
    secret: "game",
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: { maxAge: 300000 }
});
app.use(chatSession);

// This helper function checks whether the text only contains word characters
function containWordCharsOnly(text) {
    return /^\w+$/.test(text);
}

// Handle the /register endpoint
app.post("/register", (req, res) => {
    // Get the JSON data from the body
    const { username, name, password } = req.body;

    //
    // D. Reading the users.json file
    //
    const users = JSON.parse(fs.readFileSync("./data/game_users.json"));
    console.log(users);
    console.log(users["tony"]);
    //
    // E. Checking for the user data correctness
    //
    if (!username || !name) {
        res.json({
            status: "error",
            error: "Username/avatar/name cannot be empty."
        });
        return;
    }
    if (!containWordCharsOnly(username)) {
        res.json({
            status: "error",
            error: "Username should only use underscore, letters or numbers."

        });
        return;
    }
    if ((username in users)) {
        res.json({
            status: "error",
            error: "Username has already been used."
        });
        return;
    }

    //
    // G. Adding the new user account
    //
    const hash = bcrypt.hashSync(password, 10);
    users[username] = {name, hash};
    
    //
    // H. Saving the users.json file
    //
    fs.writeFileSync("./data/game_users.json", JSON.stringify(users, null, " "));
    
    //
    // I. Sending a success response to the browser
    //
    res.json({status: "success"});
    // Delete when appropriate
    // res.json({ status: "error", error: "This endpoint is not yet implemented." });
});

// Handle the /signin endpoint
app.post("/signin", (req, res) => {
    // Get the JSON data from the body
    const { username, password } = req.body;

    //
    // D. Reading the users.json file
    //
    const users = JSON.parse(fs.readFileSync("./data/game_users.json"));
    //
    // E. Checking for username/password
    //
    //empty username
    if (!username) {
        res.json({
            status: "error",
            error: "Incorrect username/password."
        });
        return;
    }

    // other error checkings? ...

    // no such user?
    if (!(username in users)) {
        res.json({
            status: "error",
            error: "Incorrect username/password."
        });
        return;
    }
    // correct user and password?
    const hashedPassword = users[username].hash;
    if (!bcrypt.compareSync(password, hashedPassword)) {
        res.json({
            status: "error",
            error: "Incorrect username/password."
        });
        return;
    }

    //
    // G. Sending a success response with the user account
    //


    // modify signed-in status...
    // refer to video

    
    req.session.user = {
        username: username,
        name: users[username].name
    };
    

    res.json({
        status: "success", 
        user: {
            username: username,
            name: users[username].name
        }
        
    });
    return;
    res.json({ status: "error", error: "Signin Failure!" });
    // Delete when appropriate
    // res.json({ status: "error", error: "This endpoint is not yet implemented." });
});

// Handle the /validate endpoint
app.get("/validate", (req, res) => {

    //
    // B. Getting req.session.user
    //
    // console.log(req.session.user);

    
    if (typeof req.session.user != "undefined") {
        const {username, name} = req.session.user;
        res.json({
            status: "success",
            user: {
                username: username,
                name: name
            }
        });
        return;
    }
    //
    // D. Sending a success response with the user account
    //
    res.json({ status: "error", error: "Validation Error!" });

    
    // Delete when appropriate
    // res.json({ status: "error", error: "This endpoint is not yet implemented." });
});

// Handle the /signout endpoint
app.get("/signout", (req, res) => {

    //
    // Deleting req.session.user
    //
    delete req.session.user;

    //
    // Sending a success response
    //
    res.json({
        status: "success"
    });
 
    // Delete when appropriate
    // res.json({ status: "error", error: "This endpoint is not yet implemented." });
});


//
// ***** Please insert your Lab 6 code here *****
//


const { createServer } = require("http");
const { Server } = require("socket.io");
const httpServer = createServer( app );
const io = new Server(httpServer);

io.use((socket, next) => {
    chatSession(socket.request, {}, next);
});

const onlineUserList = {};

let num_users = 0;

let obstacleInterval;

const thisGameScores = {};
const thisGameJumps = {};
const thisGameShoots = {};


io.on("connection", (socket) => {
    if (socket.request.session.user) {
        const user = socket.request.session.user;
        const {username, name} = user;
        onlineUserList[username] = user;
        console.log("123");
        console.log(onlineUserList);
        io.emit("add user", JSON.stringify(user));
    }
    socket.on("disconnect", () => {
        if (socket.request.session.user) {
            const user = socket.request.session.user;
            const {username, name} = user;
            if (onlineUserList[username]) {
                delete onlineUserList[username];
            }
            io.emit("remove user", JSON.stringify(user));
            
            console.log("456");
            console.log(onlineUserList);
        }
    });
    socket.on("get users", () => {
        socket.emit("users", JSON.stringify(onlineUserList));
    });

    // jump, shoot, update score, finish

    socket.on("request enter game", () => {

        if (socket.request.session.user) {
            const user = socket.request.session.user;
            const {username, name} = user;

            const message = {
                user: user,
            };

            num_clients = Object.keys(onlineUserList).length;
            if (num_clients == 1) {
                // if the server has 2 clients requesting entering game, start the game
                io.emit("start game", JSON.stringify(message, null, " "));

                obstacleInterval = setInterval(() => {
                    
                    const m = {
                        // m should contain parameters related to obstacle creation
                        obstacleWidth: 80, 
                        gapHeight: 150, 
                        upperHeight: Math.random() * 200 + 50
                    };

                    io.emit("create obstacle", JSON.stringify(m, null, " "));
                }, 2000);

            }

            if (num_clients == 2) {
                // if the server has 2 clients requesting entering game, start the game
                io.emit("start game", JSON.stringify(message, null, " "));

                obstacleInterval = setInterval(() => {
                    
                    const m = {
                        // m should contain parameters related to obstacle creation
                        obstacleWidth: 80, 
                        gapHeight: 100, 
                        upperHeight: Math.random() * 200 + 50
                    };

                    io.emit("create obstacle", JSON.stringify(m, null, " "));
                }, 1000);

            }

        }
    });

    socket.on("jump", (jumps) => {

        if (socket.request.session.user) {
            const user = socket.request.session.user;
            const {username, name} = user;

            thisGameJumps[username] = jumps;

            const message = {
                user: user,
            };

            io.emit("someone jump", JSON.stringify(message, null, " "));
        }
    });

    socket.on("shoot", () => {

        if (socket.request.session.user) {
            const user = socket.request.session.user;
            const {username, name} = user;

            const message = {
                user: user,
            };

            
            io.emit("someone shoot", JSON.stringify(message, null, " "));
            

            
        }
    });

    socket.on("update score", (score) => {

        if (socket.request.session.user) {
            const user = socket.request.session.user;
            const {username, name} = user;

            thisGameScores[username] = score;

            const message = {
                user: user,
                score: score
            };

            io.emit("someone update score", JSON.stringify(message, null, " "));
        }
    });

    socket.on("finish", () => {

        if (socket.request.session.user) {
            const user = socket.request.session.user;
            const {username, name} = user;



            /*
            const highScores = JSON.parse(fs.readFileSync("./data/game_highscores.json"));

            let maxScore = 0;
            let maxScoreUsername = "";
            for (const username in thisGameScores)
            {
                if (thisGameScores[username] > maxScore) {
                    maxScore = thisGameScores[username];
                    maxScoreUsername = username;
                }
            }
            if (maxScoreUsername != "") {
                highScores[maxScoreUsername] = maxScore;
            }

            fs.writeFileSync("./data/game_highscores.json", JSON.stringify(highScores, null, " "));


            const highScoresArray = [];
            const highScoresUsersArray = [];
            let i = 0;
            for (const username in highScores) {
                highScoresArray[i] = highScores[username];
                highScoresUsersArray[i] = username;
                ++i;
            }

            // sort into descending
            let exit = false;
            while(exit == false) {
                exit = true;
                for (let j = 0; j < highScoresArray.length - 1; ++j) {
                    if (highScoresArray[j] < highScoresArray[j+1]) {

                        let temp = highScoresArray[j];
                        highScoresArray[j] = highScoresArray[j+1];
                        highScoresArray[j+1] = temp;

                        let temp2 = highScoresUsersArray[j];
                        highScoresUsersArray[j] = highScoresUsersArray[j+1];
                        highScoresUsersArray[j+1] = temp2;
                        exit = false;
                    }
                }
            }

            const highScoresPairsArray = [];

            for (let j = 0; j < highScoresArray.length - 1; ++j) {
                const obj = {
                    highScoreUsername: highScoresUsersArray[j],
                    highScore: highScoresArray[j]
                };
                highScoresPairsArray[j] = obj;
            }

            const championScoresPairsArray = [];
            const secondScoresPairsArray = [];
            const thirdScoresPairsArray = [];

            let k = 0;
            let n = 0;
            if (k < highScoresPairsArray.length) 
                championScoresPairsArray[n] = highScoresPairsArray[k];
            k += 1;
            n += 1;
            while (k < highScoresPairsArray.length ) {
                if (highScoresPairsArray[k][highScore] == highScoresPairsArray[k-1][highScore]) {
                    championScoresPairsArray[n] = highScoresPairsArray[k];
                    k += 1;
                    n += 1;
                }
                else {
                    break;
                }
            }

            n = 0;
            if (k < highScoresPairsArray.length) 
                secondScoresPairsArray[n] = highScoresPairsArray[k];
            k += 1;
            while (k < highScoresPairsArray.length ) {
                if (highScoresPairsArray[k][highScore] == highScoresPairsArray[k-1][highScore]) {
                    secondScoresPairsArray[n] = highScoresPairsArray[k];
                    k += 1;
                }
                else {
                    break;
                }
            }

            n = 0;
            if (k < highScoresPairsArray.length) 
                thirdScoresPairsArray[n] = highScoresPairsArray[k];
            k += 1;
            while (k < highScoresPairsArray.length ) {
                if (highScoresPairsArray[k][highScore] == highScoresPairsArray[k-1][highScore]) {
                    thirdScoresPairsArray[n] = highScoresPairsArray[k];
                    k += 1;
                }
                else {
                    break;
                }
            }

            */

            const message = {
                user: user,
                thisGameScores: thisGameScores,
                thisGameJumps: thisGameJumps,
                thisGameShoots: thisGameShoots,
                
            };

            /*
            const message = {
                user: user,
                thisGameScores: thisGameScores,
                thisGameJumps: thisGameJumps,
                thisGameShoots: thisGameShoots,
                firstThreeScoresPairs: {
                    championScoresPairsArray: championScoresPairsArray,
                    secondScoresPairsArray: secondScoresPairsArray,
                    thirdScoresPairsArray: thirdScoresPairsArray
                }
            };
            */

            // if game is over, all users finish
            clearInterval(obstacleInterval);

            io.emit("someone finish", JSON.stringify(message, null, " "));
        }
    });

    socket.on("request fire bullet", (message) => {
        if (socket.request.session.user) {
            const user = socket.request.session.user;
            const {username, name} = user;

            message = JSON.parse(message);
            const {playerX, playerY, shoots} = message;

            thisGameShoots[username] = shoots;

            if (num_clients == 2) {
                io.emit("fire bullet", JSON.stringify(message, null, " "));
            }
        }
    });

    socket.on("request enable cheat mode", () => {
        if (socket.request.session.user) {
            const user = socket.request.session.user;
            const {username, name} = user;

            io.emit("enable cheat mode");
        }
    });

    socket.on("request disable cheat mode", () => {
        if (socket.request.session.user) {
            const user = socket.request.session.user;
            const {username, name} = user;

            io.emit("disable cheat mode");
        }
    });

});


// Use a web server to listen at port 8000
/*
app.listen(8000, () => {
    console.log("The chat server has started...");
});
*/

httpServer.listen(8000, () => {
    console.log("The Horny Bird server has started...");
});