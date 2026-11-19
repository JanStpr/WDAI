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
const pipeGap = 120;

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

  //new
  sprite = this.constructor.sprite;
}

//-----Bird--------------------------------------------
class Bird extends SingleAnim {
  //override
  static width = 34;
  static height = 24;

  //new
  velocityY = 0;

  //keyframes
  static flapsMiddle = null;
  static flapsUp = null;
  static flapsDown = null;

  //params:
  //  'up','down','mid'
  changeKeyFrame(arg) {
    switch (arg) {
      case "up": {
        this.sprite = this.constructor.flapsUp;
        break;
      }
      case "down": {
        this.sprite = this.constructor.flapsDown;
        break;
      }
      case "mid": {
        this.sprite = this.constructor.flapsMiddle;
        break;
      }
    }
  }
}
const bird = new Bird(gameScreenWidth / 8, gameScreenHeight / 2);

//-----Pipes--------------------------------------------

class PipeTop extends Single {
  //override
  static width = 52;
  static height = 320;

  constructor(y, isFlipped) {
    super(game.screen.width, y);
    if (isFlipped != undefined) this.isFlipped = isFlipped;
    else this.isFlipped = false;
  }

  draw(context) {
    if (this.isFlipped) {
      context.save(); //zapisujemy ustawienia kontekstu (do przywrócenia)
      context.translate(
        //zmienia punkt odniesienia
        this.x + this.constructor.width / 2,
        this.y + this.constructor.height / 2,
      );
      context.scale(1, -1); //odwracanie OX
      context.drawImage(
        this.constructor.sprite,
        -this.constructor.width / 2,
        -this.constructor.height / 2,
        this.constructor.width,
        this.constructor.height,
      );
      context.restore(); // Przywracamy normalny stan canvasu
    } else
      context.drawImage(
        this.constructor.sprite,
        this.x,
        this.y - this.constructor.height,
        this.constructor.width,
        this.constructor.height,
      );
  }

  //new
  isFlipped; // if true, then the pipe will be bottom
  passed = false; //true when bird passes the pipe. In double pipes, only the top one count the point.
}

class Pipes extends Singles {
  //override
  static type = PipeTop;
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
    this.push(new PipeTop(centerPoint - this.halfGap, false));

    //push bottom pipe
    this.push(new PipeTop(centerPoint + this.halfGap, true));
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
  Bird.flapsMiddle = util.loadImage(
    "./assets/Flappy\ Bird/yellowbird-midflap.png",
  );
  Bird.flapsUp = util.loadImage("./assets/Flappy\ Bird/yellowbird-upflap.png");
  Bird.flapsDown = util.loadImage(
    "./assets/Flappy\ Bird/yellowbird-downflap.png",
  ); //not used
  bird.sprite = Bird.flapsMiddle; //iniital bird keyframe

  PipeTop.loadImage("./assets/Flappy\ Bird/pipe-green.png");
  Ground.loadImage("./assets/Flappy\ Bird/base.png");
  Background.loadImage("./assets/Flappy\ Bird/background-day.png");

  //pushing initial elements
  groundObjs.push(new Ground(0));
  groundObjs.push(new Ground(Ground.width));
  backGroundObjs.push(new Background(0));
  backGroundObjs.push(new Background(Background.width));

  //start rendering
  requestAnimationFrame(render); //renders a frame and after a calculated by processor (typically 60Hz) amount of time, runs the given function (render)

  //set intervals
  //Ground
  setInterval(
    () => {
      groundObjs.push(new Ground(game.screen.width));
    },
    Ground.width / Math.abs(velocityX),
  );
  //BackGround
  setInterval(
    () => {
      backGroundObjs.push(new Background(game.screen.width));
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
  } else if (bird.y > game.screen.height - Ground.height - Bird.height) {
    bird.y = game.screen.height - Ground.height - Bird.height;
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

  //calculate collisions
}

//-----Rendering----------------------------------------

//renders a frame
function render() {
  requestAnimationFrame(render); //makes new frame
  context.clearRect(0, 0, game.screen.width, game.screen.height); //clear the previous frame, so that the frames do not stack onto echother

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
    (pipe) => pipe.x > -PipeTop.width,
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
}

//=======================================================
// EVENT HANDLERS
//=======================================================

document.querySelector("body").addEventListener("click", () => {
  bird.velocityY = -jumpSetsVelocity;
});
