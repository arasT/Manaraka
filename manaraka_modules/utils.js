'use strict'

/*Import module*/
const contrib = require('blessed-contrib');
const x256 = require('x256');

// Returns set of color; number of color defined in params
exports.randomColorList = function (numberOfColor) {
  var colorSet = new Set();
  var colorList = [];
  var currentColor = 0;
  while(1) {
    if (colorSet.size == numberOfColor) {
      break;
    }
    currentColor = [Math.random() * 255,Math.random()*255, Math.random()*255];
    if (!colorSet.has(x256(currentColor))) {
      colorSet.add(x256(currentColor));
      colorList.push(currentColor);
    }
  }

  return colorList;
}

// function from blessed-contrib example used for line chart
exports.setLineData = function(mockData, line) {
  for (var i=0; i<mockData.length; i++) {
    var last = mockData[i].y[mockData[i].y.length-1];
    mockData[i].y.shift();
    var num = Math.max(last + Math.round(Math.random()*10) - 5, 10);
    mockData[i].y.push(num);
  }
  line.setData(mockData);
}

// Returns size in TB, GB, MB, KB, B for a given number
exports.normalizeNumber = function(number) {
  if (number > 1024 * 1024 * 1024 * 1024) {
    return [(number / (1024 * 1024 * 1024 * 1024)).toFixed(1), ' '].join('TB');
  }
  else if (number > 1024 * 1024 * 1024) {
    return [(number / (1024 * 1024 * 1024)).toFixed(1), ' '].join('GB');
  }
  else if (number > 1024 * 1024) {
    return [(number / (1024 * 1024)).toFixed(1), ' '].join('MB');
  }
  else if (number > 1024) {
    return [(number / (1024)).toFixed(1), ' '].join('KB');
  }
  else {
    return [number, ' '].join('B');
  }
};
