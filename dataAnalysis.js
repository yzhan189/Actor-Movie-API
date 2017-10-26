var log4js = require('log4js');
var jsonfile = require('jsonfile');
var Tool = require('./Tool.js');

const Graph = require('./Graph');
const Actor = require('./Actor');
const Movie = require('./Movie');


// first create graph out of json file
var graph = Tool.jsonToGraph('./jsonfile/actor.json','./jsonfile/movie.json');


// create connection and find hubs
Tool.createConnection(graph);
console.log("hub actor: "+Tool.findHubActor(graph));
console.log("hub movie: "+Tool.findHubMovie(graph));

// set up income, and calculate income VS year
graph.setUpIncome();
console.log(Tool.getIncomeVSYear(graph));
console.log(Tool.getIncomeVSAge(graph));




/* ============ Query from last week: you can try testing ============*/
/* demo for task to do */
// graphTasks();

function graphTasks(){
    //
    // console.log(graph.findActorsOfYear(1980) );
    // console.log(graph.findMoviesOfYear(2000) );
    // console.log(graph.findMovieGrossValue("Gattaca") );
    // console.log(graph.findCast("Gattaca") );
    console.log(graph.findFilmography("Jude Law") );
    console.log(graph.findRelated("Jude Law") );
    // console.log(graph.findOldestActors(3));
    // console.log(graph.findRichestActors(10) );

    // write output to file
    // fs.writeFile("./output/findOldestActors", graph.findOldestActors(5), function(err) {
    // if(err) {
    //     return logger.error(err);
    // }
    // });
}
