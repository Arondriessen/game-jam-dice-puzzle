

// Basic Variables

gameState = 0;
loaded = 0;

level = 1;
unlockedLevel = 1;

playerPos = [0, 0];
mousePos = [0, 0];
prevMousePos = [0, 0];
canMove = 0;
playerOnTarget = -1;
onTarget = 0;
selectedTarget = 0;
gridTileStates = [];
levelSolved = 0;
targetsSolved = 0;
moves = 0;
outOfBounds = 1;


cubeTopNum = 1;
cubeBottomNum = 6;
cubeLeftNum = 4;
cubeRightNum = 3;
cubeBackNum = 2;
cubeFrontNum = 5;

moveDir = 0;
moveDist = 0;

soundOn = 1;

levelData = [];

var soundtrack;
var buttonSound;
var wrongMoveSound;
var levelCompleteSound;
var moveSound;
var soundtrack2;


document.addEventListener('contextmenu', event => event.preventDefault());

window.onload = (event) => {
  soundtrack = new Howl({
    src: ['soundtrack-1.mp3'],
    autoplay: true,
    loop: true,
    volume: 0.4,
  });

  soundtrack2 = new Howl({
    src: ['soundtrack-2.wav'],
    autoplay: true,
    loop: true,
    volume: 0.3,
  });

  buttonSound = new Howl({
    src: ['button-click-2.mp3'],
    autoplay: false,
    loop: false,
    volume: 0.4,
  });

  levelCompleteSound = new Howl({
    src: ['sip-coffee.wav'],
    autoplay: false,
    loop: false,
    volume: 5,
  });

  moveSound = new Howl({
    src: ['button-click-1.mp3'],
    autoplay: false,
    loop: false,
    volume: 0.3,
  });

  wrongMoveSound = new Howl({
    src: ['wrong-move-1.mp3'],
    autoplay: false,
    loop: false,
    volume: 0.4,
  });

  coffeePouringSound = new Howl({
    src: ['coffee-pour-2.wav'],
    autoplay: false,
    loop: false,
    volume: 0.5,
  });

  // Attach sound to all buttons

  allButtons = document.getElementsByClassName("menu-button");

  for (let i = 0; i < allButtons.length; i++) {

    allButtons[i].addEventListener("click", event => {

      buttonSound.play();
    });
  }

  // Attach function to sound toggle button

  document.getElementById('sound-toggle').addEventListener("click", event => {

    soundOn = !soundOn;
    storeItem('soundOn', soundOn);

    updateSound();
  });

  updateSound(); // delayed after setup
};


function setup() {

  // Load progression data

  level = max(1, getItem('level'));
  unlockedLevel = max(1, getItem('unlockedLevel'));
  soundOn = max(0, getItem('soundOn'));

  // Unlock everything for testing purposes

  //unlockedLevel = 1;

  // Canvas Setup

  var parentDiv = document.getElementById('game-wrap');
  var myCanvas = createCanvas(windowWidth - 5, windowHeight - 5);
  myCanvas.parent("game-wrap");

  // Basic Game Setup

  playAreaW = width - 700;
  playAreaH = height - 400;
  playAreaStartX = ((width - playAreaW) / 2) - 240;
  playAreaStartY = ((height - playAreaH) / 2);


  // Load level data from js file

  var script = document.createElement('script');

  script.onload = function () {

    levelData = levels.slice();

    // Save references to unwrapped cube numbers

    uwTop = document.getElementById('uw-top');
    uwBack = document.getElementById('uw-back');
    uwFront = document.getElementById('uw-front');
    uwBottom = document.getElementById('uw-bottom');
    uwLeft = document.getElementById('uw-left');
    uwRight = document.getElementById('uw-right');

    // Save references to top bar texts

    levelText = document.getElementById('level-text');
    movesText = document.getElementById('moves-left-text');
    targetsDoneText = document.getElementById('targets-done-text');
    totalTargets = document.getElementById('targets-text');

    // Attach level open function to play button

    document.getElementById('play-button').addEventListener("click", event => {

      gameState = 1;
      openLevel(level);
    });

    // Attach function to menu button

    document.getElementById('back-to-menu-button').addEventListener("click", event => {

      gameState = 0;
      nextLevelButton.style.visibility = 'hidden';
    });

    // Attach function to restart button

    document.getElementById('restart-button').addEventListener("click", event => {

      openLevel(level);
      nextLevelButton.style.visibility = 'hidden';
    });

    // Attach function to next level button

    nextLevelButton = document.getElementById('next-level-button');
    nextLevelButton.style.visibility = 'hidden';
    nextLevelButton.addEventListener("click", event => {

      level++;
      openLevel(level);
      nextLevelButton.style.visibility = 'hidden';
    });

    // Attach level open functions to level buttons

    levelButtons = document.getElementsByClassName("menu-button level-button");

    for (let i = 0; i < levelButtons.length; i++) {

      let numLen = 1;
      if (i > 8) { numLen = 2; }
      levelButtons[i].style.visibility = 'hidden';
      levelButtons[i].addEventListener("click", event => {

        gameState = 1;
        let fuckoff = levelButtons[i].id.substr(this.id.length - numLen);
        openLevel(parseInt(fuckoff));
      });
    }

    updateUnlockedLevel();

    c1 = color('#BA9790');

    loaded = 1;
    //openLevel(level);
  }

  script.src = 'levels.js';
  document.head.appendChild(script);
}



function windowResized() {

  resizeCanvas(windowWidth - 5, windowHeight - 5);

  playAreaW = width - 700;
  playAreaH = height - 400;
  playAreaStartX = ((width - playAreaW) / 2) - 240;
  playAreaStartY = ((height - playAreaH) / 2);

  if (gameState) {

    tileSize = min(min(min(playAreaW / gridRes[0], playAreaH / gridRes[1]), min(playAreaW, playAreaH) / 5), 200);

    gridStartX = playAreaStartX + ((playAreaW - ((gridRes[0]) * tileSize)) / 2);
    gridStartY = playAreaStartY + ((playAreaH - ((gridRes[1]) * tileSize)) / 2);
  }
}



function draw() {

  // Only do anything if the script container div is open

  if (loaded) {

    if (gameState) {

      background(c1);


      // Update mouse pos

      outOfBounds = 1;

      if (mouseX > gridStartX) {

        if (mouseX < (gridStartX + (gridRes[0] * tileSize))) {

          if (mouseY > gridStartY) {

            if (mouseY < (gridStartY + (gridRes[1] * tileSize))) {

              let newPosX = floor((mouseX - gridStartX) / tileSize);
              let newPosY = floor((mouseY - gridStartY) / tileSize);

              // Check if we're on an enabled tile

              if (levelData[level - 1][3][newPosY][newPosX]) {

                outOfBounds = 0;

                prevMousePos[0] = mousePos[0];
                prevMousePos[1] = mousePos[1];
                mousePos[0] = newPosX;
                mousePos[1] = newPosY;
              }
            }
          }
        }
      }

      // Check if mouse state needs updating

      if ((mousePos[0] != prevMousePos[0]) || (mousePos[1] != prevMousePos[1])) {

        // Can we move?
        // Set state to "cannot move" by default before checking

        canMove = 0;

        // Do we have any moves left?

        if (moves > 0) {

          // Are we on an enabled tile?

          if (gridTileStates[mousePos[1]][mousePos[0]]) {

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
        }
      }


      // Draw Grid Square Background

      fill(0);
      //square(gridStartX, gridStartY, playAreaSize);


      // Draw mouse pos

      if (gridTileStates[mousePos[1]][mousePos[0]]) {

        if (canMove == 1) {

          fill(0, 30);
          square(gridStartX + (mousePos[0] * tileSize), gridStartY + (mousePos[1] * tileSize), tileSize);

        } else {

          //if (onTarget) {

            noFill();
            stroke(color('#a88882'));
            strokeWeight(tileSize / 20);

            let xx = gridStartX + (mousePos[0] * tileSize);
            let yy = gridStartY + (mousePos[1] * tileSize);
            let off = tileSize / 4;
            let len = tileSize - (off * 2);

            line(xx + off, yy + off, xx + off + len, yy + off + len);
            line(xx + off + len, yy + off, xx + off, yy + off + len);
          //}
        }
      }


      // Draw Player Square

      fill(255);
      noStroke();
      square(gridStartX + (playerPos[0] * tileSize), gridStartY + (playerPos[1] * tileSize), tileSize);


      // Draw target done animation

      if (playerOnTarget > -1) {

        if (targetAnim) {

          fill(255, targetAnimOp / 2);
          noStroke();
          let s = tileSize + (tileSize * ((100 - targetAnimOp) / 150));
          let fadeRate = 3;
          targetAnimOp -= fadeRate;
          if (targetAnimOp < 0) { targetAnimOp = 0; targetAnim = 0; }
          square(gridStartX + (targets[playerOnTarget][0] * tileSize) - ((s - tileSize) / 2), gridStartY + (targets[playerOnTarget][1] * tileSize) - ((s - tileSize) / 2), s);
        }
      }


      // Draw Grid Tiles

      noFill();
      stroke(color('#cfb6b2'));
      strokeWeight(4);

      for (let y = 0; y < gridRes[1]; y++) {

        for (let x = 0; x < gridRes[0]; x++) {

          //console.log(gridTileStates);

          if (gridTileStates[y][x]) {

            noFill();
            square(gridStartX + (x * tileSize), gridStartY + (y * tileSize), tileSize);

          } else {

            //fill(50);
            //square(gridStartX + (x * tileSize), gridStartY + (y * tileSize), tileSize);
          }
        }
      }


      // Draw player dice num

      if (playerOnTarget == -1) {

        fill(0);
        noStroke();
        //text(cubeTopNum, gridStartX + (playerPos[0] * tileSize) + (tileSize / 2), gridStartY + (playerPos[1] * tileSize) + (tileSize / 2));
        drawDiceFace(cubeTopNum, gridStartX + (playerPos[0] * tileSize) + (tileSize / 2), gridStartY + (playerPos[1] * tileSize) + (tileSize / 2), tileSize, 0);
      }


      // Draw target numbers

      textAlign(CENTER, CENTER);
      textSize(36);
      noFill();
      noStroke();

      for (let i = 0; i < targets.length; i++) {

        stroke(255);
        noFill();
        if (targets[i][3]) { fill(255); noStroke(); }
        if (playerOnTarget == i) { fill(0); noStroke(); }
        drawDiceFace(targets[i][2], gridStartX + (targets[i][0] * tileSize) + (tileSize / 2), gridStartY + (targets[i][1] * tileSize) + (tileSize / 2), tileSize, 1);
      }
    }
  }
}



function mouseClicked() {

  if (outOfBounds == 0) {

    if (canMove) {

      // Calculate move

      rollCube(moveDir, moveDist);

      // Move player

      playerPos[0] = mousePos[0];
      playerPos[1] = mousePos[1];
      moves--;

      moveSound.play();

      playerOnTarget = -1;

      updateMovesText();
      updatePreviewCube();

      // If moving to target, set target to solved

      if (onTarget) {

        // Check if not already solved

        if (targets[selectedTarget][3] == 0) {

          // Set target to solved

          targets[selectedTarget][3] = 1;
          playerOnTarget = selectedTarget;
          targetAnim = 1;
          targetAnimOp = 100;

          //levelCompleteSound.play();

          // Check level progress

          targetsSolved++;

          updateMovesText();

          if (targetsSolved == targets.length) {

            // Level is solved

            levelCompleteSound.play();

            // Set next level button to visible

            if ((level + 1) <= levelData.length) {

              nextLevelButton.style.visibility = 'visible';
              unlockedLevel = (level + 1);
              storeItem('level', level + 1);
              storeItem('unlockedLevel', unlockedLevel);
              updateUnlockedLevel();
            }
          }
        }
      }

      // Set "canmove" to off after moving to tile

      canMove = 0;

    } else {

      wrongMoveSound.play();
    }
  }
}



function openLevel(num) {

  level = num;
  storeItem('level', level);

  coffeePouringSound.play();

  playerPos = levelData[level - 1][4].slice();
  targets = levelData[level - 1][0].slice();

  for (let i = 0; i < targets.length; i++) {

    targets[i] = targets[i].slice();
  }

  moves = levelData[level - 1][1];
  gridRes = levelData[level - 1][2];

  gridResMax = max(gridRes[0], gridRes[1]);

  tileSize = min(min(min(playAreaW / gridRes[0], playAreaH / gridRes[1]), min(playAreaW, playAreaH) / 5), 200);

  gridStartX = playAreaStartX + ((playAreaW - ((gridRes[0]) * tileSize)) / 2);
  gridStartY = playAreaStartY + ((playAreaH - ((gridRes[1]) * tileSize)) / 2);

  // Set grid tile states

  gridTileStates = levelData[level - 1][3];

  // Defaults

  mousePos = [0, 0];
  prevMousePos = [0, 0];
  canMove = 0;
  playerOnTarget = -1;
  onTarget = 0;
  selectedTarget = 0;
  levelSolved = 0;
  targetsSolved = 0;
  targetAnimOp = 100;
  targetAnim = 0;

  cubeTopNum = 1;
  cubeBottomNum = 6;
  cubeLeftNum = 4;
  cubeRightNum = 3;
  cubeBackNum = 2;
  cubeFrontNum = 5;

  updateMovesText();
  updatePreviewCube();
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



function drawDiceFace(face, x, y, size) {

  let cX = x;
  let cY = y;

  let cS = size / 8;
  let cOff = size / 3.5;

  switch(face) {

    case 1:
      circle(cX, cY, cS);
      break;

    case 2:
      circle(cX - cOff, cY - cOff, cS);
      circle(cX + cOff, cY + cOff, cS);
      break;

    case 3:
      circle(cX - cOff, cY - cOff, cS);
      circle(cX, cY, cS);
      circle(cX + cOff, cY + cOff, cS);
      break;

    case 4:
      circle(cX - cOff, cY - cOff, cS);
      circle(cX - cOff, cY + cOff, cS);
      circle(cX + cOff, cY + cOff, cS);
      circle(cX + cOff, cY - cOff, cS);
      break;

    case 5:
      circle(cX - cOff, cY - cOff, cS);
      circle(cX - cOff, cY + cOff, cS);
      circle(cX + cOff, cY + cOff, cS);
      circle(cX + cOff, cY - cOff, cS);
      circle(cX, cY, cS);
      break;

    case 6:
      circle(cX - cOff, cY - cOff, cS);
      circle(cX - cOff, cY + cOff, cS);
      circle(cX + cOff, cY + cOff, cS);
      circle(cX + cOff, cY - cOff, cS);
      circle(cX - cOff, cY, cS);
      circle(cX + cOff, cY, cS);
      break;
  }

  noStroke();
  noFill();
}



function updatePreviewCube() {

  let faceIDsArray = [
    'top-face',
    'bottom-face',
    'left-face',
    'right-face',
    'front-face',
    'back-face'
  ];

  let faceNumsArray = [
    cubeTopNum,
    cubeBottomNum,
    cubeLeftNum,
    cubeRightNum,
    cubeFrontNum,
    cubeBackNum
  ];

  for (let i = 0; i < 6; i++) {

    let face = document.getElementById(faceIDsArray[i]);
    let faceChildren = face.children;

    for (let y = 0; y < 6; y++) {

      faceChildren[y].style.visibility = 'hidden';
    }

    face.querySelector('.face-' + faceNumsArray[i]).style.visibility = 'visible';
  }
}



function updateMovesText() {

  // Update uw numbers

  /*uwTop.innerHTML = cubeTopNum;
  uwBottom.innerHTML = cubeBottomNum;
  uwBack.innerHTML = cubeBackNum;
  uwFront.innerHTML = cubeFrontNum;
  uwLeft.innerHTML = cubeLeftNum;
  uwRight.innerHTML = cubeRightNum;*/

  levelText.innerHTML = level;
  movesText.innerHTML = moves;
  targetsDoneText.innerHTML = targetsSolved;
  totalTargets.innerHTML = targets.length;
}



function updateUnlockedLevel() {

  for (let i = 0; i < unlockedLevel; i++) {

    levelButtons[i].style.visibility = "visible";
  }
}



function updateSound() {

  let tempTxt = "";
  if (soundOn) {

    soundtrack.mute(false);
    soundtrack2.mute(false);
    buttonSound.mute(false);
    levelCompleteSound.mute(false);
    moveSound.mute(false);
    wrongMoveSound.mute(false);
    coffeePouringSound.mute(false);
    tempTxt = "On";

  } else {

    soundtrack.mute(true);
    soundtrack2.mute(true);
    buttonSound.mute(true);
    levelCompleteSound.mute(true);
    moveSound.mute(true);
    wrongMoveSound.mute(true);
    coffeePouringSound.mute(true);
    tempTxt = "Off";
  }

  document.getElementById('sound-toggle-text').innerHTML = tempTxt;
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
