module.exports = function (THREE){

  require('./additive-copy-shader.js')(THREE);

  THREE.SelectiveGlowPass = function ( glowTexture ) {

    var shader = THREE.AdditiveCopyShader;

    this.uniforms = THREE.UniformsUtils.clone( shader.uniforms );

    this.material = new THREE.ShaderMaterial({

      uniforms: this.uniforms,
      vertexShader: shader.vertexShader,
      fragmentShader: shader.fragmentShader

    });

    this.uniforms['tGlow'].value = glowTexture;

    this.renderToScreen = false;

    this.enabled = true;
    this.needsSwap = true;
    this.clear = false;

    this.camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
    this.scene  = new THREE.Scene();

    this.quad = new THREE.Mesh( new THREE.PlaneGeometry( 2, 2 ), null );
    this.scene.add( this.quad );

  };

  THREE.SelectiveGlowPass.prototype = {

    render: function ( renderer, writeBuffer, readBuffer, delta ) {

      this.uniforms['tDiffuse'].value = readBuffer;

      this.quad.material = this.material;

      if ( this.renderToScreen ) {

        renderer.render( this.scene, this.camera );

      } else {

        renderer.render( this.scene, this.camera, writeBuffer, this.clear );

      }

    }

  };

};