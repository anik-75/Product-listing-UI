const listContainer = document.querySelector(".list-container");
const sortSelect = document.querySelector("#sort");
const filterTags = document.querySelector(".filter-tags");
const clearTagsBtn = document.querySelector(".clear");
const bookmark = document.querySelector(".bookmark-container");
let showBookmark = false;
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const currentPageSpan = document.querySelector(".current-page");
const searchInput = document.querySelector("#query");

const itemsPerPage = 10;
let currentPage = 1;
const url =
  "https://api.freeapi.app/api/v1/public/randomproducts?page=1&limit=100&inc=category%2Cprice%2Cthumbnail%2Cimages%2Ctitle%2Cid";
const products = [];
let data = [];
async function getData(url) {
  const response = await fetch(url);
  const json = await response.json();
  const fetchData = json.data.data;
  products.push(...fetchData);
  data.push(...products);
  const dataSlice = getDataSlice(data);
  console.log(products);
  generateCardList(dataSlice);
}
getData(url);

function generateCard(obj) {
  if (obj !== null) {
    if (obj.title && obj.title.length > 12) {
      let truncatedStr = obj.title.substring(0, 12);
      let lastSpaceIndex = truncatedStr.lastIndexOf(" ");
      obj.title = truncatedStr.substring(0, lastSpaceIndex) + "...";
    }

    let btnText = "Add to Fav";
    let btnAction = "ADD";
    let bookmarkProducts = localStorage.getItem("Products") || [];
    if (typeof bookmarkProducts === "string") {
      bookmarkProducts = JSON.parse(bookmarkProducts);
      const index = bookmarkProducts.findIndex(
        (product) => Number(product.id) === Number(obj.id)
      );
      if (index !== -1) {
        btnText = "Remove";
        btnAction = "REMOVE";
      }
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
          <button data-pid=${
            obj.id
          } data-action=${btnAction} class="fav-btn">${btnText}</button>
        </div>
      </div>
  `;
  }
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
  currentPage = 1;
  const dataSlice = getDataSlice(data);
  generateCardList(dataSlice);
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
}

listContainer.addEventListener("click", (e) => {
  if (e.target.tagName === "P") {
    const value = e.target.textContent;
    const category = value.substring(1);
    const filteredData = filterHandler(products, category);
    data.splice(0, data.length);
    data.push(...filteredData);
    currentPage = 1;
    const dataSlice = getDataSlice(filteredData);
    generateCardList(dataSlice);
    filterTags.textContent = `#${category}`;
    clearTagsBtn.style.display = "block";
  } else if (e.target.tagName === "BUTTON") {
    const productId = Number(e.target.dataset.pid);
    const action = e.target.dataset.action;
    const product = products.find((product) => product.id === productId);
    let bookmarkProducts = localStorage.getItem("Products") || [];

    if (action === "ADD") {
      // Add Products to local Storage
      if (typeof bookmarkProducts === "string") {
        bookmarkProducts = JSON.parse(bookmarkProducts);
        let index = bookmarkProducts.findIndex(
          (product) => Number(product.id) === Number(productId)
        );
        if (index === -1) {
          bookmarkProducts.push(product);
        }
      } else {
        bookmarkProducts.push(product);
      }
      e.target.dataset.action = "REMOVE";
      e.target.textContent = "Remove";
    } else if (action === "REMOVE") {
      if (product && typeof bookmarkProducts === "string") {
        bookmarkProducts = JSON.parse(bookmarkProducts);
        bookmarkProducts = bookmarkProducts.filter(
          (product) => Number(product.id) !== Number(productId)
        );
        e.target.dataset.action = "ADD";
        e.target.textContent = "Add to Fav";
        if (showBookmark) {
          generateCardList(bookmarkProducts);
        }
      }
    }
    localStorage.setItem("Products", JSON.stringify(bookmarkProducts));
  }
});

clearTagsBtn.addEventListener("click", (e) => {
  filterTags.textContent = "";
  clearTagsBtn.style.display = "none";
  data.splice(0, data.length);
  data.push(...products);
  currentPage = 1;
  const dataSlice = getDataSlice(products);
  generateCardList(dataSlice);
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

bookmark.addEventListener("click", () => {
  showBookmark = !showBookmark;
  if (showBookmark) {
    const bookmarkProducts = JSON.parse(localStorage.getItem("Products"));
    data.splice(0, data.length);
    data.push(...bookmarkProducts);
    currentPage = 1;
    const dataSlice = getDataSlice(data);
    generateCardList(dataSlice);
  } else {
    data.splice(0, data.length);
    data.push(...products);
    currentPage = 1;
    const dataSlice = getDataSlice(data);
    generateCardList(dataSlice);
  }
});

// pagination
function getDataSlice(data) {
  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const slice = data.slice(startIndex, endIndex);
  currentPageSpan.textContent = currentPage;
  return slice;
}

function updatePaginationButtons() {
  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === Math.ceil(products.length / itemsPerPage);
}

function goToPrevPage() {
  if (currentPage > 1) {
    currentPage--;
    const dataSlice = getDataSlice(data);
    generateCardList(dataSlice);
    updatePaginationButtons();
  }
}

function goToNextPage() {
  if (currentPage < Math.ceil(data.length / itemsPerPage)) {
    currentPage++;
    const dataSlice = getDataSlice(data);
    generateCardList(dataSlice);
    updatePaginationButtons();
  }
}

nextBtn.addEventListener("click", () => goToNextPage());
prevBtn.addEventListener("click", () => goToPrevPage());

// Search functionality
// debounce function
const debouncedFunc = debounce(searchHandler, 5000);

searchInput.addEventListener("input", function (e) {
  debouncedFunc(this.value);
});

function searchHandler(query) {
  if (query.trim() === "") {
    data.splice(0, data.length);
    data.push(...products);
    currentPage = 1;
    const dataSlice = getDataSlice(data);
    generateCardList(dataSlice);
  }
  const searchedRes = products.filter((product) =>
    product.title.toLowerCase().includes(query.toLowerCase())
  );
  data.splice(0, data.length);
  data.push(...searchedRes);
  currentPage = 1;
  const dataSlice = getDataSlice(data);
  generateCardList(dataSlice);
  return;
}

function debounce(fn, delay) {
  let timerId;
  return function (...args) {
    const context = this;
    clearTimeout(timerId);
    timerId = setTimeout(() => {
      console.log("call");
      fn.apply(context, args);
    }, delay);
  };
}
