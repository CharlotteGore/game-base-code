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

var mouse = new THREE.Vector2();

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

  assetLoader((function (err, assets){

    tick.add((function tickHandler (elapsed){

      stats.update();

      var now = .00025 * (tick.now() - gameTime.start);
      gameTime.delta = now - gameTime.now;
      gameTime.now = now;

      if(gameTime.delta * 25000 > 500){
        return;
      }

      this.pipe.render(this.postProcessing, gameTime.now);

      this.camera.update(gameTime.now, elapsed);

      }).bind(this));

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
    this.camera.setPosition(new THREE.Vector3(0,0,50));


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



