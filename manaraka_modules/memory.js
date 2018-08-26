'use strict'

/*Import module*/
const si = require('systeminformation');
const contrib = require('blessed-contrib');
const cpuMon_utils = require('./utils.js');


/*Exported functions*/

// Create donut chart for RAM and SWAP
exports.createMemoryDonutGrid = function(grid, colorList) {
  return grid.set(4, 0, 4, 4, contrib.donut,
    {label: 'Memory Usage: GB',
    radius: 7,
  	arcWidth: 2,
  	yPadding: 4,
    data: [
      {percent: 0, label: 'RAM [0 GB]', color: colorList[0]},
      {percent: 0, label: 'SWAP [0 GB]', color: colorList[1]}
    ]});
}

// Update donut chart every 0.5 second
exports.drawMemoryDonut = function(memDonutGrid, colorList) {
  setInterval(function(){
    si.mem(function(memData){

      // Note: memory "used" field in the package documentation doesn't give the right info
      var ramUsedPercent = ((memData.total - memData.available)/memData.total)*100;

      // Note: memory "swaptotal" field in the package documentation gives NaN
      var swapTotal = memData.swapused + memData.swapfree;
      var swapUsedPercent = ((swapTotal - memData.swapused)/swapTotal)*100;
      swapUsedPercent = isNaN(swapUsedPercent) ? 0.0 : swapUsedPercent;

      var ramUsedInGB = ((memData.total - memData.available) / (1024*1024*1024)).toFixed(1);
      var swapUsedInGB = ((swapTotal - memData.swapused) / (1024*1024*1024)).toFixed(1);

      memDonutGrid.update([
        {percent: ramUsedPercent.toFixed(0), label: ['RAM [', ramUsedInGB,']'].join(''), color: colorList[0]},
        {percent: swapUsedPercent.toFixed(0), label: ['SWAP [', swapUsedInGB,']'].join(''), color: colorList[1]}
      ])
    });
  }, 1000);
}

// Create line chart for memory
exports.createMemoryLine = function(grid) {
  return grid.set(4, 4, 4, 8, contrib.line,
            { maxY: 125,   // must be 125 to make appear 100 in Y axis
              label: 'Memory Graph: %',
              showLegend: true,
              legend: {width: 18}});
};

// Draw Memory line chart
var memoryDataList = [];   // Data list for each CPU
exports.drawMemoryLine = function(memoryLineGrid, colorList) {
  si.mem(function(memData) {

    // memoryDataList will be intiated only once
    if (memoryDataList.length == 0) {

      // RAM data
      memoryDataList.push({
        title : 'RAM: ',
        style : {line : colorList[0]},

        // Data on x axis [0-65] and on y axis 0; we chose 65 to display 60 in axis
        x     : (function(){
          var xList=[];
          for (var i=0; i<=65; i++) {
            xList.push([i].join(''));
          }
          return xList;
        })(),
        y     : (function(){
          var yList=[];
          for (var i=0; i<=65; i++) {
            yList.push(0);
          }
          return yList;
        })()
      });

      // SWAP data
      memoryDataList.push({
        title : 'SWAP: ',
        style : {line : colorList[1]},

        // Data on x axis [0-65] and on y axis 0; we chose 65 to display 60 in axis
        x     : (function(){
          var xList=[];
          for (var i=0; i<=65; i++) {
            xList.push([i].join(''));
          }
          return xList;
        })(),
        y     : (function(){
          var yList=[];
          for (var i=0; i<=65; i++) {
            yList.push(0);
          }
          return yList;
        })()
      });
    }

    updateMemoryData(memoryLineGrid);
  });

}


/* Local functions */

// Update data each 0.5 second
function updateMemoryData(memoryLineGrid) {
  setInterval(function() {

    // Only display data at interval bellow 65 seconds
    memoryDataList.forEach(function(memoryData){
      memoryData.y.shift();
    });

    // Update data
    si.mem(function(memData) {

      // Note: To understand the calculation bellow, please refer to the note into drawMemoryDonut() function
      var ramUsedPercent = ((memData.total - memData.available)/memData.total)*100;
      var swapTotal = memData.swapused + memData.swapfree;
      var swapUsedPercent = ((swapTotal - memData.swapused)/swapTotal)*100;

      memoryDataList[0].title = ['RAM: ', ramUsedPercent.toFixed(2), '%'].join('');
      memoryDataList[0].y.push(Math.floor(ramUsedPercent));
      memoryDataList[1].title = ['SWAP: ', swapUsedPercent.toFixed(2), '%'].join('');
      memoryDataList[1].y.push(Math.floor(swapUsedPercent));
    });

    // Update line; Note: surround by try-catch because error ny appears when switching between Tabs
    try {
      cpuMon_utils.setLineData(memoryDataList, memoryLineGrid);
    } catch(e) {}
  }, 1000);

}
