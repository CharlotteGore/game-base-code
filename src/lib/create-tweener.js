function createTweener (start, end){
  var changeInValue = end - start;
  return function (currentTime){
    return changeInValue * currentTime + start;
  }
}

module.exports = createTweener;