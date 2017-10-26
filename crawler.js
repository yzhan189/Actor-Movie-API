
var request = require('request');
var cheerio = require('cheerio'),
    cheerioTableparser = require('cheerio-tableparser');;
var URL = require('url-parse');
var log4js = require('log4js');
var jsonfile = require('jsonfile');
var fs = require('fs');

const Actor = require('./Actor');
const Movie = require('./Movie');
const Graph = require('./Graph');

/* configure, write to log file*/
log4js.configure({
  appenders: { 'file': { type: 'file', filename: './logfile/crawling.log' } },
  categories: { default: { appenders: ['file'], level: 'debug' } }
});
var logger = log4js.getLogger(' ');


// the starting url
var START_URL = "https://en.wikipedia.org/wiki/Jude_Law";//"https://wikipedia.org/wiki/Jude_Law";

// number of visited page
var numPagesVisited = 0;
var numActorsVisited = 0;
var numMoviesVisited = 0;

// a queue of pages to visit
var pagesToVisit = [];

// dictionaries of visited pages
var pagesVisited = {};
var actorsVisited = {};
var moviesVisited = {};

// get new url and parsed
var url = new URL(START_URL);

// baseUrl is https://en.wikipedia.org
var baseUrl = url.protocol + "//" + url.hostname;

// numActorsVisited>250&&numMoviesVisited>125
/* the callback funcion : crawl the web*/
function crawl() {
    // if find enough actors and movies
    if(numActorsVisited>400&&numMoviesVisited>200) {
        logger.info("find actor: "+numActorsVisited+", find movie: "+numMoviesVisited);
        end();
        return;
    }

    //get the next element,
    var nextPage = pagesToVisit.shift();

    // handle undefined page
    if (typeof nextPage != 'undefined'){
         logger.warn("Undefined Page.");
    }

    // already visited this page, continue crawl other pages
    if (nextPage in pagesVisited) {
        crawl();
    } else { // else visit this new page
        visitPage(nextPage, crawl);
    }
}


/* visit the page, get needed information */
function visitPage(url, callback) {
    // add page to set
    pagesVisited[url] = true;
    numPagesVisited++;

    //visit page
    logger.debug("Visiting page " + url);
    request(url, function(error, response, body) {
        logger.debug("Status code: " + response.statusCode);
        // if status not ok, go to crawl nextpage
        if(response.statusCode !== 200) {
            callback();
            return;
        }
        // parse body
        var $ = cheerio.load(body);

        //if actor, find movie related
        if (isActor($)){
            numActorsVisited++;
            collectFilmLinks($);
            addActor($);
        }
        //if mocie, find actor related
        if (isMovie($)){
            numMoviesVisited++;
            collectActorLinks($);
            addMovie($);
        }

        callback();
    });
}







/* Set up and add new object actor to list*/
function addActor($){

    var name = getName($);
    logger.info('Find Actor: '+name);

    var age = getAge($);
    logger.info("Age: "+age);

    //create new object actor
    var actor = new Actor(name,age,new Array(), 0);

    //find Filmography table on wiki page
    //<i> is the italics content, which is name of movie
    var films = ($("h2:contains('Filmography')").next().next()).find("i").children();

    //for each content in <i>
    films.each(function(){
        //name is in attribute title
        var movieName = $(this).attr('title');

        // handle the case, no such table exist
        if (typeof movieName == 'undefined'){
            logger.warn("Undefined movie title.");
            return true;
        }
        //add to film list of actor
        actor.addFilmography(movieName);

    });
    actorsVisited[actor.name]=actor;
    logger.info("Number of movies filmed: "+ actor.getFilmNum());

}//year age earn

/* Set up new obj movie, and add to list*/
function addMovie($){

    var name = getName($);
    logger.info('Find Movie: '+name);

    var year = getYear($);
    logger.info('Year Released: '+year);

    var grossValue = getGrossValue($);
    logger.info('Gross Value: '+grossValue);

    var movie = new Movie(name,year,grossValue,new Array());

    // find the cast section on wiki page
    var casts = ($("h2:contains('Cast')").next()).find("a");

    casts.each(function(){
        // actor name is in title
        var actorName = $(this).attr('title');

        // hanle case no such section is found
        if (typeof actorName == 'undefined'){
            logger.warn("Undefined actor name.");
            return true;
        }
        // add to movie cast name
        movie.addCast(actorName);
    });
    moviesVisited[movie.name]=movie;
    logger.info("Number of casts: "+ movie.getCastNum());

}//boxoffice year





/* Check if the website is about an actor*/
function isActor($){
    // to find biography of the website
    var tableRow = $("table.infobox.biography.vcard tr:contains('Occupation')")
                        .text().toLowerCase();
    // if the occupation is actor or actress, then true
    return (tableRow.indexOf("actor") !== -1
                ||tableRow.indexOf("actress") !== -1);
}

/* Check if the website is about a movie*/
function isMovie($){
    // check infobox, find table row contains info of director
    var tableRow = $("table.infobox.vevent tr:contains('Directed by')");
    // if no such table row, the length will be 0, then false
    return tableRow.length;
}

/* Find age of actor*/
function getAge($){

    // find table row with born info
    var info = $("table.infobox.biography.vcard tr:contains('Born')").text();
    if (info.length==0){
        //err handle
        logger.warn("getAge(): No Age Found.");
        return 0;
    }
    //find index of "(age xx)", add 5 is the index of "xx".
    var indexOfAge = info.indexOf('(age' )+5;

    // make sure the string starts with number and parse
    var ageNum = parseInt(info.substring(indexOfAge,indexOfAge+3));

    // if parsed uncorrectly, return 0
    if (isNaN(ageNum)){
        logger.warn("getAge(): Age not parsed correctly.");
        return 0;
    }
    return ageNum;
}
/* Get year of movie*/
function getYear($){

    // find <span> of published updated
    // which contains Released date in this form: yyyy-mm-dd
    var info = $("span.bday.dtstart.published.updated").text();

    // if no such content exist
    if (info.length==0){
        logger.warn("getYear(): Released date not found.");
        return 0;
    }
    return parseInt(info);
}

function getGrossValue($){
    //find table row contains box office
    var info = $("table.infobox.vevent tr:contains('Box office')").text();

    // handle the case table row not find
    if (info.length==0){
        logger.warn("getYear(): Box office not found.");
        return 0;
    }
    // box office is in form $xxxx, so strip the "$"
    var valueStr = info.substring(info.indexOf('$')+1).replace(',','');
    var value = parseInt(valueStr);

    // handle err: parsed incorrectly
    if (isNaN(value)){
        logger.error("Box office not parsed.");
        return 0;
    }

    // if the amount is $xxx million
    if (valueStr.indexOf('million')!=-1){
        return value*1000000;
    }// if $xxx billion
    else if (valueStr.indexOf('billion')!=-1){
        return value*1000000000;
    }

    return value;
}

/* get name of actor and movie*/
function getName($){

    // find the main title of wiki page "xxxx - Wikipedia"
    var title = ($("title:contains(' - Wikipedia')")).text();
    // title, strip of " - Wikipedia"
    return title.substring(0,title.indexOf(' - Wikipedia'));
}

/* find potential links of film in actor page*/
function collectFilmLinks($){
    // find header of Filmography
    // the second next sibling is the table with all films
    // find all relative links with '/wiki/' prefix
    var films = ($("h2:contains('Filmography')").next().next()).find("a[href^='/wiki/']");
    collectLinksHelper($,films);
}

/* find potential links of actor in movie page*/
function collectActorLinks($){
    // find header of cast
    // the next sibling is the list of cast
    // find all relative links with '/wiki/' prefix
    var casts = ($("h2:contains('Cast')").next()).find("a[href^='/wiki/']");
    collectLinksHelper($,casts);
}

/* handle links found in page*/
function collectLinksHelper($,links){

    links.each(function(){
        // push links to the queue
        pagesToVisit.push(baseUrl + $(this).attr('href'));
    });

    logger.info("Found " + (links.length) + " relative links on page");
}





/* program starts here:
    start crawl on First page*/
pagesToVisit.push(START_URL);
crawl();

function end(){

    arrayToJson();
    logger.info("Finish crawling, start writing to json file.");
}

/* Write my data structure to json file*/
function arrayToJson(){

    //write actorsVisited to actor.json
    var file = './jsonfile/actor.json';
    jsonfile.writeFile(file, actorsVisited,{spaces: 2}, function (err) {
        logger.debug("arrayToJson(): "+err);
    });

    //write moviesVisited to movie.json
    var file = './jsonfile/movie.json';
    jsonfile.writeFile(file, moviesVisited,{spaces: 2}, function (err) {
        logger.debug("arrayToJson(): "+err);
    });

}
