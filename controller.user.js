// ==UserScript==
// @name Noob Controller
// @namespace http://tampermonkey.net/
// @version v0.4.2
// @description Premium Arras.io Bot Controller - Multi Codespace (All at Once)
// @author Antigravity
// @match *://arras.io/*
// @icon https://www.google.com/s2/favicons?sz=64&domain=arras.io
// @require https://cdnjs.cloudflare.com/ajax/libs/msgpack-lite/0.1.26/msgpack.min.js
// @grant none
// ==/UserScript==

/* global msgpack */
(function () {
    'use strict';

    // ==================== MULTI CODESPACE - ALL AT ONCE ====================
    const local = false;
    let wsList = [];

    const serverList = [
        "wss://turbo-meme-x5j54jgq4vxjhp4rv-8082.app.github.dev",
        "wss://cautious-trout-q7w7xw5gxp54fqp9-8082.app.github.dev",
        // Add more Codespaces here:
    ];

    function connectAllServers() {
        wsList.forEach(ws => { if (ws) ws.close(); });
        wsList = [];

        serverList.forEach((url, index) => {
            const ws = new WebSocket(local ? "ws://localhost:8082" : url);
            ws.binaryType = "arraybuffer";
            ws.serverIndex = index + 1;

            ws.onopen = () => {
                packetToOne(ws, "M", 72011);
                updateStatus();
            };

            ws.onmessage = m => {
                try {
                    const data = msgpack.decode(new Uint8Array(m.data));
                    const type = data.shift();
                    if (type === "M") packetToOne(ws, "C", data[0] ^ 845);
                } catch (e) {}
            };

            ws.onclose = () => updateStatus();
            ws.onerror = () => updateStatus();

            wsList.push(ws);
        });
    }

    function updateStatus() {
        const connected = wsList.filter(ws => ws && ws.readyState === WebSocket.OPEN).length;
        HTML.serverStatus.innerHTML = `Connected ${connected}/${serverList.length}`;
        if (connected > 0) HTML.serverStatusBadge.classList.add("connected");
        else HTML.serverStatusBadge.classList.remove("connected");
    }

    function packet(...args) {
        wsList.forEach(ws => {
            if (ws && ws.readyState === WebSocket.OPEN) {
                try { ws.send(msgpack.encode(args)); } catch (e) {}
            }
        });
    }

    function packetToOne(ws, ...args) {
        if (ws && ws.readyState === WebSocket.OPEN) ws.send(msgpack.encode(args));
    }
    // ================================================================

    // UI Styles (full from original)
    const style = document.createElement('style');
    style.innerHTML = `
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
        :root {
            --primary: #00f5a0; --primary-glow: rgba(0, 245, 160, 0.4);
            --bg-card: rgba(255,255,255,0.04); --bg-card-hover: rgba(255,255,255,0.08);
            --text-main: #ffffff; --text-dim: #a0a0b0; --border: rgba(255,255,255,0.1);
        }
        #scriptMenu { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 520px; background: #1a1a1a; border: 2px solid #000; border-radius: 4px; color: #fff; font-family: 'Outfit', sans-serif; z-index: 9999999; display: flex; flex-direction: column; box-shadow: 0 0 50px rgba(0,0,0,0.8); }
        .header-minimal { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: #111; border-bottom: 1px solid #333; }
        .tab-bar { display: flex; background: rgba(255,255,255,0.05); padding: 6px; gap: 6px; border-bottom: 1px solid var(--border); }
        .tab-btn { flex: 1; padding: 10px; border-radius: 12px; font-size: 13px; font-weight: 700; color: var(--text-dim); cursor: pointer; text-align: center; }
        .tab-btn.active { background: var(--bg-card-hover); color: var(--primary); }
        .dashboard { padding: 24px; max-height: 60vh; overflow-y: auto; }
        .toggle-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .toggle-box { background: var(--bg-card); border: 1px solid var(--border); border-radius: 16px; padding: 16px; display: flex; justify-content: space-between; align-items: center; }
        .select-container { position: relative; }
        .select-head { background: var(--bg-card); border: 1px solid var(--border); border-radius: 16px; padding: 14px 18px; cursor: pointer; }
        .dropdown { position: absolute; top: 100%; left: 0; right: 0; background: #0d1117; border: 1px solid var(--border); border-radius: 16px; max-height: 300px; overflow-y: auto; display: none; z-index: 1000; }
        .dropdown.show { display: block; }
        button { padding: 16px; border-radius: 16px; border: none; font-weight: 700; cursor: pointer; }
        #connectNoob { background: var(--primary); color: #050505; }
        #deleteNoobs { background: rgba(255,75,43,0.1); color: #ff4b2b; }
    `;
    document.head.appendChild(style);

    const menu = document.createElement('div');
    menu.id = 'scriptMenu';
    menu.style.display = 'none';
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
                <div class="control-section">
                    <div class="section-header"><span>Combat Systems</span></div>
                    <div class="toggle-grid">
                        <label class="toggle-item"><input id="autofire" type="checkbox"><div class="toggle-box"><span class="toggle-name">Autofire</span><div class="switch-ui"></div></div></label>
                        <label class="toggle-item"><input id="autospin" type="checkbox"><div class="toggle-box"><span class="toggle-name">Auto Spin</span><div class="switch-ui"></div></div></label>
                    </div>
                </div>
                <div class="control-section">
                    <div class="section-header"><span>Swarm Intelligence</span></div>
                    <div class="toggle-grid">
                        <label class="toggle-item"><input id="mbs" type="checkbox" checked><div class="toggle-box"><span class="toggle-name">Follow Mouse</span><div class="switch-ui"></div></div></label>
                        <label class="toggle-item"><input id="feeding" type="checkbox"><div class="toggle-box"><span class="toggle-name">Auto Feed</span><div class="switch-ui"></div></div></label>
                    </div>
                    <div class="select-container" id="tankContainer">
                        <div class="select-head" id="tankTrigger">
                            <span id="selectedTankDisplay">Select Tank Class</span>
                            <input type="text" id="tankSearchInput" placeholder="Search..." style="display:none; width:100%; background:transparent; border:none; color:white; outline:none;">
                        </div>
                        <div class="dropdown" id="tankOptionsList"></div>
                    </div>
                </div>
                <div class="control-section">
                    <div class="section-header"><span>Network Configuration</span></div>
                    <input id="serverHash" type="text" placeholder="Server Hash" style="width:100%; margin-bottom:8px;">
                    <input id="botCount" type="number" value="1" min="1" style="width:100%; margin-bottom:8px;">
                    <button id="connectNoob" style="width:100%; margin-bottom:8px;">Deploy Swarm</button>
                    <button id="reconnectServer" style="width:100%; margin-bottom:8px;">Reconnect All Servers</button>
                    <button id="deleteNoobs" style="width:100%;">Terminate All Connections</button>
                </div>
            </div>
            <div id="macrosTab" class="tab-content">
                <div class="control-section">
                    <div class="section-header"><span>Transmission Hub</span></div>
                    <input id="chatMessage" type="text" placeholder="Broadcast message..." style="width:100%; margin-bottom:8px;">
                    <button id="broadcastBtn" style="width:100%;">Execute Transmission</button>
                </div>
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
        broadcastBtn: getEl("broadcastBtn"),
        chatMessage: getEl("chatMessage"),
        tankTrigger: getEl("tankTrigger"),
        selectedTankDisplay: getEl("selectedTankDisplay"),
        tankSearchInput: getEl("tankSearchInput"),
        tankOptionsList: getEl("tankOptionsList")
    };

    let currentTank = "basic";

    // Tank Categories (restored from original)
    const tankCategories = {
        "Essentials": { basic: "Basic", twin: "Twin", sniper: "Sniper", machinegun: "Machine Gun" },
        "Advanced": { doubletwin: "Double Twin", octotank: "Octo Tank", booster: "Booster", overseer: "Overseer", destroyer: "Destroyer", anni: "Annihilator" },
        // Add more categories if needed from your original script
    };

    function populateTankOptions(filter = "") {
        const list = HTML.tankOptionsList;
        list.innerHTML = "";
        const query = filter.toLowerCase();

        Object.keys(tankCategories).forEach(group => {
            const matches = [];
            Object.keys(tankCategories[group]).forEach(key => {
                const name = tankCategories[group][key];
                if (name.toLowerCase().includes(query)) {
                    matches.push({key, name});
                }
            });
            if (matches.length) {
                const label = document.createElement("div");
                label.style.padding = "8px 12px"; label.style.fontWeight = "bold"; label.textContent = group;
                list.appendChild(label);

                matches.forEach(m => {
                    const item = document.createElement("div");
                    item.style.padding = "10px 16px"; item.style.cursor = "pointer";
                    item.textContent = m.name;
                    item.onclick = () => {
                        currentTank = m.key;
                        HTML.selectedTankDisplay.textContent = m.name;
                        packet("Z", m.key);
                        HTML.tankOptionsList.classList.remove("show");
                    };
                    list.appendChild(item);
                });
            }
        });
    }

    HTML.tankTrigger.onclick = () => {
        HTML.tankOptionsList.classList.toggle("show");
        if (HTML.tankOptionsList.classList.contains("show")) {
            populateTankOptions();
            HTML.tankSearchInput.style.display = "block";
            HTML.tankSearchInput.focus();
        }
    };

    HTML.tankSearchInput.oninput = () => populateTankOptions(HTML.tankSearchInput.value);

    // Button Listeners
    HTML.reconnectServer.onclick = connectAllServers;

    HTML.connectNoob.onclick = () => {
        const hash = (HTML.serverHash.value || "").replace("#", "") || window.location.hash.slice(1);
        const count = parseInt(HTML.botCount.value) || 1;
        if (hash) packet("F", hash, count);
        else alert("Enter server hash!");
    };

    HTML.deleteNoobs.onclick = () => packet("B");

    HTML.broadcastBtn.onclick = () => {
        const msg = HTML.chatMessage.value.trim();
        if (msg) packet("T", msg, false);
    };

    // Mouse tracking
    let mouseX = 0, mouseY = 0, mouseDown = false, rMouseDown = false;
    window.addEventListener("mousemove", e => {
        mouseX = e.clientX - (window.innerWidth / 2);
        mouseY = e.clientY - (window.innerHeight / 2);
    });
    window.addEventListener("mousedown", e => { if(e.button===0) mouseDown=true; if(e.button===2) rMouseDown=true; });
    window.addEventListener("mouseup", e => { if(e.button===0) mouseDown=false; if(e.button===2) rMouseDown=false; });

    // ESC Menu
    document.addEventListener("keydown", e => {
        if (e.key === "Escape") menu.style.display = (menu.style.display === "none" || !menu.style.display) ? "flex" : "none";
    });

    // Heartbeat
    setInterval(() => {
        packet("A", null, null, mouseX/20, mouseY/20, mouseDown, rMouseDown, true, false, false, HTML.autofire?.checked||false, HTML.autospin?.checked||false, false, 0, 0);
    }, 80);

    // Start
    connectAllServers();

    console.log("%c✅ Noob Controller v0.4.2 - Tank + Macros Fixed", "color:#00f5a0; font-weight:bold");
})();
