<div align="center">

# LogiOpt

**Smart Logistics Optimization — Interactive Algorithm Visualizer**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-00d4ff?style=for-the-badge&logo=github)](https://YOUR_USERNAME.github.io/logiopt/)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Leaflet](https://img.shields.io/badge/Leaflet.js-199900?style=for-the-badge&logo=leaflet&logoColor=white)

A fully interactive, browser-based visualization engine covering **5 core algorithm paradigms** applied to real-world logistics scenarios — built with vanilla HTML, CSS, and JavaScript. No frameworks, no build tools, just open and run.

</div>

---

## Live Demo

> 🔗 **[logiopt.github.io/logiopt](https://theomatrix.github.io/logiopt-adi/)**  


---

## Overview

LogiOpt demonstrates how classic computer science algorithms solve real logistics problems — package routing, vehicle scheduling, warehouse placement, and delivery optimization. Every algorithm runs live in the browser with step-by-step terminal logs, animated visualizations, and complexity breakdowns.

---

## Modules

### 01 — Sorting
> *Prioritizing delivery queues*

| Algorithm | Strategy | Complexity |
|-----------|----------|------------|
| **Merge Sort** | Sort packages by deadline (EDF) | O(n log n) |
| **Quick Sort** | Sort packages by priority (descending) | O(n log n) avg |
| **Heap Sort** | Dynamic priority queue simulation | O(n log n) |

- Live bar chart animation showing each comparison/swap
- Step-by-step walkthrough with pseudocode
- Performance benchmark across n = 100 → 2000 packages

---

### 02 — Graph Routing
> *Finding optimal delivery routes across NYC*

Nodes represent real NYC landmarks (Times Square, Central Park, etc.) plotted on an interactive **Leaflet.js** map with real geographic distances (km) as edge weights.

| Algorithm | Use Case | Complexity |
|-----------|----------|------------|
| **Dijkstra** | Fastest route from source to destination | O((V+E) log V) |
| **Bellman-Ford** | Shortest path with edge relaxation | O(V·E) |
| **Kruskal MST** | Minimum cost delivery network | O(E log E) |

**Features:**
- 🗺️ Dark-mode Carto tile map
- 🔵 Animated node-by-node path reveal (not instant flash)
- 🟡 Visited nodes turn yellow during exploration, cyan/green on final path
- 💻 **Terminal log** — streams every `settle node`, `relax [u→v]`, and `add edge` decision with timestamps in real time
- 📍 Auto de-overlapping of nodes that share close geographic coordinates

---

### 03 — Greedy Algorithms
> *Maximizing delivery value under constraints*

| Algorithm | Problem Solved |
|-----------|---------------|
| **Activity Selection** | Max non-overlapping deliveries by deadline |
| **Fractional Knapsack** | Max value loaded into a vehicle (by value/weight ratio) |
| **Job Scheduling** | Schedule packages into time slots to maximize total value |

- Package cards highlight selected (green) vs rejected (red/faded)
- Step-by-step decision log for every selection/rejection
- Bar chart: Selected count, Rejected count, Total Value

---

### 04 — Dynamic Programming
> *Optimal loading vs. greedy loading*

**0/1 Knapsack DP**
- Builds the full DP table visually (rows = packages, cols = capacity)
- Backtracks to highlight which packages made it into the optimal load
- Comparison bar chart: DP optimal value vs. greedy approximation

**Floyd-Warshall All-Pairs Shortest Path**
- Generates a random distance matrix
- Computes shortest paths between every pair of nodes
- Renders the full distance matrix with ∞ for unreachable pairs

---

### 05 — Divide & Conquer
> *Splitting logistics networks efficiently*

**Closest Pair of Warehouses**
- Plots up to 30 warehouse points on a canvas
- Runs the O(n log n) divide-and-conquer closest-pair algorithm
- Highlights the closest pair with a dashed green line

**Zone Division**
- Divides a delivery map into configurable zones (2–6)
- Assigns each delivery node to its zone by coordinate

**Scalability Benchmark**
- Runs Merge Sort, Quick Sort, Heap Sort across n = 100 → 5000
- Live line chart showing actual millisecond timing per algorithm
- Grid of benchmark cards with fast/slow color coding

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Structure | HTML5 (semantic) |
| Styling | Vanilla CSS (custom properties, grid, animations) |
| Logic | Vanilla JavaScript (ES6+, no frameworks) |
| Maps | [Leaflet.js](https://leafletjs.com/) v1.9.4 |
| Map Tiles | [CARTO Dark Matter](https://carto.com/basemaps/) |
| Fonts | [Space Mono](https://fonts.google.com/specimen/Space+Mono) + [Syne](https://fonts.google.com/specimen/Syne) (Google Fonts) |
| Hosting | GitHub Pages |

---

## Project Structure

```
logiopt/
├── index.html      # Main HTML — all 5 module panels
├── script.js       # All algorithm logic + visualizations
├── style.css       # Dark-mode design system + component styles
└── README.md       # This file
```

All logic lives in three flat files — no bundlers, no dependencies to install, no `node_modules`.

---

## Running Locally

Just open `index.html` in any modern browser:

```bash
# Clone
git clone https://github.com/YOUR_USERNAME/logiopt.git
cd logiopt

# Open (Linux)
xdg-open index.html

# Open (macOS)
open index.html
```

Or use VS Code's **Live Server** extension for auto-reload on save.

> Requires an internet connection for Google Fonts and Leaflet CDN assets. All algorithm logic runs fully offline.

---

## Algorithm Complexity Reference

| Algorithm | Time | Space | Stable? |
|-----------|------|-------|---------|
| Merge Sort | O(n log n) | O(n) | ✅ Yes |
| Quick Sort | O(n log n) avg / O(n²) worst | O(log n) | ❌ No |
| Heap Sort | O(n log n) | O(1) | ❌ No |
| Dijkstra | O((V+E) log V) | O(V) | — |
| Bellman-Ford | O(V·E) | O(V) | — |
| Kruskal MST | O(E log E) | O(V) | — |
| Floyd-Warshall | O(V³) | O(V²) | — |
| 0/1 Knapsack DP | O(n·W) | O(n·W) | — |
| Closest Pair D&C | O(n log n) | O(n) | — |

---

## Key Design Decisions

**No frameworks** — Every module is implemented from scratch in vanilla JS to keep the focus on the algorithms, not the tooling.

**Real geography** — Graph nodes use actual NYC landmark coordinates. Edge weights are computed using the Haversine formula for real great-circle distances in km.

**Terminal log instead of explainers** — The sidebar shows a streaming, timestamped execution log (like a debugger output) rather than static text descriptions — so you see the algorithm *deciding*, not just a summary.

**Animated reveal, not instant flash** — Graph path animations build up one node at a time (280ms/step) synchronized with the terminal log, so you can watch the algorithm explore the graph.

---

## Screenshots

> Add screenshots here after deployment.

---

## License

MIT — free to use, fork, and build on.

---

<div align="center">

Built as part of **Project AXON** — a logistics optimization research platform.

</div>
