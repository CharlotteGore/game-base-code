var THREE = require('./lib/three/three.js');

var SAT = require('sat');
var HSHG = require('./lib/hshg');
var satUtils = require('./lib/quads-to-sat.js');

var tick = require('animation-loops');
var gameTime = {
  now : .00025 * tick.now(),
  start : .00025 * tick.now(),
  delta : 0
};

var Detector = require('./lib/three/detector.js');
var Stats = require('./lib/three/stats.min.js');

var Pipeline = require('./lib/pipeline.js');
var assetLoader = require('./lib/load-all-assets.js');
var inputs = require('./lib/input-aggregator.js');

var createPlayer = require('./entities/player-example');
var createDummy = require('./entities/dummy-example');

function WebGLApplication ( element ){

  this.postProcessing = true;

  var stats = new Stats();
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.top = '0px';
  document.body.appendChild( stats.domElement );

  if (! Detector.webgl){
    Detector.addGetWebGLMessage();
    return false;
  }

  document.querySelector('header').style.display = "none";



  element.appendChild(this.initialisePipeline());

  // load any assets...
  /*
  assetLoader((function (err, assets){


  }).bind(this));
  */


  var lastTick;
  // container for collision detection responses...
  var response = new SAT.Response();

  // some material references...
  var material = new THREE.MeshLambertMaterial({ ambient : 0xffffff, emissive : 0x333333 });


  // importing some example geometry... 
  var collisionGeometryRaw = new THREE.JSONLoader().parse(require('./example-geometry/test-collision-mesh.js')).geometry;
  var backGeo = new THREE.JSONLoader().parse(require('./example-geometry/background-mesh-raw.js')).geometry;
  var superBack = new THREE.JSONLoader().parse(require('./example-geometry/super-back.js')).geometry;
  var topLayer = new THREE.JSONLoader().parse(require('./example-geometry/top-layer.js')).geometry;
  var detail = new THREE.JSONLoader().parse(require('./example-geometry/detail-overlay.js')).geometry;

  var entityData = require('./example-geometry/entities.json');


  var grid = new HSHG();
  var sceneExtents = satUtils.generateEnvironmentColliders(collisionGeometryRaw, grid); // geometry, HSHG grid, isStatic

  var entities = [];

  
  for (var i = 0; i < entityData.bones.length; i++){

    var name = entityData.bones[i].name.split('.');
    var entity = false;
    var pos = entityData.bones[i].pos;

    switch (name[0]){
      case "player":
        entity = createPlayer(this.scene);
        entity.mesh.add(this.camera.camera);
        break;
      case "dummy":
        entity = createDummy(this.scene, name[1]);
        break;
    }

    entity.create(new THREE.Vector3(pos[0], pos[1], 0));
    grid.addObject(entity.box);

    entities.push(entity);

  }

  var glowball = new THREE.Mesh(new THREE.CircleGeometry(0.1), new THREE.MeshBasicMaterial({color : 0xccccff}));
  this.glowScene.add(glowball);
  glowball.position.set(-3.4,1.8,0.01);
  


  this.scene.add( new THREE.Mesh(detail, material))
  this.scene.add( new THREE.Mesh(backGeo, new THREE.MeshLambertMaterial({ambient : 0x555555})))
  this.scene.add( new THREE.Mesh(superBack, new THREE.MeshLambertMaterial({ambient : 0x333344})))
  this.scene.add( new THREE.Mesh(topLayer, new THREE.MeshLambertMaterial({ambient : 0x333355})))

  var light = new THREE.PointLight(0xccccff);
  light.intensity = 0.4;
  light.distance = 10
  light.position.set(-3.4,1.8,3);

  this.scene.add(light)

  var light = new THREE.AmbientLight( 0x404040 ); // soft white light
  this.scene.add( light );

  this.camera.pivot(5,5, new THREE.Vector3(0,0,0));

  // add a tick handler. This is our 60fps. 
  tick.add((function tickHandler (elapsed){

    this.pipe.render(this.postProcessing);

    stats.update();

    var now = .00025 * (tick.now() - gameTime.start);
    gameTime.delta = now - gameTime.now;
    gameTime.now = now;

    if(gameTime.delta * 25000 > 500){
      return;
    };

    for (var i = 0; i < entities.length; i++){
      entities[i].update(gameTime.now, gameTime.delta);
    }

    // now we update the grid... 
    grid.update();

    // now we get the pairs
    var pairs = grid.queryForCollisionPairs();

    pairs.forEach((function (pair){

      var a, b;
      // prepare for a new response...
      response.clear();

      if (pair[0]['static']){
        b = pair[0]; a = pair[1];
      } else {
        a = pair[0]; b = pair[1];
      }

      if (a.collider.isCircle){

        var collision = SAT.testCirclePolygon(a.collider, b.collider, response);

      } else if (b.collider.isCircle) {

        var collision = SAT.testPolygonCircle(a.collider, b.collider, response);

      } else {

        var collision = SAT.testPolygonPolygon(a.collider, b.collider, response);

      }

      // report the collisions to the various entities...
      if (collision){
        if (a.resolveCollision) a.resolveCollision(b, response, gameTime.now);
        if (b.resolveCollision) b.resolveCollision(a, response, gameTime.now);
      }

    }).bind(this));

    this.camera.update(gameTime.now, elapsed);

  }).bind(this));

  return this;

}

WebGLApplication.prototype = {

  initialisePipeline : function pipelineInitialiser (element){

    var width = window.innerWidth ;
    var height = (width / 16) * 9 ;

    if (height > window.innerHeight){
      height = window.innerHeight;
      width = (height / 9) * 16;
    }

    // renderer
    this.renderer = new THREE.WebGLRenderer({ antialias : false, devicePixelRatio : 1});
    this.renderer.setSize(width, height);

    // camera...
    this.camera = require('./lib/cameraman.js')(25, width/height, 1, 3000);
    this.camera.setPosition(new THREE.Vector3(0,0,30));

    if (this.postProcessing){
      this.scene = new THREE.Scene();
      this.glowScene = new THREE.Scene();
    } else {
      this.scene = this.glowScene = new THREE.Scene();
    }

    // create rendering pipeline..
    this.pipe = new Pipeline(this.renderer, this.scene, this.camera.camera, this.glowScene, width, height);

    // disable right click..
    window.oncontextmenu = function (event) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    };

    this.pipe._dims = {
      width: width, 
      height : height
    }

    // add some sort of resize handler here... 

    return this.renderer.domElement;

  }

}

new WebGLApplication(document.getElementById('screen'));



