var THREE = require('./three-v68.js');

// deferred renderer...
require('./three-plugins/binary-loader.js')(THREE);
require('./three-plugins/webgl-deferred-renderer.js')(THREE);

// passes..
require('./three-plugins/bloom-pass.js')(THREE);
require('./three-plugins/shader-pass.js')(THREE);
require('./three-plugins/render-pass.js')(THREE);
require('./three-plugins/mask-pass.js')(THREE);
require('./three-plugins/bokeh-pass.js')(THREE);

// fxaa shader..
require('./three-plugins/fxaa-shader.js')(THREE);
//require('./three-plugins/bokeh2-shader.js')(THREE);

// and the effect composer
require('./three-plugins/effect-composer.js')(THREE);

module.exports = THREE;