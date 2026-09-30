/**
 * window-component.js
 * Reusable SVG Window Component with dynamic multi-view rendering
 * and reactive data-binding to WindowStore.
 */
(function (root, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        module.exports = factory(
            require('./window-store.js'),
            require('./coordinate-service.js')
        );
    } else {
        root.WindowComponent = factory(root.WindowStore, root.CoordinateService);
    }
}(typeof self !== 'undefined' ? self : this, function (WindowStore, CoordinateService) {

    const WindowComponent = {
        /**
         * Render SVG markup for a window
         * @param {object} win - Window data object
         * @param {string} viewId - e.g. 'north_facade' or 'kitchen_back_wall'
         * @param {string} styleType - 'exterior' | 'interior-materials' | 'interior-architecture' | 'interior-electricity'
         * @returns {string} SVG inner HTML string
         */
        createSVG: function (win, viewId, styleType) {
            const coords = CoordinateService.transform(win, viewId);
            const x = coords.x;
            const y = coords.y;
            const w = coords.width;
            const h = coords.height;

            if (viewId === 'north_facade' || viewId === 'south_facade' || viewId === 'west_facade') {
                if (win.openingType === 'garage_door') {
                    return this._renderExteriorGarageDoor(win, x, y, w, h);
                } else if (win.openingType === 'entrance_door') {
                    return this._renderExteriorEntranceDoor(win, x, y, w, h);
                }
                return this._renderExteriorNorthFacade(win, x, y, w, h);
            } else if (viewId === 'kitchen_back_wall' || viewId === 'kitchen_north_wall') {
                return this._renderInteriorKitchen(win, x, y, w, h, styleType);
            } else if (viewId === 'stairs_north_wall') {
                return this._renderInteriorStairs(win, x, y, w, h);
            }

            return this._renderGeneric(win, x, y, w, h);
        },

        _renderExteriorGarageDoor: function (win, x, y, w, h) {
            const midX = x + w / 2;
            const numPanels = 4;
            let panelsSvg = '';
            for (let i = 1; i < numPanels; i++) {
                const py = y + (h * i) / numPanels;
                panelsSvg += `
                    <line x1="${x + 4}" y1="${py}" x2="${x + w - 4}" y2="${py}" stroke="#0f172a" stroke-width="2" />
                    <line x1="${x + 4}" y1="${py + 1.5}" x2="${x + w - 4}" y2="${py + 1.5}" stroke="#475569" stroke-width="0.8" opacity="0.6" />
                `;
            }
            return `
                <g class="interactive-element window-component garage-door-component" data-window-id="${win.id}" onclick="showElementDetails('${win.id}')" style="cursor: pointer;">
                    <!-- Deep Masonry Reveal Shadow -->
                    <rect x="${x - 3}" y="${y - 3}" width="${w + 6}" height="${h + 3}" fill="#0f172a" opacity="0.55" />
                    <!-- Outer Frame -->
                    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#1e293b" stroke="#0f172a" stroke-width="2.5" />
                    <!-- Sectional Door Leaf (Anthracite Matte Metallic) -->
                    <rect x="${x + 4}" y="${y + 4}" width="${w - 8}" height="${h - 4}" fill="#273244" stroke="#0f172a" stroke-width="1.5" />
                    ${panelsSvg}
                    <!-- Subtle Vertical Center Stile Stiffener Hint -->
                    <line x1="${midX}" y1="${y + 4}" x2="${midX}" y2="${y + h}" stroke="#1e293b" stroke-width="1" stroke-dasharray="2 3" opacity="0.5" />
                    <!-- Bottom Rubber Threshold Seal -->
                    <rect x="${x}" y="${y + h - 3}" width="${w}" height="3" fill="#090d16" />
                    <!-- Technical Badge -->
                    <rect x="${midX - 75}" y="${y + h / 2 - 18}" width="150" height="34" rx="4" fill="#0f172a" fill-opacity="0.82" stroke="#334155" stroke-width="1" />
                    <text x="${midX}" y="${y + h / 2 - 3}" font-family="'JetBrains Mono', monospace" font-size="11" fill="#ffffff" font-weight="700" text-anchor="middle">
                        ${win.name} (${Math.round(win.width / 10)}×${Math.round(win.height / 10)})
                    </text>
                    <text x="${midX}" y="${y + h / 2 + 11}" font-family="'JetBrains Mono', monospace" font-size="8.5" fill="#93c5fd" font-weight="600" text-anchor="middle">
                        Brama garażowa • hp=0
                    </text>
                </g>
            `;
        },

        _renderExteriorEntranceDoor: function (win, x, y, w, h) {
            const midX = x + w / 2;
            const doorW = Math.round(w * 0.60); // ~94px (940mm door leaf)
            const sideW = w - doorW;            // ~63px (630mm glazed sidelight)
            const mullionX = x + doorW;

            // Casement dashed lines on main door leaf
            const sx1 = x + 4;
            const sx2 = mullionX - 2;
            const sy1 = y + 4;
            const sy2 = y + h - 4;
            const smidY = (sy1 + sy2) / 2;

            return `
                <g class="interactive-element window-component entrance-door-component" data-window-id="${win.id}" onclick="showElementDetails('${win.id}')" style="cursor: pointer;">
                    <!-- Outer Frame -->
                    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#1e293b" stroke="#0f172a" stroke-width="2.5" />
                    <!-- Main Door Leaf (Left) -->
                    <rect x="${x + 4}" y="${y + 4}" width="${doorW - 6}" height="${h - 8}" fill="#292524" stroke="#0f172a" stroke-width="2" />
                    <!-- Vertical Decorative Groove & Stainless Pull Bar on Door Leaf -->
                    <line x1="${x + doorW * 0.35}" y1="${y + 6}" x2="${x + doorW * 0.35}" y2="${y + h - 6}" stroke="#1c1917" stroke-width="1.5" />
                    <rect x="${mullionX - 14}" y="${y + h * 0.25}" width="3" height="${h * 0.5}" rx="1.5" fill="#cbd5e1" stroke="#475569" stroke-width="0.6" />
                    <!-- Door Opening Dashed Triangle -->
                    <polyline points="${sx1},${sy1} ${sx2},${smidY} ${sx1},${sy2}" fill="none" stroke="#cbd5e1" stroke-width="0.9" stroke-dasharray="3 2" opacity="0.65" />
                    <!-- Glazed Sidelight (Right) -->
                    <rect x="${mullionX + 2}" y="${y + 4}" width="${sideW - 6}" height="${h - 8}" fill="url(#glass-glare)" stroke="#0f172a" stroke-width="2" />
                    <!-- Mullion Post -->
                    <line x1="${mullionX}" y1="${y}" x2="${mullionX}" y2="${y + h}" stroke="#0f172a" stroke-width="3.5" />
                    <!-- Label Badge -->
                    <text x="${midX}" y="${y + h / 2 - 5}" font-family="'JetBrains Mono', monospace" font-size="10" fill="#ffffff" font-weight="700" text-anchor="middle" filter="drop-shadow(0 1px 2px black)">
                        ${win.name} (${Math.round(win.width / 10)}×${Math.round(win.height / 10)})
                    </text>
                    <text x="${midX}" y="${y + h / 2 + 10}" font-family="'JetBrains Mono', monospace" font-size="8" fill="#fde68a" font-weight="600" text-anchor="middle" filter="drop-shadow(0 1px 2px black)">
                        Drzwi wejściowe
                    </text>
                </g>
            `;
        },

        _renderExteriorNorthFacade: function (win, x, y, w, h) {
            const isCorner = win.id === 'O13a' || win.id === 'O13b';
            const isFullHeight = win.id === '14a'
                || (win.floor === 'first' && win.sill <= 3430)
                || (win.floor === 'ground' && win.sill <= 0);
            const isCompactRibbon = h <= 75;
            const midX = x + w / 2;
            const numSashes = Math.max(1, Number(win.sashes) || 1);

            let sashesSvg = '';
            if (numSashes >= 2 && win.hasMullion) {
                for (let i = 1; i < numSashes; i++) {
                    const mullionX = x + (w * i) / numSashes;
                    sashesSvg += `<line x1="${mullionX}" y1="${y + 4}" x2="${mullionX}" y2="${y + h - 4}" stroke="#0f172a" stroke-width="3" />`;
                }
            }

            // Optional tilt-and-turn casement dashed lines (matching architectural CAD elevation)
            let casementSvg = '';
            if (Array.isArray(win.tiltTurnSashes) && win.tiltTurnSashes.length > 0) {
                const sashW = w / numSashes;
                win.tiltTurnSashes.forEach(sashIdx => {
                    const idx = Number(sashIdx) - 1;
                    if (idx >= 0 && idx < numSashes) {
                        const sx1 = x + idx * sashW + 4;
                        const sx2 = x + (idx + 1) * sashW - 4;
                        const sy1 = y + 4;
                        const sy2 = y + h - 4;
                        const smidX = (sx1 + sx2) / 2;
                        const smidY = (sy1 + sy2) / 2;
                        // Bottom-left & bottom-right to top-center (tilt) + left-top & left-bottom to right-center (turn)
                        casementSvg += `
                            <polyline points="${sx1},${sy2} ${smidX},${sy1} ${sx2},${sy2}" fill="none" stroke="#cbd5e1" stroke-width="0.9" stroke-dasharray="3 2" opacity="0.65" />
                            <polyline points="${sx1},${sy1} ${sx2},${smidY} ${sx1},${sy2}" fill="none" stroke="#cbd5e1" stroke-width="0.9" stroke-dasharray="3 2" opacity="0.65" />
                        `;
                    }
                });
            }

            // Optional HST sliding door arrows (central bi-parting panels 2 & 3)
            let slidingSvg = '';
            if (win.slidingArrows && numSashes >= 4) {
                const sashW = w / numSashes;
                const arrowY = y + h * 0.62;
                // Left arrow in sash 2 (index 1)
                const s2Mid = x + 1.5 * sashW;
                // Right arrow in sash 3 (index 2)
                const s3Mid = x + 2.5 * sashW;
                slidingSvg = `
                    <g stroke="#e2e8f0" stroke-width="1.6" fill="none" opacity="0.85">
                        <line x1="${s2Mid + 16}" y1="${arrowY}" x2="${s2Mid - 16}" y2="${arrowY}" />
                        <polyline points="${s2Mid - 9},${arrowY - 5} ${s2Mid - 16},${arrowY} ${s2Mid - 9},${arrowY + 5}" />
                        <line x1="${s3Mid - 16}" y1="${arrowY}" x2="${s3Mid + 16}" y2="${arrowY}" />
                        <polyline points="${s3Mid + 9},${arrowY - 5} ${s3Mid + 16},${arrowY} ${s3Mid + 9},${arrowY + 5}" />
                    </g>
                `;
            }

            // Sill plate
            let sillSvg = '';
            if (!isFullHeight && !isCorner) {
                sillSvg = `<rect x="${x - 2}" y="${y + h}" width="${w + 4}" height="4" fill="#0f172a" />`;
            }

            const hpVal = (win.floor === 'first')
                ? (win.sill <= 3430 ? 0 : Math.round((win.sill - 3330) / 10))
                : Math.round(win.sill / 10);

            const labelSvg = isCompactRibbon
                ? `
                    <text x="${midX}" y="${y + h / 2 + 3.5}" font-family="'JetBrains Mono', monospace" font-size="${w < 180 ? 8.5 : 10}" fill="#ffffff" font-weight="700" text-anchor="middle" filter="drop-shadow(0 1px 2px black)">
                        ${win.name} (${Math.round(win.width / 10)}×${Math.round(win.height / 10)}) • hp=${hpVal}
                    </text>
                `
                : `
                    <text x="${midX}" y="${y + h / 2 - 5}" font-family="'JetBrains Mono', monospace" font-size="${w > 150 ? 11 : 9.5}" fill="#ffffff" font-weight="700" text-anchor="middle" filter="drop-shadow(0 1px 2px black)">
                        ${win.name} (${Math.round(win.width / 10)}×${Math.round(win.height / 10)})
                    </text>
                    <text x="${midX}" y="${y + h / 2 + 12}" font-family="'JetBrains Mono', monospace" font-size="8.5" fill="#93c5fd" font-weight="600" text-anchor="middle">
                        hp=${hpVal}
                    </text>
                `;

            return `
                <g class="interactive-element window-component" data-window-id="${win.id}" onclick="showElementDetails('${win.id}')" style="cursor: pointer;">
                    <!-- Outer reveal / frame -->
                    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#1e293b" stroke="#0f172a" stroke-width="2" />
                    <!-- Glass pane with glare -->
                    <rect x="${x + 4}" y="${y + 4}" width="${w - 8}" height="${h - 8}" fill="url(#glass-glare)" />
                    ${casementSvg}
                    <rect x="${x + 4}" y="${y + 4}" width="${w - 8}" height="${h - 8}" fill="none" stroke="#0f172a" stroke-width="3" />
                    ${sashesSvg}
                    ${slidingSvg}
                    ${sillSvg}
                    <!-- Dimension Label Badge -->
                    ${labelSvg}
                </g>
            `;
        },

        _renderInteriorKitchen: function (win, x, y, w, h, styleType) {
            const midX = x + w / 2;
            const innerMargin = 10;
            const innerX = x + innerMargin;
            const innerY = y + innerMargin;
            const innerW = w - (innerMargin * 2);
            const innerH = h - (innerMargin * 2);

            let glassFill = '#E0F2FE';
            let strokeColor = '#333333';
            let strokeWidth = 2;

            if (styleType === 'interior-architecture' || styleType === 'interior-electricity') {
                glassFill = '#FFFFFF';
                strokeColor = '#333333';
            }

            return `
                <g class="window-component kitchen-window" data-window-id="${win.id}">
                    <!-- Outer Window Frame -->
                    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${glassFill}" stroke="${strokeColor}" stroke-width="${strokeWidth}" />
                    <!-- Inner Sash Frame -->
                    <rect x="${innerX}" y="${innerY}" width="${innerW}" height="${innerH}" fill="none" stroke="${strokeColor}" stroke-width="1" />
                    <!-- Vertical Split Mullion -->
                    <line x1="${midX}" y1="${innerY}" x2="${midX}" y2="${innerY + innerH}" stroke="${strokeColor}" stroke-width="1.5" />
                    <!-- Architectural Window Handle -->
                    <rect x="${midX - 2.5}" y="${y + h * 0.45}" width="5" height="10" fill="#555" stroke="${strokeColor}" stroke-width="0.5" />
                    <line x1="${midX - 2.5}" y1="${y + h * 0.45 + 5}" x2="${midX - 12.5}" y2="${y + h * 0.45 + 5}" stroke="#555" stroke-width="2" />
                    <!-- Technical ID Label -->
                    <text x="${x + 12}" y="${y + 22}" font-family="'JetBrains Mono', monospace" font-size="9" fill="#0284c7" font-weight="700">
                        ${win.name} (${win.width}×${win.height})
                    </text>
                </g>
            `;
        },

        _renderInteriorStairs: function (win, x, y, w, h) {
            const midX = x + w / 2;
            const innerMargin = 7;
            const innerX = x + innerMargin;
            const innerY = y + innerMargin;
            const innerW = w - (innerMargin * 2);
            const innerH = h - (innerMargin * 2);

            return `
                <g class="interactive-element window-component stairs-window" data-window-id="${win.id}" onclick="showElementDetails && showElementDetails('${win.id}')" style="cursor: pointer;">
                    <!-- Warm Interior Window Reveal Shadow -->
                    <rect x="${x - 3}" y="${y - 3}" width="${w + 6}" height="${h + 6}" fill="#e6dcd1" rx="2" />
                    <!-- Outer Window Frame (Warm Dark Bronze / Anthracite) -->
                    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#fffdf9" stroke="#3f362f" stroke-width="2.2" />
                    <!-- Warm Daylight Glass Fill with Sun Glow -->
                    <rect x="${innerX}" y="${innerY}" width="${innerW}" height="${innerH}" fill="url(#warm-daylight-glass)" stroke="#52463d" stroke-width="1.2" />
                    <!-- Subtle Diagonal Glass Sheen -->
                    <line x1="${innerX + 10}" y1="${innerY + innerH - 12}" x2="${innerX + innerW - 10}" y2="${innerY + 12}" stroke="#ffffff" stroke-width="2" opacity="0.6" />
                    <line x1="${innerX + 25}" y1="${innerY + innerH - 12}" x2="${innerX + innerW - 10}" y2="${innerY + 27}" stroke="#ffffff" stroke-width="1" opacity="0.4" />
                    <!-- Window Handle (Right Side) -->
                    <rect x="${innerX + innerW - 4}" y="${y + h * 0.48}" width="3" height="11" fill="#b45309" rx="1" />
                    <line x1="${innerX + innerW - 2.5}" y1="${y + h * 0.48 + 5.5}" x2="${innerX + innerW - 11}" y2="${y + h * 0.48 + 5.5}" stroke="#b45309" stroke-width="1.8" stroke-linecap="round" />
                    <!-- Warm Oak Interior Sill Board (Parapet) -->
                    <rect x="${x - 6}" y="${y + h}" width="${w + 12}" height="4.5" fill="#c88a4b" stroke="#8c5828" stroke-width="0.8" rx="1" />
                    <!-- Technical Badge -->
                    <rect x="${midX - 42}" y="${y + h / 2 - 15}" width="84" height="30" rx="4" fill="#3f362f" fill-opacity="0.82" />
                    <text x="${midX}" y="${y + h / 2 - 2}" font-family="'JetBrains Mono', monospace" font-size="9" fill="#fef3c7" font-weight="700" text-anchor="middle">
                        ${win.name} (${Math.round(win.width / 10)}×${Math.round(win.height / 10)})
                    </text>
                    <text x="${midX}" y="${y + h / 2 + 10}" font-family="'JetBrains Mono', monospace" font-size="8" fill="#fdba74" font-weight="500" text-anchor="middle">
                        hp=${Math.round((win.sill - 3330) / 10)}cm (+4,18)
                    </text>
                </g>
            `;
        },

        _renderGeneric: function (win, x, y, w, h) {
            return `
                <g class="window-component" data-window-id="${win.id}">
                    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#38bdf8" opacity="0.3" stroke="#0284c7" stroke-width="2" />
                    <text x="${x + w / 2}" y="${y + h / 2}" font-family="sans-serif" font-size="12" fill="#0369a1" text-anchor="middle">
                        ${win.name}
                    </text>
                </g>
            `;
        },

        /**
         * Mount and bind a window component into a DOM element with reactive live updates
         * @param {string|Element} container - DOM element or ID selector where window should be rendered
         * @param {string} windowId - e.g. 'O1'
         * @param {string} viewId - e.g. 'kitchen_back_wall'
         * @param {string} styleType - e.g. 'interior-materials'
         * @returns {Function} unmount / cleanup function
         */
        mount: function (container, windowId, viewId, styleType) {
            const el = typeof container === 'string' ? document.getElementById(container) : container;
            if (!el) {
                console.warn(`WindowComponent: Target container "${container}" not found.`);
                return () => {};
            }

            if (typeof el._unmountWindowComponent === 'function') {
                el._unmountWindowComponent();
            }

            el.setAttribute('data-window-component', windowId);

            function update() {
                const win = WindowStore.get(windowId);
                if (!win || (Array.isArray(win.views) && !win.views.includes(viewId))) {
                    el.replaceChildren();
                    return;
                }
                const svgMarkup = `<svg xmlns="http://www.w3.org/2000/svg">${WindowComponent.createSVG(win, viewId, styleType)}</svg>`;
                const doc = new DOMParser().parseFromString(svgMarkup, 'image/svg+xml');
                const parsedGroup = doc.documentElement.firstElementChild;
                if (parsedGroup) {
                    el.replaceChildren(document.importNode(parsedGroup, true));
                }
            }

            // Initial render
            update();

            // Subscribe to WindowStore updates
            const unsubscribe = WindowStore.subscribe((id) => {
                if (id === windowId || id === '*') {
                    update();
                }
            });

            el._unmountWindowComponent = unsubscribe;
            return unsubscribe;
        },

        /**
         * Mount all windows belonging to a view into their designated containers
         * Elements should have `data-window-component="windowId"` and `data-view-id="viewId"`
         */
        autoMountAll: function () {
            if (typeof document === 'undefined') return;
            const nodes = document.querySelectorAll('[data-window-component]');
            nodes.forEach(node => {
                const winId = node.getAttribute('data-window-component');
                const viewId = node.getAttribute('data-view-id') || 'north_facade';
                const styleType = node.getAttribute('data-window-style') || 'exterior';
                this.mount(node, winId, viewId, styleType);
            });
        }
    };

    return WindowComponent;
}));
