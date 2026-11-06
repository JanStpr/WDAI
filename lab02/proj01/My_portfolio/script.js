//Funkcja dokonująca tłumaczenia podstrny na wskazany język
async function makeTranslation(language) {
  //async - informacja dla kompilatora o tym, że funckja działa asynchronicznie
  //Próba wyczytania pliku z tłumaczeniem
  const response = await fetch(`resources/languages/${language}.json`); // await - zmienna poczeka, jeśli wczytanie pliku nie odbędzie się od razu, ale dopiero po chwili
  //Przypisanie do zmiennej owego pliku (czyli tablicy asocjacyjnej)
  const translations = await response.json();

  //Szukanie wsyzstkich elementów DOMa, które mają atrybut wkazujący na konieczność dokonania tłumaczenia
  var textElements = document.querySelectorAll("[data-textToTranslate]");

  //Iteracja po znalezionych elementach celem wstawienia tłumaczneia do HTMLa
  textElements.forEach((currElement) => {
    const key = currElement.getAttribute("data-textToTranslate");
    if (translations[key]) {
      if (currElement.tagName === "IMG") {
        currElement.alt = translations[key]; //nadpisanie alt dla obrazka
      } else {
        currElement.innerHTML = translations[key]; //nadpisanie danym tłumaczeniem
      }
    }
  });
}

//trigger dokonujący automatycznego tłumaczenia podstrony przy wczytywaniu
window.addEventListener("DOMContentLoaded", () => {
  makeTranslation(localStorage.getItem("selectedLanguage") || "pl_pl"); //tłumaczneie na zapisany język, bądź język domyślny (Polski), jeśli nie wybrano języka. (|| w JS działa tak że wybierana jest pierwsza prawdzia/nie nullowa wartość)
});

//trigger do przycisku zmiany języka
document
  .getElementById("languageSelection")
  .addEventListener("change", function (event) {
    var chosenLanguage = event.target.value;
    localStorage.setItem("selectedLanguage", chosenLanguage);
    makeTranslation(chosenLanguage);
  });
