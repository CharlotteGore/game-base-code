var Gather = require('gm-gather');
var THREE = require('./three/three.js');
var raf = require('raf');
var context = require('./audio-context.js');
var fontLoader = require('./font-loader.js');

function loadAllGameAssets (done){

  var gathering = new Gather();

  var assets = {
    models : {},
    shaders : {
      vertex : {},
      fragment : {}
    },
    audio : {},
    textures : {}
  };


  /*
  // loading a font..
  
  gathering.task(function (done, error){

    fontLoader('Name of the font', function(err){

      if (!err){
        done();
      } else {
        error(err);
      }

    });

  });
  */

  /*
  // loading a texture..

  gathering.task(function (done, error){

    var texture = THREE.ImageUtils.loadTexture('/images/alpha-normal.png', {}, function (){

      assets.textures['alpha-normal'] = texture;
      done();

    });

  });

  */

  /*
  // loading a shader...

  gathering.task(function (done, error){

    loadShader('path to vertex shader', function (err, glsl){

      if (!err){
        assets.shaders.vertex['vertex shader id'] = glsl;
        done();
      } else {

      }

    })

  });

  gathering.task(function (done, error){

    loadShader('path to fragment shader', function (err, glsl){

      if (!err){
        assets.shaders.fragment['fragment shader id'] = glsl;
        done();
      } else {

      }

    })

  });

  */

  /*
  // loading a model (with materials)

  gathering.task(function (done, error){

    var loader = new THREE.JSONLoader();
    loader.load('path to model', function (geometry, materials){

      assets.models['model id'] = {
        geometry : geometry,
        materials : materials
      }
      function checkMaterials (){

        var loaded = true;

        materials.forEach(function (material){
          material.texturesLoading.forEach(function (texture){
            if (texture.loaded === false) loaded = false;
          })
        });

        if (!loaded){
          raf(checkMaterials); 
        } else {
          done ();
        }

      }

      checkMaterials();

    });

  });
  */

  gathering.run(function (err){

    if (!err){
      done(false, assets);
    } else {
      done(err);
    }

  });

  // load our models.
};


// some helpful utils.. 
function loadAudio (uri, callback) {

  var request = new XMLHttpRequest();
  request.open('GET', uri, true);
  request.responseType = 'arraybuffer';
  // Decode asynchronously
  request.onload = function() {
  context.decodeAudioData(request.response, callback, function(){});
  }
  request.send();
  
}

function loadShader (uri, callback) {

  var request = new XMLHttpRequest();

  request.open('GET', uri, true);
  request.responseType = 'text';

  request.onload = function() {
    callback(false, request.responseText);
  };

  request.onerror = function (){
    callback(request.statusText, "");
  };

  request.send();

}


module.exports = loadAllGameAssets;