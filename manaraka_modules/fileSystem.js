'use strict'

/*Import module*/
const si = require('systeminformation');
const contrib = require('blessed-contrib');
const cpuMon_utils = require('./utils.js');

// Create table for devices list
exports.createDevicesListGrid = function(grid) {
  return grid.set(0, 0, 12, 12, contrib.table,
    { keys: true,
      label: 'Files System',
      columnSpacing: 2,
      columnWidth: [12, 34, 8, 8, 8, 8, 8]});   // 7 columns
};

// Populate (and update) devices list grid
exports.populateDevicesListGrid = function(devicesListGrid) {

  // Populate table at once and get focus
  populateTable();
  devicesListGrid.focus();

  // Update data each 4 seconds (take too much CPU)
  setInterval(populateTable, 4000);

  // Local function to populate table
  function populateTable() {
    si.fsSize(function(devices){
      var title = ['Device', 'Folder', 'Type', 'Total', 'Free', 'Used', 'Percent'];
      var rowList = [];

      devices.forEach(function(d) {
        var free = d.size - d.used;
        rowList.push([d.fs, d.mount, d.type,
          cpuMon_utils.normalizeNumber(d.size), cpuMon_utils.normalizeNumber(free), cpuMon_utils.normalizeNumber(d.used),
          d.use.toFixed(0)]);
      });

      // Update table data
      devicesListGrid.setData({headers:title, data:rowList});
    });
  }
};
