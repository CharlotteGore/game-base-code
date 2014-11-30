var THREE = require('../../lib/three/three.js');
var config = require('../../config.js');
  
var uniforms = {

  color: {
    type: "c",
    value: new THREE.Color(0xffffff)
  },
  texture: {
    type: "t",
    value: THREE.ImageUtils.loadTexture("/images/hexapart.png")
  }

};

var attributes = {

  size: {
    type: 'f',
    value: null
  },
  customColor: {
    type: 'c',
    value: null
  },
  active : {
    type: 'f',
    value : null
  }

};

var shaderMaterial = new THREE.ShaderMaterial({

  uniforms: uniforms,
  attributes: attributes,
  vertexShader: [
    'attribute vec3 customColor;',
    'attribute float size;',
    'attribute float active;',

    'varying vec3 vColor;',
    'varying float toDrop;',

    'void main() {',

      'toDrop = active;',

      'vColor = customColor;',

      'vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );',

      'vec4 glPosition = projectionMatrix * mvPosition;',

      'gl_PointSize = size * ((glPosition.w * 0.0025) + .5);',

      'gl_Position = glPosition;',


    '}'
  ].join('\n'),
  fragmentShader: [
    'uniform vec3 color;',
    'uniform sampler2D texture;',
    'varying float toDrop;',

    'varying vec3 vColor;',

    'void main() {',

      'if (toDrop > 0.) discard;',

      'gl_FragColor = vec4( color * vColor, 1.0 );',
      'gl_FragColor = gl_FragColor * texture2D( texture, gl_PointCoord );',

    '}'
  ].join('\n'),
  blending: THREE.AdditiveBlending,
  depthTest: false,
  transparent: true

});

module.exports = shaderMaterial;