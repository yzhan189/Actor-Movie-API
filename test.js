var assert = require('assert');
var Tool = require('./Tool.js');
const Actor = require('./Actor');
const Movie = require('./Movie');
const Graph = require('./Graph');

var graph = new Graph();

describe('Graph', function() {
    // test if constr initialize unspecified value
  describe('constructor()', function() {
    it('should initialize actor vertices', function() {
      assert.ok(typeof graph.actorVertices != 'Undefined');
    });
    it('should initialize movie vertices', function() {
      assert.ok(typeof graph.movieVertices != 'Undefined');
    });
  });

  graph.addEdge("actor1","movie1",200);
  graph.addEdge("actor1","movie2",46600);
  graph.addEdge("actor2","movie1",207890);

  // test if add edge work properly
  describe('addEdge(\"actor1\",\"movie1\",200)', function() {
    it('adjMatrix[0][1] should be 200', function() {
        assert.equal(graph.adjMatrix[0][1],200);
    });

  });
});

describe('addEdge("actor1","movie2",46600); \n\
            addEdge("actor2","movie1",207890);', function() {
  it('adjMatrix[0][2] should be 46600', function() {
      assert.equal(graph.adjMatrix[0][2],46600);
  });
  it('adjMatrix[3][1] should be 207890', function() {
      assert.equal(graph.adjMatrix[3][1],207890);
  });
  it('store actor to Vertices, no duplicate', function() {
      assert.equal(Object.keys(graph.vertexIndexDict).length,4);
  });
  it('store movie to Vertices, no duplicate', function() {
      assert.equal(Object.keys(graph.vertexIndexDict).length,4);
  });
});




actor = new Actor("actor1",2,new Array(),3);

describe('Actor', function() {
  describe('constructor()', function() {
    it('should initialize each value', function() {
      assert.ok(typeof actor.filmList != 'Undefined');
    });
    it('name actor1', function() {
        assert.equal(actor.name,"actor1");
    });
    it('age 2', function() {
        assert.equal(actor.age,2);
    });
    it('film list defined', function() {
        assert.ok(typeof actor.filmList != 'Undefined');
    });
    it('income 3', function() {
        assert.equal(actor.income,3);
    });
  });
  actor.addFilmography(new Movie());
    describe('addFilmography() and getFilmNum', function() {
      it('getFilmNum() should be 1', function() {
          assert.equal(actor.getFilmNum(actor),1);
      });
    });

});


m = new Movie("m1",2,3,new Array());

describe('Movie', function() {
  describe('constructor()', function() {
    it('should initialize each value', function() {
      assert.ok(typeof m != 'Undefined');
    });
    it('name actor1', function() {
        assert.equal(m.name,"m1");
    });
    it('year 2', function() {
        assert.equal(m.year,2);
    });
    it('cast list defined', function() {
        assert.ok(typeof m.castList != 'Undefined');
    });
    it('value 3', function() {
        assert.equal(m.value,3);
    });
  });

m.addCast(new Actor());
  describe('addCast() and getcastNum()', function() {
    it('getcastNum() should be 1', function() {
        assert.equal(m.getCastNum(m),1);
    });
  });
});



graph2 =  Tool.jsonToGraph('./jsonfile/actor.json','./jsonfile/movie.json');

describe('Tool', function() {
  describe('jsonToGraph()', function() {

    it('graph should be initialized with correct dicitonary', function() {
      assert.ok(typeof graph2.vertexIndexDict!= 'Undefined');
    });
    it('dictionary is correct', function() {
        assert.equal(Object.keys(graph2.vertexIndexDict).length,617);
    });
    it('check some of the data', function() {
        assert.ok("Jude Law" in graph2.vertexIndexDict);
        assert.ok(! ("blah" in graph2.vertexIndexDict));
    });

  });

  graph3 =  Tool.jsonToGraph('./jsonfile/testA.json','./jsonfile/testB.json');
  describe('find hub function', function() {
    it('the hub movie get 0 connections', function() {
        ret = Tool.findHubMovie(graph3);
        //assert.ok(ret.toString().indexOf("0")!=-1);
    });
    it('the hub actor get 0 connections', function() {
        ret = Tool.findHubActor(graph3);
        //assert.ok(ret.toString().indexOf("0")!=-1);
    });
  });

  describe('find income-year relationship', function() {
    it('ignore entry with 0 years or value', function() {
        ret = Tool.getIncomeVSYear(graph3);
        assert.ok(Object.keys(ret).length==0);
    });

  });
  describe('find income-age relationship', function() {
      it('do note ignore entry ', function() {
          ret = Tool.getIncomeVSAge(graph3);
          assert.ok(Object.keys(ret).length==2);
      });
    it('get correct value', function() {
        ret = Tool.getIncomeVSAge(graph3);
        assert.ok(ret['1952']==1000);
        assert.ok(typeof ret['1953'] == 'undefined');
    });
  });

});
