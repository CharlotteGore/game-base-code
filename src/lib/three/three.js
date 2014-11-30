var THREE = require('./three-v68.js');

// deferred renderer...

//require('./three-plugins/spe.js')(THREE);
require('./three-plugins/dynamictexture.js')(THREE);

// passes..
require('./three-plugins/plane-buffer-geometry.js')(THREE);
require('./three-plugins/bloom-pass.js')(THREE);
require('./three-plugins/shader-pass.js')(THREE);
require('./three-plugins/render-pass.js')(THREE);
require('./three-plugins/mask-pass.js')(THREE);
//require('./three-plugins/bokeh-pass.js')(THREE);
require('./three-plugins/selective-glow-pass.js')(THREE);
require('./three-plugins/scanline-shader.js')(THREE);
require('./three-plugins/invert-shader.js')(THREE);
require('./three-plugins/desaturate-shader.js')(THREE);

// fxaa shader..
//require('./three-plugins/fxaa-shader.js')(THREE);
//require('./three-plugins/bokeh2-shader.js')(THREE);

// and the effect composer
require('./three-plugins/effect-composer.js')(THREE);

module.exports = THREE;