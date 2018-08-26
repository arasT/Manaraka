'use strict'

/*Import module*/
const si = require('systeminformation');
const contrib = require('blessed-contrib');
const cpuMon_utils = require('./utils.js');

// Create table for processes list
exports.createProcessListGrid = function(grid) {
  return grid.set(0, 0, 12, 12, contrib.table,
    { keys: true,
      label: 'Processes',
      columnSpacing: 2,
      columnWidth: [6, 6, 4, 4, 10, 10, 2, 4, 4, 6, 12]});   // 11 columns
};

// Populate (and update) processes list grid
exports.populateProcessListGrid = function(processListGrid, cpuInfo) {

  // Populate table at once and get focus
  populateTable();
  processListGrid.focus();

  // Update data each 5 seconds (take too much CPU)
  setInterval(populateTable, 5000);

  // Local function to populate table
  function populateTable() {
    si.processes(function(procData){
      var title = ['PID', 'USER', 'PR', 'NI', 'VIRT', 'RES', 'S', '%CPU', '%MEM', 'TIME', 'NAME'];
      var rowList = [];

      procData.list.forEach(function(p) {
        //var adjustedCPU = (p.pcpu * cpuInfo.cores).toFixed(1);    // Adjust CPU percent
        var adjustedCPU = p.pcpu.toFixed(1);    // Adjust CPU percent
        //adjustedCPU <= 100.0 ? adjustedCPU : 100.0;
        var nice = isNaN(p.nice) ? '?' : p.nice;
        rowList.push([p.pid, p.user, p.priority, nice, p.mem_vsz, p.mem_rss, p.state.substring(0,1), adjustedCPU, p.pmem, p.started, p.name]);
      });

      // Sort by cpu (cpu usage is at column 7)
      rowList = sortProcesses(rowList, 7);

      // Update table data
      processListGrid.setData({headers:title, data:rowList});
    });
  }

  // Sorts process by specifying column index used to sort
  function sortProcesses(rowList, columnIndex) {
    for (var i=0; i<rowList.length; i++) {
      for (var j=0; j<rowList.length; j++) {
        if (rowList[j][columnIndex] < rowList[i][columnIndex]) {
          var tmp = rowList[i];
          rowList[i] = rowList[j];
          rowList[j] = tmp;
        }
      }
    }
    return rowList;
  }

};
