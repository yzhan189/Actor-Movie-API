
// constructor

function Movie(name,year,value,dictCast) {
    this.name = name;
    this.year = year;
    this.value = value;
    this.castList = dictCast; // list of cast
};

// get the number of cast
Movie.prototype.getCastNum = function getCastNum() {
    return this.castList.length;
};

// getter
Movie.prototype.getYear = function getYear() {
    return this.year;
};
Movie.prototype.getValue = function getValue() {
    return this.value;
};
Movie.prototype.getRelatedList = function getRelatedList() {
    return this.castList;
};

// add a actor cast in this movie
Movie.prototype.addCast = function addCast(actor) {
    this.castList.push(actor);
};

module.exports = Movie;
