let seconds = 0;
let intervalId = null;

const clockDiv = document.getElementById("clock");

function dispTime() {
  if (seconds < 60) {
    clockDiv.innerText = (seconds % 60) + "s";
  } else {
    clockDiv.innerText =
      Math.floor(seconds / 60) + "min " + (seconds % 60) + "s";
  }
}

function startTime() {
  dispTime();
  if (intervalId == null) {
    intervalId = setInterval(
      //waits the time before the first run
      () => {
        seconds++;
        dispTime();
      },
      1000, //interval time in ms
    );
  }
}

function removeInterval() {
  clearInterval(intervalId);
  intervalId = null;
}

//start button
document.getElementById("button-start").addEventListener("click", startTime);

//przycisk stop
document.getElementById("button-stop").addEventListener("click", () => {
  removeInterval();
});

//przycisk reset
document.getElementById("button-reset").addEventListener("click", () => {
  seconds = 0;
  dispTime();
  if (intervalId != null) {
    removeInterval();
    startTime();
  }
});
