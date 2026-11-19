//Returns a random integer value from <minVal;maxVal> interval
export function randInt(minVal, maxVal) {
  return Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal;
}

// Licznik wywołań i maksymalny limit alertów na sesję/stronę
let alertCounter = 0;
const MAX_ALERTS_ALLOWED = 3;

export function tellme(message) {
  if (alertCounter < MAX_ALERTS_ALLOWED) {
    alertCounter++;
    // Pokazujemy alert tylko przez pierwsze kilka razy
    alert(`[DEBUG ${alertCounter}/${MAX_ALERTS_ALLOWED}]: ${message}`);
  } else {
    // Jeśli wpadniesz w pętlę, alerty się zablokują, a komunikat pójdzie bezpiecznie do konsoli
    console.error(
      `[SAFEGUARD ACTIVE] Zablokowano nadmiarowy alert: ${message}`,
    );
  }
}
