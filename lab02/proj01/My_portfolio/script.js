//Funkcja dokonująca tłumaczenia podstrony na wskazany język
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

//język jest rzyemany w localstorage, żeby użytkownik nie musiał za każdym wejściem na stronę zmieniać języka.

//trigger dokonujący automatycznego tłumaczenia podstrony przy wczytywaniu
window.addEventListener("DOMContentLoaded", () => {
  var chosenLanguage = localStorage.getItem("selectedLanguage");

  //ustawia język domyślny, jeśli użytkownik nie ma w pamięci zapisanego języka
  if (chosenLanguage === null) {
    chosenLanguage = "pl_pl";
    localStorage.setItem("selectedLanguage", chosenLanguage);
  }

  makeTranslation(chosenLanguage); //tłumaczneie na zapisany język

  var selectedElement = document.getElementById("languageSelection");

  if (selectedElement) {
    //bezpieczna zmiana tylko, jeśli znaleziono selected Element
    selectedElement.value = chosenLanguage;
  }
});

//trigger do przycisku zmiany języka
document
  .getElementById("languageSelection")
  .addEventListener("change", function (event) {
    var chosenLanguage = event.target.value;
    localStorage.setItem("selectedLanguage", chosenLanguage);
    makeTranslation(chosenLanguage);
  });
