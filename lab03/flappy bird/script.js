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
const pipeGap = 140;

//-----Physics-----------------------------------------
const velocityX = -2;
const backgroundVelocityX = -0.7;

const physicsUpdateDelay = 1; //in ms

const gravitationalAcc = 0.03;
const terminalVelocity = 4; //the velocity vecor can't get a value offsetted more thant this value from 0
const jumpSetsVelocity = 2;

//=======================================================
// GLOBAL VARIABLES AND CONSTANTS
//=======================================================

//-----game object (screen)------------------------------
const game = {
  screen: null, //has width and height attribute
  score: 0,
  pending: true,
};
let context; //not in the game object for the sake of having shorter code

//-----Single-(generic class)--------------------------

//A generic class for a world element, that appears on the screen only as a single (one sprite) object, with a fixed sprite.
class Single {
  //they are all static, as  they are shared by every
  static sprite = null; //needs to be loaded. This variable is the objects displayed sprite
  static width = gameScreenWidth;
  static height = gameScreenHeight;
  x;
  y;

  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  static loadImage(link) {
    //There is no need to write .constructor, as this is a static method
    this.sprite = new Image();
    this.sprite.src = link;
  }

  draw(context) {
    //this.constructor. make it, so that we acess static value, rather than local
    context.drawImage(
      this.constructor.sprite,
      this.x,
      this.y,
      this.constructor.width,
      this.constructor.height,
    );
  }

  collidesWith(single) {
    return (
      this.x < single.x + single.constructor.width &&
      this.x + this.constructor.width > single.x &&
      this.y < single.y + single.constructor.height &&
      this.y + this.constructor.height > single.y
    );
  }

  collidesWithColection(Singles) {
    for (let single of Singles.list) {
      if (this.collidesWith(single)) return true;
    }
    return false;
  }
}

//A generic type for a collection of objects from a class extending Single
class Singles {
  static type = Single; //NEEDS TO BE OVERWRITTEN; HAS TO BE A CLASS EXTENDING SINGLE!
  list = [];

  //overrides default push. Ignores pushing a object, if the type (class) does not fit.
  push(newElement) {
    if (newElement instanceof this.constructor.type) this.list.push(newElement);
    else
      console.error(
        "It was tried to assign an object of a class other than" +
          this.constructor.type +
          " to " +
          this,
      );
  }

  //params:
  //    filterFunc(single) - function that filters every single in the list, before the drawing. If not needed, type:   (a) => true
  //    forEachFunc(single) - replaces every single in the list with the result of this function called with the single as argument
  draw(context, filterFunc, forEachFunc) {
    this.list = this.list.filter(filterFunc);
    for (let single of this.list) {
      forEachFunc(single);
      single.draw(context);
    }
  }
}

//A Single, but with multiple sprites for animation
class SingleAnim extends Single {
  //static sprite can be treated as default sprite. It can be accessed in this class as this.constructor.sprite (and as SingleAnim.sprite outside)

  //override
  draw(context) {
    context.drawImage(
      this.sprite,
      this.x,
      this.y,
      this.constructor.width,
      this.constructor.height,
    );
  }

  static loadImage(key, link) {
    let newSprite = new Image();
    newSprite.src = link;

    //initial sprite is the first loaded
    if (this.keyFrames.size == 0) this.sprite = newSprite; //static sprite, whose value is taken by non static sprite on construction

    this.keyFrames.set(key, newSprite);
  }

  //new
  static keyFrames = new Map();
  sprite = this.constructor.sprite; //current texture. By default it has the value of static sprite

  changeKeyFrame(arg) {
    if (this.constructor.keyFrames.has(arg))
      this.sprite = this.constructor.keyFrames.get(arg);
    else console.error(this + ": Unknown keyFrame type: " + arg);
  }
}

//-----Bird--------------------------------------------
class Bird extends SingleAnim {
  //override
  static width = 34;
  static height = 24;

  //new
  velocityY = 0;
}
const bird = new Bird(gameScreenWidth / 8, gameScreenHeight / 2);

//-----Pipes--------------------------------------------

class Pipe extends SingleAnim {
  //override
  static width = 52;
  static height = 320;

  constructor(y, topOrBottom) {
    super(gameScreenWidth, y);

    this.changeKeyFrame(topOrBottom); //if uknown value, nothing happens, aside from message on console
    if (!this.constructor.keyFrames.has(topOrBottom))
      this.changeKeyFrame("top");
  }
  //new
  passed = false; //true when bird passes the pipe. In double pipes, only the top one count the point.
}

class Pipes extends Singles {
  //override
  static type = Pipe;
}

class DoublePipes extends Pipes {
  //new
  halfGap;

  constructor(gap) {
    super();
    this.halfGap = gap / 2;
  }

  pushDoublePipe(centerPoint) {
    //push top pipe
    this.push(new Pipe(centerPoint - this.halfGap - Pipe.height, "top"));

    //push bottom pipe
    this.push(new Pipe(centerPoint + this.halfGap, "bottom"));
  }
}

let pipes = new DoublePipes(pipeGap);

//-----Ground-------------------------------------------
class Ground extends Single {
  //override
  static width = 336;
  static height = 112;

  constructor(x) {
    //UWAGA: w JS w klasie dziedziczącej nie można się odwołać do .this przed super()!!!
    super(x, gameScreenHeight - Ground.height);
  }
}

class GroundList extends Singles {
  static type = Ground;
}
let groundObjs = new GroundList();

//-----Background---------------------------------------
//background has to be in JS too, due to the adaptive scaling in css
class Background extends Single {
  //override
  static width = 288;
  static height = 512;

  constructor(x) {
    super(x, 0);
  }
}

class Backgrounds extends Singles {
  static type = Background;
}

let backGroundObjs = new Backgrounds();

//=======================================================
// FUNCTIONS
//=======================================================

//-----Initializing-------------------------------------

window.onload = () => {
  //initialize game screen
  game.screen = document.getElementById("main-canvas");
  game.screen.width = gameScreenWidth;
  game.screen.height = gameScreenHeight;
  context = game.screen.getContext("2d");

  //loading sprites
  Bird.loadImage("mid", "./assets/Flappy\ Bird/yellowbird-midflap.png");
  Bird.loadImage("up", "./assets/Flappy\ Bird/yellowbird-upflap.png");
  Bird.loadImage("down", "./assets/Flappy\ Bird/yellowbird-downflap.png"); //not used
  bird.changeKeyFrame("mid");

  Pipe.loadImage("top", "./assets/Flappy\ Bird/pipe-green-top.png");
  Pipe.loadImage("bottom", "./assets/Flappy\ Bird/pipe-green-bottom.png");

  Ground.loadImage("./assets/Flappy\ Bird/base.png");
  Background.loadImage("./assets/Flappy\ Bird/background-day.png");

  //pushing initial elements
  groundObjs.push(new Ground(0));
  groundObjs.push(new Ground(Ground.width));
  backGroundObjs.push(new Background(0));
  backGroundObjs.push(new Background(Background.width));

  //start rendering
  requestAnimationFrame(render); //renders a frame and after a calculated by processor (typically 60Hz) amount of time, runs the given function (render)
  updateScore();

  //set intervals
  //Ground
  setInterval(
    () => {
      groundObjs.push(new Ground(gameScreenWidth));
    },
    Ground.width / Math.abs(velocityX),
  );
  //BackGround
  setInterval(
    () => {
      backGroundObjs.push(new Background(gameScreenWidth));
    },
    (Background.width / Math.abs(backgroundVelocityX)) * 12,
  );
  //Pipes
  setInterval(() => {
    pipes.pushDoublePipe(
      (gameScreenHeight - Ground.height) / 2 +
        util.randInt(-pipeHeightRange, pipeHeightRange),
    );
  }, pipeFrequency);
  //Bird
  setInterval(birdPhysicsUpdate, physicsUpdateDelay); //1 ms
};

//-----Interval functions-------------------------------
function birdPhysicsUpdate() {
  //calculate y
  bird.y = bird.velocityY + bird.y; // d y(t) = d v(t) * dt
  bird.velocityY += gravitationalAcc; // d v(t) = d a(t) * dt

  //restrcting domains
  if (bird.y < 0) {
    bird.y = 0;
    bird.velocityY = 0;
  } else if (bird.y > gameScreenHeight - Ground.height - Bird.height) {
    bird.y = gameScreenHeight - Ground.height - Bird.height;
    bird.velocityY = 0;
  }

  if (bird.velocityY > terminalVelocity) bird.velocityY = terminalVelocity;
  else if (bird.velocityY < -terminalVelocity)
    bird.velocityY = -terminalVelocity;

  //annimating the bird, as it is dependent of physics
  if (bird.velocityY < 0) bird.changeKeyFrame("up");
  else if (bird.velocityY > 0.2 && bird.velocityY > terminalVelocity / 2)
    bird.changeKeyFrame("up");
  else bird.changeKeyFrame("mid");

  //collisions in render, to sync the game state with the thing the user actually sees
}

//-----Rendering----------------------------------------

//renders a frame
function render() {
  if (game.pending == true) {
    requestAnimationFrame(render); //makes new frame
    context.clearRect(0, 0, gameScreenWidth, gameScreenHeight); //clear the previous frame, so that the frames do not stack onto echother

    //Background
    backGroundObjs.draw(
      context,
      (background) => background.x > -Background.width,
      (background) => {
        background.x += backgroundVelocityX;
      },
    );

    //bird
    bird.draw(context);

    //pipes
    pipes.draw(
      context,
      (pipe) => pipe.x > -Pipe.width,
      (pipe) => {
        pipe.x += velocityX;
      },
    );

    //Ground
    groundObjs.draw(
      context,
      (ground) => ground.x > -Ground.width,
      (ground) => {
        ground.x += velocityX;
      },
    );
    afterEachFrame();
  }
}

function afterEachFrame() {
  //calculate collisions - it is here in order to sync it with players view (because of it, the last frame is rendered)
  if (
    bird.y == gameScreenHeight - Ground.height - Bird.height ||
    bird.collidesWithColection(pipes)
  )
    game.pending = false;

  for (let pipe of pipes.list) {
    if (
      pipe.sprite == Pipe.keyFrames.get("top") && //made in order to all doublepipes be counted once
      bird.x > pipe.x && //pipe already passed
      pipe.passed == false //pipe not passed before
    ) {
      pipe.passed = true;
      game.score += 1;
      updateScore();
    }
  }
}

//=======================================================
// EVENT HANDLERS
//=======================================================

document.querySelector("body").addEventListener("click", () => {
  bird.velocityY = -jumpSetsVelocity;
});

//=======================================================
// Interactions with html structure
//=======================================================
let htmlScore = document.getElementById("score");

//could be modified to display font from assets images
function updateScore() {
  htmlScore.innerText = game.score;
}
