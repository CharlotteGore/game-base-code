var THREE = require('./three/three.js');

var depthMaterial = new THREE.MeshDepthMaterial();
//depthMaterial.morphTargets = true;
//depthMaterial.index0AttributeName = "position";

window.depthMaterial = depthMaterial;

var textureParams = { 
  minFilter: THREE.LinearFilter, 
  magFilter: THREE.LinearFilter, 
  format: THREE.RGBFormat 
};

function Pipeline (renderer, scene, camera, glowScene, width, height){

  this.renderer = renderer;

  this.renderer.autoClear = false;

  this.width = width;
  this.height = height;

  this.scene = scene;
  this.camera = camera;

  this.glowScene = glowScene;

  this.passes = {};
  this.textures = {};

  this
    .prepare()
    .compose();

  return this;

};

Pipeline.prototype = {

  render : function (postProcessing){

    if (postProcessing){

      this.renderer.clear();
      this.glowComposer.render()
      this.passes.glow.uniforms['tGlow'].value = this.glowComposer.readBuffer;
      this.composer.render();

    } else {
      this.renderer.render(this.scene, this.camera);
    }

    return this;

  },

  prepare : function (){

    this.textures.glow  = new THREE.WebGLRenderTarget( this.width, this.height, textureParams );
    return this;

  },

  compose : function (){

    var render, copy, composer, glowComposer, glowRender, copyGlow, mono;

    this.glowComposer = glowComposer = new THREE.EffectComposer( this.renderer, this.textures.glow );

    this.composer = composer = new THREE.EffectComposer( this.renderer );
    

    // exposed passes...
    this.passes.bloom = new THREE.BloomPass(1, 12.5, 2.0, 512);
    this.passes.bloom2 = new THREE.BloomPass(1, 11, 1.5, 512);

    // built in passes...
    render = new THREE.RenderPass( this.scene, this.camera );
    glowRender = new THREE.RenderPass( this.glowScene, this.camera );
    glowRender.clear = true;


    copy = new THREE.ShaderPass( THREE.CopyShader );
    copy.renderToScreen = true;

    this.passes.scan = new THREE.ShaderPass( THREE.ScanlineShader );

    this.passes.invert = new THREE.ShaderPass( THREE.InvertShader );
    this.passes.invert.renderToScreen = false;

    this.passes.desat = new THREE.ShaderPass( THREE.DesaturateShader );
    this.passes.desat.renderToScreen = false;


    this.passes.glow = new THREE.SelectiveGlowPass( this.textures.glow );

    glowComposer.addPass( glowRender );
    glowComposer.addPass( this.passes.bloom );
    composer.addPass( render );
    composer.addPass( this.passes.glow );

    
    composer.addPass( this.passes.bloom2 );
    composer.addPass( this.passes.invert);
    composer.addPass( this.passes.scan);
    composer.addPass( this.passes.desat);
    composer.addPass( copy );

    this.passes.scan.enabled = true;
    this.passes.invert.enabled = false;
    this.passes.desat.enabled = false;

    //this.passes.bloom2.enabled = false;

    return this;

  },
  // call this after resizing the renderer... 
  resize : function (width, height){

    this.width = width;
    this.height = height;

    this.passes.bokeh.uniforms["width"].value = this.width;
    this.passes.bokeh.uniforms["height"].value = this.height;

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