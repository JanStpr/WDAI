//Returns a random integer value from <minVal;maxVal> interval
export function randInt(minVal, maxVal) {
  return Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal;
}

export function loadImage(link) {
  let sprite = new Image();
  sprite.src = link;
  return sprite;
}
