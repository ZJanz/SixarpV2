
var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

const rect = canvas.getBoundingClientRect();

var socket = io();


var ballRadius = 10;

var rightPressed = false;
var leftPressed = false;
var upPressed = false;
var downPressed = false;

var gridSize = 40;


var players = [];
var entities = [];

var ID;



var state = {
  rightPressed : false,
  leftPressed : false,
  upPressed : false,
  downPressed : false
};

// window.onLoad = function(){
//   init();
//   window.addEventListener('resize', init, false)
// }
// function init(){
//   var myWidth = window.innerWidth -5;
//   var myHeight = window.innerHeight -5;
//   ctx.canvas.width = myWidth;
//   ctx.canvas.height = myheight;


// }

canvas.setAttribute('width', window.innerWidth);
canvas.setAttribute('height', window.innerHeight);
document.getElementById("login").style.left = canvas.width/2 + "px";
document.getElementById("login").style.top = canvas.height/2 + "px";
document.getElementById("email").style.left = canvas.width/2-canvas.width*0.125 + "px";
document.getElementById("email").style.top = canvas.height/2 + "px";
document.getElementById("username").style.left = canvas.width/2-canvas.width*0.125 + "px";
document.getElementById("username").style.top = canvas.height/2 - canvas.height*0.05 + "px";
document.getElementById("password").style.left = canvas.width/2 - canvas.width*0.125 + "px";
document.getElementById("password").style.top = canvas.height/2 + canvas.height*0.05 + "px";
document.getElementById("cords").style.top = 0 + "px";
document.getElementById("cords").style.left = 0 + "px";
document.getElementById("gridValue").style.top = 15 + "px";
document.getElementById("gridValue").style.left = 0 + "px";






window.addEventListener('resize', resize, false)

function resize(){
  canvas.setAttribute('width', window.innerWidth);
  canvas.setAttribute('height', window.innerHeight);
  document.getElementById("login").style.left = canvas.width/2 + "px";
  document.getElementById("login").style.top = canvas.height/2 + "px";
  document.getElementById("email").style.left = canvas.width/2-canvas.width*0.125 + "px";
  document.getElementById("email").style.top = canvas.height/2 + "px";
  document.getElementById("username").style.left = canvas.width/2-canvas.width*0.125 + "px";
  document.getElementById("username").style.top = canvas.height/2 - canvas.height*0.05 + "px";
  document.getElementById("password").style.left = canvas.width/2 - canvas.width*0.125 + "px";
  document.getElementById("password").style.top = canvas.height/2 + canvas.height*0.05 + "px";
}



// socket.on('treeInfo', function(treesInfo){
//   trees = treesInfo;
// });

const RENDER_DELAY = 100;

const gameUpdates = [];
let gameStart = 0;
let firstServerTimestamp = 0;

function initState() {
  gameStart = 0;
  firstServerTimestamp = 0;
}


socket.on('playerInfo', function(serverState){
   players = serverState.playerList;
   entities = serverState.entityList;
   players.indexOf()
   players.push(serverState.currentState);
   // draw();
 });

socket.on('ID', function(result){
  ID = result;
});


canvas.addEventListener("mousedown", onDown, false);


//client
 // function drawGrid(){
 //    ctx.beginPath();
 //    ctx.translate(0.5, 0.5);
 //    for(var x = 0 - (players[currentPlayer].x % gridSize); x < canvas.width; x += gridSize){
 //      ctx.moveTo(x, 0);
 //      ctx.lineTo(x, canvas.clientHeight);
 //      ctx.strokeStyle = '#ffffff';
 //      ctx.stroke();

 //    }    
 //    for(var y = 0 - (players[currentPlayer].y % gridSize); y < canvas.height; y += gridSize){
 //      ctx.moveTo(0, y);
 //      ctx.lineTo(canvas.width, y);
 //      ctx.strokeStyle = '#ffffff';
 //      ctx.stroke();
 //    }    
 //    ctx.translate(-0.5, -0.5);
 //  }


var currentPlayer;
function getFocus(){
  for(var i = 0; i < players.length; i++){
    if (players[i].ID === ID){
      currentPlayer = i;
      break;
    }
  }
}

//client
function drawPlayers(){
  var chosePlayer = false;
  document.getElementById("attack").style.display = "none"
  for(var i = 0; i < players.length; i++){

    if(i === currentPlayer){
      if(players[currentPlayer].attacking != undefined){
        document.getElementById("peace").style.display = "inline"
        document.getElementById("peace").style.left = players[i].x - players[currentPlayer].x + canvas.width/2 - 40 + "px"
        document.getElementById("peace").style.top = players[i].y - players[currentPlayer].y + canvas.height/2 - 50 + "px"
      } else  {
        document.getElementById("peace").style.display = "none"
      }

    }

    //debug info
    // ctx.beginPath();
    // ctx.rect(players[i].gridX * gridSize - players[currentPlayer].x + canvas.width/2, players[i].gridY * gridSize - players[currentPlayer].y + canvas.height/2, gridSize, gridSize);
    // ctx.fillStyle = "#FF0000";
    // ctx.fill();
    // ctx.closePath();
    if(selectedUser != undefined && selectedType === "player" && players[i].user === selectedUser.user){
      ctx.beginPath();
      ctx.rect(players[i].x - players[currentPlayer].x + canvas.width/2 - 10, players[i].y - players[currentPlayer].y + canvas.height/2 - 10, 20, 20);
      ctx.fillStyle = "#0095DD";
      ctx.stroke();
      ctx.closePath();
      document.getElementById("chosenPlayer").innerHTML = players[i].user + ": "
      document.getElementById("chosenPlayerWood").innerHTML = "wood: " + players[i].wood
      document.getElementById("chosenPlayerX").innerHTML = "x: " + players[i].x
      document.getElementById("chosenPlayerY").innerHTML = "y: " + players[i].y
      // document.getElementById("chosenPlayerHealth").innerHTML = "Health: " + players[i].health
      chosePlayer = true;
      document.getElementById("attack").style.display = "inline"
      document.getElementById("attack").style.left = players[i].x - players[currentPlayer].x + canvas.width/2 - 20 + "px"
      document.getElementById("attack").style.top = players[i].y - players[currentPlayer].y + canvas.height/2 - 40 + "px"

    }



    drawHealth(players[i].health, players[i].x - players[currentPlayer].x + canvas.width/2 - 15, players[i].y - players[currentPlayer].y + canvas.height/2 - 20)
    //add stamina
    drawStamina(players[i].stamina, players[i].x - players[currentPlayer].x + canvas.width/2 - 15, players[i].y - players[currentPlayer].y + canvas.height/2 - 15)


    // ctx.rect(x * gridSize - players[currentPlayer].x + canvas.width/2 + (chunkInfo[xC+"x"+yC].x * chunkSize * gridSize), y * gridSize - players[currentPlayer].y + canvas.height/2 + (chunkInfo[xC+"x"+yC].y * chunkSize * gridSize), gridSize, gridSize)

    drawName(players[i].user, players[i].x - players[currentPlayer].x + canvas.width/2 - 10, players[i].y - players[currentPlayer].y + canvas.height/2 - 20)

    ctx.beginPath();
    ctx.arc(players[i].x - players[currentPlayer].x + canvas.width/2, players[i].y - players[currentPlayer].y + canvas.height/2, ballRadius, 0, Math.PI*2);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
  }
  for(var i = 0; i < entities.length; i++){
    if(selectedEntity != undefined && entities[i].ID === selectedEntity.ID){
      ctx.beginPath();
      ctx.rect(entities[i].x - players[currentPlayer].x + canvas.width/2 - 10, entities[i].y - players[currentPlayer].y + canvas.height/2 - 10, 20, 20);
      ctx.fillStyle = "#0095DD";
      ctx.stroke();
      ctx.closePath();

      document.getElementById("attack").style.display = "inline"
      document.getElementById("attack").style.left = entities[i].x - players[currentPlayer].x + canvas.width/2 - 20 + "px"
      document.getElementById("attack").style.top = entities[i].y - players[currentPlayer].y + canvas.height/2 - 40 + "px"
    }

    ctx.beginPath();
    ctx.arc(entities[i].x - players[currentPlayer].x + canvas.width/2, entities[i].y - players[currentPlayer].y + canvas.height/2, ballRadius, 0, Math.PI*2);
    ctx.fillStyle = "#a0522d";
    ctx.fill();
    ctx.closePath();

    

    drawHealth(entities[i].health, entities[i].x - players[currentPlayer].x + canvas.width/2 - 15, entities[i].y - players[currentPlayer].y + canvas.height/2 - 20)

  }
  // if(chosePlayer) {document.getElementById("attack").style.display = "inline";}

}


function render(x, y){
  if(x <= players[ID].gridX + 8 && x >= players[ID].gridX - 8){
    if(y <= players[ID].gridY + 6 && y >= players[ID].gridY - 6){
      return true;
    }
  }
  else {return false}
}

chunkSize = 8;

var chunkInfo = {};

var loggedIn = false;

socket.on('login', function(state){
  loggedIn = true;
  document.getElementById("login").style.display = "none"
  document.getElementById("email").style.display = "none"
  document.getElementById("username").style.display = "none"
  document.getElementById("password").style.display = "none"
})

socket.on('renderedChunks', function(rendered){
  for(x = -1; x <=1; x++){
      for(y = -1; y <=1; y++){
      chunkInfo[x+"x"+y] = rendered[(x + rendered.cenChunkX)+"x"+(y + rendered.cenChunkY)];
    }
  }
});

function checkSuroundings(){
  document.getElementById("woodAmount").innerHTML = players[currentPlayer].wood;
}

function drawChunk(){
  document.getElementById("wall").style.display = "none";
  for(xC = -1; xC <=1; xC++){
      for(yC = -1; yC <=1; yC++){
        for(var x = 0; x < chunkSize; x++){
          for(var y = 0; y < chunkSize; y++){

            if(chunkInfo[xC+"x"+yC].chunk[x][y].name === "wall"){
              ctx.beginPath();
              //positioning is equal to playerXY multiplied by chunkXY times the size of 16 and the grid size of forty. Then array x/y position multiplied by grid size is added
              // ctx.rect(x * gridSize - players[currentPlayer].x + canvas.width/2 + (chunkInfo[xC+"x"+yC].x * chunkSize * gridSize), y * gridSize - players[currentPlayer].y + canvas.height/2 + (chunkInfo[xC+"x"+yC].y * chunkSize * gridSize), gridSize, gridSize)
              // ctx.fillStyle = "rgba(139,69,19,"+ chunkInfo[xC+"x"+yC].chunk[x][y].dura/200 + ")";
              // ctx.fill();
              // ctx.closePath();
              wallToCanvas(x * gridSize - players[currentPlayer].x + canvas.width/2 + (chunkInfo[xC+"x"+yC].x * chunkSize * gridSize), y * gridSize - players[currentPlayer].y + canvas.height/2 + (chunkInfo[xC+"x"+yC].y * chunkSize * gridSize), chunkInfo[xC+"x"+yC].chunk[x][y].dura)

            }

            if(chunkInfo[xC+"x"+yC].chunk[x][y].name === "groupHub"){
              // ctx.beginPath();
              // ctx.rect(x * gridSize - players[currentPlayer].x + canvas.width/2 + (chunkInfo[xC+"x"+yC].x * chunkSize * gridSize), y * gridSize - players[currentPlayer].y + canvas.height/2 + (chunkInfo[xC+"x"+yC].y * chunkSize * gridSize), gridSize, gridSize)
              // ctx.fillStyle = "rgba(0,255,0,"+ chunkInfo[xC+"x"+yC].chunk[x][y].dura/100 + ")";
              groupHubToCanvas(x * gridSize - players[currentPlayer].x + canvas.width/2 + (chunkInfo[xC+"x"+yC].x * chunkSize * gridSize), y * gridSize - players[currentPlayer].y + canvas.height/2 + (chunkInfo[xC+"x"+yC].y * chunkSize * gridSize), chunkInfo[xC+"x"+yC].chunk[x][y].dura)
              // ctx.fill();

              // ctx.closePath();
            }

            if(chunkInfo[xC+"x"+yC].chunk[x][y].name === "tree"){
              // ctx.beginPath();
              // ctx.rect(x * gridSize - players[currentPlayer].x + canvas.width/2 + (chunkInfo[xC+"x"+yC].x * chunkSize * gridSize), y * gridSize - players[currentPlayer].y + canvas.height/2 + (chunkInfo[xC+"x"+yC].y * chunkSize * gridSize), gridSize, gridSize)
              // ctx.fillStyle = "rgba(0,255,0,"+ chunkInfo[xC+"x"+yC].chunk[x][y].dura/100 + ")";
              treeToCanvas(x * gridSize - players[currentPlayer].x + canvas.width/2 + (chunkInfo[xC+"x"+yC].x * chunkSize * gridSize), y * gridSize - players[currentPlayer].y + canvas.height/2 + (chunkInfo[xC+"x"+yC].y * chunkSize * gridSize), chunkInfo[xC+"x"+yC].chunk[x][y].dura)
              // ctx.fill();

              // ctx.closePath();
            }

            if(chunkInfo[xC+"x"+yC].chunk[x][y].name === "jungle"){
              ctx.beginPath();
              ctx.rect(x * gridSize - players[currentPlayer].x + canvas.width/2 + (chunkInfo[xC+"x"+yC].x * chunkSize * gridSize), y * gridSize - players[currentPlayer].y + canvas.height/2 + (chunkInfo[xC+"x"+yC].y * chunkSize * gridSize), gridSize, gridSize)
              ctx.fillStyle = "rgba(2,89,57,"+ chunkInfo[xC+"x"+yC].chunk[x][y].dura/120 + ")";
              ctx.fill();
              ctx.closePath();
            }

             if(chunkInfo[xC+"x"+yC].chunk[x][y].name === "catus"){
              ctx.beginPath();
              ctx.rect(x * gridSize - players[currentPlayer].x + canvas.width/2 + (chunkInfo[xC+"x"+yC].x * chunkSize * gridSize), y * gridSize - players[currentPlayer].y + canvas.height/2 + (chunkInfo[xC+"x"+yC].y * chunkSize * gridSize), gridSize, gridSize)
              ctx.fillStyle = "rgba(255,0,0,"+ chunkInfo[xC+"x"+yC].chunk[x][y].dura/120 + ")";
              ctx.fill();
              ctx.closePath();
            }

            if(chunkInfo[xC+"x"+yC].chunk[x][y].name === "savanna"){
              ctx.beginPath();
              ctx.rect(x * gridSize - players[currentPlayer].x + canvas.width/2 + (chunkInfo[xC+"x"+yC].x * chunkSize * gridSize), y * gridSize - players[currentPlayer].y + canvas.height/2 + (chunkInfo[xC+"x"+yC].y * chunkSize * gridSize), gridSize, gridSize)
              ctx.fillStyle = "rgba(210,180,140,"+ chunkInfo[xC+"x"+yC].chunk[x][y].dura/120 + ")";
              ctx.fill();
              ctx.closePath();
            }

            if(chunkInfo[xC+"x"+yC].chunk[x][y].name === "plain"){
              ctx.beginPath();
              // treeToCanvas(x * gridSize - players[currentPlayer].x + canvas.width/2 + (chunkInfo[xC+"x"+yC].x * chunkSize * gridSize, y * gridSize - players[currentPlayer].y + canvas.height/2 + (chunkInfo[xC+"x"+yC].y * chunkSize * gridSize)
              ctx.rect(x * gridSize - players[currentPlayer].x + canvas.width/2 + (chunkInfo[xC+"x"+yC].x * chunkSize * gridSize), y * gridSize - players[currentPlayer].y + canvas.height/2 + (chunkInfo[xC+"x"+yC].y * chunkSize * gridSize), gridSize, gridSize)
              ctx.fillStyle = "rgba(5,237,152,"+ chunkInfo[xC+"x"+yC].chunk[x][y].dura/120 + ")";
              ctx.fill();
              ctx.closePath();
            }

            if(chunkInfo[xC+"x"+yC].chunk[x][y].name === "marsh"){
              ctx.beginPath();
              ctx.rect(x * gridSize - players[currentPlayer].x + canvas.width/2 + (chunkInfo[xC+"x"+yC].x * chunkSize * gridSize), y * gridSize - players[currentPlayer].y + canvas.height/2 + (chunkInfo[xC+"x"+yC].y * chunkSize * gridSize), gridSize, gridSize)
              ctx.fillStyle = "rgba(0,153,77,"+ chunkInfo[xC+"x"+yC].chunk[x][y].dura/120 + ")";
              ctx.fill();
              ctx.closePath();
            }

            if(chunkInfo[xC+"x"+yC].chunk[x][y].name === "frost"){
              ctx.beginPath();
              ctx.rect(x * gridSize - players[currentPlayer].x + canvas.width/2 + (chunkInfo[xC+"x"+yC].x * chunkSize * gridSize), y * gridSize - players[currentPlayer].y + canvas.height/2 + (chunkInfo[xC+"x"+yC].y * chunkSize * gridSize), gridSize, gridSize)
              ctx.fillStyle = "rgba(77,106,255,"+ chunkInfo[xC+"x"+yC].chunk[x][y].dura/120 + ")";
              ctx.fill();
              ctx.closePath();
            }

            if(chunkInfo[xC+"x"+yC].chunk[x][y].name === "snow"){
              ctx.beginPath();
              ctx.rect(x * gridSize - players[currentPlayer].x + canvas.width/2 + (chunkInfo[xC+"x"+yC].x * chunkSize * gridSize), y * gridSize - players[currentPlayer].y + canvas.height/2 + (chunkInfo[xC+"x"+yC].y * chunkSize * gridSize), gridSize, gridSize)
              ctx.fillStyle = "rgba(53,73,176,"+ chunkInfo[xC+"x"+yC].chunk[x][y].dura/120 + ")";
              ctx.fill();
              ctx.closePath();
            }

            if(chunkInfo[xC+"x"+yC].chunk[x][y].name === "frozen"){
              ctx.beginPath();
              ctx.rect(x * gridSize - players[currentPlayer].x + canvas.width/2 + (chunkInfo[xC+"x"+yC].x * chunkSize * gridSize), y * gridSize - players[currentPlayer].y + canvas.height/2 + (chunkInfo[xC+"x"+yC].y * chunkSize * gridSize), gridSize, gridSize)
              ctx.fillStyle = "rgba(25,35,84,"+ chunkInfo[xC+"x"+yC].chunk[x][y].dura/120 + ")";
              ctx.fill();
              ctx.closePath();
            }


            if(chunkInfo[xC+"x"+yC].chunk[x][y].name === "rock"){
              ctx.beginPath();
              ctx.rect(x * gridSize - players[currentPlayer].x + canvas.width/2 + (chunkInfo[xC+"x"+yC].x * chunkSize * gridSize), y * gridSize - players[currentPlayer].y + canvas.height/2 + (chunkInfo[xC+"x"+yC].y * chunkSize * gridSize), gridSize, gridSize)
              ctx.fillStyle = "rgba(128,128,128,"+ chunkInfo[xC+"x"+yC].chunk[x][y].dura/150 + ")";
              ctx.fill();
              ctx.closePath();
            }

            if(chunkInfo[xC+"x"+yC].chunk[x][y].name === "water"){
              ctx.beginPath();
              ctx.rect(x * gridSize - players[currentPlayer].x + canvas.width/2 + (chunkInfo[xC+"x"+yC].x * chunkSize * gridSize), y * gridSize - players[currentPlayer].y + canvas.height/2 + (chunkInfo[xC+"x"+yC].y * chunkSize * gridSize), gridSize, gridSize)
              ctx.fillStyle = "rgba(0,0,255,"+ 1 +")";
              ctx.fill();
              ctx.closePath();
            }
            if(chunkInfo[xC+"x"+yC].chunk[x][y].name === "door"){
              ctx.beginPath();
              ctx.rect(x * gridSize - players[currentPlayer].x + canvas.width/2 + (chunkInfo[xC+"x"+yC].x * chunkSize * gridSize), y * gridSize - players[currentPlayer].y + canvas.height/2 + (chunkInfo[xC+"x"+yC].y * chunkSize * gridSize), gridSize, gridSize)
              ctx.fillStyle = "rgba(0,0,255,"+ 1 +")";
              ctx.fill();
              ctx.closePath();
            }
              // ctx.beginPath();
              // //tree positioning is equal to playerXY multiplied by chunkXY times the size of 16 and the grid size of forty. Then array x/y position multiplied by grid size is added
              // ctx.rect(x * gridSize - players[currentPlayer].x + canvas.width/2 + (chunkInfo[xC+"x"+yC].x * chunkSize * gridSize), y * gridSize - players[currentPlayer].y + canvas.height/2 + (chunkInfo[xC+"x"+yC].y * chunkSize * gridSize), gridSize, gridSize)
              // ctx.fillStyle = "rgb(" + (128 + Math.floor(128 * chunkInfo[xC+"x"+yC].chunk[x][y].noiseValue)) +", "  + (128 + Math.floor(128 * chunkInfo[xC+"x"+yC].chunk[x][y].noiseValue)) + ", " + (128 + Math.floor(128 * chunkInfo[xC+"x"+yC].chunk[x][y].noiseValue)) +")"
              // ctx.fill();
              // ctx.closePath();
          }
        }
        if(chunkInfo[xC+"x"+yC].x === clickedArea.chunkClickedX && chunkInfo[xC+"x"+yC].y === clickedArea.chunkClickedY){
              ctx.beginPath();
              ctx.strokeStyle = "blue";
              ctx.rect(clickedArea.chunkGridXClicked * gridSize - players[currentPlayer].x + canvas.width/2 + (chunkInfo[xC+"x"+yC].x * chunkSize * gridSize), clickedArea.chunkGridYClicked * gridSize - players[currentPlayer].y + canvas.height/2 + (chunkInfo[xC+"x"+yC].y * chunkSize * gridSize), gridSize, gridSize)
              ctx.stroke();
              ctx.closePath();
              var chosenGrid = chunkInfo[xC+"x"+yC].chunk[clickedArea.chunkGridXClicked][clickedArea.chunkGridYClicked]
              document.getElementById("gridValue").innerHTML = "name = " + chosenGrid.name + " isSolid = " + chosenGrid.isSolid + " isEmpty = " + chosenGrid.isEmpty + " chunkX = " + clickedArea.chunkClickedX + " chunkY = " + clickedArea.chunkClickedY + " gridX = " + clickedArea.chunkGridXClicked + " gridY = " + clickedArea.chunkGridYClicked + " noise value = " + chosenGrid.noiseValue;
              if(chosenGrid.name === "tree"){
                document.getElementById("chop").style.display = "block";
                document.getElementById("chop").style.left =  canvas.width/2 + clickedArea.chunkGridXClicked * 40 - (players[currentPlayer].chunkGridX)*40 - (players[currentPlayer].x % 40) - (players[currentPlayer].chunkX - clickedArea.chunkClickedX) * gridSize * chunkSize - 20 + "px"
                document.getElementById("chop").style.top = canvas.height/2 + clickedArea.chunkGridYClicked *40  - (players[currentPlayer].chunkGridY)*40 - (players[currentPlayer].y % 40)  - (players[currentPlayer].chunkY - clickedArea.chunkClickedY) * gridSize * chunkSize - 20 + "px"
              } else {
                document.getElementById("chop").style.display = "none";
              }
              if(chosenGrid.name === "groupHub"){
                document.getElementById("takeGroup").style.display = "inline";
                // document.getElementById("chop").style.display = "block";
                document.getElementById("takeGroup").style.left =  canvas.width/2 + clickedArea.chunkGridXClicked * 40 - (players[currentPlayer].chunkGridX)*40 - (players[currentPlayer].x % 40) - (players[currentPlayer].chunkX - clickedArea.chunkClickedX) * gridSize * chunkSize - 20 + "px"
                document.getElementById("takeGroup").style.top = canvas.height/2 + clickedArea.chunkGridYClicked *40  - (players[currentPlayer].chunkGridY)*40 - (players[currentPlayer].y % 40)  - (players[currentPlayer].chunkY - clickedArea.chunkClickedY) * gridSize * chunkSize - 20 + "px"
              } else {
                document.getElementById("takeGroup").style.display = "none";
              }
              if(chosenGrid.isEmpty === true){
                
                document.getElementById("wall").style.display = "inline";
                document.getElementById("wall").style.left =  canvas.width/2 + clickedArea.chunkGridXClicked * 40 - (players[currentPlayer].chunkGridX)*40 - (players[currentPlayer].x % 40) - (players[currentPlayer].chunkX - clickedArea.chunkClickedX) * gridSize * chunkSize - 20 + "px"
                document.getElementById("wall").style.top = canvas.height/2 + clickedArea.chunkGridYClicked *40  - (players[currentPlayer].chunkGridY)*40 - (players[currentPlayer].y % 40)  - (players[currentPlayer].chunkY - clickedArea.chunkClickedY) * gridSize * chunkSize - 20  + "px"
              } else {
                document.getElementById("wall").style.display = "none";
              }
              if(chosenGrid.occupiedBy != undefined){
                document.getElementById("fight").style.display = "inline";
              } else {
                document.getElementById("fight").style.display = "none";
              }
              // console.log(chosenGrid.occupiedBy)


        }
      }
    }
  }

function treeToCanvas(x, y, dura) {
  var image = document.getElementById("treeAsset")

  ctx.beginPath();
  ctx.globalAlpha = dura/100
  ctx.drawImage(
  image,
    0, 0,
    200, 200,
    x, y,
    gridSize, gridSize
    )
  ctx.globalAlpha = 1.0;
  ctx.closePath();
}
function wallToCanvas(x, y, dura) {
  var image = document.getElementById("wallAsset")

  ctx.beginPath();
  ctx.globalAlpha = dura/100
  ctx.drawImage(
  image,
    0, 0,
    60, 60,
    x, y,
    gridSize, gridSize
    )
  ctx.globalAlpha = 1.0;
  ctx.closePath();

}

function groupHubToCanvas(x, y, dura){
  var image = document.getElementById("groupHubAsset")

  ctx.beginPath();
  ctx.globalAlpha = dura/200;
  ctx.drawImage(
  image,
    0, 0,
    40, 40,
    x, y,
    gridSize, gridSize
    )
  ctx.globalAlpha = 1.0;
  ctx.closePath();
}

var selectedType;

var selectedUser;

var selectedEntity;
// const isSelectedUser = (player) => player.user === selectedUser;

function onDown(event){
  
  if(loggedIn === true){
    cx = event.clientX - canvas.offsetLeft - canvas.width/2 + players[currentPlayer].x;
    cy = event.clientY - canvas.offsetTop - canvas.height/2 + players[currentPlayer].y;
    for(let i = 0; i < players.length; i++){
      if(cx <= players[i].x + 10 && cx >= players[i].x-10 && cy <= players[i].y + 10 && cy >= players[i].y-10){
        console.log("clicked player " + players[i].user)
        selectedType = "player"
        selectedUser = players[i]
      }
    }

    for(let i = 0; i < entities.length; i++){
      if(cx <= entities[i].x + 10 && cx >= entities[i].x-10 && cy <= entities[i].y + 10 && cy >= entities[i].y-10){
        // console.log("clicked player " + players[i].user)
        selectedType = "entity"
        selectedEntity = entities[i]
      }
    }
    
    getChosenGrid(cx, cy);
  }
}


var clickedArea = {};


//Work on this so it works for different canvas sizes
function getChosenGrid(x, y){
  var gridXClicked = Math.floor(x/gridSize)
  var gridYClicked = Math.floor(y/gridSize)

  // var chunkClickedX = undefined
  // var chunkClickedY = undefined

  var chunkClickedX = Math.floor(gridXClicked/8);
  var chunkClickedY = Math.floor(gridYClicked/8);

  var chunkGridXClicked = gridXClicked % 8;
  var chunkGridYClicked = gridYClicked % 8;

  if(chunkGridXClicked < 0){
    chunkGridXClicked += 8;
  }

  if(chunkGridYClicked < 0){
    chunkGridYClicked += 8;
  }

  clickedArea.chunkClickedX = chunkClickedX
  clickedArea.chunkClickedY = chunkClickedY
  clickedArea.chunkGridXClicked = chunkGridXClicked
  clickedArea.chunkGridYClicked = chunkGridYClicked
}


function draw() {
  if(loggedIn === true){
  	ctx.clearRect(0, 0, canvas.width, canvas.height);
    getFocus();
  	// drawGrid();
    drawChunk();
    drawPlayers();
    checkSuroundings();
  	document.getElementById("cords").innerHTML = "X= " + players[currentPlayer].x + "Y= " + players[currentPlayer].y;
  } else {
    // drawText("Login:", canvas.width/2-100, canvas.height/2)
  }
}

function drawText(text, x, y) {
    ctx.beginPath();
    ctx.font = "32px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText(text, x, y);
    ctx.closePath();
}

function drawHealth(health, x, y){
  ctx.beginPath();
  ctx.rect(x, y, 30*(health/10), 5)
  ctx.fillStyle = "#00ff00"
  ctx.fill();
  ctx.closePath();
}

function drawStamina(stamina, x, y){
  ctx.beginPath();
  ctx.rect(x, y, 30*(stamina/10), 4)
  ctx.fillStyle = "#FF0000"
  ctx.fill();
  ctx.closePath();
}

function drawName(name, x, y) {
    ctx.beginPath();
    ctx.font = "16px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText(name, x, y);
    ctx.closePath();
}

function attackHandler(){

  if(selectedType === "player"){
    var wraper = {
      selectedEntity : selectedType,
      ID : selectedUser.ID
    }
    socket.emit('attack', wraper)
  }
  if(selectedType === "entity"){
    var wraper = {
        selectedType : selectedType,
        ID : selectedEntity.ID
    }

    socket.emit('attack', wraper)
  }
}

function peaceHandler(){
 socket.emit('peace')
}

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.getElementById("chop").addEventListener("click", chopHandler);
document.getElementById("wall").addEventListener("click", placeWallHandler);
document.getElementById("fight").addEventListener("click", fightHandler);
document.getElementById("login").addEventListener("click", loginHandler);
document.getElementById("attack").addEventListener("click", attackHandler);
document.getElementById("peace").addEventListener("click", peaceHandler);

document.getElementById("saveAllChunks").addEventListener("click", saveAllChunksHandler);
document.getElementById("createGroup").addEventListener("click", createGroupHandler);
document.getElementById("editGroup").addEventListener("click", editGroupHandler);
document.getElementById("submitCreateGroup").addEventListener("click", submitCreateGroupHandler);
document.getElementById("editGroupSubmit").addEventListener("click", editGroupSubmitHandler);
document.getElementById("takeGroup").addEventListener("click", claimGroupHandler);
document.getElementById("placeDoor").addEventListener("click", placeDoorHandler);
document.getElementById("saveAllGroups").addEventListener("click", saveAllGroupsHandler);
document.getElementById("craftingMenu").addEventListener("click", craftingMenuHandler);


function placeDoorHandler(){
  var currentGroup = document.getElementById('currentGroup').value
  var doorPlacement = {
    clickedArea: clickedArea,
    group : currentGroup
  }
  socket.emit('placeDoor', doorPlacement)
}

function editGroupSubmitHandler(){
  var nameOfGroup = document.getElementById('editGroupName').value
  

  var editInfo = {
    name: nameOfGroup,
    addAdmin : undefined,
    addMod : undefined,
    addMember : undefined,
    removeAdmin : undefined,
    removeMod : undefined,
    removeMember : undefined
  }


  if(document.getElementById('editGroupAddAdmin').value != ''){
    editInfo.addAdmin = document.getElementById('editGroupAddAdmin').value
  }

  if(document.getElementById('editGroupAddMod').value != ''){
    editInfo.addMod = document.getElementById('editGroupAddMod').value
  }

  if(document.getElementById('editGroupAddMember').value != ''){
    editInfo.addMember = document.getElementById('editGroupAddMember').value
  }

  if(document.getElementById('editGroupRemoveAdmin').value != ''){
    editInfo.removeAdmin = document.getElementById('editGroupRemoveAdmin').value
  }

  if(document.getElementById('editGroupRemoveMod').value != ''){
   editInfo.removeMod = document.getElementById('editGroupRemoveMod').value
  }

  if(document.getElementById('editGroupRemoveMember').value != ''){
    editInfo.removeMember = document.getElementById('editGroupRemoveMember').value
  }




  socket.emit('editGroup', editInfo)
}

function submitCreateGroupHandler(){
  var nameOfGroup = document.getElementById('createGroupName').value
  var action = {
    group : {
      name: nameOfGroup
    },
    clickedArea : {
      chunkClickedX : clickedArea.chunkClickedX,
      chunkClickedY : clickedArea.chunkClickedY,
      chunkGridXClicked : clickedArea.chunkGridXClicked,
      chunkGridYClicked : clickedArea.chunkGridYClicked
    }
  }



  socket.emit('createGroup', action)
}



function createGroupHandler(){
  document.getElementById("createGroupName").style.display = "inline";
  document.getElementById("submitCreateGroup").style.display = "inline";
}

function editGroupHandler(){
  document.getElementById("editGroupName").style.display = "inline";
  document.getElementById("editGroupAddAdmin").style.display = "inline";
  document.getElementById("editGroupAddMod").style.display = "inline";
  document.getElementById("editGroupAddMember").style.display = "inline";
  document.getElementById("editGroupRemoveAdmin").style.display = "inline";
  document.getElementById("editGroupRemoveMod").style.display = "inline";
  document.getElementById("editGroupRemoveMember").style.display = "inline";
  document.getElementById("editGroupSubmit").style.display = "inline";


}
var craftingMenuOn = false
function craftingMenuHandler(){

  if(craftingMenuOn === false){
    craftingMenuOn = true
    document.getElementById("woodenSpear").style.display = "inline";
    document.getElementById("woodenAxe").style.display = "inline";
    document.getElementById("woodenPickaxe").style.display = "inline";
  } else {
    craftingMenuOn = false
    document.getElementById("woodenSpear").style.display = "none";
    document.getElementById("woodenAxe").style.display = "none";
    document.getElementById("woodenPickaxe").style.display = "none";
  }

    
}


function saveAllChunksHandler(){
  socket.emit('saveServer')
}

function saveAllGroupsHandler(){
  console.log("saveAllGroupsHandler")
  socket.emit('saveGroups')
}

function loginHandler(){
  var email = document.getElementById('email').value
  var username = document.getElementById('username').value
  var password = document.getElementById('password').value

  var loginInfo = {
    email: email,
    username: username,
    password: password
  }

  socket.emit('login', loginInfo)
}

function fightHandler(){
  socket.emit('fight', clickedArea);
}

function chopHandler(){
  socket.emit('chop', clickedArea);
}

function placeWallHandler(){
  socket.emit('placeWall', clickedArea)
}

function claimGroupHandler(){
  socket.emit('claimGroup', clickedArea)
}

var selectedSlot = 1;

function keyDownHandler(e) {
    if(e.key == "Right" || e.key == "ArrowRight" || e.keyCode === 68) {
        state.rightPressed = true;
        socket.emit('movement', state);
    }
    if(e.key == "Left" || e.key == "ArrowLeft" || e.keyCode === 65) {
        state.leftPressed = true;
       socket.emit('movement', state);
    }
    if(e.key == "Down" || e.key == "ArrowDown" || e.keyCode === 83) {
        state.downPressed = true;
       socket.emit('movement', state);
    }
    if(e.key == "Up" || e.key == "ArrowUp" || e.keyCode === 87) {
        state.upPressed = true;
        socket.emit('movement', state);
    }
    if(e.keyCode === 32) {
      if(selectedSlot === 1){
        chopHandler();
      }
      if(selectedSlot === 2){
        placeWallHandler();
      }
      if(selectedSlot === 3){
        fightHandler();
      }
    }
    if(e.keyCode === 49) {
      selectedSlot = 1;
    }
    if(e.keyCode === 50) {
      selectedSlot = 2;
    }
    if(e.keyCode === 51) {
      selectedSlot = 3;
    }
    if(e.keyCode === 52) {
      selectedSlot = 4;
    }
    if(e.keyCode === 53) {
      selectedSlot = 5;
    }
    if(e.keyCode === 54) {
      selectedSlot = 6;
    }
    if(e.keyCode === 55) {
      selectedSlot = 7;
    }
    if(e.keyCode === 56) {
      selectedSlot = 8;
    }
    if(e.keyCode === 57) {
      selectedSlot = 9;
    }

}
//keycodes for WASD controls

function keyUpHandler(e) {
    if(e.key == "Right" || e.key == "ArrowRight" || e.keyCode === 68) {
        state.rightPressed = false;
        socket.emit('movement', state);
    }
    if(e.key == "Left" || e.key == "ArrowLeft" || e.keyCode === 65) {
        state.leftPressed = false;
        socket.emit('movement', state);
    }
    if(e.key == "Down" || e.key == "ArrowDown" || e.keyCode === 83) {
        state.downPressed = false;
        socket.emit('movement', state);
    }
    if(e.key == "Up" || e.key == "ArrowUp" || e.keyCode === 87) {
        state.upPressed = false;
        socket.emit('movement', state);
    }
}


var interval = setInterval(draw, 1000/60);