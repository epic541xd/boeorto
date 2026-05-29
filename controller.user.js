// ==UserScript==
// @name Noob Controller
// @namespace http://tampermonkey.net/
// @version v0.9
// @description Premium Arras.io Bot Controller - Fancy UI + Collision & Crackshot
// @author Antigravity
// @match *://arras.io/*
// @icon https://www.google.com/s2/favicons?sz=64&domain=arras.io
// @require https://cdnjs.cloudflare.com/ajax/libs/msgpack-lite/0.1.26/msgpack.min.js
// @grant none
// ==/UserScript==

/* global msgpack */
(function () {
    'use strict';

    // ==================== MULTI CODESPACE ====================
    let wsList = [];
    let serverList = [
        "wss://turbo-meme-x5j54jgq4vxjhp4rv-8082.app.github.dev",
        "wss://cautious-trout-q7w7xw5gxp54fqp9-8082.app.github.dev"
        // wss://YOUR-CODESPACE-NAME-8082.app.github.dev
    ];

    function connectAllServers() {
        wsList.forEach(ws => ws?.close());
        wsList = [];

        serverList.forEach((url, i) => {
            const ws = new WebSocket(url);
            ws.binaryType = "arraybuffer";
            ws.serverIndex = i + 1;

            ws.onopen = () => { packetToOne(ws, "M", 72011); updateStatus(); };
            ws.onmessage = m => {
                try {
                    const data = msgpack.decode(new Uint8Array(m.data));
                    if (data[0] === "M") packetToOne(ws, "C", data[1] ^ 845);
                } catch (e) {}
            };
            ws.onclose = ws.onerror = updateStatus;
            wsList.push(ws);
        });
    }

    function updateStatus() {
        const connected = wsList.filter(ws => ws?.readyState === WebSocket.OPEN).length;
        HTML.serverStatus.innerHTML = `Connected ${connected}/${serverList.length}`;
        HTML.serverStatusBadge.classList.toggle("connected", connected > 0);
    }

    function packet(...args) {
        wsList.forEach(ws => {
            if (ws?.readyState === WebSocket.OPEN) ws.send(msgpack.encode(args));
        });
    }

    function packetToOne(ws, ...args) {
        if (ws?.readyState === WebSocket.OPEN) ws.send(msgpack.encode(args));
    }

    function addServer(url) {
        if (url && !serverList.includes(url)) {
            serverList.push(url);
            connectAllServers();
        }
    }
    // ================================================================

    const style = document.createElement('style');
    style.innerHTML = `
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
        :root {
            --primary: #00f5a0;
            --primary-glow: rgba(0, 245, 160, 0.4);
            --bg-card: rgba(255, 255, 255, 0.04);
            --bg-card-hover: rgba(255, 255, 255, 0.08);
            --text-main: #ffffff;
            --text-dim: #a0a0b0;
            --border: rgba(255, 255, 255, 0.1);
        }
        #scriptMenu {
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            width: 520px; background: #1a1a1a; border: 2px solid #000; border-radius: 12px;
            color: #fff; font-family: 'Outfit', sans-serif; z-index: 9999999;
            display: none; flex-direction: column; box-shadow: 0 0 60px rgba(0,0,0,0.9);
        }
        .header-minimal { display: flex; justify-content: space-between; align-items: center; padding: 14px 18px; background: #111; border-bottom: 1px solid #333; }
        .tab-bar { display: flex; background: rgba(255,255,255,0.05); padding: 6px; gap: 6px; }
        .tab-btn { flex: 1; padding: 10px; border-radius: 10px; font-weight: 700; cursor: pointer; text-align: center; }
        .tab-btn.active { background: var(--bg-card-hover); color: var(--primary); }
        button { padding: 16px; border-radius: 16px; border: none; font-weight: 700; cursor: pointer; }
        #connectNoob { background: var(--primary); color: #050505; }
    `;
    document.head.appendChild(style);

    const menu = document.createElement('div');
    menu.id = 'scriptMenu';
    menu.innerHTML = `
        <div class="header-minimal">
            <span class="title-minimal">Noob Hub • Multi Server</span>
            <div class="status-tag" id="statusPill"><span id="serverStatus">Connecting...</span></div>
        </div>
        <div class="tab-bar">
            <div class="tab-btn active" data-tab="main">Main Dashboard</div>
            <div class="tab-btn" data-tab="macros">Macros</div>
        </div>
        <div class="dashboard">
            <div id="mainTab" class="tab-content active">
                <div class="toggle-grid">
                    <label class="toggle-item"><input id="autofire" type="checkbox" checked><div class="toggle-box"><span>Autofire</span><div class="switch-ui"></div></div></label>
                    <label class="toggle-item"><input id="autospin" type="checkbox"><div class="toggle-box"><span>Auto Spin</span><div class="switch-ui"></div></div></label>
                    <label class="toggle-item"><input id="mbs" type="checkbox" checked><div class="toggle-box"><span>Follow Mouse</span><div class="switch-ui"></div></div></label>
                    <label class="toggle-item"><input id="feeding" type="checkbox"><div class="toggle-box"><span>Auto Feed</span><div class="switch-ui"></div></div></label>
                </div>
                <div id="tankContainer" style="margin:20px 0;">
                    <div class="select-head" id="tankTrigger"><span id="selectedTankDisplay">Select Tank Class</span></div>
                    <div class="dropdown" id="tankOptionsList"></div>
                </div>
                <input id="newServerUrl" type="text" placeholder="wss://new-codespace-8082.app.github.dev" style="width:100%;padding:12px;margin:8px 0;">
                <button id="addServerBtn">Add Server</button>
                <input id="serverHash" type="text" placeholder="Server Hash" style="width:100%;padding:12px;margin:8px 0;">
                <input id="botCount" type="number" value="1" min="1" style="width:100%;padding:12px;margin:8px 0;">
                <button id="connectNoob">Deploy Swarm</button>
                <button id="reconnectServer">Reconnect All</button>
                <button id="deleteNoobs">Terminate All</button>
            </div>
            <div id="macrosTab" class="tab-content" style="display:none;">
                <input id="chatMessage" type="text" placeholder="Broadcast message..." style="width:100%;padding:12px;margin-bottom:8px;">
                <button id="broadcastBtn">Send Message</button>
            </div>
        </div>
    `;
    document.body.appendChild(menu);

    const getEl = id => document.getElementById(id);

    const HTML = {
        serverStatus: getEl("serverStatus"),
        serverStatusBadge: getEl("statusPill"),
        reconnectServer: getEl("reconnectServer"),
        connectNoob: getEl("connectNoob"),
        deleteNoobs: getEl("deleteNoobs"),
        autofire: getEl("autofire"),
        autospin: getEl("autospin"),
        mbs: getEl("mbs"),
        feeding: getEl("feeding"),
        serverHash: getEl("serverHash"),
        botCount: getEl("botCount"),
        tankTrigger: getEl("tankTrigger"),
        selectedTankDisplay: getEl("selectedTankDisplay"),
        tankOptionsList: getEl("tankOptionsList"),
        newServerUrl: getEl("newServerUrl"),
        addServerBtn: getEl("addServerBtn"),
        broadcastBtn: getEl("broadcastBtn"),
        chatMessage: getEl("chatMessage")
    };

    let currentTank = "basic";

    const tankCategories = {
        "Essentials": {
            basic: "Basic",
            twin: "Twin",
            sniper: "Sniper",
            machinegun: "Machine Gun"
        },
        "Advanced": {
            doubletwin: "Double Twin",
            octotank: "Octo Tank",
            booster: "Booster",
            overseer: "Overseer",
            destroyer: "Destroyer",
            anni: "Annihilator",
            coli: "Collision",
            crack: "Crackshot"
        }
    };

    function populateTankOptions() {
        const list = HTML.tankOptionsList;
        list.innerHTML = "";
        Object.keys(tankCategories).forEach(group => {
            const label = document.createElement("div");
            label.textContent = group;
            label.style.fontWeight = "bold";
            label.style.padding = "8px 12px";
            list.appendChild(label);

            Object.keys(tankCategories[group]).forEach(key => {
                const item = document.createElement("div");
                item.textContent = tankCategories[group][key];
                item.style.padding = "10px 16px";
                item.style.cursor = "pointer";
                item.onclick = () => {
                    currentTank = key;
                    HTML.selectedTankDisplay.textContent = tankCategories[group][key];
                    packet("Z", key);
                    list.style.display = "none";
                };
                list.appendChild(item);
            });
        });
    }

    HTML.tankTrigger.onclick = () => {
        const show = HTML.tankOptionsList.style.display !== "block";
        HTML.tankOptionsList.style.display = show ? "block" : "none";
        if (show) populateTankOptions();
    };

    HTML.addServerBtn.onclick = () => {
        const url = HTML.newServerUrl.value.trim();
        if (url) addServer(url);
    };

    let mouseX = 0, mouseY = 0, mouseDown = false, rMouseDown = false;
    let gameX = null, gameY = null;
    // Restore Game Coordinate Reading (very important)
    const oldStrokeText = CanvasRenderingContext2D.prototype.strokeText;
    CanvasRenderingContext2D.prototype.strokeText = function (text, ...args) {
        if (text.includes("Coordinates: (")) {
            const match = text.match(/Coordinates: \(([^)]+)\)/);
            if (match) {
                const [gx, gy] = match[1].split(", ").map(Number);
                gameX = gx;
                gameY = gy;
            }
        }
        return oldStrokeText.call(this, text, ...args);
    };
    window.addEventListener("mousemove", e => {
        mouseX = e.clientX - (window.innerWidth / 2);
        mouseY = e.clientY - (window.innerHeight / 2);
    });
    window.addEventListener("mousedown", e => {
        if (e.button === 0) mouseDown = true;
        if (e.button === 2) rMouseDown = true;
    });
    window.addEventListener("mouseup", e => {
        if (e.button === 0) mouseDown = false;
        if (e.button === 2) rMouseDown = false;
    });
    document.addEventListener("keydown", e => {
        if (e.key === "Escape") {
            menu.style.display = (menu.style.display === "flex") ? "none" : "flex";
        }
    });
    // Button Listeners
    HTML.reconnectServer.onclick = connectAllServers;
    HTML.connectNoob.onclick = () => {
        const hash = (HTML.serverHash.value || "").replace("#", "") || window.location.hash.slice(1);
        if (hash) packet("F", hash, parseInt(HTML.botCount.value) || 1);
    };
    HTML.deleteNoobs.onclick = () => packet("B");
    // Strong Movement Packet
    setInterval(() => {
        packet("A",
            gameX, gameY,
            mouseX / 12,
            mouseY / 12,
            mouseDown,
            rMouseDown,
            HTML.mbs?.checked ?? true,
            HTML.feeding?.checked ?? false,
            false,
            HTML.autofire?.checked ?? true,
            HTML.autospin?.checked ?? false,
            false,
            0, 0
        );
    }, 55);
    // Start
    connectAllServers();
    menu.style.display = "flex";
    console.log("%c✅ Noob Controller v0.9 - Fancy UI + Collision & Crackshot", "color:#00f5a0;font-weight:bold");
})();
