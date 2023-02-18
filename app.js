const express = require("express");
const {open} = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

//INITIALIZING DB AND SERVER

const initializeDBAndServer = async () => {
    try{
         db = await open({
            filename: dbPath,
            driver: sqlite3.Database,
        });
        app.listen(3000, () => {
            console.log("Running Successfully")
        });
    } catch(e) {
        console.log(`DB error: ${e.message}`)
        process.exit(1);
    };
};

initializeDBAndServer();

// API 1 - Get all players details

const convertDbObjectToResponseObject = (eachPlayer) => {
        return {
            playerId: eachPlayer.player_id,
            playerName: eachPlayer.player_name,
            jerseyNumber: eachPlayer.jersey_number,
            role: eachPlayer.role,
        };
        };

app.get("/players/", async (request, response) =>{
    const allPlayersQuery = 
                                `SELECT 
                                * 
                                FROM cricket_team 
                                ORDER BY player_id`;
    const playerData = await db.all(allPlayersQuery);
    response.send( playerData.map((eachPlayer) =>
        convertDbObjectToResponseObject(eachPlayer)
        )
    );
});


// API 2 - CREATE A PLAYER

app.post("/players/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const createPlayerQuery = `INSERT INTO cricket_team(player_name,
    jersey_number,role) 
    VALUES('${playerName}',${jerseyNumber},'${role}');`;
  const createPlayerQueryResponse = await db.run(createPlayerQuery);
  response.send(`Player Added to Team`);
});


// API 3 - GET PLAYER

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerDetailsQuery = `select * from cricket_team where 
  player_id = ${playerId};`;
  const getPlayerDetailsQueryResponse = await db.get(
    getPlayerDetailsQuery
  );
  response.send(convertDbObjectToResponseObject(getPlayerDetailsQueryResponse));
});


// API 4 - UPDATE PLAYER

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName, jerseyNumber, role } = request.body;
  const updatePlayerDetailsQuery = `update cricket_team set 
  player_name = '${playerName}' , jersey_number = ${jerseyNumber} , role = '${role}' 
  where player_id = ${playerId};`;
  await db.run(updatePlayerDetailsQuery);
  response.send("Player Details Updated");
});


//api 5 - delete Player

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
  DELETE FROM
    cricket_team
  WHERE
    player_id = ${playerId};`;
  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});

//

module.exports = app;



