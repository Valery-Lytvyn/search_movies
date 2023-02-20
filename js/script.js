"use strict";
let serverResponse;
let storySearchQuery;
let storyRadioButton;
let storyCurrentPage;
let searchResults = document.querySelector(".searchResults");
let failResultMessage = document.createElement("div");
let radioButton
let moviesList;
let numberPagesWrapper;
let visiblyPagesList = [];
let totalNumberPages;
let nextPage;
let currentPage = 1;
let movieDetails;
let storyMoviesList;

let clearButton = document.querySelector(".clearButton");
clearButton.after(searchResults);
clearButton.addEventListener("click", function () {
   localStorage.clear();
   removeResult();
});

let searchButton = document.getElementById("searchButton");
searchButton.addEventListener("click", function (event) {
   serverRequest(currentPage);
});

let inputForm = document.forms.form;
let searchInput = inputForm.searchInput;
searchInput.addEventListener("keydown", function (event) {
   if (event.key === "Enter") {
      setLocalStorage("storyCurrentPage", 1);
      currentPage = 1;
      event.preventDefault();
      serverRequest(currentPage);
   }
});

radioButton = null;
let radioForm = document.forms.radioSection;
for (let i = 0; i < radioForm.length; i++) {
   radioForm[i].addEventListener("change", function () {
      setLocalStorage("storyCurrentPage", 1);
      currentPage = 1;
      radioButton = this.value;
   });
}


let status = function (response) {
   if (response.status !== 200) {
      return Promise.reject(new Error(response.statusText));
   }
   return Promise.resolve(response);
}

let json = function (response) {
   return response.json();
}

function getStorageParse(keyName) {
   return JSON.parse(localStorage.getItem(keyName));
}

function getLocalStorage() {
   if (localStorage.getItem("storySearchQuery")) {
      storySearchQuery = getStorageParse("storySearchQuery");
      storyRadioButton = getStorageParse("storyRadioButton");
      storyCurrentPage = getStorageParse("storyCurrentPage");
      searchInput.value = storySearchQuery;
      currentPage = storyCurrentPage;
      serverRequest(currentPage);
   }
}
getLocalStorage()

function serverRequest(currentPage) {
   let searchQuery = searchInput.value;
   if (searchQuery.length < 3) {
      alert("Enter at least 3 characters");
   };
   if (searchQuery) {
      fetch(
         `https://www.omdbapi.com/?s=${searchQuery}&type=${radioButton}&page=${currentPage}&apikey=465e935e&`
      )
         .then(status)
         .then(json)
         .then(function (response) {
            setLocalStorage("storySearchQuery", searchQuery)
            setLocalStorage("storyRadioButton", radioButton)
            setLocalStorage("storyCurrentPage", currentPage)
            removeResult();
            if (!response.Search) {
               showFailResultMessage();
            } else {
               serverResponse = response.Search;
               createMoviesList(serverResponse);
               if (response.totalResults > 10) {
                  pagination(response.totalResults);
               }
            }
         });
   }
}

function showFailResultMessage() {
   failResultMessage.style.color = "red";
   failResultMessage.innerHTML = "Movie not found!";
   elementPosition(searchResults, failResultMessage, "prepend");
}

function setLocalStorage(keyName, keyValue) {
   localStorage.setItem(keyName, JSON.stringify(keyValue));
}

function createMoviesList(arr) {
   moviesList = document.createElement("ul");
   moviesList.addEventListener("click", clickDetailsMovie);

   arr.forEach((item, index) => {
      elementPosition(searchResults, moviesList, "prepend")
      let liWrap = document.createElement("div");
      elementPosition(moviesList, liWrap, "append")
      let li = document.createElement("li");
      let sequenceNumber = (currentPage - 1) * 10 + 1 + index;
      li.innerText = `${sequenceNumber}. ${item.Title}`;
      elementPosition(liWrap, li, "prepend")
      let movieDetailsButton = document.createElement("button");
      movieDetailsButton.classList.add("btn");
      movieDetailsButton.id = `id = ${index}`;
      movieDetailsButton.innerHTML = "DETAILS";
      elementPosition(li, movieDetailsButton, "after")
   });
}

function createPagesSection(number) {
   numberPagesWrapper = document.createElement("div");
   numberPagesWrapper.classList.add("numberPagesWrapper")
   elementPosition(searchResults, numberPagesWrapper, "after")
   numberPagesWrapper.addEventListener("click", changePage);

   let previousPage = document.createElement("div");
   previousPage.classList.add("btn");
   elementPosition(numberPagesWrapper, previousPage, "prepend")
   previousPage.innerHTML = "pre page";
   previousPage.id = "-1";

   nextPage = document.createElement("div");
   nextPage.classList.add("btn");
   elementPosition(numberPagesWrapper, nextPage, "append")
   nextPage.innerHTML = "next page";
   nextPage.id = "-2";
}

function createVisiblyPagesList(totalNumberPages) {
   visiblyPagesList = []
   for (let i = 0; i <= 3; i++) {
      visiblyPagesList.push(i, totalNumberPages - i, currentPage - i, currentPage + i);
   }
}



function pagination(number) {
   createPagesSection();
   totalNumberPages = Math.ceil(number * 0.1);
   createVisiblyPagesList(totalNumberPages)
   let tempPrevPage = 0;
   for (let page = 1; page <= totalNumberPages; page++) {
      if (visiblyPagesList.includes(page)) {
         if ((page - tempPrevPage) != 1) {
            let threeDots = document.createElement("div");
            threeDots.classList.add("btn")
            elementPosition(nextPage, threeDots, "before")
            threeDots.innerHTML = "...";
         }
         let pageNumber = document.createElement("div");
         pageNumber.classList.add("btn")
         elementPosition(nextPage, pageNumber, "before")
         pageNumber.innerHTML = page;
         pageNumber.id = page;
         tempPrevPage = page;
         if (page === currentPage) {
            pageNumber.classList.add("active")
         }
      }
   }
}

function changePage(event) {
   let idPage = Number(event.target.id);
   if ((idPage === -1 && currentPage === 1) ||
      (idPage === -2 && currentPage === totalNumberPages) || (!idPage)) {
   } else
      if (idPage === -1 && currentPage > 1) {
         currentPage = --currentPage;
         serverRequest(currentPage);
      } else if (idPage === -2 && currentPage < totalNumberPages) {
         currentPage = ++currentPage;
         serverRequest(currentPage);
      } else {
         currentPage = idPage;
         serverRequest(currentPage);
      }
}

function clickDetailsMovie(event) {
   if (event.target.tagName === "BUTTON") {
      if (!serverResponse) {
         serverResponse = storyMoviesList;
      }
      createListDetailsMovie(event)
      setTimeout(() => searchResults.scrollIntoView());
   }
}

function createListDetailsMovie(event) {
   let idMovie = event.target.id;
   let numberMovie = Number(idMovie.slice(4));
   let detailsMovie = serverResponse[numberMovie];
   let titleMovie = detailsMovie.Title;
   let typeMovie = detailsMovie.Type;
   let yearMovie = detailsMovie.Year;
   let posterMovie = detailsMovie.Poster;
   showDetailsMovie(titleMovie, typeMovie, yearMovie, posterMovie);
}

function showDetailsMovie(title, type, year, poster) {
   numberPagesWrapper.style.display = "none";
   let movieDetailsWrap = document.createElement("div");
   movieDetailsWrap.classList.add("movieDetailsWrap");
   elementPosition(searchResults, movieDetailsWrap, "prepend")
   movieDetails = document.createElement("div");
   movieDetails.classList.add("movieDetails");
   elementPosition(movieDetailsWrap, movieDetails, "prepend")

   let closeDiv = document.createElement("div");
   closeDiv.classList.add("button");
   let closeDivText = document.createElement("div")
   elementPosition(closeDiv, closeDivText, "append")
   closeDivText.classList.add("buttonText");
   closeDivText.innerHTML = `close`;
   elementPosition(movieDetailsWrap, closeDiv, "prepend")
   closeDiv.onclick = () => {
      movieDetailsWrap.remove();
      numberPagesWrapper.style.display = "flex";
   }
   let titleDiv = document.createElement("div");
   titleDiv.innerHTML = `Title: ${title}`;
   titleDiv.style.padding = "15px";
   elementPosition(movieDetails, titleDiv, "append")
   let typeDiv = document.createElement("div");
   typeDiv.innerHTML = `Type: ${type}`;
   typeDiv.style.padding = "15px";
   elementPosition(movieDetails, typeDiv, "append")
   let yearDiv = document.createElement("div");
   yearDiv.innerHTML = `Year: ${year}`;
   yearDiv.style.padding = "15px";
   elementPosition(movieDetails, yearDiv, "append")
   if (poster != "N/A") {
      let posterImg = document.createElement("img");
      posterImg.src = poster;
      elementPosition(movieDetails, posterImg, "append")
      posterImg.style.padding = "15px";
   }
}

function removeResult() {
   if (moviesList != null) {
      moviesList.remove();
   }
   if (numberPagesWrapper != null) {
      numberPagesWrapper.remove();
   }
   if (movieDetails != null) {
      movieDetails.remove();
   }
   if (failResultMessage != null) {
      failResultMessage.remove();
   }
}

function elementPosition(parentElement, currentElement, position) {
   switch (position) {
      case "prepend":
         return (parentElement.prepend(currentElement))
      case "append":
         return (parentElement.append(currentElement))
      case "after":
         return (parentElement.after(currentElement))
      case "before":
         return (parentElement.before(currentElement))
   }
}
