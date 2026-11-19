let normalList = [];
for (let i = 48; i <= 57; i++) normalList.push(i);
for (let i = 97; i <= 122; i++) normalList.push(i);

let capitalList = [];
for (let i = 65; i <= 90; i++) capitalList.push(i);

let specialList = [];
for (let i = 35; i <= 38; i++) specialList.push(i);
specialList.push(33);

//Returns a random integer value from <minVal;maxVal> interval
function randInt(minVal, maxVal) {
  return Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal;
}

//run after form submission
document
  .getElementById("password-generate-form")
  .addEventListener("submit", () => {
    let minLen = document.getElementById("min-len").value;
    let maxLen = document.getElementById("max-len").value;
    if (minLen < 1 || minLen > maxLen) {
      alert("Nieprawidłowe długości hasła!");
    } else {
      //craft a proper charlist
      let charList = normalList.concat([]); //makes a copy
      if (document.getElementById("capital-letters").checked) {
        charList = charList.concat(capitalList);
      }
      if (document.getElementById("special-characters").checked) {
        charList = charList.concat(specialList);
      }

      let result = []; //it is not a string now, because if it was, than the loop woudl be O(N^2)
      for (let i = 0; i < randInt(minLen, maxLen); i++) {
        result.push(
          String.fromCharCode(charList[randInt(0, charList.length - 1)]),
        );
      }

      alert("Wygenerowane hasło:\n" + result.join(""));
    }
  });
