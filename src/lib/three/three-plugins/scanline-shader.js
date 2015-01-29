module.exports = function (THREE){
  /**
   * @author alteredq / http://alteredqualia.com/
   *
   * Full-screen textured quad shader
   */

  THREE.ScanlineShader = {

    uniforms: {

      "tDiffuse": { type: "t", value: null },

    },

    vertexShader: [

      "varying vec2 vUv;",

      "void main() {",

        "vUv = uv;",
        "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

      "}"

    ].join("\n"),

    fragmentShader: [

      "uniform sampler2D tDiffuse;",

      "varying vec2 vUv;",

      "void main() {",

        "vec2 p = (gl_FragCoord.xy);",

        "float dProd = 1.0;",

        "if (mod( p.y, 4.0 ) > 2. )",
        "dProd *= 0.8;",

        //"if (mod( p.x, 4.0 ) > 2. )",
        //"dProd *= 0.3;",

        "vec4 texel = texture2D( tDiffuse, vUv );",
        "gl_FragColor = texel * dProd;",

      "}"

    ].join("\n")

  };

};