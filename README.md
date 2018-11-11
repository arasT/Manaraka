manaraka
=========

A System Monitor like into command line.
Please check the [ManarakaWUI](https://github.com/arasT/ManarakaWUI) if you want to use an web interface instead the command line.

Screenshots
---
<img src="./screenshoots/manaraka_graphs.png" alt="Ressources graph" width="800">
<img src="./screenshoots/manaraka_processes.png" alt="Processes" width="800">
<img src="./screenshoots/Manaraka_filesSystem.png" alt="Files System" width="800">

How to install
---

This app is based on [Node.js](http://nodejs.org/).
It uses:
* [blessed-contrib](https://github.com/yaronn/blessed-contrib) to draw graph.
* [systeminformation](https://github.com/sebhildebrandt/systeminformation) to get informations about: CPU, RAM, SWAP, Networks, Processes, Mounted files system.

Clone or Download this repository.
```
git clone https://github.com/arasT/Manaraka
```
Extract the archive and move into it.
```
cd manaraka
```
Install all node modules
```
npm install
```

Run the app
---

Just launch one of the commands bellow.

```
npm start
```
Or
```
node .
```

Keyboard shortcuts
---

* 'Arrow Left' or 'Arrow Right' to switch between tabs.
* 'q' or 'ctrl + c' to quit the app.

License
----

The MIT License.
Further details see LICENSE file.

Miscellanous
----
* Work on Windows but not recommanded. Blessed-Contrib [pre requisites](http://webservices20.blogspot.com/2015/04/running-terminal-dashboards-on-windows.html) for Windows, or use [ConEmu](https://conemu.github.io/).
* For Linux based system, 'ifconfig' may be necessary.

Contributing
----

Please fork if you want to contribut to this project.
