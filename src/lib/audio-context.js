var context = false;
try {

  if (window.AudioContext = window.AudioContext || window.webkitAudioContext){
    context = new AudioContext();
  }

} catch (e){

  console.warn('Web Audio API is not supported in this browser');
  context = false;
  
}
module.exports = context;