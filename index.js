'use strict'

/*Import module*/
const si = require('systeminformation');
const blessed = require('blessed')
  , contrib = require('blessed-contrib')
  , screen = blessed.screen();
const manaraka_cpu = require('./manaraka_modules/cpu.js');
const manaraka_memory = require('./manaraka_modules/memory.js');
const manaraka_network = require('./manaraka_modules/network.js');
const manaraka_process = require('./manaraka_modules/process.js');
const manaraka_fileSys = require('./manaraka_modules/fileSystem.js');
const manaraka_utils = require('./manaraka_modules/utils.js');


/* Global variables */
var CPUlineGrid = {};
var memoryDonutGrid = {};
var memoryLineGrid = {};
var memoryColorList = manaraka_utils.randomColorList(2);
var networkLineGrid = {};
var ressourcesHeaderGrid = {};
var processListGrid = {};
var devicesListGrid = {};
var HelpFooter = {content: 'Right-Left arrows to navigate between tabs (\'q\' or \'ctrl + c\' to quit)', top: '98%', left: '5%'};

/* First tab: CPU, RAM and Network */
function tab01(screen) {
  var grid = new contrib.grid({rows:12, cols:12, screen: screen});

  // Create line chart for CPUs
  CPUlineGrid = manaraka_cpu.createCPUlineGrid(grid);

  // Draw and update CPUs line chart
  si.cpu(function(cpuInfo){   // cpuInfo holds informations like: cores, voltage, speed,...
    manaraka_cpu.drawCPUChart(CPUlineGrid, cpuInfo);
  });

  // Create then update memory donut
  memoryDonutGrid = manaraka_memory.createMemoryDonutGrid(grid, memoryColorList);
  manaraka_memory.drawMemoryDonut(memoryDonutGrid, memoryColorList);

  // Create, draw and update memory line chart
  memoryLineGrid = manaraka_memory.createMemoryLine(grid);
  manaraka_memory.drawMemoryLine(memoryLineGrid, memoryColorList);

  // Create line chart for networks card
  networkLineGrid = manaraka_network.createNetlineGrid(grid);

  // Draw and update networks line chart for networks
  // Note: for this version, the app cannot detect network changes (interfaces changing state: up to down)
  si.networkInterfaces(function(ifaceList){
    var upIfaceList = [];       // upIfaceList holds informations about "Up" interfaces
    for (var i=0; i<ifaceList.length; i++) {
      si.networkStats(ifaceList[i].iface, function(ifaceInfo){
        if (ifaceInfo.operstate == 'up') {
          upIfaceList.push(ifaceInfo.iface);
        }

        updateNetChart(i, ifaceList.length, upIfaceList);
      });
    }

  });

  // Append instruction
  var box = blessed.box(HelpFooter);
  screen.append(box);

  // Callback after detecting all networks interfaces
  function updateNetChart(init, final, upIfaceList) {
    if (init == final) {
      manaraka_network.drawNetChart(networkLineGrid, upIfaceList);
    }
  }

}


/* Second tab: Process */
function tab02(screen) {
  var grid = new contrib.grid({rows:12, cols:12, screen: screen});

  // Create grid for processes list table
  processListGrid = manaraka_process.createProcessListGrid(grid);

  // Populate (and update) processes list table
  si.cpu(function(cpuInfo){   // cpuInfo holds informations like: cores, voltage, speed,...
    manaraka_process.populateProcessListGrid(processListGrid, cpuInfo);
  });

  // Append instruction
  var box = blessed.box(HelpFooter);
  screen.append(box);
}


/* Third tab: mounted devices */
function tab03(screen) {
  var grid = new contrib.grid({rows:12, cols:12, screen: screen});

  // Create grid for mounted devices list table
  devicesListGrid = manaraka_fileSys.createDevicesListGrid(grid);

  manaraka_fileSys.populateDevicesListGrid(devicesListGrid);

  // Append instruction
  var box = blessed.box(HelpFooter);
  screen.append(box);
}

/*Action for main screen*/

// Exit keys
screen.key(['escape', 'q', 'C-c'], function(ch, key) {
  return process.exit(0);
});

// Render screen each 1 second
setInterval(function() {
  screen.render()
}, 1000);

// Resize widget on window resized
screen.on('resize', function() {
  try {   // Error appears sometimes while navigating between tabs
    CPUlineGrid.emit('attach');
    memoryDonutGrid.emit('attach');
    memoryLineGrid.emit('attach');
    networkLineGrid.emit('attach');
    ressourcesHeaderGrid.emit('attach');
    processListGrid.emit('attach');
    devicesListGrid.emit('attach');
  } catch(e) {}
});


/* Create and Start carousel */
var carousel = new contrib.carousel( [tab01, tab02, tab03]
                                   , { screen: screen
                                     , interval: 0
                                     , controlKeys: true })
carousel.start()
