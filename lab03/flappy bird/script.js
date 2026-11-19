import * as util from "./utils.js";

//=======================================================
// SETTINGS
//=======================================================
//-----Screen------------------------------------------
const gameScreenWidth = 360;
const gameScreenHeight = 620;

//-----Game rules--------------------------------------
const pipeHeightRange = 50; //maximum offset that a pipe (it's holes center) would have from the center of screen
const pipeFrequency = 1500; //

//-----Physics-----------------------------------------
const physicsUpdateDelay = 1; //in ms
const velocityX = -2;
const gravitationalAcc = 0.02;

//=======================================================
// GLOBAL VARIABLES AND CONSTANTS
//=======================================================

//-----game object (screen)------------------------------
const game = {
  screen: null, //has width and height attribute
};
let context; //not in the game object for the sake of having shorter code

//-----Bird--------------------------------------------
const bird = {
  //const, as this referecne will only reference the one and olny bird on the screen.
  //const properties
  width: 34,
  height: 24,
  x: gameScreenWidth / 8,
  sprite: null,
  velocityY: 0, //if velocity>0, than the bird falls

  //variable attributes
  y: gameScreenHeight / 2,
};

//-----Pipes--------------------------------------------
let topPipeSprite = null; //these two have to be loaded first
let bottomPipeSprite = null;

let pipes = []; //list of pipes

class Pipe {
  //constants
  topSprite = topPipeSprite;
  bottomSprite = bottomPipeSprite;

  width = 52;
  singlePipeHeight = 320;
  gapHeight = 120;

  y;

  //variables
  x = game.screen.width;
  passed = false; //true when bird passes the pipe

  constructor(y) {
    this.y = y;
  }

  //draws the dobule pipe.
  // y is the place right below the top pipe
  // (y + gapHeight) is the place right above the bottom pipe
  draw(context) {
    //top pipe
    context.drawImage(
      this.topSprite,
      this.x,
      this.y - (gameScreenHeight + this.gapHeight) / 2,
      this.width,
      this.singlePipeHeight,
    );

    //bottom pipe
    context.drawImage(
      this.bottomSprite,
      this.x,
      this.y + this.gapHeight / 2,
      this.width,
      this.singlePipeHeight,
    );
  }
}

//-----Ground-------------------------------------------
let groundSprite = null;
let groundObjs = [];

const groundWidth = 336;

class Ground {
  sprite = groundSprite;
  width = groundWidth;
  height = 112;
  x;
  y = gameScreenHeight - 112;

  constructor(x) {
    this.x = x;
  }
}

//=======================================================
// FUNCTIONS
//=======================================================

window.onload = () => {
  //initialize game screen
  game.screen = document.getElementById("main-canvas");
  game.screen.width = gameScreenWidth;
  game.screen.height = gameScreenHeight;
  context = game.screen.getContext("2d");

  //load bird sprite
  bird.sprite = new Image();
  bird.sprite.src = "./assets/Flappy\ Bird/yellowbird-midflap.png";
  //the image has to load
  bird.sprite.onload = () => {
    context.drawImage(bird.sprite, bird.x, bird.y, bird.width, bird.height);
  };

  //load top pipe sprite
  topPipeSprite = new Image();
  topPipeSprite.src = "./assets/Flappy\ Bird/pipe-green-top.png";

  //load bottom pipe sprite
  bottomPipeSprite = new Image();
  bottomPipeSprite.src = "./assets/Flappy\ Bird/pipe-green-bottom.png";

  //load ground sprite
  groundSprite = new Image();
  groundSprite.src = "./assets/Flappy\ Bird/base.png";
  groundObjs.push(new Ground(0));
  groundObjs.push(new Ground(groundWidth));

  requestAnimationFrame(render); //renders a frame and after a calculated by processor (typically 60Hz) amount of time, runs the given function (render)
  setInterval(placeGround, groundWidth / Math.abs(velocityX));
  setInterval(placePipes, pipeFrequency);
  setInterval(birdPhisicsUpdate, physicsUpdateDelay); //1 ms
};

//renders a frame
function render() {
  requestAnimationFrame(render); //makes new frame
  context.clearRect(0, 0, game.screen.width, game.screen.height); //clear the previous frame, so that the frames do not stack onto echother

  //bird
  context.drawImage(bird.sprite, bird.x, bird.y, bird.width, bird.height);

  //pipes
  pipes.filter((pipe) => pipe.x > -pipe.width); //deletes hidden pipes
  for (let pipe of pipes) {
    pipe.x += velocityX;
    pipe.draw(context);
  }

  //Ground
  groundObjs.filter((ground) => ground.x > -ground.width);
  for (let ground of groundObjs) {
    ground.x += velocityX;
    context.drawImage(
      ground.sprite,
      ground.x,
      ground.y,
      ground.width,
      ground.height,
    );
  }
}

function placePipes() {
  pipes.push(
    new Pipe(
      gameScreenHeight / 2 + util.randInt(-pipeHeightRange, pipeHeightRange),
    ),
  );
}

function placeGround() {
  groundObjs.push(new Ground(groundWidth));
}

function birdPhisicsUpdate() {
  //calculate y
  bird.y += bird.velocityY; // d y(t) = d v(t) * dt
  bird.velocityY += gravitationalAcc; // d v(t) = d a(t) * dt

  //calculate collisions
}

//=======================================================
// EVENT HANDLERS
//=======================================================
