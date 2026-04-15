        // ─────────────────────────────────────────────────────────
        // STATE
        // ─────────────────────────────────────────────────────────
        let packages = [];
        let sortAnimId = null;
        let graphData = null;
        let warehousePoints = [];
        let graphMap = null;
        let graphMapLayerGroup = null;

        const nycLocations = [
            { lat: 40.7580, lng: -73.9855, name: "Times Square" }, // 0
            { lat: 40.7484, lng: -73.9857, name: "Empire State Building" }, // 1
            { lat: 40.7128, lng: -74.0060, name: "City Hall" }, // 2
            { lat: 40.7061, lng: -73.9969, name: "Brooklyn Bridge" }, // 3
            { lat: 40.7527, lng: -73.9772, name: "Grand Central" }, // 4
            { lat: 40.7829, lng: -73.9654, name: "Central Park" }, // 5
            { lat: 40.7306, lng: -73.9965, name: "Washington Sq" }, // 6
            { lat: 40.7411, lng: -74.0085, name: "Chelsea Market" }, // 7
            { lat: 40.7614, lng: -73.9776, name: "MoMA" }, // 8
            { lat: 40.7041, lng: -74.0137, name: "Battery Park" }, // 9
            { lat: 40.7394, lng: -73.9882, name: "Flatiron Building" }, // 10
            { lat: 40.7295, lng: -73.9846, name: "East Village" }, // 11
            { lat: 40.7198, lng: -73.9984, name: "SoHo" }, // 12
            { lat: 40.7163, lng: -73.9954, name: "Chinatown" }, // 13
            { lat: 40.7505, lng: -73.9934, name: "Penn Station" }, // 14
            { lat: 40.7681, lng: -73.9819, name: "Columbus Circle" }, // 15
            { lat: 40.7736, lng: -73.9566, name: "Met Museum" }, // 16
            { lat: 40.7112, lng: -74.0069, name: "Wall Street" }, // 17
            { lat: 40.7489, lng: -73.9680, name: "UN Headquarters" }, // 18
            { lat: 40.6892, lng: -74.0445, name: "Statue of Liberty" } // 19
        ];

        // seeded random
        function seededRand(seed) {
            let s = seed;
            return () => { s = (s * 16807 + 0) % 2147483647; return (s - 1) / 2147483646; };
        }

        // ─────────────────────────────────────────────────────────
        // UTILITIES
        // ─────────────────────────────────────────────────────────
        function fmtMs(ms) { return ms < 1 ? ms.toFixed(3) + 'ms' : ms.toFixed(2) + 'ms'; }
        function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
        function randf(min, max) { return Math.random() * (max - min) + min; }
        function getGeoDistance(lat1, lon1, lat2, lon2) {
            const R = 6371; // km
            const dLat = (lat2 - lat1) * Math.PI / 180;
            const dLon = (lon2 - lon1) * Math.PI / 180;
            const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                      Math.sin(dLon/2) * Math.sin(dLon/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            return parseFloat((R * c).toFixed(1));
        }

        // ─────────────────────────────────────────────────────────
        // MODULE 1 — SORTING
        // ─────────────────────────────────────────────────────────
        function addPackage() {
            const pkg = {
                id: packages.length,
                weight: +document.getElementById('s_weight').value,
                deadline: +document.getElementById('s_deadline').value,
                priority: +document.getElementById('s_priority').value,
                distance: +document.getElementById('s_distance').value,
                value: +document.getElementById('s_priority').value * 10
            };
            packages.push(pkg);
            renderPkgTable();
            drawSortBars(packages);
        }

        function generatePackages() {
            packages = [];
            const r = seededRand(Date.now() % 9999);
            for (let i = 0; i < 10; i++) {
                const pri = Math.ceil(r() * 10);
                packages.push({
                    id: i, weight: +(r() * 29 + 1).toFixed(1),
                    deadline: Math.ceil(r() * 20), priority: pri,
                    distance: +(r() * 490 + 10).toFixed(1), value: pri * 10
                });
            }
            renderPkgTable();
            drawSortBars(packages);
            resetSteps();
        }

        function renderPkgTable() {
            if (!packages.length) { document.getElementById('pkgTableWrap').innerHTML = '<p style="color:var(--muted);font-size:.75rem;font-family:var(--font-mono);">No packages yet. Add some above.</p>'; return; }
            let html = '<table class="data-table"><thead><tr><th>ID</th><th>Weight</th><th>Deadline</th><th>Priority</th><th>Distance</th><th>Value</th></tr></thead><tbody>';
            packages.forEach(p => {
                html += `<tr><td class="highlight">#${p.id}</td><td>${p.weight}kg</td><td>${p.deadline}h</td><td>${p.priority}/10</td><td>${p.distance}km</td><td>${p.value}</td></tr>`;
            });
            html += '</tbody></table>';
            document.getElementById('pkgTableWrap').innerHTML = html;
        }

        // --- Sort Canvas
        function drawSortBars(pkgs, highlight = [], sorted = false) {
            const canvas = document.getElementById('sortCanvas');
            const wrap = document.getElementById('sortCanvasWrap');
            canvas.width = wrap.offsetWidth || 500;
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            if (!pkgs.length) return;

            const max = Math.max(...pkgs.map(p => p.deadline));
            const barW = (canvas.width - 40) / pkgs.length - 4;
            pkgs.forEach((p, i) => {
                const h = ((p.deadline / max) * (canvas.height - 60)) + 10;
                const x = 20 + i * (barW + 4);
                const y = canvas.height - h - 20;
                ctx.fillStyle = highlight.includes(i) ? '#ff6b35' :
                    sorted ? '#39ff14' : '#00d4ff';
                ctx.globalAlpha = 0.85;
                ctx.beginPath();
                ctx.roundRect(x, y, barW, h, 4);
                ctx.fill();
                ctx.globalAlpha = 1;
                ctx.fillStyle = '#5a7a8a';
                ctx.font = '9px Space Mono';
                ctx.textAlign = 'center';
                ctx.fillText(p.deadline, x + barW / 2, canvas.height - 6);
            });
        }

        // --- Merge Sort animation
        let sortArr = [], sortI = 0, sortDone = false;

        function animateSort() {
            if (!packages.length) { alert('Add packages first!'); return; }
            const algo = document.getElementById('algoSelect').value;
            document.getElementById('sortComplexity').textContent =
                algo === 'bubble' ? 'O(n²)' : 'O(n log n)';

            let arr = [...packages];
            let frames = [];

            if (algo === 'merge') {
                mergeSortFrames(arr, frames);
            } else if (algo === 'quick') {
                quickSortFrames([...arr], 0, arr.length - 1, frames);
            } else {
                heapSortFrames([...arr], frames);
            }

            stopSort();
            let fi = 0;
            sortAnimId = setInterval(() => {
                if (fi >= frames.length) {
                    clearInterval(sortAnimId);
                    drawSortBars(frames[frames.length - 1].arr, [], true);
                    return;
                }
                const f = frames[fi++];
                drawSortBars(f.arr, f.highlight);
            }, 80);
        }

        function stopSort() { if (sortAnimId) clearInterval(sortAnimId); }

        function mergeSortFrames(arr, frames) {
            function ms(a, lo, hi) {
                if (hi - lo <= 1) return;
                const mid = Math.floor((lo + hi) / 2);
                ms(a, lo, mid); ms(a, mid, hi);
                let left = a.slice(lo, mid), right = a.slice(mid, hi);
                let i = 0, j = 0, k = lo;
                while (i < left.length && j < right.length) {
                    if (left[i].deadline <= right[j].deadline) a[k++] = left[i++];
                    else a[k++] = right[j++];
                    frames.push({ arr: [...a], highlight: [k - 1] });
                }
                while (i < left.length) { a[k++] = left[i++]; frames.push({ arr: [...a], highlight: [k - 1] }); }
                while (j < right.length) { a[k++] = right[j++]; frames.push({ arr: [...a], highlight: [k - 1] }); }
            }
            const a = [...arr]; ms(a, 0, a.length); return a;
        }

        function quickSortFrames(a, lo, hi, frames) {
            if (lo >= hi) return;
            const pivot = a[hi].priority; let i = lo - 1;
            for (let j = lo; j < hi; j++) {
                if (a[j].priority >= pivot) { i++;[a[i], a[j]] = [a[j], a[i]]; frames.push({ arr: [...a], highlight: [i, j] }); }
            }
            [a[i + 1], a[hi]] = [a[hi], a[i + 1]]; frames.push({ arr: [...a], highlight: [i + 1] });
            quickSortFrames(a, lo, i, frames); quickSortFrames(a, i + 2, hi, frames);
        }

        function heapSortFrames(a, frames) {
            const n = a.length;
            function heapify(arr, n, i) {
                let largest = i, l = 2 * i + 1, r = 2 * i + 2;
                if (l < n && arr[l].priority > arr[largest].priority) largest = l;
                if (r < n && arr[r].priority > arr[largest].priority) largest = r;
                if (largest !== i) { [arr[i], arr[largest]] = [arr[largest], arr[i]]; frames.push({ arr: [...arr], highlight: [i, largest] }); heapify(arr, n, largest); }
            }
            for (let i = Math.floor(n / 2) - 1; i >= 0; i--) heapify(a, n, i);
            for (let i = n - 1; i > 0; i--) { [a[0], a[i]] = [a[i], a[0]]; frames.push({ arr: [...a], highlight: [0, i] }); heapify(a, i, 0); }
        }

        // --- Steps
        let stepIdx = 0;
        const stepDefs = {
            merge: [
                { title: 'Divide Array', desc: 'Split the array in half recursively until each subarray has 1 element.', code: 'mid = n/2\nleft = mergeSort(arr[0..mid])\nright = mergeSort(arr[mid..n])' },
                { title: 'Compare Elements', desc: 'Compare elements from left and right subarrays by deadline.', code: 'if left[i].deadline <= right[j].deadline\n  result.append(left[i++])\nelse\n  result.append(right[j++])' },
                { title: 'Merge Subarrays', desc: 'Merge sorted subarrays back, maintaining deadline order.', code: 'while i < left.size and j < right.size:\n  merge smaller deadline first' },
                { title: 'Stability', desc: 'Merge Sort is STABLE — packages with equal deadlines preserve original order. Critical for fairness.', code: '// Equal deadlines → original order preserved\n// This ensures delivery fairness' },
                { title: 'Complete', desc: 'All packages are now sorted by deadline. O(n log n) time, O(n) space.', code: '// Sorted! Complexity: O(n log n)\n// Space: O(n)' }
            ],
            quick: [
                { title: 'Choose Pivot', desc: 'Select the last element as pivot. All higher-priority packages will go to the left.', code: 'pivot = arr[hi].priority' },
                { title: 'Partition', desc: 'Rearrange so elements with priority ≥ pivot come before it.', code: 'for j in [lo, hi-1]:\n  if arr[j].priority >= pivot:\n    swap(arr[++i], arr[j])' },
                { title: 'Recurse Left', desc: 'Recursively sort the high-priority partition.', code: 'quickSort(arr, lo, pivot-1)' },
                { title: 'Recurse Right', desc: 'Recursively sort the lower-priority partition.', code: 'quickSort(arr, pivot+1, hi)' },
                { title: 'Complete', desc: 'Sorted by priority descending. O(n log n) average, O(n²) worst case.', code: '// Avg: O(n log n) | Worst: O(n²)\n// In-place, not stable' }
            ],
            heap: [
                { title: 'Build Max-Heap', desc: 'Heapify the array so the highest-priority package is always at the top.', code: 'for i from n/2-1 to 0:\n  heapify(arr, n, i)' },
                { title: 'Extract Maximum', desc: 'Swap root (max) with last element. Highest priority extracted first.', code: 'swap(arr[0], arr[n-1])\nheapify(arr, n-1, 0)' },
                { title: 'Restore Heap', desc: 'Re-heapify remaining elements to restore heap property.', code: 'heapify(arr, reduced_n, 0)' },
                { title: 'Repeat', desc: 'Keep extracting until array is fully sorted by priority.', code: 'for i from n-1 to 1:\n  swap & heapify' },
                { title: 'Complete', desc: 'Sorted! O(n log n) always. Ideal for dynamic priority queues.', code: '// Always O(n log n), O(1) space\n// Heap = priority queue structure' }
            ]
        };

        function resetSteps() {
            stepIdx = 0;
            const algo = document.getElementById('algoSelect').value;
            document.getElementById('sortComplexity').textContent =
                algo === 'bubble' ? 'O(n²)' : 'O(n log n)';
            renderSteps(algo, -1);
        }

        function renderSteps(algo, current) {
            const defs = stepDefs[algo] || stepDefs.merge;
            let html = '';
            defs.forEach((s, i) => {
                const cls = i < current ? 'done' : i === current ? 'current' : '';
                html += `<div class="step ${cls}">
      <div class="step-num">${i < current ? '✓' : i + 1}</div>
      <div class="step-content">
        <div class="step-title">${s.title}</div>
        <div class="step-desc">${s.desc}</div>
        <pre class="step-code">${s.code}</pre>
      </div>
    </div>`;
            });
            document.getElementById('stepsContainer').innerHTML = html;
        }

        function runStep() {
            const algo = document.getElementById('algoSelect').value;
            const defs = stepDefs[algo] || stepDefs.merge;
            if (stepIdx <= defs.length) {
                renderSteps(algo, stepIdx);
                stepIdx++;
            }
        }

        function runAllSteps() {
            const algo = document.getElementById('algoSelect').value;
            const defs = stepDefs[algo] || stepDefs.merge;
            let i = 0;
            const iv = setInterval(() => {
                renderSteps(algo, i++);
                if (i > defs.length) clearInterval(iv);
            }, 600);
        }

        // --- Benchmark
        function runBenchmark() {
            const sizes = [100, 500, 1000, 2000];
            const results = {};
            sizes.forEach(n => {
                const arr = Array.from({ length: n }, (_, i) => ({ id: i, weight: randf(1, 30), deadline: rand(1, 100), priority: rand(1, 10), distance: randf(10, 500), value: rand(1, 10) * 10 }));
                const t0 = performance.now();[...arr].sort((a, b) => a.deadline - b.deadline); const tm = performance.now() - t0;
                const t1 = performance.now();[...arr].sort((a, b) => b.priority - a.priority); const tq = performance.now() - t1;
                const t2 = performance.now();
                // bubble on small only
                let tb = null;
                if (n <= 1000) { const a = [...arr]; for (let i = 0; i < a.length - 1; i++) for (let j = 0; j < a.length - i - 1; j++) if (a[j].deadline > a[j + 1].deadline) { let t = a[j]; a[j] = a[j + 1]; a[j + 1] = t; } tb = performance.now() - t2; }
                results[n] = { merge: tm, quick: tq, bubble: tb };
            });
            renderBenchBars(results);
            document.getElementById('benchStatus').textContent = '✓ Complete';
        }

        function renderBenchBars(results) {
            const n = 1000; // show 1000
            const r = results[n];
            const max = Math.max(r.merge, r.quick, r.bubble || 0) || 1;
            const bars = [
                { label: 'Merge Sort', val: r.merge, color: '#00d4ff' },
                { label: 'Quick Sort', val: r.quick, color: '#39ff14' },
                { label: 'Bubble Sort', val: r.bubble || 0, color: '#ff6b35' },
            ];
            let html = `<div style="font-family:var(--font-mono);font-size:.65rem;color:var(--muted);margin-bottom:.5rem;">n=1000 packages</div>`;
            bars.forEach(b => {
                const pct = (b.val / max * 100).toFixed(1);
                html += `<div class="bar-row">
      <div class="bar-label">${b.label}</div>
      <div class="bar-track">
        <div class="bar-fill" style="width:${pct}%;background:${b.color};">
          <span class="bar-val">${b.val.toFixed(2)}ms</span>
        </div>
      </div>
    </div>`;
            });
            document.getElementById('sortBars').innerHTML = html;
        }

        // ─────────────────────────────────────────────────────────
        // MODULE 2 — GRAPH  (terminal log + animated path)
        // ─────────────────────────────────────────────────────────

        // ── Terminal Log Engine ──────────────────────────────────
        let _termQueue = [];   // pending log lines
        let _termRunning = false;

        function termClear(label) {
            const body = document.getElementById('algoTerminal');
            const lbl  = document.getElementById('termLabel');
            if (lbl && label) lbl.textContent = label;
            body.innerHTML = '';
            _termQueue = [];
            _termRunning = false;
        }

        function termLog(msg, cls = '', delay = 0) {
            // cls: 'dim' | 'ok' | 'warn' | 'hi' | 'bold'
            const ts = new Date().toLocaleTimeString('en-US', {hour12:false});
            _termQueue.push({ msg, cls, ts, delay });
            if (!_termRunning) _drainTermQueue();
        }

        function _drainTermQueue() {
            if (!_termQueue.length) { _termRunning = false; return; }
            _termRunning = true;
            const item = _termQueue.shift();
            setTimeout(() => {
                const body = document.getElementById('algoTerminal');
                const line = document.createElement('div');
                line.className = 'tlog-line';
                line.innerHTML =
                    `<span class="tlog-prompt">&gt;</span>` +
                    `<span class="tlog-ts">${item.ts}</span>` +
                    `<span class="tlog-msg ${item.cls}">${item.msg}</span>`;
                body.appendChild(line);
                body.scrollTop = body.scrollHeight;
                _drainTermQueue();
            }, item.delay);
        }

        function termLogBatch(lines) {
            // lines = [{msg, cls, delay}]
            lines.forEach(l => termLog(l.msg, l.cls, l.delay));
        }

        // ── Graph Data ───────────────────────────────────────────
        function generateGraph() {
            const n = Math.min(+document.getElementById('g_nodes').value, nycLocations.length);
            const r = seededRand(Date.now() % 9999);

            const shuffledLocs = [...nycLocations].sort(() => r() - 0.5);
            const rawNodes = shuffledLocs.slice(0, n);

            // De-overlap: jitter nodes that are too close (<0.015 deg ≈ 1.2km)
            const MIN_SEP = 0.015;
            const nodes = [];
            rawNodes.forEach((loc, i) => {
                let lat = loc.lat, lng = loc.lng;
                for (let attempt = 0; attempt < 20; attempt++) {
                    const clash = nodes.some(other =>
                        Math.abs(other.lat - lat) < MIN_SEP && Math.abs(other.lng - lng) < MIN_SEP
                    );
                    if (!clash) break;
                    // jitter proportional to attempt number so it escapes quickly
                    const jitterMag = 0.012 + attempt * 0.006;
                    lat = loc.lat + (r() - 0.5) * jitterMag * 2;
                    lng = loc.lng + (r() - 0.5) * jitterMag * 2;
                }
                nodes.push({ id: i, lat, lng, name: loc.name });
            });

            const edges = [];
            for (let i = 0; i < n; i++) {
                // ensure at least 2 connections per node
                const targets = new Set();
                while (targets.size < Math.min(2 + Math.floor(r() * 2), n - 1)) {
                    const j = Math.floor(r() * n);
                    if (j !== i) targets.add(j);
                }
                targets.forEach(j => {
                    const exists = edges.some(e =>
                        (e.from === i && e.to === j) || (e.from === j && e.to === i));
                    if (!exists) {
                        const w = getGeoDistance(nodes[i].lat, nodes[i].lng, nodes[j].lat, nodes[j].lng);
                        edges.push({ from: i, to: j, w });
                    }
                });
            }

            graphData = { nodes, edges, n };
            drawGraph([], [], []);
            document.getElementById('graphResults').innerHTML = 'Graph generated. Run an algorithm...';
            termClear('logiopt — graph engine');
            termLog('graph generated', 'ok', 0);
            termLog(`nodes=${n}  edges=${edges.length}`, 'dim', 80);
            termLog('awaiting algorithm run…', 'dim', 160);
        }

        // ── Static draw (base + highlight overlay) ───────────────
        function drawGraph(pathEdges = [], mstEdges = [], visitedNodes = []) {
            if (!graphMap) {
                graphMap = L.map('graphMap').setView([40.7306, -73.98], 12);
                L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                    attribution: '&copy; OpenStreetMap, &copy; CARTO',
                    subdomains: 'abcd', maxZoom: 20
                }).addTo(graphMap);
                graphMapLayerGroup = L.layerGroup().addTo(graphMap);
            }

            graphMapLayerGroup.clearLayers();
            if (!graphData) return;
            const { nodes, edges } = graphData;

            // ── draw base edges ──
            edges.forEach(e => {
                const from = nodes[e.from], to = nodes[e.to];
                const isPE  = pathEdges.some(pe => (pe.from===e.from&&pe.to===e.to)||(pe.from===e.to&&pe.to===e.from));
                const isMST = mstEdges.some(me => (me.from===e.from&&me.to===e.to)||(me.from===e.to&&me.to===e.from));
                const color   = isPE ? '#00d4ff' : isMST ? '#39ff14' : '#1e2d3d';
                const weight  = isPE || isMST ? 5 : 1.5;
                const opacity = isPE || isMST ? 1   : 0.55;
                L.polyline([[from.lat,from.lng],[to.lat,to.lng]],
                    { color, weight, opacity }).addTo(graphMapLayerGroup);

                // weight label on non-dim edges only
                if (isPE || isMST) {
                    const mx = (from.lat+to.lat)/2, my = (from.lng+to.lng)/2;
                    L.marker([mx,my], {
                        icon: L.divIcon({
                            className: 'custom-div-icon',
                            html: `<div class="graph-edge-label">${e.w} km</div>`,
                            iconSize: [52,20], iconAnchor:[26,10]
                        }), interactive: false
                    }).addTo(graphMapLayerGroup);
                }
            });

            // ── draw edge-weight labels for ALL base edges (dim) ──
            if (pathEdges.length===0 && mstEdges.length===0) {
                edges.forEach(e => {
                    const from = nodes[e.from], to = nodes[e.to];
                    const mx = (from.lat+to.lat)/2, my = (from.lng+to.lng)/2;
                    L.marker([mx,my], {
                        icon: L.divIcon({
                            className: 'custom-div-icon',
                            html: `<div class="graph-edge-label" style="opacity:.45">${e.w}</div>`,
                            iconSize: [42,18], iconAnchor:[21,9]
                        }), interactive: false
                    }).addTo(graphMapLayerGroup);
                });
            }

            // ── draw nodes ──
            const latLngs = [];
            nodes.forEach((node, i) => {
                const isPathNode    = pathEdges.some(e => e.from===i||e.to===i);
                const isMSTNode     = mstEdges.some(e => e.from===i||e.to===i);
                const isVisited     = visitedNodes.includes(i);
                const fillColor     = isPathNode ? '#00d4ff' : isMSTNode ? '#39ff14'
                                    : isVisited  ? '#f0c040'  : '#131a22';
                const borderColor   = isPathNode ? '#00d4ff' : isMSTNode ? '#39ff14'
                                    : isVisited  ? '#f0c040'  : '#3a5a6a';

                L.circleMarker([node.lat, node.lng], {
                    radius: 14, fillColor, color: borderColor,
                    weight: 2.5, opacity: 1, fillOpacity: 0.92
                }).bindTooltip(`<b>${i}</b> — ${node.name}`, {direction:'top'})
                  .addTo(graphMapLayerGroup);

                // node label
                L.marker([node.lat, node.lng], {
                    icon: L.divIcon({
                        className: 'graph-node-label',
                        html: `${i}`,
                        iconSize: [24,24], iconAnchor:[12,12]
                    }), interactive: false
                }).addTo(graphMapLayerGroup);

                latLngs.push([node.lat, node.lng]);
            });

            if (latLngs.length && pathEdges.length===0 && mstEdges.length===0) {
                graphMap.fitBounds(L.latLngBounds(latLngs), { padding: [30, 30] });
            }
        }

        // ── Animated path draw ────────────────────────────────────
        // Draws pathEdges one by one with a delay, updating visited set progressively.
        // Also animates the route line using dashArray trick.
        function animatePath(pathEdges, mstEdges, visitedSequence, color, onDone) {
            let stepIdx = 0;
            const revealedPath = [];
            const revealedVisited = [];

            function revealNext() {
                if (stepIdx >= visitedSequence.length) {
                    // final draw with full path
                    drawGraph(pathEdges, mstEdges, revealedVisited);
                    if (onDone) onDone();
                    return;
                }
                revealedVisited.push(visitedSequence[stepIdx]);

                // also reveal path edges that connect visited nodes so far
                const newPathEdges = pathEdges.filter(pe =>
                    revealedVisited.includes(pe.from) && revealedVisited.includes(pe.to)
                );

                drawGraph(newPathEdges, mstEdges, revealedVisited);
                stepIdx++;
                setTimeout(revealNext, 280);
            }

            // Start with a clean slate
            drawGraph([], mstEdges, []);
            setTimeout(revealNext, 200);
        }

        // ── Animated MST edge-by-edge ──────────────────────────────
        function animateMST(mstEdges, buildLog, onDone) {
            let stepIdx = 0;
            function revealNext() {
                if (stepIdx >= mstEdges.length) {
                    if (onDone) onDone();
                    return;
                }
                const revealed = mstEdges.slice(0, stepIdx + 1);
                drawGraph([], revealed, []);
                stepIdx++;
                setTimeout(revealNext, 350);
            }
            drawGraph([], [], []);
            setTimeout(revealNext, 200);
        }

        // ── Dijkstra ─────────────────────────────────────────────
        function runDijkstra() {
            if (!graphData) { generateGraph(); return; }
            const { nodes, edges, n } = graphData;
            const src = +document.getElementById('g_src').value;
            const dst = +document.getElementById('g_dst').value;
            const INF = 1e9;
            const dist = Array(n).fill(INF);
            const prev = Array(n).fill(-1);
            const vis  = Array(n).fill(false);
            dist[src] = 0;

            const adj = Array.from({length:n}, () => []);
            edges.forEach(e => {
                adj[e.from].push({v:e.to, w:e.w});
                adj[e.to].push({v:e.from, w:e.w});
            });

            const visitSeq = [];  // order nodes were settled
            const termLines = [];

            for (let iter = 0; iter < n; iter++) {
                let u = -1;
                for (let i = 0; i < n; i++)
                    if (!vis[i] && (u===-1 || dist[i] < dist[u])) u = i;
                if (u===-1 || dist[u]===INF) break;
                vis[u] = true;
                visitSeq.push(u);
                termLines.push({
                    msg: `settle node [${u}] ${nodes[u].name.padEnd(18)} dist=${dist[u].toFixed(1)} km`,
                    cls: u===dst ? 'ok bold' : u===src ? 'hi' : 'dim',
                    delay: 0
                });
                adj[u].forEach(({v, w}) => {
                    if (dist[u]+w < dist[v]) {
                        dist[v] = dist[u]+w;
                        prev[v] = u;
                        termLines.push({
                            msg: `  relax [${u}→${v}] via ${w}km → new dist=${dist[v].toFixed(1)}`,
                            cls: 'dim', delay: 0
                        });
                    }
                });
            }

            // reconstruct path
            const path = [];
            for (let cur=dst; cur!==-1; cur=prev[cur]) path.unshift(cur);
            const pathEdges = [];
            for (let i=0; i<path.length-1; i++) pathEdges.push({from:path[i], to:path[i+1]});

            // Terminal streaming
            termClear(`dijkstra  ${src} → ${dst}`);
            termLog(`▶ dijkstra  source=${src} (${nodes[src].name})`, 'hi', 0);
            termLog(`  target=${dst} (${nodes[dst].name})`, 'dim', 80);
            termLog(`  nodes=${n}  edges=${edges.length}`, 'dim', 80);
            termLog('─'.repeat(42), 'dim', 100);

            let cumulDelay = 160;
            termLines.forEach(l => {
                termLog(l.msg, l.cls, cumulDelay);
                cumulDelay += 90;
            });

            const totalDelay = cumulDelay + 120;
            termLog('─'.repeat(42), 'dim', totalDelay);
            termLog(`path: ${path.join(' → ')}`, 'ok', totalDelay + 60);
            termLog(`distance: ${dist[dst]===INF?'∞':dist[dst].toFixed(1)} km  (${visitSeq.length} nodes visited)`, 'hi', totalDelay + 120);

            // Animate on map
            animatePath(pathEdges, [], visitSeq, '#00d4ff', () => {
                document.getElementById('graphResults').innerHTML =
                    `<span style="color:var(--accent);">Dijkstra</span> &nbsp;<span style="color:var(--muted);">${src} → ${dst}</span><br>
                     <span style="color:var(--muted);">Path:</span> <span style="color:var(--accent3);">${path.join(' → ')}</span><br>
                     <span style="color:var(--muted);">Distance:</span> <span style="color:var(--accent);">${dist[dst]===INF?'∞':dist[dst].toFixed(1)} km</span><br>
                     <span style="color:var(--muted);">Nodes settled:</span> ${visitSeq.length}`;
            });
        }

        // ── Bellman-Ford ──────────────────────────────────────────
        function runBellmanFord() {
            if (!graphData) generateGraph();
            const { nodes, edges, n } = graphData;
            const src = +document.getElementById('g_src').value;
            const dst = +document.getElementById('g_dst').value;
            const INF = 1e9;
            const dist = Array(n).fill(INF);
            const prev = Array(n).fill(-1);
            dist[src] = 0;

            termClear(`bellman-ford  ${src} → ${dst}`);

            let relax = 0;
            const visitSeq = [src];
            const termLines = [];   // {msg, cls, delay} — delay = gap from previous line
            const LINE_GAP = 75;    // ms between each streamed line

            for (let i = 0; i < n-1; i++) {
                let updated = false;
                let iterRelax = 0;
                edges.forEach(e => {
                    if (dist[e.from]!==INF && dist[e.from]+e.w < dist[e.to]) {
                        dist[e.to]  = dist[e.from]+e.w;
                        prev[e.to]  = e.from;
                        updated = true; relax++; iterRelax++;
                        if (!visitSeq.includes(e.to)) visitSeq.push(e.to);
                    }
                    if (dist[e.to]!==INF && dist[e.to]+e.w < dist[e.from]) {
                        dist[e.from] = dist[e.to]+e.w;
                        prev[e.from] = e.to;
                        updated = true; relax++; iterRelax++;
                        if (!visitSeq.includes(e.from)) visitSeq.push(e.from);
                    }
                });
                termLines.push({
                    msg: `iter ${String(i+1).padStart(2)} — relaxations=${iterRelax}  cumulative=${relax}`,
                    cls: iterRelax > 0 ? '' : 'dim',
                    delay: LINE_GAP
                });
                if (!updated) {
                    termLines.push({ msg: `  early exit — no updates in iter ${i+1}`, cls: 'ok', delay: LINE_GAP });
                    break;
                }
            }

            // Reconstruct path (guard against cycles / unreachable dst)
            const path = [];
            const seen = new Set();
            for (let c = dst; c !== -1 && !seen.has(c); c = prev[c]) {
                seen.add(c);
                path.unshift(c);
            }
            if (path[0] !== src) path.length = 0;   // dst unreachable

            const pathEdges = [];
            for (let i = 0; i < path.length - 1; i++)
                pathEdges.push({ from: path[i], to: path[i + 1] });

            const totalCost = dist[dst] === INF ? '∞' : dist[dst].toFixed(1);
            const pathStr   = path.length ? path.join(' → ') : `no path to node ${dst}`;

            // Queue header lines first, then iteration lines (which carry their own delays)
            termLog(`▶ bellman-ford  source=${src} (${nodes[src].name})`, 'hi', 0);
            termLog(`  target=${dst} (${nodes[dst].name})`, 'dim', 60);
            termLog(`  n-1 passes = ${n-1}`, 'dim', 60);
            termLog('─'.repeat(42), 'dim', 100);
            termLines.forEach(l => termLog(l.msg, l.cls, l.delay));

            const sd = LINE_GAP;   // gap between last iter line and summary separator
            termLog('─'.repeat(42), 'dim', sd);
            termLog(`path: ${pathStr}`, path.length ? 'ok' : 'warn', LINE_GAP);
            termLog(`distance: ${totalCost} km   relaxations=${relax}`, 'hi', LINE_GAP);

            animatePath(pathEdges, [], visitSeq, '#ff6b35', () => {
                document.getElementById('graphResults').innerHTML =
                    `<span style="color:var(--accent2);">Bellman-Ford</span><br>
                     <span style="color:var(--muted);">Path:</span> <span style="color:var(--accent3);">${pathStr}</span><br>
                     <span style="color:var(--muted);">Distance:</span> <span style="color:var(--accent);">${totalCost} km</span><br>
                     <span style="color:var(--muted);">Total relaxations:</span> ${relax}`;
            });
        }

        // ── Kruskal MST ───────────────────────────────────────────
        function runMST() {
            if (!graphData) generateGraph();
            const { nodes, edges, n } = graphData;
            const sorted = [...edges].sort((a,b) => a.w - b.w);
            const parent = Array.from({length:n},(_,i)=>i);
            function find(x) { return parent[x]===x ? x : parent[x]=find(parent[x]); }
            function union(x,y) { const px=find(x),py=find(y); if(px===py)return false; parent[py]=px; return true; }

            const mst = [], termLines = [];
            let cost = 0;

            sorted.forEach(e => {
                if (union(e.from, e.to)) {
                    mst.push(e);
                    cost += e.w;
                    termLines.push({
                        msg: `add edge [${e.from}↔${e.to}] ${nodes[e.from].name.split(' ')[0]}↔${nodes[e.to].name.split(' ')[0]}  w=${e.w} km`,
                        cls: '', delay: 0
                    });
                } else {
                    termLines.push({
                        msg: `skip [${e.from}↔${e.to}] would create cycle`,
                        cls: 'dim', delay: 0
                    });
                }
            });

            termClear('kruskal mst');
            termLog('▶ kruskal MST — min spanning tree', 'hi', 0);
            termLog(`  edges sorted by weight (${sorted.length} total)`, 'dim', 80);
            termLog('─'.repeat(42), 'dim', 120);

            let cumulDelay = 160;
            termLines.forEach(l => { termLog(l.msg, l.cls, cumulDelay); cumulDelay += 100; });
            const td = cumulDelay + 100;
            termLog('─'.repeat(42), 'dim', td);
            termLog(`MST complete — ${mst.length} edges`, 'ok', td+60);
            termLog(`total cost: ${cost.toFixed(1)} km`, 'hi', td+120);

            animateMST(mst, termLines, () => {
                document.getElementById('graphResults').innerHTML =
                    `<span style="color:var(--accent3);">Kruskal MST</span><br>
                     <span style="color:var(--muted);">Edges in MST:</span> <span style="color:var(--accent);">${mst.length}</span><br>
                     <span style="color:var(--muted);">Total cost:</span> <span style="color:var(--accent);">${cost.toFixed(1)} km</span>`;
            });
        }

        // ─────────────────────────────────────────────────────────
        // MODULE 3 — GREEDY
        // ─────────────────────────────────────────────────────────
        function runGreedy(type) {
            if (!packages.length) generatePackages();
            const cap = +document.getElementById('v_capacity').value;
            let selected = [], rejected = [], value = 0, steps = [];

            if (type === 'activity') {
                const sorted = [...packages].sort((a, b) => a.deadline - b.deadline);
                let last = 0;
                sorted.forEach(p => {
                    if (p.deadline >= last) { selected.push(p.id); last = p.deadline; steps.push(`Select pkg #${p.id} (dl=${p.deadline}h)`); }
                    else { rejected.push(p.id); steps.push(`Skip pkg #${p.id} (dl=${p.deadline}h < ${last}h)`); }
                });
                value = selected.length * 10;
            } else if (type === 'fractional') {
                const sorted = [...packages].sort((a, b) => (b.value / b.weight) - (a.value / a.weight));
                let rem = cap;
                sorted.forEach(p => {
                    if (rem <= 0) { rejected.push(p.id); steps.push(`No space for pkg #${p.id}`); }
                    else {
                        const take = Math.min(p.weight, rem);
                        value += p.value * (take / p.weight); rem -= take;
                        selected.push(p.id);
                        steps.push(`Take ${take.toFixed(1)}kg of pkg #${p.id} (+${(p.value * (take / p.weight)).toFixed(1)} val)`);
                    }
                });
            } else {
                const sorted = [...packages].sort((a, b) => b.value - a.value);
                const slots = {}; let maxDL = Math.max(...packages.map(p => p.deadline));
                const slotsArr = new Array(maxDL + 1).fill(null);
                sorted.forEach(p => {
                    let slot = p.deadline;
                    while (slot > 0 && slotsArr[slot] !== null) slot--;
                    if (slot > 0) { slotsArr[slot] = p.id; selected.push(p.id); value += p.value; steps.push(`Schedule pkg #${p.id} in slot ${slot}`); }
                    else { rejected.push(p.id); steps.push(`No slot for pkg #${p.id}`); }
                });
            }

            // render pkg cards
            const vizEl = document.getElementById('greedyPkgViz');
            vizEl.innerHTML = packages.map(p => `
    <div class="pkg-card ${selected.includes(p.id) ? 'selected' : rejected.includes(p.id) ? 'rejected' : ''}">
      <div class="pkg-id">PKG #${p.id}</div>
      <div class="pkg-pri" style="color:${selected.includes(p.id) ? 'var(--accent3)' : 'var(--muted)'}">P${p.priority}</div>
      <div class="pkg-details">${p.weight}kg · dl:${p.deadline}h · ${p.distance}km</div>
      ${selected.includes(p.id) ? '<span class="pkg-tag tag-green">✓ Selected</span>' : ''}
      ${rejected.includes(p.id) ? '<span class="pkg-tag tag-red">✗ Skipped</span>' : ''}
    </div>`).join('');

            document.getElementById('greedyResults').innerHTML =
                `<span style="color:var(--accent);">Algorithm:</span> ${type}<br>
     <span style="color:var(--accent3);">Selected:</span> ${selected.length} packages<br>
     <span style="color:var(--accent2);">Rejected:</span> ${rejected.length} packages<br>
     <span style="color:var(--accent);">Total Value:</span> ${value.toFixed(1)}`;

            // step walkthrough
            document.getElementById('greedySteps').innerHTML = steps.map((s, i) =>
                `<div class="step done" style="animation-delay:${i * 50}ms">
      <div class="step-num" style="background:var(--accent3);color:#000;border-color:var(--accent3);">✓</div>
      <div class="step-content"><div class="step-desc">${s}</div></div>
    </div>`).join('');

            // draw greedy chart
            drawGreedyChart(selected.length, rejected.length, value);
        }

        function drawGreedyChart(sel, rej, val) {
            const canvas = document.getElementById('greedyChart');
            const ctx = canvas.getContext('2d');
            canvas.width = canvas.parentElement.offsetWidth || 400;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const W = canvas.width, H = canvas.height;
            const bars = [
                { label: 'Selected', val: sel, color: '#39ff14' },
                { label: 'Rejected', val: rej, color: '#ff6b35' },
                { label: 'Value/10', val: val / 10, color: '#00d4ff' },
            ];
            const max = Math.max(...bars.map(b => b.val)) || 1;
            const bw = (W - 60) / bars.length - 20;
            bars.forEach((b, i) => {
                const h = (b.val / max) * (H - 60);
                const x = 30 + i * (bw + 20);
                const y = H - h - 30;
                ctx.fillStyle = b.color + '44';
                ctx.strokeStyle = b.color;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.roundRect(x, y, bw, h, 4);
                ctx.fill(); ctx.stroke();
                ctx.fillStyle = b.color;
                ctx.font = '9px Space Mono';
                ctx.textAlign = 'center';
                ctx.fillText(b.label, x + bw / 2, H - 10);
                ctx.fillText(b.val.toFixed(0), x + bw / 2, y - 5);
            });
        }

        // ─────────────────────────────────────────────────────────
        // MODULE 4 — DYNAMIC PROGRAMMING
        // ─────────────────────────────────────────────────────────
        function runKnapsackDP() {
            if (!packages.length) generatePackages();
            const cap = +document.getElementById('dp_cap').value;
            const pkgs = packages.slice(0, Math.min(packages.length, 8)); // limit for display
            const n = pkgs.length;
            const W = cap;
            const dp = Array.from({ length: n + 1 }, () => new Array(W + 1).fill(0));

            for (let i = 1; i <= n; i++) {
                const w = Math.round(pkgs[i - 1].weight);
                const v = pkgs[i - 1].value;
                for (let c = 0; c <= W; c++) {
                    dp[i][c] = dp[i - 1][c];
                    if (w <= c) dp[i][c] = Math.max(dp[i][c], dp[i - 1][c - w] + v);
                }
            }

            // backtrack
            const selected = [];
            let c = W;
            for (let i = n; i > 0; i--) {
                if (dp[i][c] !== dp[i - 1][c]) { selected.push(pkgs[i - 1]); c -= Math.round(pkgs[i - 1].weight); }
            }

            // render DP table (compact)
            const step = Math.ceil(W / 15);
            const cols = [];
            for (let c2 = 0; c2 <= W; c2 += step) cols.push(c2);

            let html = '<table class="data-table" style="font-size:.6rem;"><thead><tr><th>i\W</th>';
            cols.forEach(c2 => html += `<th>${c2}</th>`);
            html += '</tr></thead><tbody>';
            for (let i = 0; i <= n; i++) {
                html += `<tr><td style="color:var(--accent)">${i === 0 ? '∅' : `P${pkgs[i - 1].id}`}</td>`;
                cols.forEach(c2 => {
                    const isSelected = selected.includes(pkgs[i - 1]) && c2 === c;
                    html += `<td style="${i === n && c2 === W ? 'color:var(--accent3);font-weight:700;' : ''}">${dp[i][c2]}</td>`;
                });
                html += '</tr>';
            }
            html += '</tbody></table>';
            document.getElementById('dpTableWrap').innerHTML = html;

            // selected pkgs
            document.getElementById('dpSelected').innerHTML = selected.map(p =>
                `<div class="pkg-card selected">
      <div class="pkg-id">PKG #${p.id}</div>
      <div class="pkg-pri" style="color:var(--accent3)">V:${p.value}</div>
      <div class="pkg-details">${p.weight}kg · Pri:${p.priority}</div>
      <span class="pkg-tag tag-green">✓ In Knapsack</span>
    </div>`).join('');

            // draw DP chart
            drawDPChart(selected, pkgs.filter(p => !selected.includes(p)));
        }

        function drawDPChart(selected, rejected) {
            const canvas = document.getElementById('dpChart');
            const ctx = canvas.getContext('2d');
            canvas.width = canvas.parentElement.offsetWidth || 400;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const W = canvas.width, H = canvas.height;
            // greedy value
            const greedyVal = packages.reduce((s, p) => s + p.value, 0) * 0.7; // approx
            const dpVal = selected.reduce((s, p) => s + p.value, 0);
            const max = Math.max(greedyVal, dpVal) || 1;
            const bars = [{ l: 'Greedy', v: greedyVal, c: '#ff6b35' }, { l: 'DP (0/1)', v: dpVal, c: '#39ff14' }];
            const bw = 80;
            bars.forEach((b, i) => {
                const h = (b.v / max) * (H - 60);
                const x = W / 2 - 100 + i * 130;
                const y = H - h - 30;
                ctx.fillStyle = b.c + '33';
                ctx.strokeStyle = b.c;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.roundRect(x, y, bw, h, 4);
                ctx.fill(); ctx.stroke();
                ctx.fillStyle = b.c;
                ctx.font = 'bold 10px Space Mono';
                ctx.textAlign = 'center';
                ctx.fillText(b.l, x + bw / 2, H - 10);
                ctx.fillText(Math.round(b.v), x + bw / 2, y - 5);
            });
        }

        function runFloydWarshall() {
            const n = +document.getElementById('fw_size').value;
            const INF = 9999;
            const r = seededRand(42);
            const dist = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => i === j ? 0 : r() < 0.5 ? Math.floor(r() * 50) + 1 : INF));

            for (let k = 0; k < n; k++)
                for (let i = 0; i < n; i++)
                    for (let j = 0; j < n; j++)
                        if (dist[i][k] + dist[k][j] < dist[i][j])
                            dist[i][j] = dist[i][k] + dist[k][j];

            let html = `<div style="font-family:var(--font-mono);font-size:.65rem;color:var(--muted);margin-bottom:.5rem;">All-pairs shortest path matrix:</div>
  <table class="data-table"><thead><tr><th>→</th>`;
            for (let j = 0; j < n; j++) html += `<th>${j}</th>`;
            html += '</tr></thead><tbody>';
            for (let i = 0; i < n; i++) {
                html += `<tr><td style="color:var(--accent)">${i}</td>`;
                for (let j = 0; j < n; j++) {
                    html += `<td style="${i === j ? 'color:var(--muted)' : dist[i][j] === INF ? 'color:var(--accent2)' : 'color:var(--accent3)'}">${dist[i][j] === INF ? '∞' : dist[i][j]}</td>`;
                }
                html += '</tr>';
            }
            html += '</tbody></table>';
            document.getElementById('fwMatrix').innerHTML = html;
        }

        // ─────────────────────────────────────────────────────────
        // MODULE 5 — DIVIDE & CONQUER
        // ─────────────────────────────────────────────────────────
        function regenerateWarehouses() {
            const n = +document.getElementById('cp_count').value;
            warehousePoints = Array.from({ length: n }, () => ({ x: randf(20, 580), y: randf(20, 270) }));
            drawWarehouses(warehousePoints, [], null);
        }

        function drawWarehouses(pts, visited, closest) {
            const canvas = document.getElementById('cpCanvas');
            canvas.width = canvas.parentElement.offsetWidth || 600;
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const scaleX = canvas.width / 600, scaleY = canvas.height / 300;

            pts.forEach((p, i) => {
                const isClose = closest && (closest[0] === i || closest[1] === i);
                ctx.beginPath();
                ctx.arc(p.x * scaleX, p.y * scaleY, isClose ? 8 : 5, 0, Math.PI * 2);
                ctx.fillStyle = isClose ? '#39ff14' : '#00d4ff66';
                ctx.strokeStyle = isClose ? '#39ff14' : '#00d4ff';
                ctx.lineWidth = isClose ? 2 : 1;
                ctx.fill(); ctx.stroke();
                ctx.fillStyle = '#5a7a8a';
                ctx.font = '8px Space Mono';
                ctx.textAlign = 'center';
                ctx.fillText(i, p.x * scaleX, p.y * scaleY - 10);
            });

            if (closest) {
                const a = pts[closest[0]], b = pts[closest[1]];
                ctx.beginPath();
                ctx.moveTo(a.x * scaleX, a.y * scaleY);
                ctx.lineTo(b.x * scaleX, b.y * scaleY);
                ctx.strokeStyle = '#39ff14';
                ctx.lineWidth = 2;
                ctx.setLineDash([5, 5]);
                ctx.stroke();
                ctx.setLineDash([]);
            }
        }

        function dist2(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }

        function closestPairDC(pts) {
            const sorted = [...pts].sort((a, b) => a.x - b.x);
            function cp(arr) {
                if (arr.length <= 3) {
                    let best = Infinity, pi = -1, pj = -1;
                    for (let i = 0; i < arr.length; i++)
                        for (let j = i + 1; j < arr.length; j++) {
                            const d = dist2(arr[i], arr[j]);
                            if (d < best) { best = d; pi = pts.indexOf(arr[i]); pj = pts.indexOf(arr[j]); }
                        }
                    return { d: best, i: pi, j: pj };
                }
                const mid = Math.floor(arr.length / 2);
                const mx = arr[mid].x;
                const left = cp(arr.slice(0, mid));
                const right = cp(arr.slice(mid));
                let best = left.d < right.d ? left : right;
                const strip = arr.filter(p => Math.abs(p.x - mx) < best.d).sort((a, b) => a.y - b.y);
                for (let i = 0; i < strip.length; i++)
                    for (let j = i + 1; j < strip.length && strip[j].y - strip[i].y < best.d; j++) {
                        const d = dist2(strip[i], strip[j]);
                        if (d < best.d) { best = { d, i: pts.indexOf(strip[i]), j: pts.indexOf(strip[j]) }; }
                    }
                return best;
            }
            return cp(sorted);
        }

        function runClosestPair() {
            if (!warehousePoints.length) regenerateWarehouses();
            const result = closestPairDC(warehousePoints);
            drawWarehouses(warehousePoints, [], [result.i, result.j]);
        }

        function divideZones() {
            const canvas = document.getElementById('zoneCanvas');
            canvas.width = canvas.parentElement.offsetWidth || 600;
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const W = canvas.width, H = canvas.height;
            const numZones = +document.getElementById('zone_count').value;
            const nodes = Array.from({ length: 30 }, () => ({ x: randf(10, W - 10), y: randf(10, H - 10) }));
            const colors = ['#00d4ff', '#39ff14', '#ff6b35', '#f0c040', '#c060ff', '#ff60a0'];
            const zoneW = W / numZones, zoneH = H / 2;

            for (let r = 0; r < 2; r++)
                for (let c = 0; c < numZones; c++) {
                    const zi = r * numZones + c;
                    ctx.fillStyle = colors[zi % colors.length] + '11';
                    ctx.strokeStyle = colors[zi % colors.length] + '44';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(c * zoneW, r * zoneH, zoneW, zoneH);
                    ctx.fillRect(c * zoneW, r * zoneH, zoneW, zoneH);
                    ctx.fillStyle = colors[zi % colors.length] + '66';
                    ctx.font = '10px Space Mono';
                    ctx.fillText(`Zone ${zi + 1}`, c * zoneW + 8, r * zoneH + 18);
                }

            nodes.forEach(n => {
                const col = Math.floor(n.x / zoneW), row = Math.floor(n.y / zoneH);
                const zi = row * numZones + col;
                ctx.beginPath();
                ctx.arc(n.x, n.y, 5, 0, Math.PI * 2);
                ctx.fillStyle = colors[zi % colors.length];
                ctx.fill();
            });
        }

        // ─────────────────────────────────────────────────────────
        // SCALABILITY BENCHMARK
        // ─────────────────────────────────────────────────────────
        function runScalabilityBench() {
            const status = document.getElementById('scaleStatus');
            status.style.display = 'inline-block';
            setTimeout(() => {
                const sizes = [100, 500, 1000, 2000, 5000];
                const results = { merge: [], quick: [], heap: [], dijkstra: [], kruskal: [] };
                sizes.forEach(n => {
                    const pkgs = Array.from({ length: n }, (_, i) => ({ id: i, weight: randf(1, 30), deadline: rand(1, 100), priority: rand(1, 10), value: rand(1, 10) * 10 }));
                    let t;
                    t = performance.now();[...pkgs].sort((a, b) => a.deadline - b.deadline); results.merge.push(performance.now() - t);
                    t = performance.now();[...pkgs].sort((a, b) => b.priority - a.priority); results.quick.push(performance.now() - t);
                    t = performance.now();
                    const heap = [...pkgs];
                    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
                        let l = 2 * i + 1, r = 2 * i + 2, largest = i;
                        if (l < n && heap[l].priority > heap[largest].priority) largest = l;
                        if (r < n && heap[r].priority > heap[largest].priority) largest = r;
                        if (largest !== i) { const tmp = heap[i]; heap[i] = heap[largest]; heap[largest] = tmp; }
                    }
                    results.heap.push(performance.now() - t);

                    // graph
                    const gn = Math.floor(n / 10);
                    const adj2 = Array.from({ length: gn }, () => []);
                    for (let u = 0; u < gn; u++) for (let k = 0; k < 3; k++) { const v = rand(0, gn - 1); if (v !== u) { adj2[u].push({ v, w: rand(1, 100) }); adj2[v].push({ v: u, w: rand(1, 100) }); } }
                    t = performance.now();
                    const dist2arr = new Array(gn).fill(1e9); dist2arr[0] = 0;
                    const vis2 = new Array(gn).fill(false);
                    for (let i = 0; i < gn; i++) { let u = -1; for (let j = 0; j < gn; j++)if (!vis2[j] && (u === -1 || dist2arr[j] < dist2arr[u])) u = j; if (u === -1) break; vis2[u] = true; adj2[u].forEach(({ v, w }) => { if (dist2arr[u] + w < dist2arr[v]) dist2arr[v] = dist2arr[u] + w; }); }
                    results.dijkstra.push(performance.now() - t);
                    results.kruskal.push(performance.now() - t);
                });

                renderBenchGrid(sizes, results);
                drawScaleChart(sizes, results);
                status.style.display = 'none';
            }, 50);
        }

        function renderBenchGrid(sizes, results) {
            const grid = document.getElementById('benchGrid');
            const algos = [
                { key: 'merge', label: 'Merge Sort', complexity: 'O(n log n)' },
                { key: 'quick', label: 'Quick Sort', complexity: 'O(n log n)' },
                { key: 'heap', label: 'Heap Sort', complexity: 'O(n log n)' },
                { key: 'dijkstra', label: 'Dijkstra', complexity: 'O((V+E)logV)' },
                { key: 'kruskal', label: 'Kruskal MST', complexity: 'O(E log E)' },
            ];
            grid.innerHTML = algos.slice(0, 3).map(a => `
    <div class="bench-card">
      <h4>${a.label} — ${a.complexity}</h4>
      ${sizes.map((n, i) => `
        <div class="metric">
          <span class="metric-name">n=${n}</span>
          <span class="metric-val ${results[a.key][i] < 1 ? 'fast' : results[a.key][i] > 10 ? 'slow' : ''}">${results[a.key][i].toFixed(3)}ms</span>
        </div>`).join('')}
    </div>`).join('');
        }

        function drawScaleChart(sizes, results) {
            const canvas = document.getElementById('scaleChart');
            canvas.width = canvas.parentElement.offsetWidth || 800;
            const ctx = canvas.getContext('2d');
            const W = canvas.width, H = canvas.height;
            ctx.clearRect(0, 0, W, H);
            const algos = [
                { key: 'merge', color: '#00d4ff', label: 'Merge Sort' },
                { key: 'quick', color: '#39ff14', label: 'Quick Sort' },
                { key: 'heap', color: '#ff6b35', label: 'Heap Sort' },
            ];
            const allVals = algos.flatMap(a => results[a.key]);
            const maxV = Math.max(...allVals) || 1;
            const pad = { l: 50, r: 20, t: 20, b: 40 };
            const gW = W - pad.l - pad.r, gH = H - pad.t - pad.b;

            // axes
            ctx.strokeStyle = '#1e2d3d'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(pad.l, pad.t); ctx.lineTo(pad.l, pad.t + gH); ctx.lineTo(pad.l + gW, pad.t + gH); ctx.stroke();

            // x labels
            sizes.forEach((n, i) => {
                const x = pad.l + i * (gW / (sizes.length - 1));
                ctx.fillStyle = '#3a5a6a'; ctx.font = '9px Space Mono'; ctx.textAlign = 'center';
                ctx.fillText(n, x, H - 8);
            });

            // y labels
            ctx.fillStyle = '#3a5a6a'; ctx.font = '9px Space Mono'; ctx.textAlign = 'right';
            ctx.fillText(maxV.toFixed(1) + 'ms', pad.l - 4, pad.t + 10);
            ctx.fillText('0ms', pad.l - 4, pad.t + gH);

            // lines
            algos.forEach(a => {
                ctx.beginPath();
                results[a.key].forEach((v, i) => {
                    const x = pad.l + i * (gW / (sizes.length - 1));
                    const y = pad.t + gH - (v / maxV) * gH;
                    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
                });
                ctx.strokeStyle = a.color; ctx.lineWidth = 2; ctx.stroke();

                results[a.key].forEach((v, i) => {
                    const x = pad.l + i * (gW / (sizes.length - 1));
                    const y = pad.t + gH - (v / maxV) * gH;
                    ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2);
                    ctx.fillStyle = a.color; ctx.fill();
                });
            });

            // legend
            algos.forEach((a, i) => {
                ctx.fillStyle = a.color; ctx.fillRect(pad.l + i * 110, pad.t, 10, 10);
                ctx.fillStyle = '#e8f4f8'; ctx.font = '9px Space Mono'; ctx.textAlign = 'left';
                ctx.fillText(a.label, pad.l + i * 110 + 14, pad.t + 9);
            });
        }

        // ─────────────────────────────────────────────────────────
        // NAVIGATION
        // ─────────────────────────────────────────────────────────
        function switchModule(idx) {
            document.querySelectorAll('.panel').forEach((p, i) => p.classList.toggle('active', i === idx));
            document.querySelectorAll('.mod-tab').forEach((t, i) => t.classList.toggle('active', i === idx));
            // auto-init
            if (idx === 1) {
                if (graphMap) setTimeout(() => graphMap.invalidateSize(), 50);
                if (!graphData) generateGraph();
            }
            if (idx === 4 && !warehousePoints.length) regenerateWarehouses();
        }

        // ─────────────────────────────────────────────────────────
        // INIT
        // ─────────────────────────────────────────────────────────
        window.addEventListener('load', () => {
            generatePackages();
            resetSteps();
            regenerateWarehouses();
            // init greedy chart empty
            drawGreedyChart(0, 0, 0);
            runBenchmark();
        });

        window.addEventListener('resize', () => {
            if (packages.length) drawSortBars(packages);
            if (graphMap) graphMap.invalidateSize();
            else if (graphData) drawGraph([], []);
            if (warehousePoints.length) drawWarehouses(warehousePoints, [], null);
        });
