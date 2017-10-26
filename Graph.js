var arraySort = require('array-sort');
var log4js = require('log4js');

// configure log file
log4js.configure({
  appenders: { 'file': { type: 'file', filename: 'logfile/Graph.log' } },
  categories: { default: { appenders: ['file'], level: 'info' } }
});
var logger = log4js.getLogger(' ');

const MATRIX_NUM = 700;


function Graph(actorsVisited,moviesVisited) {
    // dictionary: name to object
    this.movieDict = moviesVisited;
    this.actorDict = actorsVisited;

    // dict of vertices: name to index
    // indicate which actor the row represents in the adjMatrix
    // which movie the col represents
    this.vertexIndexDict = new Array();

    // the array that sort actor by age and by income
    // store the outcome array after user first call it
    this.actorsByAge;
    this.actorsByIncome;

    // a adjacent matrix to store the graph
    var arr = new Array(MATRIX_NUM);
    for (var i = 0; i < MATRIX_NUM; i++) {
      arr[i] = new Array(MATRIX_NUM);
    }
    this.adjMatrix = arr;

    logger.info("Create new graph.");
};

/* add edge, non-exist vertex will be added automatically*/
Graph.prototype.addEdge = function addEdge(vertex1,vertex2,edgeValue) {

	if (!(vertex1 in this.vertexIndexDict)){
		this.vertexIndexDict[vertex1] = Object.keys(this.vertexIndexDict).length;
	}
    if (!(vertex2 in this.vertexIndexDict)){
        this.vertexIndexDict[vertex2] = Object.keys(this.vertexIndexDict).length;
    }
    addValueToAdjMatrix(vertex1,vertex2,edgeValue,this);
};

/* Only add edges between vertices that already exist in graph
    use for add connections between actors.
    since web crawler is not exhaustic,
    the previous addEdge() will add actors that I haven't crawl yet */
Graph.prototype.addEdgeOfExistVertices = function addEdgeOfExistVertices(vertex1,vertex2,edgeValue) {
    // if not in Dict, do nothing.
	if (!(vertex1 in this.vertexIndexDict)||!(vertex2 in this.vertexIndexDict)){
        return;
    }
    addValueToAdjMatrix(vertex1,vertex2,edgeValue,this);
};

function addValueToAdjMatrix(vertex1,vertex2,edgeValue,graph){
    // get the index of actor and movie represented by in adjMatrix
    var vertex1Index = graph.vertexIndexDict[vertex1];
    var vertex2Index = graph.vertexIndexDict[vertex2];

    graph.adjMatrix[vertex1Index][vertex2Index] = edgeValue;
    graph.adjMatrix[vertex2Index][vertex1Index] = edgeValue;
}

/* a helper print function*/
Graph.prototype.print = function print() {
    console.log(this.vertexIndexDict);
    console.log(this.adjMatrix);
}





// =========== Specific Query below ===========:

/* find actor born in year */
Graph.prototype.findActorsOfYear = function findActorsOfYear(year) {
    // call helper with actor dictionary
    return findByYear(this.actorDict,year);
}
/* find movie of a year */
Graph.prototype.findMoviesOfYear = function findMoviesOfYear(year) {
    // call helper with movie dictionary
    return findByYear(this.movieDict,year);
}

function findByYear(objDict,year){
    // create a new array of result
    var ret = [];

    // get actor list first
    var objNameList = Object.keys(objDict);

    // iterate through obj list
    for (var i=0; i<objNameList.length; i++){
        var object = objDict[objNameList[i]];
        // get year
        if(object.getYear() == year){
            // add to result
            ret.push(object.name);
        }
    }
    return ret;
}

/* find movie's gross value*/
Graph.prototype.findMovieGrossValue = function findMovieGrossValue(movie) {
    // if such movie not exist handle err
    if(typeof (this.movieDict[movie]) == 'undefined'){
        logger.error(movie+": Movie not found.");
        return null;
    }
    // return value
    return this.movieDict[movie].value;
};

/* find neighbor vertex of movie */
Graph.prototype.findCast = function findCast(movie) {
    return findRelatedHelper(movie,this.movieDict);
};
/* find neighbor vertex of actor*/
Graph.prototype.findFilmography = function findFilmography(actor) {
    return findRelatedHelper(actor,this.actorDict);
};

Graph.prototype.findRelated = function findRelated(objName){
    return findRelatedHelper(objName,this.actorDict)
            || findRelatedHelper(objName,this.movieDict);
}

function findRelatedHelper(objName, objDict){
    if(typeof (objDict[objName]) == 'undefined'){
        logger.error(objName+": Name not found.");
        return null;
    }
    return objDict[objName].getRelatedList();
}

/* sort actor by age*/
Graph.prototype.findOldestActors = function findOldestActors(rank) {
    // if sorted array actorsByAge not initialized yet, initialize it
    if (typeof this.actorsByAge == 'undefined'){
        // sort the object list by "age" in reverse order
        this.actorsByAge = arraySort(Object.values(this.actorDict),'age',{reverse: true});
    }
    var ret = [];

    // now find the top x oldest actor
    // if total number of actor is less than x, return all actor
    for (i=0; i<rank&&i<this.actorsByAge.length ; i++){
        ret.push((this.actorsByAge[i].name+" "+this.actorsByAge[i].age));
    }

    return ret;
};
/* sort actor by name*/
Graph.prototype.findRichestActors = function findRichestActors(rank) {
    // if sorted array actorsByIncome not initialized yet, initialize it
    if (typeof this.actorsByIncome == 'undefined'){
        setUpIncomeHelper(this);
        // sort actor list by "income"
        this.actorsByIncome = arraySort(Object.values(this.actorDict),'income',{reverse: true});
    }
    var ret = [];

    // now find the top x richest actor
    // if total number of actor is less than x, return all actor
    for (i=0; i<rank&&i<this.actorsByIncome.length ; i++){
        ret.push(this.actorsByIncome[i].name+" "+this.actorsByIncome[i].income);
    }

    return ret;
};

Graph.prototype.setUpIncome = function setUpIncome() {
    setUpIncomeHelper(this);
}

function setUpIncomeHelper(graph){
    // loop actor, calculate income for each actor
    for (i=0; i<Object.values(graph.actorDict).length; i++){
        // income is 0 before sum up
        var income = 0;

        // get the object actor
        var actor = Object.values(graph.actorDict)[i];

        // get adjMatrix index for this actor
        var actorIndex = graph.vertexIndexDict[actor.name];

        // loop through all edges to sum up total earning for this actor
        for (j=0; j<graph.adjMatrix[0].length; j++){
            // get earning for this movie
            var earning = graph.adjMatrix[i][j];
            if (typeof earning == 'number'){
                income+= earning;
            }

            // if a valid earning, add it
            // (which means the actor filmed it)
            // if (typeof earning != 'undefined'&&!isNaN(earning)){
            //     income+= earning;
            // }
        }
        //set income for this actor
        actor.income = income;
    }
}

module.exports = Graph;
