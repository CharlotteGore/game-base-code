var codes = {
  tab : false,
  up : false, // 38
  down : false, // 40
  left : false, // 37
  right : false, // 39
  lclick : false, // 1
  rclick : false, // 3
  mclick : false, // 2
  esc : false, // 27
  space : false, // 32,
  buffer : [],
  ctrl : false
};

var keytests = {
  9 : function (val){ codes.tab = val; },
  27 : function (val){ codes.esc = val; },
  32 : function (val){ codes.space = val; },
  37 : function (val){ codes.left = val; },
  39 : function (val){ codes.right = val; },
  38 : function (val){ codes.up = val; },
  40 : function (val){ codes.down = val; },
  17 : function (val){ codes.ctrl = val; }
};

var mousetests = {
  1 : function (val){ codes.lclick = val; },
  3 : function (val){ codes.rclick = val; },
  2 : function (val){ codes.mclick = val; },
};

function processKeyDown (e){
  if (keytests[e.keyCode]) {
    keytests[e.keyCode](true);
    if (e.keyCode === 9){
      e.preventDefault();
    }
    return false;
  }

}

function processKeyUp (e){
  if (keytests[e.keyCode]){ 
    keytests[e.keyCode](false);
    return false;
  } else {
    //codes.buffer.push(e.keyCode);
  }
}

function processMouseDown (e){
  if (mousetests[e.which]) mousetests[e.which](true);
}

function processMouseUp (e){
  if (mousetests[e.which]) mousetests[e.which](false);
}

window.addEventListener('keydown', processKeyDown, false);
window.addEventListener('keyup', processKeyUp, false);
window.addEventListener('mousedown', processMouseDown, false);
window.addEventListener('mouseup', processMouseUp, false);

module.exports = codes;