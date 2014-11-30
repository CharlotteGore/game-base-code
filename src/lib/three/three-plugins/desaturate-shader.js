module.exports = function (THREE){
  /**
   * @author alteredq / http://alteredqualia.com/
   *
   * Full-screen textured quad shader
   */

  THREE.DesaturateShader = {

    uniforms: {

      "tDiffuse": { type: "t", value: null }

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

        "vec4 texel = texture2D( tDiffuse, vUv );",
        "float col;",

        "col = (texel.r + texel.g + texel.b) / 3.0;",
        "gl_FragColor = vec4(col,col,col, 1);",

      "}"

    ].join("\n")

  };

};