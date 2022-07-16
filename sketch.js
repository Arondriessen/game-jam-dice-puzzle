

// Basic Variables

gameState = 0;

level = 1;
moves = 0;

playerPos = [0, 0];
mousePos = [0, 0];
prevMousePos = [0, 0];
canMove = 0;
onTarget = 0;
selectedTarget = 0;

cubeTopNum = 1;
cubeBottomNum = 6;
cubeLeftNum = 4;
cubeRightNum = 3;
cubeBackNum = 2;
cubeFrontNum = 5;

moveDir = 0;
moveDist = 0;

levelData = [];


document.addEventListener('contextmenu', event => event.preventDefault());


function setup() {

  // Canvas Setup

  var myCanvas = createCanvas(windowWidth - 5, windowHeight - 5);
  myCanvas.parent("game-wrap");

  // Basic Game Setup

  playAreaSize = min(width, height) - 200;
  gridStartX = (width - playAreaSize) / 2;
  gridStartY = (height - playAreaSize) / 2;


  // Load level data from js file

  var script = document.createElement('script');

  script.onload = function () {

    levelData = levels.slice();

    openLevel(level);

    // Attach level open function to play button

    document.getElementById('play-button').addEventListener("click", event => {

      gameState = 1;
      openLevel(level);
    });

    // Attach function to menu button

    document.getElementById('back-to-menu-button').addEventListener("click", event => {

      gameState = 0;
    });

    // Attach level open functions to level buttons

    let levelButtons = document.getElementsByClassName("menu-button level-button");

    for (let i = 0; i < levelButtons.length; i++) {

      levelButtons[i].addEventListener("click", event => {

        gameState = 1;
        let fuckoff = levelButtons[i].id.substr(this.id.length - 1);
        openLevel(fuckoff);
      });
    }
  }

  script.src = 'levels.js';
  document.head.appendChild(script);
}



function draw() {

  // Only do anything if the script container div is open

  if (gameState) {

    background(0);


    // Update mouse pos

    if (mouseX > gridStartX) {

      if (mouseX < (gridStartX + (gridRes * tileSize))) {

        if (mouseY > gridStartY) {

          if (mouseY < (gridStartY + (gridRes * tileSize))) {

            prevMousePos[0] = mousePos[0];
            prevMousePos[1] = mousePos[1];
            mousePos[0] = floor((mouseX - gridStartX) / tileSize);
            mousePos[1] = floor((mouseY - gridStartY) / tileSize);
          }
        }
      }
    }

    // Check if mouse state needs updating

    if ((mousePos[0] != prevMousePos[0]) || (mousePos[1] != prevMousePos[1])) {

      // Can we move?
      // Set state to "cannot move" by default before checking

      canMove = 0;

      // Are we along the x or y axis of the player?

      if ((mousePos[0] == playerPos[0]) || (mousePos[1] == playerPos[1])) {

        // If we are clamp selected tile to within 1 tile distance from player

        mousePos[0] = playerPos[0] + max(min(mousePos[0] - playerPos[0], 1), -1);
        mousePos[1] = playerPos[1] + max(min(mousePos[1] - playerPos[1], 1), -1);

        // Make sure mouse is not ON the player

        if ((mousePos[0] != playerPos[0]) || (mousePos[1] != playerPos[1])) {

          // If we aren't set state to "can move"

          canMove = 1;
        }

        // Set move direction and distance

        if (mousePos[0] > playerPos[0]) { moveDir = 1; moveDist = 1; }
        if (mousePos[0] < playerPos[0]) { moveDir = 0; moveDist = 1; }
        if (mousePos[1] > playerPos[1]) { moveDir = 3; moveDist = 1; }
        if (mousePos[1] < playerPos[1]) { moveDir = 2; moveDist = 1; }

        // Is the mouse on a target number?
        // Set to no by default before checking

        onTarget = 0;

        for (let i = 0; i < targets.length; i++) {

          if ((mousePos[0] == targets[i][0]) && (mousePos[1] == targets[i][1])) {

            onTarget = 1;
            selectedTarget = i;

            // Calculate movement outcome numbers
            // Can we land of the target number? (will it match the top number?)
            // Is it not already solved (can't move to it then)

            rollTempCube(moveDir, moveDist);

            if (targets[i][2] != tempTopNum) { canMove = 0; }
            if (targets[i][3]) { canMove = 0; }

            break;
          }
        }
      }
    }


    // Draw Grid Square Background

    fill(0);
    square(gridStartX, gridStartY, playAreaSize);


    // Draw mouse pos

    fill(255, 0, 0);
    if (canMove == 1) { fill(0, 255, 0); }
    noStroke();
    square(gridStartX + (mousePos[0] * tileSize), gridStartY + (mousePos[1] * tileSize), tileSize);


    // Draw Player

    fill(255);
    noStroke();
    square(gridStartX + (playerPos[0] * tileSize), gridStartY + (playerPos[1] * tileSize), tileSize);


    // Draw Grid Tiles

    noFill();
    stroke(255);
    strokeWeight(4);

    for (let i = 0; i < gridRes; i++) {

      for (let y = 0; y < gridRes; y++) {

        square(gridStartX + (i * tileSize), gridStartY + (y * tileSize), tileSize);
      }
    }


    // Draw target numbers

      textAlign(CENTER, CENTER);
      textSize(36);
      fill(255);
      noStroke();

    for (let i = 0; i < targets.length; i++) {

      fill(255);
      if (targets[i][3]) { fill(0, 255, 0); }

      text(targets[i][2], gridStartX + (targets[i][0] * tileSize) + (tileSize / 2), gridStartY + (targets[i][1] * tileSize) + (tileSize / 2));
    }


    // Draw cube num

    fill(0);
    text(cubeTopNum, gridStartX + (playerPos[0] * tileSize) + (tileSize / 2), gridStartY + (playerPos[1] * tileSize) + (tileSize / 2));
  }
}



function mouseClicked() {

  if (canMove) {

    // Calculate move

    rollCube(moveDir, moveDist);

    // Move player

    playerPos[0] = mousePos[0];
    playerPos[1] = mousePos[1];

    // If moving to target, set target to solved

    if (onTarget) {

      // Check if not already solved

      if (targets[selectedTarget][3] == 0) {

        targets[selectedTarget][3] = 1;
      }
    }

    // Set "canmove" to off after moving to tile

    canMove = 0;
  }
}



function openLevel(num) {

  level = num;

  playerPos

  targets = levelData[level - 1][0].slice();

  for (let i = 0; i < targets.length; i++) {

    targets[i] = targets[i].slice();
  }

  moves = levelData[level - 1][1];
  gridRes = levelData[level - 1][2];
  tileSize = playAreaSize / gridRes;

  // Defaults

  playerPos = [0, 0];
  mousePos = [0, 0];
  prevMousePos = [0, 0];
  canMove = 0;
  onTarget = 0;
  selectedTarget = 0;

  cubeTopNum = 1;
  cubeBottomNum = 6;
  cubeLeftNum = 4;
  cubeRightNum = 3;
  cubeBackNum = 2;
  cubeFrontNum = 5;
}



function rollCube(dir, num) {

  rollTempCube(dir, num);

  cubeTopNum = tempTopNum;
  cubeBottomNum = tempBottomNum;
  cubeLeftNum = tempLeftNum;
  cubeRightNum = tempRightNum;
  cubeFrontNum = tempFrontNum;
  cubeBackNum = tempBackNum;
}



function rollTempCube(dir, num) {

  tempTopNum = cubeTopNum;
  tempBottomNum = cubeBottomNum;
  tempLeftNum = cubeLeftNum;
  tempRightNum = cubeRightNum;
  tempFrontNum = cubeFrontNum;
  tempBackNum = cubeBackNum;

  for (let i = 0; i < num; i++) {

    switch(dir) {

      case 0:
        rollLeft();
        break;
      case 1:
        rollRight();
        break;
      case 2:
        rollUp();
        break;
      case 3:
        rollDown();
        break;
    }
  }
}



function rollUp() {

  let temp = tempTopNum;
  tempTopNum = tempFrontNum;
  tempFrontNum = tempBottomNum;
  tempBottomNum = tempBackNum;
  tempBackNum = temp;
}



function rollDown() {

  let temp = tempTopNum;
  tempTopNum = tempBackNum;
  tempBackNum = tempBottomNum;
  tempBottomNum = tempFrontNum;
  tempFrontNum = temp;
}



function rollLeft() {

  let temp = tempTopNum;
  tempTopNum = tempRightNum;
  tempRightNum = tempBottomNum;
  tempBottomNum = tempLeftNum;
  tempLeftNum = temp;
}



function rollRight() {

  let temp = tempTopNum;
  tempTopNum = tempLeftNum;
  tempLeftNum = tempBottomNum;
  tempBottomNum = tempRightNum;
  tempRightNum = temp;
}
