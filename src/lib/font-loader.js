var raf = require('raf');

module.exports = function checkFontHasLoaded (fontfamily, callback, timeout){

  var start = new Date().getTime();

  var p1, p2;

  function check (){

    createElements();

    if (p1.offsetWidth === p2.offsetWidth){
      if (timeout){
        if (new Date().getTime() > (start + timeout)){
          callback('timeout');
        }
      } else {
        document.body.removeChild(p1);
        document.body.removeChild(p2);
        raf(check);
      }
    } else {
      callback(false);
    }

  }

  function createElements(){

    p1 = document.createElement('p');
    p1.innerHTML = "This is a string to test";
    p1.style.fontFamily = fontfamily + ', "Comic Sans MS"';
    p1.style.display = 'inline';
    p1.style.opacity = 0.01;
    p1.style.position = 'absolute';
    document.body.appendChild(p1);

    p2 = document.createElement('p');
    p2.innerHTML = "This is a string to test";
    p2.style.fontFamily  = '"Comic Sans MS"';
    p2.style.display  = 'inline';
   p2.style.opacity = 0.01;
    p2.style.position = 'absolute';
    document.body.appendChild(p2);

  }

  check();

}