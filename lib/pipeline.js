var THREE = require('./three/three.js');

var depthMaterial = new THREE.MeshDepthMaterial;

var textureParams = { 
  minFilter: THREE.LinearFilter, 
  magFilter: THREE.LinearFilter, 
  format: THREE.RGBFormat 
};

function Pipeline (renderer, scene, camera){

  this.renderer = renderer;

  this.renderer.autoClear = false;

  this.width = renderer.context.canvas.clientWidth;
  this.height = renderer.context.canvas.clientHeight;

  this.scene = scene;
  this.camera = camera;

  this.passes = {};
  this.textures = {};

  this
    .prepare()
    .compose();

  return this;

};

Pipeline.prototype = {

  render : function (){

    if (this.passes.bokeh.enabled = true){

      this.passes.bokeh.uniforms[ 'znear' ].value = this.camera.near;
      this.passes.bokeh.uniforms[ 'zfar' ].value = this.camera.far;

    }

    this.renderer.clear();

    this.scene.overrideMaterial = depthMaterial;
    this.renderer.render( this.scene, this.camera, this.textures.depth, true );
    this.scene.overrideMaterial = null;

    this.composer.render();

    return this;

  },

  prepare : function (){

    this.textures.depth = new THREE.WebGLRenderTarget( this.width, this.height, textureParams );

    return this;

  },

  compose : function (){

    var render, copy, composer;

    this.composer = composer = new THREE.EffectComposer( this.renderer );
    
    // exposed passes...
    this.passes.bloom = new THREE.BloomPass();
    this.passes.bokeh = new THREE.BokehPass( this.textures.depth );
    this.passes.fxaa = new THREE.ShaderPass( THREE.FXAAShader );

    // built in passes...
    render = new THREE.RenderPass( this.scene, this.camera );
    copy = new THREE.ShaderPass( THREE.CopyShader );
    copy.renderToScreen = true;

    composer.addPass( render );
    composer.addPass( this.passes.bokeh );
    composer.addPass( this.passes.bloom );
    composer.addPass( this.passes.fxaa );
    composer.addPass( copy );

    this.passes.fxaa.uniforms["resolution"].value.set( 1 / this.width, 1 / this.height );
    this.passes.bokeh.uniforms[ "textureWidth" ].value = this.width;
    this.passes.bokeh.uniforms[ "textureHeight" ].value = this.height;

    return this;

  },
  // call this after resizing the renderer... 
  resize : function (){

    this.width = this.renderer.context.canvas.clientWidth;
    this.height = this.renderer.context.canvas.clientHeight;

    this.textures.depth = new THREE.WebGLRenderTarget ( this.width, this.height, textureParams );

    this.passes.bokey.uniforms["tDepth"].value = this.textures.depth;
    this.passes.fxaa.uniforms["resolution"].value.set( 1 / this.width, 1 / this.height );
    this.passes.bokeh.uniforms["textureWidth"].value = this.width;
    this.passes.bokeh.uniforms["textureHeight"].value = this.height;

    return this;

  },
  // to enable a particular pass... 
  enable : function (pass){

    if (this.passes[pass]){
      this.passes[pass].enabled = true;
    }

    return this;

  },
  // to disable a particular pass..
  disable : function (pass){

    if (this.passes[pass]){
      this.passes[pass].enabled = false;
    }

    return this;

  },
  // to set the value of uniforms.. 
  setPassUniforms : function (pass, params){

    for (var i in params){
      if (params.hasOwnProperty(i)){
        if (this.passes[pass].uniforms[i]){
          this.passes[pass].uniforms[i].value = params[i];
        }
      }
    }
    return this;
  }
};

module.exports = Pipeline;