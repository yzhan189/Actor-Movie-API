var log4js = require('log4js');
var jsonfile = require('jsonfile');
const Graph = require('./Graph');
const Actor = require('./Actor');
const Movie = require('./Movie');


log4js.configure({
    appenders: { 'file': { type: 'file', filename: './tasks/.log' } },
    categories: { default: { appenders: ['file'], level: 'debug' } }
});
var logger = log4js.getLogger(' ');



/* convert json file to array of objects*/
function jsonToArray(retrievedActors,retrievedMovies,actorFilePath,movieFilePath){

    var json = require(actorFilePath);
    //loop through each key in json
    for (var key in json){

        var item = json[key];
        // create new object
        var actor = new Actor(item.name,item.age,item.filmList,item.income);

        // add to dictionary
        retrievedActors[actor.name] = actor;

    }

    var json = require(movieFilePath);
    //loop through each key in json
    for (var key in json){
        var item = json[key];
        // create new object
        var movie = new Movie(item.name,item.year,item.value,item.castList);
        // add to dictionary
        retrievedMovies[movie.name] = movie;
    }

}

/* construct graph base on my data structure*/
function arrayToGraph(retrievedActors,retrievedMovies){
    var movie,movieName;
    var movieName;
    var actorName;

    // create new obj
    graph = new Graph(retrievedActors,retrievedMovies);

    // get movies from my data structure
    movieNameList = Object.keys(retrievedMovies);
    // loop through each movie
    for(var i=0; i<movieNameList.length; i++){
        movieName = movieNameList[i];
        movie =  retrievedMovies[movieName];

        // calculate earning for each of its cast
        // divide half of the box office into equal units
        // the top i-th cast gets (n-i) units of earning
        var castNum = movie.getCastNum();
        var unitEarning = movie.value/((castNum-1)*castNum);

        for (var j=0; j<castNum; j++){

            actorName = movie.castList[j];

            if(actorName in retrievedActors){
                graph.addEdge(actorName,movieName,unitEarning*(castNum-j));
              }
        }
    }
    console.log("create verteices: "+Object.keys(graph.vertexIndexDict).length);
    return graph;
}

/* convert json to graph structure */
exports.jsonToGraph =
function (actorFilePath,movieFilePath){
    var retrievedActors = {};
    var retrievedMovies = {};
    jsonToArray(retrievedActors,retrievedMovies,actorFilePath,movieFilePath);
    return arrayToGraph(retrievedActors,retrievedMovies);
}

/* find and create connection between actors
 * and between movies in graph */
exports.createConnection = function (graph) {
    createConnectionHelper(graph,graph.actorDict);
    createConnectionHelper(graph,graph.movieDict);
}

/* helper to create connection */
function createConnectionHelper(graph,objectDict){
    // loop each object
    for (k=0; k<Object.keys(objectDict).length; k++){
        // find name and index
        var obj1Name = Object.keys(objectDict)[k];

        // find filmed movie
        var relatedList = graph.findRelated(obj1Name);
        for (i in relatedList){
            // find all the cast in that movie
            var relatedObjName = relatedList[i];
            // related of related is connected
            var connectedList = graph.findRelated(relatedObjName);
            // add connection to each connected object
            for (j in connectedList){
                var obj2Name = connectedList[j];
                graph.addEdgeOfExistVertices(obj1Name,obj2Name,'&');
            }
        }
    }
}
/* find actor with most connection*/
exports.findHubActor = function (graph){
    return findHub(graph,graph.actorDict);
}

/* find movie with most connection*/
exports.findHubMovie = function (graph){
    return findHub(graph,graph.movieDict);
}

/* helper function to find hub */
function findHub(graph, objDict){
    var hub;
    var maxConneted = 0;
    // loop though each element in objDict
    for (i=0; i<Object.keys(objDict).length; i++){
        // find name and index of obj
        var objName = Object.keys(objDict)[i];
        var objIndex = graph.vertexIndexDict[objName];
        if (typeof objIndex == 'undefined'){
            //console.log(objName);
        }else{

            // initialized its num of connected
            var numConnected = 0;

            // loop though the adjMatrix to find all edges to this obj
            for (j=0; j<graph.adjMatrix.length; j++){
                // if '&' means connected
                if (graph.adjMatrix[objIndex][j] == '&'){
                    numConnected++;
                }
            }
            //update the maximum value
            if (numConnected>maxConneted){
                hub = objName;
                maxConneted = numConnected;
            }
        }
    }
    // return a list of hub name and max connected
    return hub;
}

/* get dictionary income vs years*/
exports.getIncomeVSAge = function (graph){
    return getIncomeHelper(graph,graph.actorDict);
}
/* get dictionary income vs years*/
exports.getIncomeVSYear = function (graph){
    return getIncomeHelper(graph,graph.movieDict);
}

/* get income versus year*/
function getIncomeHelper(graph, objDict){
    // dictionar: year to average income
    var yearToAve = {}
    // dict: year to total income
    var yearToTotalIncome = {};
    // dict: year to number of actor/movies
    var yearToNum = {}

    // loop though each element in objDict
    for (i in objDict){
        // find name and index of obj
        var obj = objDict[i];

        var year = obj.getYear();
        var value = obj.getValue();

        //  handle mising data
        if (isNaN(value)||value==0||year==0||year==2017){
        }else{
            if (year==1931){
                console.log(obj.name);
                console.log(value);
            }
            // if key of year aready exists
            if (year in yearToTotalIncome){

                yearToTotalIncome[year] += value;
                yearToNum[year]++;

            }else { //if a new year is added

                yearToTotalIncome[year] = value;
                yearToNum[year] = 1;

            }
            // caculate average
            for (year in yearToTotalIncome){
                yearToAve[year] = yearToTotalIncome[year] / yearToNum[year];
            }
        }
    }

    //return result
    return yearToAve;
}
