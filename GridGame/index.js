const fastnoise = require('fastnoisejs')
const readline = require('readline')
const argon2 = require('argon2');
var express = require('express');
app = express();
const path = require('path');
const mysql   = require('mysql');
const bodyParser = require('body-parser');
const Victor = require('victor')
const PF = require('pathfinding');


app.use(bodyParser.urlencoded({extended: true}));


const noise1 = fastnoise.Create(464)
const noise2 = fastnoise.Create(2341)
noise1.SetNoiseType(fastnoise.Perlin)
noise1.SetSeed(744212321)
noise1.SetFrequency(0.01)

noise2.SetNoiseType(fastnoise.Perlin)
noise2.SetSeed(4324)
noise2.SetFrequency(0.01)
 
// for (let x = 0; x < 10; x++) {
//   for (let y = 0; y < 10; y++) {
//     console.log(noise.GetNoise(x, y))
//   }
// }
const now = Date.now();
const lastUpdateTime = now;
const dt = (now - lastUpdateTime) / 1000;

var groups = {}

var speed = 3


const db = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'crimeosucksballs336',
  database : 'userInfo'
});

//Connect
db.connect((err) => {
	if(err){
		throw err;
	}
	console.log("MySql Connected....")
});


var http = require('http').createServer(app);



var io = require('socket.io')(http);

var borderRadius = 800;
var trees = [];

var players = [];
var entities = []


var chunks ={};

var chunkSize = 8;
//takes player index
var playerRender = [];

createChunk(0,0);


var defaultGrid = {
	isSolid : false,
	isEmpty : true
}

var treeGrid = {
	name : "tree",
	isEmpty : false,
	isSolid : true,
	dura : 100
}

var wallGrid = {
	name : "wall",
	isEmpty : false,
	isSolid : true,
	dura : 200,

}

var catusGrid = {
	name : "catus",
	isEmpty : false,
	isSolid : true,
	dura : 120
}

var savannaGrid = {
	name : "savanna",
	isEmpty : false,
	isSolid : true,
	dura : 120
}

var jungleGrid = {
	name : "jungle",
	isEmpty : false,
	isSolid : true,
	dura : 120
}

var plainGrid = {
	name : "plain",
	isEmpty : false,
	isSolid : true,
	dura : 120
}

var marshGrid = {
	name : "marsh",
	isEmpty : false,
	isSolid : true,
	dura : 120
}

var frostGrid = {
	name : "frost",
	isEmpty : false,
	isSolid : true,
	dura : 120
}

var snowyGrid = {
	name : "snow",
	isEmpty : false,
	isSolid : true,
	dura : 120
}

var frozenGrid = {
	name : "frozen",
	isEmpty : false,
	isSolid : true,
	dura : 120
}

var rockGrid = {
	name : "rock",
	isEmpty : false,
	isSolid : true,
	dura : 150
}

var waterGrid = {
	name : "water",
	isEmpty : false,
	isSolid : false,
}

var doorGrid = {
	name : "door",
	isEmpty : false,
	isSolid : false,
	dura : 60
}

var groupHub = {
	name : "groupHub",
	isEmpty : false,
	isSolid : true,
	dura : 200
}

setChunks()
setGroups()


//Puts chunks saved from database into program
function setChunks(){
	let sql = `SELECT * FROM chunks`
	let query = db.query(sql, (err, result)=> {
		for(i = 0; i<result.length; i++){
			// console.log(result[i].chunkX)
			// chunks[cX + "x" + cY] =

			if(chunks[result[i].chunkX + "x" + result[i].chunkY] === undefined){
				createEmptyChunk(result[i].chunkX, result[i].chunkY)

			}
			if(result[i].isSolid === 1){
				chunks[result[i].chunkX + "x" + result[i].chunkY].chunk[result[i].gridX][result[i].gridY].isSolid = true
			}
			if(result[i].isSolid === 0){
				chunks[result[i].chunkX + "x" + result[i].chunkY].chunk[result[i].gridX][result[i].gridY].isSolid = false
			}
			if(result[i].isEmpty === 1){
				chunks[result[i].chunkX + "x" + result[i].chunkY].chunk[result[i].gridX][result[i].gridY].isEmpty = true
			}
			if(result[i].isEmpty === 0){
				chunks[result[i].chunkX + "x" + result[i].chunkY].chunk[result[i].gridX][result[i].gridY].isEmpty = false
			}
			
			chunks[result[i].chunkX + "x" + result[i].chunkY].chunk[result[i].gridX][result[i].gridY].name = result[i].name
			chunks[result[i].chunkX + "x" + result[i].chunkY].chunk[result[i].gridX][result[i].gridY].dura = result[i].dura
			chunks[result[i].chunkX + "x" + result[i].chunkY].chunk[result[i].gridX][result[i].gridY].group = result[i].groupName



		}
		
	})
	
}

function createEmptyChunk(cX, cY){
	var chunkInfo = {
		x : cX,
		y : cY,
		chunk : [],
		playersInChunk : [],
		entitiesInChunk : []
	}
		for(var x = 0; x < chunkSize; x++){
			chunkInfo.chunk.push([]);
			for(var y = 0; y < chunkSize; y++){
				chunkInfo.chunk[x].push({});
				chunkInfo.chunk[x][y] = { ...defaultGrid};
				

			}
		}
		chunks[cX + "x" + cY] = chunkInfo;
}


function createChunk(cX, cY){
	var chunkInfo = {
		x : cX,
		y : cY,
		chunk : [],
		playersInChunk : [],
		entitiesInChunk : []
	}
		for(var x = 0; x < chunkSize; x++){
			chunkInfo.chunk.push([]);
			for(var y = 0; y < chunkSize; y++){
				chunkInfo.chunk[x].push({});
				chunkInfo.chunk[x][y] = { ...defaultGrid};
				var noiseValueT = noise1.GetNoise(x + (chunkInfo.x*8), y + (chunkInfo.y*8))
				var noiseValueR = noise2.GetNoise(x + (chunkInfo.x*8), y + (chunkInfo.y*8))

				var randomNum = Math.random()
				if(randomNum< 0.2 && noiseValueT > 0.3 && noiseValueR < -0.3){	
					chunkInfo.chunk[x][y] = { ...catusGrid};
				}

				if(randomNum< 0.2 && noiseValueT > 0.3 && noiseValueR > -0.3 && noiseValueR < 0.3){	
					chunkInfo.chunk[x][y] = { ...savannaGrid};
				}

				if(randomNum< 0.2 && noiseValueT > 0.3 && noiseValueR > 0.3){	
					chunkInfo.chunk[x][y] = { ...jungleGrid};
				}

				if(randomNum< 0.2 && noiseValueT < 0.3 && noiseValueT > -0.3 && noiseValueR < -0.3){	
					chunkInfo.chunk[x][y] = { ...plainGrid};
				}

				if(randomNum< 0.2 && noiseValueT < 0.3 && noiseValueT > -0.3 && noiseValueR > -0.3 && noiseValueR < 0.3){	
					chunkInfo.chunk[x][y] = { ...treeGrid};
				}

				if(randomNum< 0.2 && noiseValueT < 0.3 && noiseValueT > -0.3 && noiseValueR > 0.3){	
					chunkInfo.chunk[x][y] = { ...marshGrid};
				}

				if(randomNum< 0.2 && noiseValueT < -0.3 && noiseValueR < -0.3){	
					chunkInfo.chunk[x][y] = { ...frostGrid};
				}

				if(randomNum< 0.2 && noiseValueT < -0.3 && noiseValueR > -0.3 && noiseValueR < 0.3){	
					chunkInfo.chunk[x][y] = { ...snowyGrid};
				}

				if(randomNum< 0.2 && noiseValueT < -0.3 && noiseValueR > 0.3){	
					chunkInfo.chunk[x][y] = { ...frozenGrid};
				}

				// if(randomNum<1){
				// 	createCow(cX * 40 * 8 + x * 40 + 20, cY * 40 * 8 + y * 40 + 20)
				// }

				// if(randomNum< 0.2 && (noiseValueT >= -0.2 && noiseValueT < 0.2)  && (noiseValueR >= -0.2 && noiseValueR < 0.2)){	
				// 	chunkInfo.chunk[x][y] = { ...treeGrid};
				// }

				// if(randomNum< 0.2 && noiseValueT < -0.8 && noiseValueR < -0.8 ){	
				// 	chunkInfo.chunk[x][y] = { ...rockGrid};
				// }

				// if(noiseValueR >= 0.9){	
				// 	chunkInfo.chunk[x][y] = { ...waterGrid};
				// }


			}
		}
		chunks[cX + "x" + cY] = chunkInfo;
		for(var x = 0; x < chunkSize; x++){
			for(var y = 0; y < chunkSize; y++){
				if(chunks[cX + "x" + cY].chunk[x][y].isEmpty === true &&  Math.random()<0.05){
				
					createCow(cX * 40 * 8 + x * 40 + 20, cY * 40 * 8 + y * 40 + 20)

				}

			}
		}
}

//added this due to problems while coding creating chunk 0,0
// createChunk(0, 0)

function loadChunk(p){
	if(players[p].loggedIn === true){
		var positionX = players[p].gridX;
		var positionY = players[p].gridY;

		playerRender[p] = {};
		playerRender[p].cenChunkX = players[p].chunkX;
		playerRender[p].cenChunkY = players[p].chunkY;
			for(x = -1; x <=1; x++){
				for(y = -1; y <=1; y++){

					var currentChunk = {
						chunkX : players[p].chunkX + x,
						chunkY : players[p].chunkY + y
					}

					
					//consider changing to an array that pushes chunks.
					playerRender[p][currentChunk.chunkX+"x"+currentChunk.chunkY] = chunks[currentChunk.chunkX + "x" + currentChunk.chunkY];

						if(chunks[currentChunk.chunkX + "x" + currentChunk.chunkY] === undefined){
							createChunk(currentChunk.chunkX, currentChunk.chunkY)
							playerRender[p][currentChunk.chunkX+"x"+currentChunk.chunkY] = chunks[currentChunk.chunkX + "x" + currentChunk.chunkY];
						}
					}
				}
		io.to(`${playerIDs[p]}`).emit('renderedChunks', playerRender[p])
	}
}

function saveSingleGrid(chunkX, chunkY, gridX, gridY){
				let sql = `SELECT EXISTS (SELECT isSolid FROM chunks WHERE chunkX = ${chunkX} AND chunkY =  ${chunkY} AND gridX = ${gridX} AND gridY = '${gridY}')`
				let query = db.query(sql, (err, result)=> {
					// console.log(Object.values(result[0])[0])
					var name = chunks[chunkX+'x'+chunkY].chunk[gridX][gridY].name
					var dura = chunks[chunkX+'x'+chunkY].chunk[gridX][gridY].dura


					var groupDefault = ''

					if (chunks[chunkX+'x'+chunkY].chunk[gridX][gridY].group != undefined){
						groupDefault = chunks[chunkX+'x'+chunkY].chunk[gridX][gridY].group
					}




					
						if(Object.values(result[0])[0] === 1){

							if(chunks[chunkX+'x'+chunkY].chunk[gridX][gridY].name === undefined){
								name = "null"
							}

							if(chunks[chunkX+'x'+chunkY].chunk[gridX][gridY].dura === undefined){
								dura = 0
							}


							 // console.log("made it here")

							let sql2 = `UPDATE chunks SET isSolid = ${chunks[chunkX+'x'+chunkY].chunk[gridX][gridY].isSolid}, isEmpty = ${chunks[chunkX+'x'+chunkY].chunk[gridX][gridY].isEmpty}, name = '${name}', dura = ${dura}, groupName = '${groupDefault}' WHERE chunkX = ${chunkX} AND chunkY = ${chunkY} AND gridX = ${gridX} AND gridY = ${gridY}`
							let query2 = db.query(sql2, (err, result)=> {
								console.log(result)
								console.log(err)


							})
						} else {


							if(chunks[chunkX+'x'+chunkY].chunk[gridX][gridY].name === undefined){
								name = "null"
							}

							if(chunks[chunkX+'x'+chunkY].chunk[gridX][gridY].dura === undefined){
								dura = 0
							}
							// console.log("made it to else")
							// console.log(arrayChunks)
							// console.log(n + "i itteration")
							// console.log(arrayChunks[0])
							// console.log(`${chunkX}, ${chunkY}, ${gridX}, ${gridY}`)
							// console.log(chunks[chunkX+'x'+chunkY].chunk[x])

							// console.log(chunks[chunkX+'x'+chunkY].chunk[x][y].isSolid)
							var name = chunks[chunkX+'x'+chunkY].chunk[gridX][gridY].name
							var dura = chunks[chunkX+'x'+chunkY].chunk[gridX][gridY].dura

							


							let sql2 = `INSERT INTO chunks VALUES(${chunkX}, ${chunkY}, ${gridX}, ${gridY}, ${chunks[chunkX+'x'+chunkY].chunk[gridX][gridY].isSolid}, ${chunks[chunkX+'x'+chunkY].chunk[gridX][gridY].isEmpty}, '${name}', ${dura}, '${groupDefault}')`
							let query2 = db.query(sql2, (err, result)=> {
								// console.log(result);
								// console.log(err);

							})


						}
					
				})
}

function saveChunks(){
	var arrayChunks = Object.values(chunks)
	console.log(arrayChunks.length)
	var n;
	for(n=0; n < arrayChunks.length; n++){
		console.log("for itteration")
		for(x=0; x < 8; x++){
			for(y=0; y<8; y++){
				// console.log(chunks[arrayChunks[i].x+'x'+arrayChunks[i].y].chunk[x][y])
				// console.log(`${n}, ${x}, ${y}`)

				saveSingleGrid(arrayChunks[n].x, arrayChunks[n].y, x, y)
				
			}
		}
	}

	// console.log("Chunk x = " + arrayChunks[0].x)
	// console.log("Chunk y = " + arrayChunks[0].y)
	// console.log("inner array length= " + arrayChunks[0].chunk.length)
	// console.log("inner array 1= " + arrayChunks[0].chunk[0][0])
	// console.log(chunks["0x0"].chunk[0][0])

}


function emitInfo(){
	for(var i = 0; i < players.length; i++){
		if(players[i].loggedIn === true){
			var wraper = {
				// playersNearby : [],
				playerList : [],
				entityList : [],
				currentState : players[i]
			}

			// for(var x = -1; x <= 1; x++){
			// 	for(var y = -1; y <= 1; y++){
			// 		chunks[(players[i].chunkX + x) + 'x'+(players[i].chunkY + y)]
			// 	}
			// }

			// for(var x = -1; x <= 1; x++){
			// 	for(var y = -1; y <= 1; y++){

			// 		if(chunks[(players[i].chunkX + x) + "x"+ (players[i].chunkY + y)] != undefined){
					

			// 		wraper.playersNearby = wraper.playersNearby.concat(chunks[(players[i].chunkX + x) + "x"+ (players[i].chunkY + y)].playersInChunk)

					
			// 		}
			// 	}	

			// }

			// console.log(wraper.playersNearby)

			for(var n = 0; n < players[i].playersNearby.length; n++){
				if(players[players[i].playersNearby[n]].loggedIn === true && players[players[i].playersNearby[n]].ID != players[i].ID){
					// if(players[n].gridX <= players[i].gridX + 8 && players[n].gridX >= players[i].gridX - 8){
		    			// if(players[n].gridY <= players[i].gridY + 6 && players[n].gridY >= players[i].gridY - 6){
		    				var publicPlayer = {
		    					x : players[players[i].playersNearby[n]].x,
						  		y : players[players[i].playersNearby[n]].y,
						  		ID : players[players[i].playersNearby[n]].ID,
						  		health : players[players[i].playersNearby[n]].health,
						  		stamina : players[players[i].playersNearby[n]].stamina,
						  		user: players[players[i].playersNearby[n]].user
		    				}
		    				// console.log(publicPlayer)
		      				wraper.playerList.push(publicPlayer);
		    			// }
		  			// }
		  		}
			}

			for(var n = 0; n < players[i].entitiesNearby.length; n++){
				if(entities[players[i].entitiesNearby[n]].isAlive){
					wraper.entityList.push(entities[players[i].entitiesNearby[n]])
				}
				// console.log(cows)
			}

				// console.log(cows)


			// console.log(Date.now())
			wraper.t = Date.now()

			io.to(`${playerIDs[i]}`).emit('playerInfo', wraper);

		}

	}
}


function death(i){
	
	players[i].x = 0
	players[i].y = 0
	players[i].gridX = 0
	players[i].gridY = 0
	players[i].chunkX = 0
	players[i].chunkY = 0
	players[i].chunkGridX = 0
	players[i].chunkGridY = 0
	players[i].wood = 0
	players[i].health = 10



}


var playerIDs = [];


app.use(express.static('public')); //used to get files from public

app.get('/', function(req, res){
  res.render("index.ejs");
});


var playerCount = 0;

cowIDs = 0;


function createCow(x, y){

	var gridX = Math.floor(x/40)

	var gridY = Math.floor(y/40)


	var chunkX = Math.floor(gridX/8)
	

  	var chunkY = Math.floor(gridY/8)

  	var chunkGridX = gridX % 8;
  	if (chunkGridX < 0){
  		chunkGridX += 8;
  	}	

  	var chunkGridY = gridY % 8;
  	if (chunkGridY < 0){
  		chunkGridY += 8;
  	}


	entities.push({
		name: "cow",
		x: x,
		y: y,
		chunkX : chunkX,
		chunkY : chunkY,
		gridX: gridX,
		gridY: gridY,
		chunkGridX: chunkGridX,
		chunkGridY: chunkGridY,
		health: 5,
		ID: entities.length,
		isAlive: true,
		movingTowardsX: x,
		movingTowardsY: y,
		moved: false

	})
	// if(chunks[chunkX+"x"+chunkY] != undefined){
		chunks[chunkX+"x"+chunkY].entitiesInChunk.push(entities.length-1)
	// }

}

io.on('connection', function(socket){
  	console.log(socket.id + " connected");
  	playerIDs.push(socket.id);
  	players.push({
  		x : 0,
  		y : 0,
  		gridX : 0,
  		gridY : 0,
  		chunkX : 0,
  		chunkY : 0,
  		chunkGridX : 0,
  		chunkGridY : 0,
  		right : false,
  		left : false,
  		up : false,
  		down : false,
  		ID : playerCount,
  		wood : 0,
  		woodSpear : 0,
  		woodAxe : 0,
  		woodPickaxe : 0,
  		equiped : "fists",
  		door : 0,
  		health : 10,
  		stamina : 10,
  		user: undefined,
  		loggedIn: false,
  		playersNearby : [],
  		entitiesNearby : [],
  		interactingWith : "player"
  	});
  	io.to(`${socket.id}`).emit('ID', players[players.length-1].ID);
  	playerCount++;
  	var idPOS = playerIDs.indexOf(socket.id);
  	socket.on('login', function(loginInfo){
	  	console.log(loginInfo.email, loginInfo.username, loginInfo.password)
	  	let sql2 = `SELECT EXISTS (SELECT password FROM accounts WHERE email LIKE '${loginInfo.email}')`

	  	let query2 = db.query(sql2, (err, result)=> {
	  		if(Object.values(result[0])[0] === 1){
	  			let sql = `SELECT password FROM accounts WHERE email LIKE '${loginInfo.email}'`

				let query = db.query(sql, (err, result)=> {
					if(err) {throw err;} else{
						signIn(loginInfo.email, loginInfo.username, loginInfo.password, result[0].password).then(() => {
							if(access===true){
								const username = loginInfo.username
								const user = {name: username}
								players[playerIDs.indexOf(socket.id)].user = user.name

								//set player index equal to user info here
								var newX = 0;
								var newY = 0;

								players[playerIDs.indexOf(socket.id)].loggedIn = true


								


								let sql = `SELECT * FROM players WHERE username LIKE '${user.name}' `

								let query = db.query(sql, (err, result)=> {
									newX = result[0].x
									console.log(newX)
									newY = result[0].y
									console.log(newY)
									players[playerIDs.indexOf(socket.id)].role = result[0].role
									players[playerIDs.indexOf(socket.id)].wood = result[0].wood
									players[playerIDs.indexOf(socket.id)].health = result[0].health
									players[playerIDs.indexOf(socket.id)].role = result[0].role
									teleport(playerIDs.indexOf(socket.id), newX, newY)
									
								
								// console.log(newX)

								
								})
								// console.log(newY)
								
								


								io.to(`${socket.id}`).emit('login', true)

								loadChunk(playerIDs.indexOf(socket.id))





								console.log("correct password")
							} else{
								console.log("wrong password")
							}
						})
						
					}
				})
	  		}
	  	})


		
	})
  	socket.on('movement', function(state){
  		if(players[playerIDs.indexOf(socket.id)] != undefined && players[playerIDs.indexOf(socket.id)].loggedIn === true){
	  		players[playerIDs.indexOf(socket.id)].right = state.rightPressed;
	  		players[playerIDs.indexOf(socket.id)].left = state.leftPressed;
	  		players[playerIDs.indexOf(socket.id)].up = state.upPressed;
	  		players[playerIDs.indexOf(socket.id)].down = state.downPressed;
	  	}
  	} )
 //  	socket.on('fight', function(clickedArea){
 //  	if(players[playerIDs.indexOf(socket.id)].loggedIn === true){
	//   	var range = 1;
	//   	var damage = 1;
	//   	if(chunks[clickedArea.chunkClickedX + "x" + clickedArea.chunkClickedY] != undefined){
	// 	  	if(chunks[clickedArea.chunkClickedX + "x" + clickedArea.chunkClickedY].chunk[clickedArea.chunkGridXClicked][clickedArea.chunkGridYClicked].occupiedBy != undefined && isBlockInRange(range, idPOS, clickedArea) === true){
	// 				players[chunks[clickedArea.chunkClickedX + "x" + clickedArea.chunkClickedY].chunk[clickedArea.chunkGridXClicked][clickedArea.chunkGridYClicked].occupiedBy].health -= 1;
	// 				console.log("hit");
	// 				if(players[chunks[clickedArea.chunkClickedX + "x" + clickedArea.chunkClickedY].chunk[clickedArea.chunkGridXClicked][clickedArea.chunkGridYClicked].occupiedBy].health <= 0){
	// 						death(players[chunks[clickedArea.chunkClickedX + "x" + clickedArea.chunkClickedY].chunk[clickedArea.chunkGridXClicked][clickedArea.chunkGridYClicked].occupiedBy].ID);
	// 						chunks[clickedArea.chunkClickedX + "x" + clickedArea.chunkClickedY].chunk[clickedArea.chunkGridXClicked][clickedArea.chunkGridYClicked].occupiedBy = undefined;
	// 				}

	// 			}
	// 		} else(console.log("undefined chunk -fight"))
	// 	 }
	// })

	socket.on('attack', function(wraper){

		players[playerIDs.indexOf(socket.id)].interactingWith = wraper.selectedType
		players[playerIDs.indexOf(socket.id)].attacking = wraper.ID
	})

	socket.on('peace', function(){
		players[playerIDs.indexOf(socket.id)].attacking = undefined
	})





  	socket.on('chop', function(clickedArea){
  		if(players[playerIDs.indexOf(socket.id)].loggedIn === true){
	  		var range = 1;

		  	if(chunks[clickedArea.chunkClickedX + "x" + clickedArea.chunkClickedY] != undefined){
		  		if(chunks[clickedArea.chunkClickedX + "x" + clickedArea.chunkClickedY].chunk[clickedArea.chunkGridXClicked][clickedArea.chunkGridYClicked].isSolid === true && isBlockInRange(range, idPOS, clickedArea) === true){

		  			mining(clickedArea.chunkClickedX, clickedArea.chunkClickedY, clickedArea.chunkGridXClicked, clickedArea.chunkGridYClicked, playerIDs.indexOf(socket.id));

		  			
		  			// chunks[clickedArea.chunkClickedX + "x" + clickedArea.chunkClickedY].chunk[clickedArea.chunkGridXClicked][clickedArea.chunkGridYClicked].tree=false;
				  	// chunks[clickedArea.chunkClickedX + "x" + clickedArea.chunkClickedY].chunk[clickedArea.chunkGridXClicked][clickedArea.chunkGridYClicked].isSolid=false;
				  	// chunks[clickedArea.chunkClickedX + "x" + clickedArea.chunkClickedY].chunk[clickedArea.chunkGridXClicked][clickedArea.chunkGridYClicked].isEmpty=true;

				  	// players[idPOS].wood += 1;
		  		} else {console.log("undefined chunk -mine")}
		  		
		  	}
		 }
	}) 
	socket.on('craft', function(craftedItem){
		if(craftedItem === "door" && players[idPOS].wood >= 2){
			players[idPOS].wood -= 2;
			players[idPOS].door += 1;
		}
		if(craftedItem === "woodSpear" && players[idPOS].wood >= 5){
			players[idPOS].wood -= 5;
			players[idPOS].woodSpear += 1;
		}
		if(craftedItem === "woodAxe" && players[idPOS].wood >= 5){
			players[idPOS].wood -= 5;
			players[idPOS].woodAxe += 1;
		}
		if(craftedItem === "woodPickaxe" && players[idPOS].wood >= 5){
			players[idPOS].wood -= 5;
			players[idPOS].woodPickaxe += 1;
		}
	})
	socket.on('placeDoor', function(doorPlacement){
	if(players[playerIDs.indexOf(socket.id)].loggedIn === true){
	  	var range = 1;

	  	if(chunks[doorPlacement.clickedArea.chunkClickedX + "x" + doorPlacement.clickedArea.chunkClickedY] != undefined){
	  			if(players[idPOS].wood >= 2 && chunks[doorPlacement.clickedArea.chunkClickedX + "x" + doorPlacement.clickedArea.chunkClickedY].chunk[doorPlacement.clickedArea.chunkGridXClicked][doorPlacement.clickedArea.chunkGridYClicked].isEmpty === true && isBlockInRange(range, idPOS, doorPlacement.clickedArea) === true){
	  				chunks[doorPlacement.clickedArea.chunkClickedX + "x" + doorPlacement.clickedArea.chunkClickedY].chunk[doorPlacement.clickedArea.chunkGridXClicked][doorPlacement.clickedArea.chunkGridYClicked] = { ...doorGrid}

	  				chunks[doorPlacement.clickedArea.chunkClickedX + "x" + doorPlacement.clickedArea.chunkClickedY].chunk[doorPlacement.clickedArea.chunkGridXClicked][doorPlacement.clickedArea.chunkGridYClicked].group = doorPlacement.group

					players[idPOS].wood -= 2;
					// players[idPOS].door += 1;
	  			}
	  		} else {console.log("undefined chunk -placeDoor")}

	  	}
	  })


	socket.on('placeWall', function(clickedArea){
	if(players[playerIDs.indexOf(socket.id)].loggedIn === true){
	  	var range = 1;

	  	if(chunks[clickedArea.chunkClickedX + "x" + clickedArea.chunkClickedY] != undefined){
	  			if(players[idPOS].wood > 0 && chunks[clickedArea.chunkClickedX + "x" + clickedArea.chunkClickedY].chunk[clickedArea.chunkGridXClicked][clickedArea.chunkGridYClicked].isEmpty === true && isBlockInRange(range, idPOS, clickedArea) === true){
	  				chunks[clickedArea.chunkClickedX + "x" + clickedArea.chunkClickedY].chunk[clickedArea.chunkGridXClicked][clickedArea.chunkGridYClicked] = { ...wallGrid}

					players[idPOS].wood -= 1;
	  			}
	  		} else {console.log("undefined chunk -build")}

	  	}
	  })
	socket.on('createGroup', function(action){

		//block placement for group core
		if(players[playerIDs.indexOf(socket.id)].loggedIn === true){
	  	var range = 1;
	  	if(chunks[action.clickedArea.chunkClickedX + "x" + action.clickedArea.chunkClickedY] != undefined){
	  			if(players[playerIDs.indexOf(socket.id)].wood >= 4 && chunks[action.clickedArea.chunkClickedX + "x" + action.clickedArea.chunkClickedY].chunk[action.clickedArea.chunkGridXClicked][action.clickedArea.chunkGridYClicked].isEmpty === true && isBlockInRange(range, idPOS, action.clickedArea) === true){
	  				createGroup(playerIDs.indexOf(socket.id), action.group.name, action.clickedArea.chunkClickedX, action.clickedArea.chunkClickedY, action.clickedArea.chunkGridXClicked, action.clickedArea.chunkGridYClicked)

	  				chunks[action.clickedArea.chunkClickedX + "x" + action.clickedArea.chunkClickedY].chunk[action.clickedArea.chunkGridXClicked][action.clickedArea.chunkGridYClicked] = { ...groupHub};


	  				chunks[action.clickedArea.chunkClickedX + "x" + action.clickedArea.chunkClickedY].chunk[action.clickedArea.chunkGridXClicked][action.clickedArea.chunkGridYClicked].group = action.group.name;
	  				console.log(chunks[action.clickedArea.chunkClickedX + "x" + action.clickedArea.chunkClickedY].chunk[action.clickedArea.chunkGridXClicked][action.clickedArea.chunkGridYClicked])


					players[playerIDs.indexOf(socket.id)].wood -= 4;
	  			}
	  		} else {console.log("undefined chunk -createGroup")}

	  	}

	})
  	socket.on('editGroup', function(editInfo){
  		editGroup(playerIDs.indexOf(socket.id), editInfo.name, editInfo)
  		console.log("editGroup")
  	})
  	socket.on('claimGroup', function(clickedArea){
  		var range = 1;
  		// console.log('claimGroup' + " " + chunks[clickedArea.chunkClickedX + "x" + clickedArea.chunkClickedY].chunk[clickedArea.chunkGridXClicked][clickedArea.chunkGridYClicked].group)

  		if(chunks[clickedArea.chunkClickedX + "x" + clickedArea.chunkClickedY] != undefined){
	  			if(chunks[clickedArea.chunkClickedX + "x" + clickedArea.chunkClickedY].chunk[clickedArea.chunkGridXClicked][clickedArea.chunkGridYClicked].name === "groupHub" && chunks[clickedArea.chunkClickedX + "x" + clickedArea.chunkClickedY].chunk[clickedArea.chunkGridXClicked][clickedArea.chunkGridYClicked].group != undefined && chunks[clickedArea.chunkClickedX + "x" + clickedArea.chunkClickedY].chunk[clickedArea.chunkGridXClicked][clickedArea.chunkGridYClicked].group != "" && isBlockInRange(range, idPOS, clickedArea) === true){

	  				groups[chunks[clickedArea.chunkClickedX + "x" + clickedArea.chunkClickedY].chunk[clickedArea.chunkGridXClicked][clickedArea.chunkGridYClicked].group].owner = players[idPOS].user

	  				console.log(groups)
				
	  			} 
	  		} else {console.log("undefined chunk -takeGroup")}

  	})
	socket.on('saveServer', function(){
		if(players[playerIDs.indexOf(socket.id)].role==="admin"){
			saveChunks()
		}
	})

	socket.on('saveGroups', function(){
		console.log("checking if admin....")
		if(players[playerIDs.indexOf(socket.id)].role==="admin"){
			console.log("You are admin")
			saveGroups()
		}
	})

  	socket.on('disconnect', function(){
  		let sql = `UPDATE players SET x = ${players[playerIDs.indexOf(socket.id)].x}, y = ${players[playerIDs.indexOf(socket.id)].y}, wood = ${players[playerIDs.indexOf(socket.id)].wood}, health = ${players[playerIDs.indexOf(socket.id)].health}  WHERE username LIKE '${players[playerIDs.indexOf(socket.id)].user}' `
			let query = db.query(sql, (err, result)=> {
				
				
			
			
		})
		players[playerIDs.indexOf(socket.id)].loggedIn = false;

		
    	console.log(socket.id + ' disconnected');
	})

});

function attack(attackerID, victimID){

	if(players[attackerID].interactingWith === "entity" && entities[victimID].isAlive){
		var vec1 = new Victor(players[attackerID].x - entities[victimID].x, players[attackerID].y - entities[victimID].y);

		if(players[attackerID].equiped === "woodSpear"){
			if(vec1.length() < 80 && players[attackerID].stamina >= 10){
				entities[victimID].health -= 2;
				players[attackerID].stamina -= 8;
				if(entities[victimID].health <= 0){
					entities[victimID].isAlive = false
					// death(victimID)
				}
			}
		}

		if(players[attackerID].equiped === "fists"){
			if(vec1.length() < 40 && players[attackerID].stamina >= 10){
				entities[victimID].health -= 1;
				players[attackerID].stamina -= 10;
				if(entities[victimID].health <= 0){
					entities[victimID].isAlive = false

					// death(victimID)
				}
			}
		}

	}


	if(players[attackerID].interactingWith === "player"){
		var vec1 = new Victor(players[attackerID].x - players[victimID].x, players[attackerID].y - players[victimID].y);

		if(players[attackerID].equiped === "woodSpear"){
			if(vec1.length() < 80 && players[attackerID].stamina >= 10){
				players[victimID].health -= 2;
				players[attackerID].stamina -= 8;
				if(players[victimID].health <= 0){
					death(victimID)
				}
			}
		}

		if(players[attackerID].equiped === "fists"){
			if(vec1.length() < 40 && players[attackerID].stamina >= 10){
				players[victimID].health -= 1;
				players[attackerID].stamina -= 10;
				if(players[victimID].health <= 0){
					death(victimID)
				}
			}
		}
	}

}

async function signIn(email, username, password, hash){
	
		try {
	  		if (await argon2.verify(hash, password)) {
	    	// password match
	    	access=true;
	    	console.log("Password Matched")
	  			} else {
	    	// password did not match
	    	console.log("Password didn't match")
	    	access=false;
	  			}
			} 
			catch (err) {
	  		// internal failure
	  		throw err;
	} 
}



function createGroup(playerIndex, groupName, chunkX, chunkY, chunkGridX, chunkGridY){
	let groupExists = groupName in groups
	if(groupExists === false){
		groups[groupName] = {
			owner : players[playerIndex].user,
			admins : [],
			mods : [],
			members : [],
			chunkX : chunkX,
			chunkY : chunkY,
			chunkGridX : chunkGridX,
			chunkGridY : chunkGridY
		}
	}
	console.log(groups)
	console.log(groups[groupName])
}

function editGroup(playerIndex, groupName, action){
	if(groups[groupName] != undefined){	
		if(groups[groupName].owner === players[playerIndex].user || groups[groupName].admins.includes(players[playerIndex].user)){
			if(action.addAdmin != undefined){
				groups[groupName].admins.push(action.addAdmin);
				console.log("add admin")
			}
			if(action.addMod != undefined){
				groups[groupName].mods.push(action.addMod);
			}
			if(action.addMember != undefined){
				groups[groupName].members.push(action.addMember);
			}

			if(action.removeAdmin != undefined){
				groups[groupName].admins.splice(groups[groupName].admins.indexOf(action.removeAdmin), 1)
			}

			if(action.removeMod != undefined){
				groups[groupName].mods.splice(groups[groupName].mods.indexOf(action.removeMod), 1)
			}

			if(action.removeMember != undefined){
				groups[groupName].members.splice(groups[groupName].members.indexOf(action.removeMember), 1)
			}
		}
	}
}

function saveGroups(){
	var groupsString = JSON.stringify(groups);
	console.log(groups)
	var groupsAsArray = Object.entries(groups);

	let sql = "TRUNCATE TABLE permissions"
	let query = db.query(sql, (err, result)=> {
		console.log(result);
		console.log(err);
		for(i = 0; i < groupsAsArray.length; i++){
			var groupString = JSON.stringify(groupsAsArray[i][1])
			let sql2 = `INSERT INTO permissions VALUES (${i}, '${groupsAsArray[i][0]}', '${groupString}')`
			let query2 = db.query(sql2, (err2, result2)=> {
				console.log(result2);
				console.log(err2);
			})
		}

	})
}

function setGroups(){
	let sql = `SELECT * FROM permissions`
	let query = db.query(sql, (err, result)=> {
		for(i = 0; i < result.length; i++){
			groupValue = JSON.parse(result[i].perms)
			groups[`${result[i].objectKey}`] = groupValue
		}
		console.log(groups)
	})
}

function hasAccess(playerIndex, chunkX, chunkY, chunkGridX, chunkGridY){
	if(groups[chunks[chunkX+'x'+chunkY].chunk[chunkGridX][chunkGridY].group].owner != players[playerIndex].user && 
			groups[chunks[chunkX+'x'+chunkY].chunk[chunkGridX][chunkGridY].group].admins.indexOf(players[playerIndex].user) < 0 &&
			groups[chunks[chunkX+'x'+chunkY].chunk[chunkGridX][chunkGridY].group].mods.indexOf(players[playerIndex].user) < 0 &&
			groups[chunks[chunkX+'x'+chunkY].chunk[chunkGridX][chunkGridY].group].members.indexOf(players[playerIndex].user) < 0){

			return false;
		}
	return true;
}

//return true if a player has access to the door or their is no door, false otherwise
function door(playerIndex, chunkX, chunkY, chunkGridX, chunkGridY){
	if(chunks[chunkX+'x'+chunkY].chunk[chunkGridX][chunkGridY].name === "door"){
		// console.log(groups[chunks[chunkX+'x'+chunkY].chunk[chunkGridX][chunkGridY].group])
		

		if(groups[chunks[chunkX+'x'+chunkY].chunk[chunkGridX][chunkGridY].group].owner != players[playerIndex].user && 
			groups[chunks[chunkX+'x'+chunkY].chunk[chunkGridX][chunkGridY].group].admins.indexOf(players[playerIndex].user) < 0 &&
			groups[chunks[chunkX+'x'+chunkY].chunk[chunkGridX][chunkGridY].group].mods.indexOf(players[playerIndex].user) < 0 &&
			groups[chunks[chunkX+'x'+chunkY].chunk[chunkGridX][chunkGridY].group].members.indexOf(players[playerIndex].user) < 0){

			return false;
		}
	}
	return true;
}

function teleport(p, x, y){
	var beforeChunk = {
			chunkX : players[p].chunkX,
			chunkY : players[p].chunkY
		}



	players[p].x = x
	players[p].y = y
						


	players[p].gridX = Math.floor(players[p].x/40)
	players[p].gridY = Math.floor(players[p].y/40)

	players[p].chunkX = Math.floor(players[p].gridX/8)
	players[p].chunkY = Math.floor(players[p].gridY/8)

	players[p].chunkGridX = players[p].gridX % 8;
	if (players[p].chunkGridX < 0){
		players[p].chunkGridX += 8;
	}	

	players[p].chunkGridY = players[p].gridY % 8;
	if (players[p].chunkGridY < 0){
		players[p].chunkGridY += 8;
	}

	// chunks[players[p].chunkX + "x" + players[p].chunkY].playersInChunk.push(i)
	if(beforeChunk.chunkX != players[p].chunkX || beforeChunk.chunkY != players[p].chunkY){
		if(beforeChunk.chunkX != undefined){
  			chunks[beforeChunk.chunkX + "x" + beforeChunk.chunkY].playersInChunk.splice(chunks[beforeChunk.chunkX + "x" + beforeChunk.chunkY].playersInChunk.indexOf(i),1)
		}
		if(chunks[players[p].chunkX + "x" + players[p].chunkY] != undefined){
  			chunks[players[p].chunkX + "x" + players[p].chunkY].playersInChunk.push(p)
  		} else{
  			createChunk(players[p].chunkX, players[p].chunkY)
  			chunks[players[p].chunkX + "x" + players[p].chunkY].playersInChunk.push(p)
  		}
  	}
}

function mining(cX, cY, x, y, pID){
	chunks[cX + "x" + cY].chunk[x][y].beingMinedBy = pID;
	players[pID].miningcX = cX;
	players[pID].miningcY = cY;
	players[pID].miningX = x;
	players[pID].miningY = y;

}

function checkPossibleMovement(cX, cY, cgX, cgY, pID){
	if(chunks[cX + 'x' + cY] === undefined || chunks[cX + 'x' + cY].chunk[cgX][cgY].isSolid === true || door(pID, cX, cY, cgX, cgY) === false){
		return false
	}
	return true


}

function moveEntity(i){
	if(entities[i] != undefined){
		var beforeChunk = {
				chunkX : entities[i].chunkX,
				chunkY : entities[i].chunkY,
				x : entities[i].x,
				y : entities[i].y,
				gridX : entities[i].gridX,
				gridY : entities[i].gridY,
				chunkGridX : entities[i].chunkGridX,
				chunkGridY : entities[i].chunkGridY

			}
		var victor = new Victor(entities[i].movingTowardsX - entities[i].x, entities[i].movingTowardsY - entities[i].y)
		var victorDirection = victor
	  			.clone()
	  			.normalize()
		  	entities[i].x += victorDirection.x
		  	entities[i].y += victorDirection.y

		  	entities[i].gridX = Math.floor(entities[i].x/40)
		  	entities[i].gridY = Math.floor(entities[i].y/40)

		  	entities[i].chunkX = Math.floor(entities[i].gridX/8)
		  	entities[i].chunkY = Math.floor(entities[i].gridY/8)

		  	entities[i].chunkGridX = entities[i].gridX % 8;
		  	if (entities[i].chunkGridX < 0){
		  		entities[i].chunkGridX += 8;
		  	}	

		  	entities[i].chunkGridY = entities[i].gridY % 8;
		  	if (entities[i].chunkGridY < 0){
		  		entities[i].chunkGridY += 8;
		  	}
		  	if(chunks[entities[i].chunkX + "x" + entities[i].chunkY] === undefined){
		  		createChunk(entities[i].chunkX, entities[i].chunkY)
		  	}
		  	// if(checkPossibleMovement(entities[i].chunkX, entities[i].chunkY, entities[i].chunkGridX, entities[i].chunkGridY, -1) === false){
		  	// 	entities[i].chunkX = beforeChunk.chunkX
		  	// 	entities[i].chunkY = beforeChunk.chunkY
		  	// 	entities[i].x = beforeChunk.x
		  	// 	entities[i].y = beforeChunk.y
		  	// 	entities[i].gridX = beforeChunk.gridX
		  	// 	entities[i].gridY = beforeChunk.gridY
		  	// 	entities[i].chunkGridX = beforeChunk.chunkGridX
		  	// 	entities[i].chunkGridY = beforeChunk.chunkGridY
		  	// }

		  	if(checkPossibleMovement(beforeChunk.chunkX, entities[i].chunkY, beforeChunk.chunkGridX, entities[i].chunkGridY, -1) === false){
		  		// entities[i].chunkX = beforeChunk.chunkX
		  		entities[i].chunkY = beforeChunk.chunkY
		  		// entities[i].x = beforeChunk.x
		  		entities[i].y = beforeChunk.y
		  		// entities[i].gridX = beforeChunk.gridX
		  		entities[i].gridY = beforeChunk.gridY
		  		// entities[i].chunkGridX = beforeChunk.chunkGridX
		  		entities[i].chunkGridY = beforeChunk.chunkGridY
		  	}

		  	if(checkPossibleMovement(entities[i].chunkX, beforeChunk.chunkY, entities[i].chunkGridX, beforeChunk.chunkGridY, -1) === false){
		  		entities[i].chunkX = beforeChunk.chunkX
		  		// entities[i].chunkY = beforeChunk.chunkY
		  		entities[i].x = beforeChunk.x
		  		// entities[i].y = beforeChunk.y
		  		entities[i].gridX = beforeChunk.gridX
		  		// entities[i].gridY = beforeChunk.gridY
		  		entities[i].chunkGridX = beforeChunk.chunkGridX
		  		// entities[i].chunkGridY = beforeChunk.chunkGridY
		  	}



		  	if(beforeChunk.chunkX != entities[i].chunkX || beforeChunk.chunkY != entities[i].chunkY){
		  	chunks[beforeChunk.chunkX + "x" + beforeChunk.chunkY].entitiesInChunk.splice(chunks[beforeChunk.chunkX + "x" + beforeChunk.chunkY].entitiesInChunk.indexOf(i),1)

		  	chunks[entities[i].chunkX + "x" + entities[i].chunkY].entitiesInChunk.push(i)
		  	
		  	}
	  }


}



function move(i){
	// if(chunks[players[i].chunkX + "x" + players[i].chunkY] !=undefined){
	// 	delete chunks[players[i].chunkX + "x" + players[i].chunkY].chunk[players[i].chunkGridX][players[i].chunkGridY].occupiedBy;
	// 	// chunks[players[i].chunkX + "x" + players[i].chunkY].chunk[players[i].chunkGridX][players[i].chunkGridY].isSolid = false;
	// }
		var movingRight = false;
		var movingLeft = false;
		var movingUp = false;
		var movingDown = false;
		var beforeChunk = {
			chunkX : players[i].chunkX,
			chunkY : players[i].chunkY
		}


		if (players[i].right === true && players[i].x < borderRadius * 40){
			var moveRight = true;
			if (players[i].x % 40 >= 40-speed) {
				if(playerRender[i][players[i].chunkX + 'x' + players[i].chunkY].chunk[players[i].chunkGridX + 1] === undefined){
					if (checkPossibleMovement(players[i].chunkX + 1, players[i].chunkY, 0, players[i].chunkGridY, i)===false){
		  				moveRight = false;
		  			}
				} else {
		  		
		  		if (checkPossibleMovement(players[i].chunkX, players[i].chunkY, players[i].chunkGridX + 1, players[i].chunkGridY, i) === false){
		  			moveRight = false;
		  		}
		  	}

	  		}
	  		if (moveRight === true){
	  			// players[i].x += 2;
	  			movingRight = true;
	  		} 
  		}

  		if (players[i].left === true && players[i].x > 0){
  			var moveLeft = true;
			if (players[i].x % 40 <= 0+speed) {
				if(playerRender[i][players[i].chunkX + 'x' + players[i].chunkY].chunk[players[i].chunkGridX - 1] === undefined){
					if (checkPossibleMovement(players[i].chunkX - 1, players[i].chunkY, 7, players[i].chunkGridY, i)===false){
		  				moveLeft = false;
		  			}
				} else {
		  		
		  		if (checkPossibleMovement(players[i].chunkX, players[i].chunkY, players[i].chunkGridX - 1, players[i].chunkGridY, i) === false){
		  			moveLeft = false;
		  		}
		  	}

	  		}
	  		if (moveLeft === true){
	  			// players[i].x -= 2;
	  			movingLeft = true;
	  		} 

  		}

  		if (players[i].up === true && players[i].y > 0){
  			var moveUp = true;
			if (players[i].y % 40 <= 0+speed) {
				if(playerRender[i][players[i].chunkX + 'x' + players[i].chunkY].chunk[players[i].chunkGridY - 1] === undefined){
					if (checkPossibleMovement(players[i].chunkX, players[i].chunkY-1, players[i].chunkGridX, 7, i) === false){
		  				moveUp = false;
		  			}
				} else {
		  		
		  		if (checkPossibleMovement(players[i].chunkX, players[i].chunkY, players[i].chunkGridX, players[i].chunkGridY-1, i) === false){
		  			moveUp = false;
		  		}
		  	}

	  		}
	  		if (moveUp === true){
	  			// players[i].y -= 2;
	  			movingUp = true
	  		} 

  		}

  		if (players[i].down === true && players[i].y < borderRadius * 40){
  			var moveDown = true;
			if (players[i].y % 40 >= 40-speed) {
				if(playerRender[i][players[i].chunkX + 'x' + players[i].chunkY].chunk[players[i].chunkGridY + 1] === undefined){
					if (checkPossibleMovement(players[i].chunkX, players[i].chunkY+1, players[i].chunkGridX, 0, i) === false){
		  				moveDown = false;
		  			}
				} else {
		  		
		  		if (checkPossibleMovement(players[i].chunkX, players[i].chunkY, players[i].chunkGridX, players[i].chunkGridY+1, i) === false){
		  			moveDown = false;
		  		}
		  	}

	  		}
	  		if (moveDown === true){
	  			// players[i].y += 2;
	  			movingDown = true;
	  		} 

  		}


  		//WORKING ON THIS
  		if (movingDown === true && movingRight === true && players[i].y % 40 >= 40-speed && players[i].x % 40 >= 40-speed){
  			if(playerRender[i][players[i].chunkX + 'x' + players[i].chunkY].chunk[players[i].chunkGridX + 1] === undefined || playerRender[i][players[i].chunkX + 'x' + players[i].chunkY].chunk[players[i].chunkGridX + 1][players[i].chunkGridY + 1] === undefined){
  				var crossValueX = 0
  				var crossValueY = 0
  					if((players[i].chunkGridX+1) > 7){
  						crossValueX = 1
  					}

  					if((players[i].chunkGridY+1) > 7){
  						crossValueY = 1
  					}

					if (checkPossibleMovement(players[i].chunkX+crossValueX, players[i].chunkY+crossValueY, (players[i].chunkGridX+1)%8, (players[i].chunkGridY+1)%8, i) === false){
		  				movingDown = false;
		  				movingRight = false;
		  			}
				} else {
		  		
			  	if (checkPossibleMovement(players[i].chunkX, players[i].chunkY, players[i].chunkGridX+1, players[i].chunkGridY+1, i) === false){
			  			movingDown = false;
			  			movingRight = false;
			  	}
			}
  		}

  		if (movingDown === true && movingLeft === true && players[i].y % 40 >= 40-speed && players[i].x % 40 <= 0+speed){
  			if(playerRender[i][players[i].chunkX + 'x' + players[i].chunkY].chunk[players[i].chunkGridX - 1]===undefined || playerRender[i][players[i].chunkX + 'x' + players[i].chunkY].chunk[players[i].chunkGridX - 1][players[i].chunkGridY + 1] === undefined){

	  			var crossValueX = 0
	  			var crossValueY = 0
	  			var crossGridValueX = 0
  				if((players[i].chunkGridX-1) < 0){
  					crossValueX = 1
  					crossGridValueX = 8
  				}

  				if((players[i].chunkGridY+1) > 7){
  					crossValueY = 1
  				}

				if (checkPossibleMovement(players[i].chunkX-crossValueX, players[i].chunkY+crossValueY, (players[i].chunkGridX-1)+crossGridValueX, (players[i].chunkGridY+1)%8, i) === false){
		  			movingDown = false;
		  			movingLeft = false;
		  			}
				} else {
		  		
			  	if (checkPossibleMovement(players[i].chunkX, players[i].chunkY, players[i].chunkGridX-1, players[i].chunkGridY+1, i) === false){
			  			movingDown = false;
			  			movingLeft = false;
			  	}
			}
  		}

  		

  		if (movingUp === true && movingLeft === true && players[i].y % 40 <= 0+speed && players[i].x % 40 <= 0+speed){
  			if(playerRender[i][players[i].chunkX + 'x' + players[i].chunkY].chunk[players[i].chunkGridX - 1]===undefined || playerRender[i][players[i].chunkX + 'x' + players[i].chunkY].chunk[players[i].chunkGridX - 1][players[i].chunkGridY - 1] === undefined){

	  			var crossValueX = 0
	  			var crossValueY = 0
	  			var crossGridValueX = 0
	  			var crossGridValueY = 0
  				if((players[i].chunkGridX-1) < 0){
  					crossValueX = 1
  					crossGridValueX = 8
  				}

  				if((players[i].chunkGridY-1) < 0){
  					crossValueY = 1
  					crossGridValueY = 8
  				}

				if (checkPossibleMovement(players[i].chunkX-crossValueX, players[i].chunkY-crossValueY, (players[i].chunkGridX-1)+crossGridValueX, (players[i].chunkGridY-1)+crossGridValueY, i) === false){
		  			movingUp = false;
		  			movingLeft = false;
		  			}
				} else {
		  		
			  	if (checkPossibleMovement(players[i].chunkX, players[i].chunkY, players[i].chunkGridX-1, players[i].chunkGridY-1, i) === false){
			  			movingUp = false;
			  			movingLeft = false;
			  	}
			}
  		}

  		if (movingUp === true && movingRight === true && players[i].y % 40 <= 0+speed && players[i].x % 40 >= 40-speed){
  			if(playerRender[i][players[i].chunkX + 'x' + players[i].chunkY].chunk[players[i].chunkGridX + 1]===undefined || playerRender[i][players[i].chunkX + 'x' + players[i].chunkY].chunk[players[i].chunkGridX + 1][players[i].chunkGridY - 1] === undefined){

	  			var crossValueX = 0
	  			var crossValueY = 0
	  			var crossGridValueX = 0
	  			var crossGridValueY = 0
  				if((players[i].chunkGridX+1) > 7){
  						crossValueX = 1
  					}

  				if((players[i].chunkGridY-1) < 0){
  					crossValueY = 1
  					crossGridValueY = 8
  				}

				if (checkPossibleMovement(players[i].chunkX+crossValueX, players[i].chunkY-crossValueY, (players[i].chunkGridX+1)%8, (players[i].chunkGridY-1)+crossGridValueY, i) === false){
		  			movingUp = false;
		  			movingRight = false;
		  			}
				} else {
		  		
			  	if (checkPossibleMovement(players[i].chunkX, players[i].chunkY, players[i].chunkGridX+1, players[i].chunkGridY-1, i) === false){
			  			movingUp = false;
			  			movingRight = false;
			  	}
			}
  		}



  		var moveTowards = [0, 0]

  		var beforeMove = new Victor(moveTowards[0], moveTowards[1])
  		// console.log(moving)

  		if (movingDown === true){
  			moveTowards[1] += 2
  		}
  		if (movingUp === true){
  			moveTowards[1] -= 2
  		}
  		if (movingLeft === true){
  			moveTowards[0] -= 2
  		}
  		if (movingRight === true){
  			moveTowards[0] += 2
  		}

  		var afterMove = new Victor(moveTowards[0], moveTowards[1])

  		var finalMove = afterMove
  			.clone()
  			.normalize()

  		if(movingUp === true && movingDown === true){
  			movingUp = false;
  			movingDown = false;
  		}

  		// console.log(finalMove)
  		if(movingDown===true || movingUp === true || movingLeft === true || movingRight === true){
	  		players[i].x=players[i].x + (finalMove.x * speed)
	  		players[i].y=players[i].y + (finalMove.y * speed)
	  	}


  		players[i].gridX = Math.floor(players[i].x/40)
  		players[i].gridY = Math.floor(players[i].y/40)

  		players[i].chunkX = Math.floor(players[i].gridX/8)
  		players[i].chunkY = Math.floor(players[i].gridY/8)

  		players[i].chunkGridX = players[i].gridX % 8;
  		if (players[i].chunkGridX < 0){
  			players[i].chunkGridX += 8;
  		}	

  		players[i].chunkGridY = players[i].gridY % 8;
  		if (players[i].chunkGridY < 0){
  			players[i].chunkGridY += 8;
  		}
  		if(beforeChunk.chunkX != players[i].chunkX || beforeChunk.chunkY != players[i].chunkY){
  		chunks[beforeChunk.chunkX + "x" + beforeChunk.chunkY].playersInChunk.splice(chunks[beforeChunk.chunkX + "x" + beforeChunk.chunkY].playersInChunk.indexOf(i),1)

  		chunks[players[i].chunkX + "x" + players[i].chunkY].playersInChunk.push(i)
  		// console.log("changed chunk")
  		}



  		// if(chunks[players[i].chunkX + "x" + players[i].chunkY] !=undefined){
  		// 	chunks[players[i].chunkX + "x" + players[i].chunkY].chunk[players[i].chunkGridX][players[i].chunkGridY].occupiedBy = players[i].ID;
  		// }
  		// chunks[players[i].chunkX + "x" + players[i].chunkY].chunk[players[i].chunkGridX][players[i].chunkGridY].isSolid = true;


  	}


function isBlockInRange(r, idPOS, clickedArea){
	var range = r;
  			if(players[idPOS].chunkX+1 === clickedArea.chunkClickedX && players[idPOS].chunkY === clickedArea.chunkClickedY){
	  			if(players[idPOS].chunkGridX <= clickedArea.chunkGridXClicked + 8 + range && players[idPOS].chunkGridX >= clickedArea.chunkGridXClicked + 8 - range && players[idPOS].chunkGridY <= clickedArea.chunkGridYClicked + range && players[idPOS].chunkGridY >= clickedArea.chunkGridYClicked - range){
	  				if(chunks[clickedArea.chunkClickedX + "x" + clickedArea.chunkClickedY].chunk[clickedArea.chunkGridXClicked][clickedArea.chunkGridYClicked].isEmpty === true){
		  				return true;
	  			}
  			}
  		}

  		if(players[idPOS].chunkX-1 === clickedArea.chunkClickedX && players[idPOS].chunkY === clickedArea.chunkClickedY){
	  		if(players[idPOS].chunkGridX <= clickedArea.chunkGridXClicked - 8 + range && players[idPOS].chunkGridX >= clickedArea.chunkGridXClicked - 8 - range && players[idPOS].chunkGridY <= clickedArea.chunkGridYClicked + range && players[idPOS].chunkGridY >= clickedArea.chunkGridYClicked - range){
		  			return true;
  			}
  		}

  		if(players[idPOS].chunkX === clickedArea.chunkClickedX && players[idPOS].chunkY - 1 === clickedArea.chunkClickedY){
	  		if(players[idPOS].chunkGridX <= clickedArea.chunkGridXClicked + range && players[idPOS].chunkGridX >= clickedArea.chunkGridXClicked - range && players[idPOS].chunkGridY <= clickedArea.chunkGridYClicked - 8 + range && players[idPOS].chunkGridY >= clickedArea.chunkGridYClicked - 8 - range){
		  			return true;
  			}
  		}

  		if(players[idPOS].chunkX === clickedArea.chunkClickedX && players[idPOS].chunkY + 1 === clickedArea.chunkClickedY){
	  		if(players[idPOS].chunkGridX <= clickedArea.chunkGridXClicked + range && players[idPOS].chunkGridX >= clickedArea.chunkGridXClicked - range && players[idPOS].chunkGridY <= clickedArea.chunkGridYClicked + 8 + range && players[idPOS].chunkGridY >= clickedArea.chunkGridYClicked + 8 - range){
		  			return true;
  			}
  		}

  		if(players[idPOS].chunkX-1 === clickedArea.chunkClickedX && players[idPOS].chunkY - 1 === clickedArea.chunkClickedY){
	  		if(players[idPOS].chunkGridX <= clickedArea.chunkGridXClicked - 8 + range && players[idPOS].chunkGridX >= clickedArea.chunkGridXClicked - 8 - range && players[idPOS].chunkGridY <= clickedArea.chunkGridYClicked - 8 + range && players[idPOS].chunkGridY >= clickedArea.chunkGridYClicked - 8 - range){
		  			return true;
  			}
  		}

  		if(players[idPOS].chunkX-1 === clickedArea.chunkClickedX && players[idPOS].chunkY + 1 === clickedArea.chunkClickedY){
	  		if(players[idPOS].chunkGridX <= clickedArea.chunkGridXClicked - 8 + range && players[idPOS].chunkGridX >= clickedArea.chunkGridXClicked - 8 - range && players[idPOS].chunkGridY <= clickedArea.chunkGridYClicked + 8 + range && players[idPOS].chunkGridY >= clickedArea.chunkGridYClicked + 8 - range){
		  			return true;
  			}
  		}


  		if(players[idPOS].chunkX+1 === clickedArea.chunkClickedX && players[idPOS].chunkY -1 === clickedArea.chunkClickedY){
	  		if(players[idPOS].chunkGridX <= clickedArea.chunkGridXClicked + 8 + range && players[idPOS].chunkGridX >= clickedArea.chunkGridXClicked + 8 - range && players[idPOS].chunkGridY <= clickedArea.chunkGridYClicked - 8 + range && players[idPOS].chunkGridY >= clickedArea.chunkGridYClicked - 8 - range){
		  			return true;
  			}
  		}

  		if(players[idPOS].chunkX+1 === clickedArea.chunkClickedX && players[idPOS].chunkY + 1 === clickedArea.chunkClickedY){
	  		if(players[idPOS].chunkGridX <= clickedArea.chunkGridXClicked + 8 + range && players[idPOS].chunkGridX >= clickedArea.chunkGridXClicked + 8 - range && players[idPOS].chunkGridY <= clickedArea.chunkGridYClicked + 8 + range && players[idPOS].chunkGridY >= clickedArea.chunkGridYClicked + 8 - range){
		  			return true;
  			}
  		}



  		if(players[idPOS].chunkX === clickedArea.chunkClickedX && players[idPOS].chunkY === clickedArea.chunkClickedY){
	  		if(players[idPOS].chunkGridX <= clickedArea.chunkGridXClicked + range && players[idPOS].chunkGridX >= clickedArea.chunkGridXClicked - range && players[idPOS].chunkGridY <= clickedArea.chunkGridYClicked + range && players[idPOS].chunkGridY >= clickedArea.chunkGridYClicked - range){
		  			return true;
	  		}
	  	}
	}
  		
var connectionPinged = {};

var allEntitiesThatMoved = []

function AI(i){
	var playersNearby = []
	for(var x = -1; x <= 1; x++){
		for(var y = -1; y <= 1; y++){
			if(chunks[(entities[i].chunkX + x) + "x"+ (entities[i].chunkY + y)] != undefined&& chunks[(entities[i].chunkX + x) + "x"+ (entities[i].chunkY + y)] != []){
				playersNearby = playersNearby.concat(chunks[(entities[i].chunkX + x) + "x"+ (entities[i].chunkY + y)].playersInChunk)
			}
		}
	}
	var nearestPlayerVictor = new Victor(999999, 9999999)
	var targetPlayer = undefined

	for(var n = 0; n < playersNearby.length; n++){
		// console.log(playersNearby[n])
		checkVic = new Victor(entities[i].x - players[playersNearby[n]].x, entities[i].y - players[playersNearby[n]].y)
		
		if(checkVic.length() < nearestPlayerVictor.length()){
			// console.log("here")
			nearestPlayerVictor = checkVic
			targetPlayer = playersNearby[n]
		}
	}

	// console.log(playersNearby)
	

	// var vec1 = new Victor(players[n].x - entities[i].x, players[n].y - entities[i].y)
		
	// console.log(orgVec.x)
	var finalVictorMovement = nearestPlayerVictor
		.clone()
		.normalize()
	

	if(targetPlayer != undefined){
		entities[i].movingTowardsX = entities[i].x + finalVictorMovement.x
		entities[i].movingTowardsY = entities[i].y + finalVictorMovement.y
	}
}

function selectPlayersLC(){
		for (var i=0; i < players.length; i++){
			//initally loads the chunks reguardless of tick value to prevent errors

				if(connectionPinged[i] != true){
						loadChunk(i);
						connectionPinged[i] = true;

					} else if(tick === 0) {
						loadChunk(i);
					} 
				if(players[i].stamina < 10){
					players[i].stamina += 0.25
				}
				if(players[i].attacking != undefined){
					attack(i, players[i].attacking)
				}

			players[i].playersNearby = []
			players[i].entitiesNearby = []

			
			for(var x = -1; x <= 1; x++){
				for(var y = -1; y <= 1; y++){

					if(chunks[(players[i].chunkX + x) + "x"+ (players[i].chunkY + y)] != undefined){
				

					players[i].playersNearby = players[i].playersNearby.concat(chunks[(players[i].chunkX + x) + "x"+ (players[i].chunkY + y)].playersInChunk)

					players[i].entitiesNearby = players[i].entitiesNearby.concat(chunks[(players[i].chunkX + x) + "x"+ (players[i].chunkY + y)].entitiesInChunk)



						
					}
				}	
			}

			for(var n = 0; n < players[i].entitiesNearby.length; n++){
				if(entities[players[i].entitiesNearby[n]].moved === false){
					AI(players[i].entitiesNearby[n]	)
					moveEntity(players[i].entitiesNearby[n])
					entities[players[i].entitiesNearby[n]].moved = true
					allEntitiesThatMoved.push(players[i].entitiesNearby[n])
				}
			}





		



		move(i);
		}
		
		tick++;

		//tick value determines how often chunks are loaded for all players, reduces lag significantly
		if (tick === 20) {
			tick = 0;
		}

	}


// function selectPlayers(){
// 	for (var i=0; i < players.length; i++){
// 		move(i);
// 	}
// }

function selectPlayersMine(){
	for (var i=0; i < players.length; i++){
		isMining(i);
	}
}


function isMining(p){
	if(tick===19){
		if(players[p].miningcX != undefined && Math.abs(players[p].miningcX * 8 + players[p].miningX - players[p].gridX) <= 1 && Math.abs(players[p].miningcY * 8 + players[p].miningY - players[p].gridY ) <= 1){
			chunks[players[p].miningcX + "x" + players[p].miningcY].chunk[players[p].miningX][players[p].miningY].dura-=10;
			if(chunks[players[p].miningcX + "x" + players[p].miningcY].chunk[players[p].miningX][players[p].miningY].dura === 0){

				if(chunks[players[p].miningcX + "x" + players[p].miningcY].chunk[players[p].miningX][players[p].miningY].name === "groupHub"){
					console.log(groups)
					delete groups[chunks[players[p].miningcX + "x" + players[p].miningcY].chunk[players[p].miningX][players[p].miningY].group]
					console.log(groups)
				}

				chunks[players[p].miningcX + "x" + players[p].miningcY].chunk[players[p].miningX][players[p].miningY] = { ...defaultGrid};

				chunks[players[p].miningcX + "x" + players[p].miningcY].chunk[players[p].miningX][players[p].miningY].group = undefined;

			  	players[p].wood += 1;

			  	players[p].miningcX = undefined;
			  	players[p].miningcY = undefined;
			  	players[p].miningx = undefined;
			  	players[p].miningy = undefined;



			}
		}
	}
}


var tick = 0;
function ping(){

	selectPlayersLC();
	// selectPlayers();
	selectPlayersMine();
	for(var i = 0; i < allEntitiesThatMoved.length; i++){
		entities[allEntitiesThatMoved[i]].moved = false
	}

	allEntitiesThatMoved = []

	//gives entity info to player
	emitInfo();
	
	

}


function time(){
    // Calculate time elapsed
    now = Date.now();
    dt = (now - lastUpdateTime) / 1000;
    lastUpdateTime = now;
}


var interval = setInterval(ping, 1000/60);


http.listen(3000, function(){
  console.log('listening on *:3000');
});