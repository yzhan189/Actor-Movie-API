// constructor

function Actor(name,age,dictMovies,income) {
    this.name = name;
    this.age = age;
    this.income = income;
    this.filmList = dictMovies; // list of film
};

// get the number of movies this actor filmed
Actor.prototype.getFilmNum = function getFilmNum(movie) {
    return this.filmList.length;
};
// getter
Actor.prototype.getYear = function getYear() {
    return (2017-this.age);
};
Actor.prototype.getValue = function getValue() {
    return this.income;
};
Actor.prototype.getRelatedList = function getRelatedList() {
    return this.filmList;
};

// add a movie this actor filmed
Actor.prototype.addFilmography = function addFilmography(movie) {
  this.filmList.push(movie);
};

module.exports = Actor;
