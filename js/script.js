"use strict";
let serverResponse;
let searchResults = document.querySelector(".searchResults");
let failResultMessage = document.createElement("div");
let moviesList;
let numberPagesWrapper;
let totalNumberPages;
let nextPage;
let currentPage = 1;
let movieDetails;
let story;

let clearButton = document.querySelector(".clearButton");
clearButton.after(searchResults);
clearButton.addEventListener("click", function () {
   localStorage.clear();
   removeResult();
});

function getLocalStorage() {
   if (localStorage.length > 0 && !localStorage.getItem("failResultMessage")) {
      story = JSON.parse(localStorage.getItem("moviesList"));
      createMoviesList(story);
   } else
      if (localStorage.getItem("failResultMessage")) {
         showFailResultMessage();
      }
}

getLocalStorage()


let searchButton = document.getElementById("searchButton");
searchButton.addEventListener("click", serverRequest);


let inputForm = document.forms.form;
let searchInput = inputForm.searchInput;
searchInput.addEventListener("keydown", function (event) {
   if (event.key === "Enter") {
      event.preventDefault();
      serverRequest();
   }
});

let radioButton = null;
let radioForm = document.forms.radioSection;
for (let i = 0; i < radioForm.length; i++) {
   radioForm[i].addEventListener("change", function () {
      radioButton = this.value;
   });
}


let status = function (response) {
   if (response.status !== 200) {
      return Promise.reject(new Error(response.statusText));
   }
   return Promise.resolve(response);
};
let json = function (response) {
   return response.json();
};

function serverRequest(currentPage) {
   let searchQuery = searchInput.value;
   if (searchQuery) {
      fetch(
         `https://www.omdbapi.com/?s=${searchQuery}&type=${radioButton}&page=${currentPage}&apikey=465e935e&`
      )
         .then(status)
         .then(json)
         .then(function (response) {
            removeResult();
            if (!response.Search) {
               showFailResultMessage();
               setLocalStorage("failResultMessage", "Movie not found!");
            } else {
               serverResponse = response.Search;
               createMoviesList(serverResponse);
               setLocalStorage("moviesList", serverResponse);
               if (response.totalResults > 10) {
                  createListPages(response.totalResults)
               }
            }
         });
   }
}

function showFailResultMessage() {
   failResultMessage.style.color = "red";
   failResultMessage.innerHTML = "Movie not found!";
   elementPosition(searchResults, failResultMessage, 'prepend')
}



function setLocalStorage(keyName, keyValue) {
   localStorage.clear();
   localStorage.setItem(keyName, JSON.stringify(keyValue));
}

function createMoviesList(arr) {
   moviesList = document.createElement("ul");
   moviesList.addEventListener("click", clickDetailsMovie);

   arr.forEach((item, index) => {
      elementPosition(searchResults, moviesList, 'prepend')
      let liWrap = document.createElement("div");
      elementPosition(moviesList, liWrap, 'append')
      let li = document.createElement("li");
      let sequenceNumber = (currentPage - 1) * 10 + 1 + index;
      li.innerText = `${sequenceNumber}. ${item.Title}`;
      elementPosition(liWrap, li, 'prepend')

      movieDetails = document.createElement("button");
      movieDetails.classList.add("btn");
      movieDetails.id = `id = ${index}`;
      movieDetails.innerHTML = "DETAILS";
      li.after(movieDetails);
      elementPosition(li, movieDetails, 'after')

   });
}

function createPagesSection(number) {
   numberPagesWrapper = document.createElement("div");
   numberPagesWrapper.classList.add('numberPagesWrapper')
   elementPosition(searchResults, numberPagesWrapper, 'after')
   numberPagesWrapper.addEventListener("click", changePage);

   let previousPage = document.createElement("div");
   previousPage.classList.add("btn");
   elementPosition(numberPagesWrapper, previousPage, 'prepend')
   previousPage.innerHTML = "pre page";
   previousPage.id = "-1";

   nextPage = document.createElement("div");
   nextPage.classList.add("btn");
   elementPosition(numberPagesWrapper, nextPage, 'append')
   nextPage.innerHTML = "next page";
   nextPage.id = "-2";
}

function createListPages(number) {
   createPagesSection();
   totalNumberPages = Math.ceil(number * 0.1);
   for (let i = 1; i <= totalNumberPages; i++) {
      let page = document.createElement("div");
      page.classList.add("btn")
      elementPosition(nextPage, page, 'before')
      page.innerHTML = i;
      page.id = i;
      if (i === currentPage) {
         page.classList.add('active')
      }
   }
}

function changePage(event) {
   let idButton = Number(event.target.id);
   if ((idButton === -1 && currentPage === 1) ||
      (idButton === -2 && currentPage === totalNumberPages)) {
   } else
      if (idButton === -1 && currentPage > 1) {
         currentPage = currentPage - 1;
         serverRequest(currentPage);
      } else if (idButton === -2 && currentPage < totalNumberPages) {
         currentPage = currentPage + 1;
         serverRequest(currentPage);
      } else {
         removeResult();
         currentPage = idButton;
         serverRequest(currentPage);
      }
}

function clickDetailsMovie(event) {
   if (event.target.tagName === "BUTTON") {
      if (!serverResponse) {
         serverResponse = story;
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
   if (movieDetails) {
      movieDetails.remove();
   }
   movieDetails = document.createElement("div");
   movieDetails.classList.add('movieDetails');
   let movieDetailsWrap = document.createElement("div");
   movieDetailsWrap.classList.add('movieDetailsWrap');
   elementPosition(searchResults, movieDetailsWrap, 'prepend')
   elementPosition(movieDetailsWrap, movieDetails, 'prepend')

   let closeDiv = document.createElement("div");
   closeDiv.classList.add('button');
   let closeDivText = document.createElement("div")
   elementPosition(closeDiv, closeDivText, 'append')
   closeDivText.classList.add('buttonText');
   closeDivText.innerHTML = `close`;
   elementPosition(movieDetailsWrap, closeDiv, 'prepend')
   closeDiv.onclick = () => movieDetailsWrap.remove();
   let titleDiv = document.createElement("div");
   titleDiv.innerHTML = `Title: ${title}`;
   titleDiv.style.padding = "15px";
   elementPosition(movieDetails, titleDiv, 'append')
   let typeDiv = document.createElement("div");
   typeDiv.innerHTML = `Type: ${type}`;
   typeDiv.style.padding = "15px";
   elementPosition(movieDetails, typeDiv, 'append')
   let yearDiv = document.createElement("div");
   yearDiv.innerHTML = `Year: ${year}`;
   yearDiv.style.padding = "15px";
   elementPosition(movieDetails, yearDiv, 'append')
   if (poster != "N/A") {
      let posterImg = document.createElement("img");
      posterImg.src = poster;
      elementPosition(movieDetails, posterImg, 'append')
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
      case 'prepend':
         return (parentElement.prepend(currentElement))
      case 'append':
         return (parentElement.append(currentElement))
      case 'after':
         return (parentElement.after(currentElement))
      case 'before':
         return (parentElement.before(currentElement))
   }
}
