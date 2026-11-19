//Settings--------------------------

let sortType = 0; //0 - unsorted, 1 - asc, 2 - desc
const maxEntriesNum = 30;

//Global variables------------------

let entries;

const main = document.getElementById("main-flex");

//Util functions------------------

function comparAsc(a, b) {
  return a.title == b.title ? 0 : a.title > b.title ? 1 : -1;
}
//comparDesc = -comparAsc

//make a comparition that organises the array into it's original state
function comparOrg(a, b) {
  return a.id == b.id ? 0 : a.id > b.id ? 1 : -1;
}

//Main functions--------------------

function renderEntry(entry) {
  return `
      <div class="product-entry-left">
        <h3>${entry.id}. ${entry.title} - $${entry.price}</h3>
        <p>${entry.description}</p>
      </div>
      <div class="product-entry-right">
        <img src="${entry.thumbnail}" alt="${entry.title}" />
      </div>
`;
}

function createEntryDiv(entry) {
  let div = document.createElement("div");

  div.className = "product-entry";
  div.innerHTML = renderEntry(entry);

  return div;
}

async function load() {
  switch (sortType) {
    case 0:
      entries.sort(comparOrg);
      break;
    case 1:
      entries.sort(comparAsc);
      break;
    case 2:
      entries.sort((a, b) => -comparAsc(a, b));
      break;
  }

  // Clearing the main container (otherwise, the objects  would be duplicated after second call, and so on!)
  main.innerHTML = "";

  for (let entry of entries) {
    main.appendChild(createEntryDiv(entry));
  }
}

//event listeners-------------------

//load the json after page loaded
addEventListener("DOMContentLoaded", async () => {
  let response = await fetch("https://dummyjson.com/products");
  let data = await response.json();

  entries = data.products.slice(0, maxEntriesNum);

  load();
});

document.getElementById("order-by").addEventListener("change", (e) => {
  let select = e.target;
  switch (select.value) {
    case "original":
      sortType = 0;
      break;
    case "ascending":
      sortType = 1;
      break;
    case "descending":
      sortType = 2;
      break;
  }
  load();
});
