module.exports = function (THREE){

    THREE.AdditiveCopyShader = {
        uniforms: {
          "tDiffuse":   { type: "t", value: null },
          "tGlow":   { type: "t", value: null }
        },
     
        vertexShader: [
            "varying vec2 vUv;",
     
            "void main() {",
     
                "vUv = vec2( uv.x, uv.y );",
                "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
     
            "}"
        ].join("\n"),
     
        fragmentShader: [
            "uniform sampler2D tDiffuse; ",
            "uniform sampler2D tGlow; ",
     
            "varying vec2 vUv;",
     
            "void main() {",
     
                "vec4 texel = texture2D( tDiffuse, vUv );",
                "vec4 glow = texture2D( tGlow, vUv );",
                "gl_FragColor = texel + vec4(0.5, 0.5, 0.5, 1.0) * glow * 2.0;", // Blend the two buffers together (I colorized and intensified the glow at the same time)
     
            "}"
        ].join("\n")
    };

};

