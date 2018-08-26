'use strict'

/*Import module*/
const si = require('systeminformation');
const contrib = require('blessed-contrib');
const cpuMon_utils = require('./utils.js');


/*Exported functions*/

// Create line chart for network traffic
exports.createNetlineGrid = function(grid) {
  return grid.set(8, 0, 4, 12, contrib.line,
            { //maxY: 125,   // Dynamic Y axis
              label: 'Network Graph: KB/s',
              showLegend: true,
              legend: {width: 18}});
};

var ifaceDataList = [];   // Data list for all interfaces: UP and DOWN
var ifaceDownloadList = [];   // Data list for all interfaces: Download only
var ifaceUploadList = [];     // Data list for all interfaces: Upload only

// Draw network chart
exports.drawNetChart = function(netLineGrid, ifaceNameList) {
  var netColorList = cpuMon_utils.randomColorList(ifaceNameList.length * 2);
  var downColorList = netColorList.slice(0, ifaceNameList.length);
  var upColorList = netColorList.slice(ifaceNameList.length, ifaceNameList.length * 2);

  // ifaceDataList will be intiated only once
  //(without this condition, new CPU-ID will be added on it at each time we switch between tab)
  if (ifaceDownloadList.length == 0) {
    for (var i=0; i<ifaceNameList.length; i++) {
      var ifaceTitle = '';

      // Data downloaded
      ifaceTitle = ifaceNameList[i].length > 3 ? [ifaceNameList[i].substring(0,4), '...'].join('') : ifaceNameList[i];
      ifaceDownloadList.push({
        iface : ifaceNameList[i],  // Tricks to get iface
        title : [ifaceTitle, ': DOWN'].join(''),
        style : {line : downColorList[i]},

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

      // Data uploaded
      ifaceUploadList.push({
        iface : ifaceNameList[i],  // Tricks to get iface
        title : [ifaceTitle, ': UP'].join(''),
        style : {line : upColorList[i]},

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
  }

  updateNetData(netLineGrid, ifaceNameList);
}


/* Local functions */

// Update data each 1 second
function updateNetData(netLineGrid, ifaceNameList) {
  setInterval(function() {
    ifaceDownloadList.forEach(function(iData){
      si.networkStats(iData.iface).then(ifaceData => {

        // Only display data at interval bellow 60 seconds
        iData.y.shift();

        //iData.title = ['DOWN: ', iData.iface.substring(0,4), '...'].join('');
        var downKBsec = Math.ceil(ifaceData.rx_sec / 1024);
        downKBsec = isNaN(downKBsec) ? 0 : downKBsec;
        iData.y.push(downKBsec > 0 ? downKBsec : 0);
      });
    });

    ifaceUploadList.forEach(function(iData){
      si.networkStats(iData.iface).then(ifaceData => {

        // Only display data at interval bellow 60 seconds
        iData.y.shift();

        //iData.title = ['UP: ', iData.iface.substring(0,4), '...'].join('');
        var upKBsec = Math.ceil(ifaceData.tx_sec / 1024);
        iData.y.push(upKBsec > 0 ? upKBsec : 0);
      });
    });

    // Put data for down and up into one array
    ifaceDataList = ifaceDownloadList.concat(ifaceUploadList);
    try {
      cpuMon_utils.setLineData(ifaceDataList, netLineGrid);
    } catch(e){};

  }, 1000);

}
