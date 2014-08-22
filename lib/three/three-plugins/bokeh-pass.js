module.exports = function (THREE){
  /**
   * @author alteredq / http://alteredqualia.com/
   */

  require('./bokeh2-shader.js')(THREE);

  var shaderSettings = {
    rings: 3,
    samples: 4
  };

  THREE.BokehPass = function ( depthBuffer, parameters ) {

    if (!parameters){
      parameters = {};
    }

    var bokehShader = THREE.BokehShader;

    var rings = (parameters.rings ? parameters.rings : 3);
    var samples = (parameters.samples ? parameters.samples: 4);

    this.uniforms = THREE.UniformsUtils.clone( bokehShader.uniforms );

    this.material = new THREE.ShaderMaterial({

      uniforms: this.uniforms,
      vertexShader: bokehShader.vertexShader,
      fragmentShader: bokehShader.fragmentShader,
      defines : {
        RINGS : rings,
        SAMPLES : samples
      }

    });

    this.renderToScreen = false;

    this.enabled = true;
    this.needsSwap = true;
    this.clear = false;

    this.uniforms["tDepth"].value = depthBuffer;

    this.camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
    this.scene  = new THREE.Scene();

    this.quad = new THREE.Mesh( new THREE.PlaneGeometry( 2, 2 ), null );
    this.scene.add( this.quad );

  };

  THREE.BokehPass.prototype = {

    render: function ( renderer, writeBuffer, readBuffer, delta ) {

      this.uniforms["tColor"].value = readBuffer;

      this.quad.material = this.material;

      if ( this.renderToScreen ) {

        renderer.render( this.scene, this.camera );

      } else {

        renderer.render( this.scene, this.camera, writeBuffer );

      }

    }

  };

};