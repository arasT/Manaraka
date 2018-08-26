'use strict'

/*Import module*/
const si = require('systeminformation');
const contrib = require('blessed-contrib');
const cpuMon_utils = require('./utils.js');


/*Exported functions*/

// Create line chart for CPUs
// => Way when using grid
exports.createCPUlineGrid = function(grid) {
  return grid.set(0, 0, 4, 12, contrib.line,
            { maxY: 125,   // must be 125 to make appear 100 in Y axis
              label: 'CPUs Graph: %',
              showLegend: true,
              legend: {width: 18}});
};

// Draw CPUs chart
var CPUDataList = [];   // Data list for each CPU
exports.drawCPUChart = function(CPUlineGrid, cpuInfo) {
  var cpuColorList = cpuMon_utils.randomColorList(cpuInfo.cores);
  var cpu_i = 1;

  // CPUDataList will be intiated only once
  //(without this condition, new CPU-ID will be added on it at each time we switch between tab)
  if (CPUDataList.length == 0) {
    for (var i=0; i<cpuInfo.cores; i++) {
      CPUDataList.push({
        title : ['CPU-', cpu_i].join(''),
        style : {line : cpuColorList[cpu_i-1]},

        // Data on x axis [0-60] and on y axis 0; we chose 60 to display 60 in axis
        x     : (function(){
          var xList=[];
          for (var i=0; i<=60; i++) {
            xList.push([i].join(''));
          }
          return xList;
        })(),
        y     : (function(){
          var yList=[];
          for (var i=0; i<=60; i++) {
            yList.push(0);
          }
          return yList;
        })()
      });

      cpu_i++;
    }
  }

  updateCPUData(CPUlineGrid);
};


/* Local functions */

// Update data each 0.5 second
function updateCPUData(CPUlineGrid) {
  setInterval(function() {

    // Only display data at interval bellow 60 seconds
    CPUDataList.forEach(function(cpuData){
      cpuData.y.shift();
    });

    // Update data
    si.currentLoad(function(data) {
      var cpu_index = 1;
      data.cpus.forEach(function(cpu){
          CPUDataList[cpu_index-1].title = ['CPU-', cpu_index, ': ', cpu.load.toFixed(2), '%'].join('');
          CPUDataList[cpu_index-1].y.push(Math.floor(cpu.load));
          cpu_index++;
      });
    });

    // Update line; Note: surround by try-catch because error ny appears when switching between Tabs
    try {
      cpuMon_utils.setLineData(CPUDataList, CPUlineGrid);
    } catch(e) {}
  }, 500);

}
