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

  var image = document.createElement('img');
  var tex = new THREE.Texture(image);
  tex.minFilter = tex.magFilter = THREE.NearestFilter;
  image.onload = function (){
    tex.needsUpdate = true;
  }
  image.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZAAAAGQCAMAAAC3Ycb+AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyhpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDIxIDc5LjE1NTc3MiwgMjAxNC8wMS8xMy0xOTo0NDowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTQgKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6M0ZFQjU3Qjc5Q0RGMTFFNDg5NDc5MkMxOTBGMzRDMDkiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6M0ZFQjU3Qjg5Q0RGMTFFNDg5NDc5MkMxOTBGMzRDMDkiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpEMjg5MTQ2MjlDQUExMUU0ODk0NzkyQzE5MEYzNEMwOSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDozRkVCNTdCNjlDREYxMUU0ODk0NzkyQzE5MEYzNEMwOSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Ps3F2FQAAAI0UExURV19fFyTmNOljCl1d5ycl5qNh2KAf6jU0jZ7fNWokJmPid22oYysrXaNjT5+f3XExWuGhdaqk11kYdWnkIufn3KLinOgpHaOjWGWmmWCgZLOymmEg9CfhpGkpPTg2+nJwC94edOljV5+fZ6hnFCGh3ulqXSMi2F/f1SIifDX0G6doZuOiIGqrmGOj62inKKrpoyfn22Hhvbn4vbl4PPf2eTFs06FhvXj3nWNjIqenubCuYqwtNe2ouO8sujHvWaCgl+Njs6bgYuxtdq7p9erlK3W1OzTxZ+wsN65pYKXl3Kfo0mDhGqUlWOBgM7HxImws2qFhOHFtIWtsZe1tefJuHqRkJepqeLOvmSQkdapko2ztoebm+S/tNKjitWokWWRktGghzp8fmKWm3eOjV2UmOnNvtmwml6UmWeDg4qws4GqrWiEg4yyttSmjevRw9vDsm6Hh3WbnJyQimCVmjN5e+rQwaCUjmGVmtark19+fpmMhqugmyt2d+nOvlKBhI6ztsnBvX6nq3eWmY2yts7Gw22Hh+G9qoeoqenIvzN6e3qQkCt2eObIt1aJikeCg9CghtSmjp+Sjdy1oFGGiDd7fEWBgq2inaKWkdKji3uSkWWBgX2goUKAgejLu8vEwHCeomOQkXmdnlKHiM2bgc2agIGWlWOXm/Th3HCRlDl8fW+IiOfFu1mKjL2zr3OZmu7Yy3idnYKkpca+utSpknySkmubn4uxtKCppKre3eK5rpiLhf///wc9coUAAAVPSURBVHja7N3Vkl1FGIDRISGQ4BCc4ITg7u7u7u7u7u7u7u7OzMvxAt/FrpopZie1vuvTp3v/68xd156JiYFtEZ0YrRFtHU1Fz0W1dtdog2iFgdXaa6JTonre66P3oiXRBBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAWepA7o02ilaNavg3RfW5taMvo8ujdQa2XnRm9EdUZ64ZPBkdHAEBAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIkKUPpC4HfBcdG9WhX4uOiWrt0dHG0S5RAdfas6I6y1FRfe7d6JYICBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQICMB2S5qF4S8FW0T/R4VAdcGL0arRxNjaih59s/qssVQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQJkPCDVFVG9JGBxVIf5MLormoxui+ZE90RrRguiG6MLo0XR29ELUc3l0QgIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgIwHpC45XB39GV0X1cZXRfOiyaWweo76IdRcTouAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBMi4QZZE20XnR7XxudHkMtw7Uc1l3wgIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgIwb5Pbo4+jkqDa+KBr6cCtFy0d/D2zLgQ39vjrL71HN5a8ICBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQICMG+Tu6LjosKg2fiUaClIPvGL0zyxVZzkgqrlcGwEBAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIkPGAzI3Wj/aKbohq482joSB1saAGMzWwoYOezvedHdXabyIgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAATIekLrkUCDrRudFtfGcaFkGuTmqtTtEQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQJk3CDPRgXySzTTINN5ccCG0eoDq7W1x5HRqVHNZXEEBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIEDGA1IvDrgs2ip6OJppkJn+B/drDazW7hwdHtUMHoseioAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIEyHhAHojmR9tE70cz/TL+MfVyVM+7SvRJ9EEEBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIEDGA7JZtFp0SPR09HM0nUsOs9V90RFRgXwafRa9EQEBAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIkPGAfBvVSwJ+iuowD0aXREMH8+//UO37RVTPe3p0QvRmVH8MQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQJkPCDHRxdHdZg7o4XR9tFsDX9oh0ZDXxKwY1QXR56PgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgTIeEBejGrjK6MF0bxoTBcahvZ5VHP5NfohujSaGwEBAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIkPGA1CZnRD9Gb0X3RztFmw7smeig6Ptov+iC6MBoUVSzujV6PZofAQECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAiQcYM8Ff0WPRJ9FD0RnRRtMrCvo72j3aPdoj2ibaM9owI5J3opuiMCAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECCjBvlPgAEAvfGYp+8L4yMAAAAASUVORK5CYII="

  var testMaterial = new THREE.MeshBasicMaterial({ color: 0x666666, map : tex});
  var testMesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), testMaterial);
  testMesh.position.z = 0.02;
  this.scene.add(testMesh);

  assetLoader((function (err, assets){

    var test = new THREE.PlaneBufferGeometry(1, 1);
    var material = new THREE.MeshLambertMaterial({ color : 0xffffff, map : assets.textures['dark-tiles'], transparent: true})
    assets.textures['test-map'].minFilter = assets.textures['dark-tiles'].magFilter = THREE.NearestFilter

    var material2 = new THREE.MeshBasicMaterial({ color : 0xffffff, map : assets.textures['dark-tiles']})
    assets.textures['test-map'].minFilter = assets.textures['dark-tiles'].magFilter = THREE.NearestFilter

    this.circle = new THREE.Mesh(new THREE.PlaneBufferGeometry(1,1), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.2}));
    this.circle.position.z = 0.01;
    this.circle.geometry.applyMatrix( new THREE.Matrix4().makeTranslation(0.5, -0.5, 0))
    this.scene.add(this.circle);

    this.map = {
      layers : {
          0 : {},
          1 : {}
        }
      }

    
    var map = require('./map.json');

    var size = map.tilesets[0].tilewidth;
    var offset = 1 / size;
    var columns = map.canvas.width / size;
    var rows = map.canvas.height / size;

    for (var i = 0; i < rows; i++){
      for (var j = 0; j < columns; j++){
        var dat = map.layers[0].data[i * columns + j];

        var row = (dat * 10 % 10);
        var col = Math.floor(dat);

        //console.log(i, j, i * columns + j, dat, col, row);

        if (dat != -1){

          var tile = 
          new THREE.Mesh(new THREE.PlaneBufferGeometry(1, 1), material);
          setTile(row, col, tile.geometry);

          tile.position.set(j - (columns / 2), (rows - i) - (rows / 2), 0);
          tile.geometry.applyMatrix( new THREE.Matrix4().makeTranslation(0.5, -0.5, 0))

          if(!this.map.layers[0].columns){
            this.map.layers[0].columns = {};
          }
          if(!this.map.layers[0].columns[tile.position.x]){
            this.map.layers[0].columns[tile.position.x] = {
              rows : {

              }
            }
          };
          this.map.layers[0].columns[tile.position.x][tile.position.y] = tile;

          this.scene.add(tile);
        }
      }
    }

    for (var i = 0; i < rows; i++){
      for (var j = 0; j < columns; j++){
        var dat = map.layers[1].data[i * columns + j];

        var row = (dat * 10 % 10);
        var col = Math.floor(dat);

        //console.log(i, j, i * columns + j, dat, col, row);

        if (dat != -1){

          var tile = 
          new THREE.Mesh(new THREE.PlaneBufferGeometry(1, 1), material2);
          setTile(row, col, tile.geometry);

          tile.position.set(j - (columns / 2) , (rows - i) - (rows / 2), 0.2);

          if(!this.map.layers[1].columns){
            this.map.layers[1].columns = {};
          }
          if(!this.map.layers[1].columns[tile.position.x]){
            this.map.layers[1].columns[tile.position.x] = {
              rows : {

              }
            }
          };
          this.map.layers[1].columns[tile.position.x][tile.position.y] = tile;

          this.glowScene.add(tile);

          var light = new THREE.PointLight(0xccccff);
          light.intensity = 1;
          light.distance = 20;
          light.position.set(j - (columns / 2),(rows - i) - (rows / 2),.5);

          this.scene.add(light);
          
        }
      }
    }

    function setTile(row, col, geo){

      offset = 1 / 8;

      /*
        0.0234375

        128 pixels with 8 tiles of 10x10. 
        width of tiles = 80
        total width = 128
        remaining? 
      */
 
      var att = geo.attributes.uv.array;
      var tl = [(col * offset) + 0.0234375, (1 - (row * offset)) - 0.0234375]
      var br = [((col + 1) * offset) - 0.0234375, 1 - ((row + 1) * offset) + 0.0234375] 
      att[0] = tl[0]; 
      att[4] = tl[0]; 

      att[1] = tl[1]; 
      att[3] = tl[1];

      att[6] = br[0];
      att[2] = br[0]; 

      att[7] = br[1];
      att[5] = br[1];  
      geo.attributes.uv.needsUpdate = true
    }

    window.mapgraph = this.map;


//this.camera.pivot(2,1, new THREE.Vector3(0,0,0));

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

 /*

var test = new THREE.PlaneBufferGeometry(1, 1);
var material = new THREE.MeshBasicMaterial({ color : 0xffffff, map : assets.textures['test-map'], transparent: true})
assets.textures['test-map'].minFilter = assets.textures['test-map'].magFilter = THREE.NearestFilter

var offset = (1 / 8);

var mesh = new THREE.Mesh(test, material);
var att = mesh.geometry.attributes.uv.array;

this.scene.add(mesh);

function setTile(row, col){
  var tl = [col * offset, 1 - (row * offset)]
  var br = [((col + 1) * offset), 1 - ((row + 1) * offset)] 
  att[0] = tl[0]; 
  att[4] = tl[0]; 

  att[1] = tl[1]; 
  att[3] = tl[1];

  att[6] = br[0];
  att[2] = br[0]; 

  att[7] = br[1];
  att[5] = br[1];  
  mesh.geometry.attributes.uv.needsUpdate = true
}

 */

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

    window.onmousemove = (function (event){
      event.preventDefault();
      var vector = new THREE.Vector3();

      vector.set(
          ( event.clientX / this.pipe.width ) * 2 - 1,
          - ( event.clientY / this.pipe.height ) * 2 + 1,
          0.5 );

      vector.unproject( this.camera.camera );

      var dir = vector.sub( this.camera.camera.position ).normalize();

      var distance = - this.camera.camera.position.z / dir.z;

      var pos = this.camera.camera.position.clone().add( dir.multiplyScalar( distance ) );
      //console.log(pos.x, pos.y)

      this.circle.position.x = Math.floor(pos.x);
      this.circle.position.y = Math.ceil(pos.y);

      if(this.map.layers[0].columns[this.circle.position.x ] && this.map.layers[0].columns[this.circle.position.x ][this.circle.position.y]){
      //  console.log('tile found');
      } else {
      //  console.log('no tile found');
      }

    }).bind(this);

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



