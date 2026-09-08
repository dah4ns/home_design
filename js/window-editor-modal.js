/**
 * window-editor-modal.js
 * Interactive UI Inspector and Live Editor for Building Views and Window Openings.
 * Allows inspecting and dynamically modifying window geometry across all views,
 * with real-time multi-view synchronization and direction-aware shift testing.
 * Version: 1.1.0
 */
(function (root, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        module.exports = factory(
            require('./window-store.js'),
            require('./coordinate-service.js')
        );
    } else {
        root.WindowEditorModal = factory(root.WindowStore, root.CoordinateService);
    }
}(typeof self !== 'undefined' ? self : this, function (WindowStore, CoordinateService) {

    const WindowEditorModal = {
        currentTab: 'windows', // 'windows' | 'views'

        init: function () {
            if (typeof document === 'undefined') return;
            if (document.getElementById('window-editor-modal-container')) return;

            const modalHtml = `
                <!-- Floating Database Access Button -->
                <div id="window-editor-trigger" style="position: fixed; bottom: 24px; right: 24px; z-index: 9999; display: flex; gap: 8px;">
                    <button onclick="WindowEditorModal.open()" style="
                        background: #0f172a;
                        color: #f8fafc;
                        border: 1px solid #334155;
                        border-radius: 30px;
                        padding: 10px 18px;
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        font-size: 13px;
                        font-weight: 600;
                        cursor: pointer;
                        box-shadow: 0 4px 16px rgba(0,0,0,0.25);
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        transition: all 0.2s ease;
                    " onmouseover="this.style.background='#1e293b'; this.style.transform='translateY(-2px)'" onmouseout="this.style.background='#0f172a'; this.style.transform='translateY(0)'">
                        <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #10b981;"></span>
                        🪟 Architecture Database (Live)
                    </button>
                </div>

                <!-- Modal Backdrop & Card -->
                <div id="window-editor-modal-container" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.65); backdrop-filter: blur(4px); z-index: 10000; justify-content: center; align-items: center;">
                    <div style="
                        background: #ffffff;
                        width: 92%;
                        max-width: 620px;
                        border-radius: 14px;
                        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                        border: 1px solid #e2e8f0;
                        overflow: hidden;
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    ">
                        <!-- Header -->
                        <div style="background: #0f172a; color: white; padding: 16px 22px; display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <h3 style="margin: 0; font-size: 17px; font-weight: 700; display: flex; align-items: center; gap: 8px;">
                                    <span>🪟</span> Building Architecture Database
                                </h3>
                                <p style="margin: 4px 0 0 0; font-size: 12px; color: #94a3b8;">
                                    Views & Openings Single Source of Truth with Direction-Aware Shift Logic
                                </p>
                            </div>
                            <button onclick="WindowEditorModal.close()" style="background: none; border: none; color: #94a3b8; font-size: 24px; cursor: pointer; line-height: 1;">&times;</button>
                        </div>

                        <!-- Top Tab Bar -->
                        <div style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; padding: 6px 22px; display: flex; gap: 8px;">
                            <button id="we-tab-btn-windows" onclick="WindowEditorModal.switchTab('windows')" style="
                                background: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px; padding: 6px 14px; font-size: 12px; font-weight: 700; color: #0f172a; cursor: pointer;
                            ">Window Openings</button>
                            <button id="we-tab-btn-views" onclick="WindowEditorModal.switchTab('views')" style="
                                background: transparent; border: 1px solid transparent; border-radius: 6px; padding: 6px 14px; font-size: 12px; font-weight: 600; color: #64748b; cursor: pointer;
                            ">Architectural Views (2)</button>
                        </div>

                        <!-- Body Container -->
                        <div style="padding: 18px 22px; max-height: 68vh; overflow-y: auto;">
                            
                            <!-- ================= TAB 1: WINDOWS ================= -->
                            <div id="we-panel-windows">
                                <!-- Window Selector -->
                                <div style="margin-bottom: 14px;">
                                    <label style="display: block; font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; margin-bottom: 4px;">Select Window</label>
                                    <select id="we-select-window" onchange="WindowEditorModal.loadSelectedWindow()" style="width: 100%; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 13.5px; background: #f8fafc; font-weight: 600; color: #0f172a;">
                                    </select>
                                </div>

                                <!-- Direction-Aware Shift Tester Card -->
                                <div style="background: #fffbeb; border: 1px solid #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 14px; border-radius: 8px; margin-bottom: 14px;">
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                                        <span style="font-size: 12px; font-weight: 700; color: #92400e;">⚡ Direction-Aware Shift Tester (ΔX = ±100 mm)</span>
                                        <div style="display: flex; gap: 6px;">
                                            <button onclick="WindowEditorModal.shiftCurrentWindow(-100)" style="background: #ffffff; border: 1px solid #d97706; color: #b45309; border-radius: 4px; padding: 4px 10px; font-size: 11.5px; font-weight: 700; cursor: pointer;">
                                                ◀ Shift -100 mm
                                            </button>
                                            <button onclick="WindowEditorModal.shiftCurrentWindow(100)" style="background: #f59e0b; border: 1px solid #d97706; color: white; border-radius: 4px; padding: 4px 10px; font-size: 11.5px; font-weight: 700; cursor: pointer;">
                                                Shift +100 mm ▶
                                            </button>
                                        </div>
                                    </div>
                                    <div id="we-shift-feedback" style="font-size: 11.5px; color: #78350f; font-family: monospace; line-height: 1.4;">
                                        <!-- Populated dynamically -->
                                    </div>
                                </div>

                                <!-- Window Properties Form -->
                                <div id="we-form-fields" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                                    <div style="grid-column: span 2; background: #f1f5f9; padding: 10px 12px; border-radius: 6px; border-left: 4px solid #3b82f6;">
                                        <div style="display: flex; justify-content: space-between;">
                                            <span id="we-info-room" style="font-size: 12px; font-weight: 700; color: #1e293b;">Room</span>
                                            <span id="we-info-views" style="font-size: 11px; color: #64748b;">Views</span>
                                        </div>
                                        <p id="we-info-desc" style="margin: 3px 0 0 0; font-size: 11px; color: #475569;">Description</p>
                                    </div>

                                    <div>
                                        <label style="display: block; font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; margin-bottom: 3px;">5) Unique ID</label>
                                        <input id="we-prop-id" type="text" readonly style="width: 100%; box-sizing: border-box; padding: 7px; border: 1px solid #e2e8f0; background: #f8fafc; border-radius: 6px; font-family: monospace; font-size: 13px; color: #64748b;" />
                                    </div>

                                    <div>
                                        <label style="display: block; font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; margin-bottom: 3px;">6) Display Name</label>
                                        <input id="we-prop-name" type="text" oninput="WindowEditorModal.applyLiveChange()" style="width: 100%; box-sizing: border-box; padding: 7px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 13px; font-weight: 600;" />
                                    </div>

                                    <div>
                                        <label style="display: block; font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; margin-bottom: 3px;">1) Horizontal X (mm from East datum)</label>
                                        <input id="we-prop-x" type="number" step="10" oninput="WindowEditorModal.applyLiveChange()" style="width: 100%; box-sizing: border-box; padding: 7px; border: 1px solid #cbd5e1; border-radius: 6px; font-family: monospace; font-size: 13px; font-weight: 700; color: #0284c7;" />
                                        <span style="font-size: 10px; color: #94a3b8;">Eastmost building point = 0 mm</span>
                                    </div>

                                    <div>
                                        <label style="display: block; font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; margin-bottom: 3px;">2) Sill Height hp (mm from floor)</label>
                                        <input id="we-prop-sill" type="number" step="10" oninput="WindowEditorModal.applyLiveChange()" style="width: 100%; box-sizing: border-box; padding: 7px; border: 1px solid #cbd5e1; border-radius: 6px; font-family: monospace; font-size: 13px; font-weight: 700; color: #0284c7;" />
                                        <span style="font-size: 10px; color: #94a3b8;">Finished floor datum = 0 mm</span>
                                    </div>

                                    <div>
                                        <label style="display: block; font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; margin-bottom: 3px;">3) Window Width (mm)</label>
                                        <input id="we-prop-width" type="number" step="10" oninput="WindowEditorModal.applyLiveChange()" style="width: 100%; box-sizing: border-box; padding: 7px; border: 1px solid #cbd5e1; border-radius: 6px; font-family: monospace; font-size: 13px; font-weight: 700; color: #16a34a;" />
                                    </div>

                                    <div>
                                        <label style="display: block; font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; margin-bottom: 3px;">4) Window Height (mm)</label>
                                        <input id="we-prop-height" type="number" step="10" oninput="WindowEditorModal.applyLiveChange()" style="width: 100%; box-sizing: border-box; padding: 7px; border: 1px solid #cbd5e1; border-radius: 6px; font-family: monospace; font-size: 13px; font-weight: 700; color: #16a34a;" />
                                    </div>
                                </div>
                            </div>

                            <!-- ================= TAB 2: VIEWS ================= -->
                            <div id="we-panel-views" style="display: none;">
                                <p style="margin: 0 0 12px 0; font-size: 12px; color: #475569;">
                                    Each architectural view is registered with its global reference position, floor level, orientation direction, and length:
                                </p>
                                <div id="we-views-list" style="display: flex; flex-direction: column; gap: 12px;">
                                    <!-- Populated dynamically -->
                                </div>
                            </div>

                            <!-- Live Feedback Notification -->
                            <div id="we-live-badge" style="margin-top: 14px; padding: 8px 12px; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 6px; font-size: 11.5px; color: #065f46; display: flex; align-items: center; gap: 6px;">
                                <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #10b981;"></span>
                                <span>Multi-view synchronization active. Changes update all elevations in real time.</span>
                            </div>
                        </div>

                        <!-- Footer -->
                        <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 12px 22px; display: flex; justify-content: space-between; align-items: center;">
                            <button onclick="WindowEditorModal.resetDefaults()" style="background: none; border: 1px solid #cbd5e1; border-radius: 6px; padding: 6px 12px; font-size: 12px; color: #64748b; cursor: pointer;">
                                Reset to Canonical Defaults
                            </button>
                            <div style="display: flex; gap: 8px;">
                                <button onclick="WindowEditorModal.copyJSON()" style="background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 6px; padding: 6px 12px; font-size: 12px; font-weight: 600; color: #334155; cursor: pointer;">
                                    Copy Database JSON
                                </button>
                                <button onclick="WindowEditorModal.close()" style="background: #0f172a; color: white; border: none; border-radius: 6px; padding: 6px 16px; font-size: 12px; font-weight: 600; cursor: pointer;">
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            const wrapper = document.createElement('div');
            wrapper.innerHTML = modalHtml;
            document.body.appendChild(wrapper);

            this._populateSelect();
            this._renderViewsList();
        },

        switchTab: function (tab) {
            this.currentTab = tab;
            const pWindows = document.getElementById('we-panel-windows');
            const pViews = document.getElementById('we-panel-views');
            const bWindows = document.getElementById('we-tab-btn-windows');
            const bViews = document.getElementById('we-tab-btn-views');

            if (tab === 'windows') {
                pWindows.style.display = 'block';
                pViews.style.display = 'none';
                bWindows.style.background = '#ffffff';
                bWindows.style.color = '#0f172a';
                bWindows.style.borderColor = '#cbd5e1';
                bViews.style.background = 'transparent';
                bViews.style.color = '#64748b';
                bViews.style.borderColor = 'transparent';
            } else {
                pWindows.style.display = 'none';
                pViews.style.display = 'block';
                bViews.style.background = '#ffffff';
                bViews.style.color = '#0f172a';
                bViews.style.borderColor = '#cbd5e1';
                bWindows.style.background = 'transparent';
                bWindows.style.color = '#64748b';
                bWindows.style.borderColor = 'transparent';
                this._renderViewsList();
            }
        },

        _populateSelect: function (selectedId) {
            const select = document.getElementById('we-select-window');
            if (!select) return;
            select.innerHTML = '';
            const all = WindowStore.getAll();
            Object.keys(all).forEach(id => {
                const win = all[id];
                const opt = document.createElement('option');
                opt.value = id;
                opt.textContent = `${win.name} — ${win.room} (${win.width}×${win.height} mm)`;
                if (selectedId && selectedId === id) opt.selected = true;
                select.appendChild(opt);
            });
            this.loadSelectedWindow();
        },

        _renderViewsList: function () {
            const container = document.getElementById('we-views-list');
            if (!container) return;
            const views = WindowStore.getAllViews();
            let html = '';

            Object.keys(views).forEach(viewId => {
                const v = views[viewId];
                const isWest = (v.direction === 'west');
                const badgeColor = isWest ? '#0284c7' : '#d97706';
                const badgeBg = isWest ? '#e0f2fe' : '#fef3c7';

                html += `
                    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <strong style="font-size: 13px; color: #0f172a;">${v.name} (<code>${v.id}</code>)</strong>
                            <span style="background: ${badgeBg}; color: ${badgeColor}; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 4px; text-transform: uppercase;">
                                Direction: ${v.direction}
                            </span>
                        </div>
                        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; font-size: 11.5px; background: white; padding: 8px 10px; border-radius: 6px; border: 1px solid #cbd5e1;">
                            <div>
                                <span style="color: #64748b; display: block; font-size: 10px; text-transform: uppercase;">1) Left Edge</span>
                                <strong style="color: #0f172a;">${v.positionOnMap !== undefined ? v.positionOnMap : v.leftEdge} mm</strong>
                            </div>
                            <div>
                                <span style="color: #64748b; display: block; font-size: 10px; text-transform: uppercase;">2) Floor</span>
                                <strong style="color: #0f172a;">${v.floor}</strong>
                            </div>
                            <div>
                                <span style="color: #64748b; display: block; font-size: 10px; text-transform: uppercase;">3) Direction</span>
                                <strong style="color: ${badgeColor};">${v.direction}</strong>
                            </div>
                            <div>
                                <span style="color: #64748b; display: block; font-size: 10px; text-transform: uppercase;">4) Length</span>
                                <strong style="color: #0f172a;">${v.length.toLocaleString()} mm</strong>
                            </div>
                        </div>
                        <p style="margin: 6px 0 0 0; font-size: 11px; color: #64748b;">${v.description || ''}</p>
                    </div>
                `;
            });

            container.innerHTML = html;
        },

        open: function (targetWindowId) {
            this.init();
            const container = document.getElementById('window-editor-modal-container');
            if (container) {
                container.style.display = 'flex';
                this._populateSelect(targetWindowId || 'O1');
            }
        },

        close: function () {
            const container = document.getElementById('window-editor-modal-container');
            if (container) container.style.display = 'none';
        },

        loadSelectedWindow: function () {
            const select = document.getElementById('we-select-window');
            if (!select) return;
            const win = WindowStore.get(select.value);
            if (!win) return;

            document.getElementById('we-prop-id').value = win.id;
            document.getElementById('we-prop-name').value = win.name;
            document.getElementById('we-prop-x').value = win.x;
            document.getElementById('we-prop-sill').value = win.sill;
            document.getElementById('we-prop-width').value = win.width;
            document.getElementById('we-prop-height').value = win.height;

            document.getElementById('we-info-room').textContent = `${win.room} (Floor: ${win.floor})`;
            document.getElementById('we-info-views').textContent = `Views: ${(win.views || []).join(', ')}`;
            document.getElementById('we-info-desc').textContent = win.description || '';

            this._updateShiftFeedback(win);
        },

        _updateShiftFeedback: function (win) {
            const fb = document.getElementById('we-shift-feedback');
            if (!fb) return;

            const nfShift = CoordinateService.getShiftDirection('north_facade');
            const kwShift = CoordinateService.getShiftDirection('kitchen_north_wall');
            const nfCoords = CoordinateService.transform(win, 'north_facade');
            const kwCoords = CoordinateService.transform(win, 'kitchen_north_wall');

            fb.innerHTML = `
                <div>• <strong>North Facade</strong> (dir: <em>${nfShift.direction}</em>): +ΔX shifts <strong style="color: #047857;">${nfShift.label}</strong> (Screen X = ${nfCoords.localX_mm} mm)</div>
                <div>• <strong>Kitchen North Wall</strong> (dir: <em>${kwShift.direction}</em>): +ΔX shifts <strong style="color: #b45309;">${kwShift.label}</strong> (Screen X = ${kwCoords.localX_mm} mm)</div>
            `;
        },

        applyLiveChange: function () {
            const id = document.getElementById('we-prop-id').value;
            if (!id) return;

            const updates = {
                name: document.getElementById('we-prop-name').value,
                x: Number(document.getElementById('we-prop-x').value),
                sill: Number(document.getElementById('we-prop-sill').value),
                width: Number(document.getElementById('we-prop-width').value),
                height: Number(document.getElementById('we-prop-height').value)
            };

            const updated = WindowStore.update(id, updates);
            this._updateShiftFeedback(updated);
        },

        shiftCurrentWindow: function (deltaX) {
            const id = document.getElementById('we-prop-id').value;
            if (!id) return;
            const updated = WindowStore.shiftWindow(id, deltaX);
            document.getElementById('we-prop-x').value = updated.x;
            this._updateShiftFeedback(updated);
        },

        resetDefaults: function () {
            if (confirm('Reset all windows and views to canonical project defaults?')) {
                WindowStore.resetToDefaults();
                this._populateSelect();
                this._renderViewsList();
            }
        },

        copyJSON: function () {
            const json = WindowStore.toJSON();
            if (navigator.clipboard) {
                navigator.clipboard.writeText(json).then(() => {
                    alert('Copied updated database JSON to clipboard!');
                });
            } else {
                console.log(json);
                alert('Database JSON printed to developer console.');
            }
        }
    };

    if (typeof window !== 'undefined') {
        window.addEventListener('DOMContentLoaded', () => {
            WindowEditorModal.init();
        });
    }

    return WindowEditorModal;
}));
