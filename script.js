const listContainer = document.querySelector(".list-container");
const sortSelect = document.querySelector("#sort");
const filterTags = document.querySelector(".filter-tags");
const clearTagsBtn = document.querySelector(".clear");

const url =
  "https://api.freeapi.app/api/v1/public/randomproducts?page=1&limit=20&inc=category%2Cprice%2Cthumbnail%2Cimages%2Ctitle%2Cid";
const products = [];
let data = [];
async function getData(url) {
  const response = await fetch(url);
  const json = await response.json();
  const data = json.data.data;
  products.push(...data);
  data.push(...products);
  generateCardList(data);
}
getData(url);

function generateCard(obj) {
  if (obj.title && obj.title.length > 12) {
    let truncatedStr = obj.title.substring(0, 12);
    let lastSpaceIndex = truncatedStr.lastIndexOf(" ");
    obj.title = truncatedStr.substring(0, lastSpaceIndex) + "...";
  }
  listContainer.innerHTML += `
      <div class="card" >
        <span class="card-header">
          <img src=${obj.thumbnail} alt=${obj.title}/>
        </span>
        <hr/>
        <div class="card-info-container">
          <h3 class='title'>${obj?.title}</h3>
          <p class='category'>#${obj?.category.toUpperCase()}</p>
          <p class='price'>Price: $${obj.price}</p>
          <button class="fav-btn">Add To Fav</button>
        </div>
      </div>
  `;
}

function generateCardList(data) {
  listContainer.innerHTML = "";
  for (let product of data) {
    generateCard(product);
  }
}

sortSelect.addEventListener("change", function (e) {
  if (this.value === "low-to-high") {
    sortByHandler(data, "ASC");
  } else if (this.value === "high-to-low") {
    sortByHandler(data, "DESC");
  } else {
    sortByHandler(data);
  }
});

function sortByHandler(data, sortOrder = "none") {
  if (sortOrder === "ASC") {
    data.sort((itemA, itemB) => {
      return itemA.price - itemB.price;
    });
  } else if (sortOrder === "DESC") {
    data.sort((itemA, itemB) => {
      return itemB.price - itemA.price;
    });
  } else {
    return data;
  }
  generateCardList(data);
}

listContainer.addEventListener("click", (e) => {
  if (e.target.tagName === "P") {
    const value = e.target.textContent;
    const category = value.substring(1);
    data = filterHandler(products, category);
    generateCardList(data);
    filterTags.textContent = `#${category}`;
    clearTagsBtn.style.display = "block";
  }
});

clearTagsBtn.addEventListener("click", (e) => {
  filterTags.textContent = "";
  clearTagsBtn.style.display = "none";
  data.push(...products);
  generateCardList(filterHandler(data, ""));
});

function filterHandler(data, tag = "skincare") {
  if (tag.trim() === "") {
    return data;
  }
  clearTagsBtn.style.display = "";
  const filterData = data.filter((element) => {
    return element.category.toLowerCase() === tag.toLowerCase();
  });
  return filterData;
}
