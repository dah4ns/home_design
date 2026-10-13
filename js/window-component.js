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
        root.setWindowJambOption = function (mode) {
            root.WindowComponent.setJambMaterialMode(mode);
        };
    }
}(typeof self !== 'undefined' ? self : this, function (WindowStore, CoordinateService) {

    const WindowComponent = {
        /**
         * Canonical RAL 7021 (Black-grey / Schwarzgrau) hex color for all window frames and Option 2 jambs
         */
        RAL_7021: '#1f2421',

        /**
         * Jamb display material mode across facade views:
         * - 'floor': Option 1 — same material as the corresponding floor (brick on lower level, wood on upper level)
         * - 'ral7021': Option 2 — RAL 7021 (Black-grey, #1f2421) [DEFAULT]
         */
        jambMaterialMode: 'ral7021',

        /**
         * Set window jamb display mode and synchronize SVG & summary panels
         * @param {'floor'|'ral7021'} mode
         */
        setJambMaterialMode: function (mode) {
            this.jambMaterialMode = (mode === 'floor') ? 'floor' : 'ral7021';
            if (typeof document !== 'undefined') {
                const nodes = document.querySelectorAll('[data-window-component]');
                nodes.forEach(node => {
                    const winId = node.getAttribute('data-window-component');
                    const viewId = node.getAttribute('data-view-id') || 'north_facade';
                    const styleType = node.getAttribute('data-window-style') || 'exterior';
                    this.mount(node, winId, viewId, styleType);
                });
                const summaryNodes = document.querySelectorAll('[data-facade-area-summary]');
                summaryNodes.forEach(node => {
                    const viewId = node.getAttribute('data-facade-area-summary');
                    if (viewId) {
                        this.mountFacadeAreaSummary(node, viewId);
                    }
                });
            }
            this.syncJambVisualsOnPage();
            if (WindowStore && typeof WindowStore._notify === 'function') {
                WindowStore._notify('*');
            }
        },

        /**
         * Synchronize jamb toggle buttons and face-on SVG jamb strips on the active page
         */
        syncJambVisualsOnPage: function () {
            if (typeof document === 'undefined') return;
            const isRal = this.jambMaterialMode === 'ral7021';

            const btnFloor = document.getElementById('btn-jamb-floor');
            const btnRal = document.getElementById('btn-jamb-ral7021');
            const badge = document.getElementById('jamb-material-opt-badge');

            if (btnFloor) btnFloor.classList.toggle('active', !isRal);
            if (btnRal) btnRal.classList.toggle('active', isRal);
            if (badge) {
                badge.textContent = isRal
                    ? 'Jambs: Option 2 — RAL 7021 (#1f2421 • default)'
                    : 'Jambs: Option 1 — Floor Material (Brick / Wood)';
            }

            // Update any face-on jamb strips in the SVG (e.g. on east_facade)
            const jambStrips = document.querySelectorAll('[data-jamb-strip]');
            jambStrips.forEach(strip => {
                const floorFill = strip.getAttribute('data-floor-fill') || 'url(#brick-pattern)';
                if (isRal) {
                    strip.setAttribute('fill', '#1f2421');
                    strip.setAttribute('stroke', '#141816');
                    strip.setAttribute('stroke-width', '2');
                    strip.setAttribute('opacity', '1');
                } else {
                    strip.setAttribute('fill', floorFill);
                    strip.setAttribute('stroke', 'none');
                }
            });
        },

        /**
         * Render SVG reveal strips for the window's defined jambs ('left', 'right', 'top')
         */
        _renderWindowJambReveals: function (win, x, y, w, h) {
            const jambs = Array.isArray(win.jambs) ? win.jambs : [];
            if (jambs.length === 0) return '';

            const isRal = this.jambMaterialMode === 'ral7021';
            const jambFill = isRal
                ? '#1f2421'
                : (win.floor === 'first' ? 'url(#wood-slats-pattern)' : 'url(#brick-pattern)');
            const jambStroke = isRal ? '#141816' : (win.floor === 'first' ? '#5d4c38' : '#181b20');
            const band = 5.5;

            let svg = `<g class="window-jamb-reveals" data-jamb-mode="${this.jambMaterialMode}">`;
            if (jambs.includes('left')) {
                svg += `<rect x="${x}" y="${y}" width="${band}" height="${h}" fill="${jambFill}" stroke="${jambStroke}" stroke-width="0.9" />`;
            }
            if (jambs.includes('right')) {
                svg += `<rect x="${x + w - band}" y="${y}" width="${band}" height="${h}" fill="${jambFill}" stroke="${jambStroke}" stroke-width="0.9" />`;
            }
            if (jambs.includes('top')) {
                svg += `<rect x="${x}" y="${y}" width="${w}" height="${band}" fill="${jambFill}" stroke="${jambStroke}" stroke-width="0.9" />`;
            }
            svg += `</g>`;
            return svg;
        },

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

            if (viewId === 'north_facade' || viewId === 'south_facade' || viewId === 'west_facade' || viewId === 'east_facade') {
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
                    <line x1="${x + 4}" y1="${py}" x2="${x + w - 4}" y2="${py}" stroke="#1f2421" stroke-width="2" />
                    <line x1="${x + 4}" y1="${py + 1.5}" x2="${x + w - 4}" y2="${py + 1.5}" stroke="#475569" stroke-width="0.8" opacity="0.6" />
                `;
            }
            const jambsSvg = this._renderWindowJambReveals(win, x, y, w, h);
            return `
                <g class="interactive-element window-component garage-door-component" data-window-id="${win.id}" onclick="showElementDetails('${win.id}')" style="cursor: pointer;">
                    <!-- Deep Masonry Reveal Shadow -->
                    <rect x="${x - 3}" y="${y - 3}" width="${w + 6}" height="${h + 3}" fill="#141816" opacity="0.55" />
                    <!-- Outer Frame (RAL 7021) -->
                    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#1f2421" stroke="#141816" stroke-width="2.5" />
                    <!-- Window Jamb Reveals (left, right, top) -->
                    ${jambsSvg}
                    <!-- Sectional Door Leaf (RAL 7021 Matte Metallic) -->
                    <rect x="${x + 4}" y="${y + 4}" width="${w - 8}" height="${h - 4}" fill="#1f2421" stroke="#141816" stroke-width="1.5" />
                    ${panelsSvg}
                    <!-- Subtle Vertical Center Stile Stiffener Hint -->
                    <line x1="${midX}" y1="${y + 4}" x2="${midX}" y2="${y + h}" stroke="#141816" stroke-width="1" stroke-dasharray="2 3" opacity="0.5" />
                    <!-- Bottom Rubber Threshold Seal -->
                    <rect x="${x}" y="${y + h - 3}" width="${w}" height="3" fill="#090d16" />
                    <!-- Technical Badge -->
                    <rect x="${midX - 75}" y="${y + h / 2 - 18}" width="150" height="34" rx="4" fill="#1f2421" fill-opacity="0.88" stroke="#334155" stroke-width="1" />
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
                    <!-- Outer Frame (RAL 7021) -->
                    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#1f2421" stroke="#141816" stroke-width="2.5" />
                    <!-- Main Door Leaf (Left, RAL 7021 frame) -->
                    <rect x="${x + 4}" y="${y + 4}" width="${doorW - 6}" height="${h - 8}" fill="#1f2421" stroke="#141816" stroke-width="2" />
                    <!-- Vertical Decorative Groove & Stainless Pull Bar on Door Leaf -->
                    <line x1="${x + doorW * 0.35}" y1="${y + 6}" x2="${x + doorW * 0.35}" y2="${y + h - 6}" stroke="#141816" stroke-width="1.5" />
                    <rect x="${mullionX - 14}" y="${y + h * 0.25}" width="3" height="${h * 0.5}" rx="1.5" fill="#cbd5e1" stroke="#475569" stroke-width="0.6" />
                    <!-- Door Opening Dashed Triangle -->
                    <polyline points="${sx1},${sy1} ${sx2},${smidY} ${sx1},${sy2}" fill="none" stroke="#cbd5e1" stroke-width="0.9" stroke-dasharray="3 2" opacity="0.65" />
                    <!-- Glazed Sidelight (Right, RAL 7021 inner frame) -->
                    <rect x="${mullionX + 2}" y="${y + 4}" width="${sideW - 6}" height="${h - 8}" fill="url(#glass-glare)" stroke="#1f2421" stroke-width="2" />
                    <!-- Mullion Post (RAL 7021) -->
                    <line x1="${mullionX}" y1="${y}" x2="${mullionX}" y2="${y + h}" stroke="#1f2421" stroke-width="3.5" />
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
            const isCorner = win.id === 'O13a' || win.id === 'O13a_2' || win.id === 'O13b' || win.id === 'O13b_1' || win.id === 'O13b_2';
            const isFullHeight = win.id === '14a'
                || (win.floor === 'first' && win.sill <= 3430)
                || (win.floor === 'ground' && win.sill <= 0);
            const isCompactRibbon = h <= 75;
            const midX = x + w / 2;
            const numSashes = Math.max(1, Number(win.sashes) || 1);
            const pillarMm = Number(win.pillarWidth) || 0;
            const jambsSvg = this._renderWindowJambReveals(win, x, y, w, h);

            const hpVal = (win.floor === 'first')
                ? (win.sill <= 3430 ? 0 : Math.round((win.sill - 3330) / 10))
                : Math.round(win.sill / 10);

            // Windows with inner window pillars/mullions (e.g. 90 mm or 100 mm, part of the window itself)
            if (pillarMm > 0 && numSashes >= 2) {
                const scale = w / (win.width || 1);
                const pillarSvg = pillarMm * scale;
                const customPanes = (Array.isArray(win.sashWidths) && win.sashWidths.length === numSashes)
                    ? win.sashWidths.map(Number)
                    : null;

                let paneWidthsMm;
                if (customPanes) {
                    const sumCustom = customPanes.reduce((a, b) => a + b, 0);
                    const totalPillarMm = (numSashes - 1) * pillarMm;
                    if (Math.abs(sumCustom + totalPillarMm - win.width) < 1) {
                        paneWidthsMm = customPanes;
                    } else if (Math.abs(sumCustom - win.width) < 1) {
                        // Keep right-hand pane(s) intact, deduct pillar width from left-hand pane
                        paneWidthsMm = customPanes.slice();
                        paneWidthsMm[0] = Math.max(0, paneWidthsMm[0] - totalPillarMm);
                    } else {
                        paneWidthsMm = customPanes;
                    }
                } else {
                    const eqPaneMm = (win.width - (numSashes - 1) * pillarMm) / numSashes;
                    paneWidthsMm = Array(numSashes).fill(eqPaneMm);
                }

                const paneW = (w - (numSashes - 1) * pillarSvg) / numSashes;

                let pillarsSvg = '';
                let splitLabelsSvg = '';
                let casementSvg = '';
                let cursorSvg = x;
                const tiltTurnSet = Array.isArray(win.tiltTurnSashes) ? win.tiltTurnSashes.map(Number) : [];

                for (let i = 0; i < numSashes; i++) {
                    const thisPaneMm = paneWidthsMm[i];
                    const thisPaneW = thisPaneMm * scale;
                    const px = cursorSvg;
                    const paneMidX = px + thisPaneW / 2;
                    const paneMmLabel = (Math.abs(thisPaneMm - Math.round(thisPaneMm)) < 0.05)
                        ? Math.round(thisPaneMm)
                        : Number(thisPaneMm.toFixed(1));

                    // Optional tilt-and-turn casement dashed lines on this pane
                    if (tiltTurnSet.includes(i + 1)) {
                        const sx1 = px + 4;
                        const sx2 = px + thisPaneW - 4;
                        const sy1 = y + 4;
                        const sy2 = y + h - 4;
                        const smidX = (sx1 + sx2) / 2;
                        const smidY = (sy1 + sy2) / 2;
                        casementSvg += `
                            <polyline points="${sx1},${sy2} ${smidX},${sy1} ${sx2},${sy2}" fill="none" stroke="#cbd5e1" stroke-width="0.9" stroke-dasharray="3 2" opacity="0.65" />
                            <polyline points="${sx1},${sy1} ${sx2},${smidY} ${sx1},${sy2}" fill="none" stroke="#cbd5e1" stroke-width="0.9" stroke-dasharray="3 2" opacity="0.65" />
                        `;
                    }

                    // Subtle pane width indicator near bottom of each pane
                    splitLabelsSvg += `
                        <text x="${paneMidX}" y="${y + h - 12}" font-family="'JetBrains Mono', monospace" font-size="8" fill="#cbd5e1" font-weight="600" text-anchor="middle" opacity="0.9">
                            ${paneMmLabel}
                        </text>
                    `;

                    cursorSvg += thisPaneW;

                    if (i < numSashes - 1) {
                        const pilX = cursorSvg;
                        pillarsSvg += `
                            <!-- Inner window pillar ${i + 1} (${pillarMm} mm wide, RAL 7021) -->
                            <rect x="${pilX}" y="${y + 4}" width="${pillarSvg}" height="${h - 8}" fill="#1f2421" stroke="#141816" stroke-width="0.6" />
                        `;
                        cursorSvg += pillarSvg;
                    }
                }

                // Optional HST sliding door arrows
                let slidingSvg = '';
                if (win.slidingArrows && numSashes >= 4) {
                    const arrowY = y + h * 0.62;
                    const s2Mid = x + 1 * (paneW + pillarSvg) + paneW / 2;
                    const s3Mid = x + 2 * (paneW + pillarSvg) + paneW / 2;
                    slidingSvg = `
                        <g stroke="#e2e8f0" stroke-width="1.6" fill="none" opacity="0.85">
                            <line x1="${s2Mid + 16}" y1="${arrowY}" x2="${s2Mid - 16}" y2="${arrowY}" />
                            <polyline points="${s2Mid - 9},${arrowY - 5} ${s2Mid - 16},${arrowY} ${s2Mid - 9},${arrowY + 5}" />
                            <line x1="${s3Mid - 16}" y1="${arrowY}" x2="${s3Mid + 16}" y2="${arrowY}" />
                            <polyline points="${s3Mid + 9},${arrowY - 5} ${s3Mid + 16},${arrowY} ${s3Mid + 9},${arrowY + 5}" />
                        </g>
                    `;
                } else if (win.slidingArrows && numSashes === 3) {
                    const arrowY = y + h * 0.62;
                    const s2Mid = x + 1 * (paneW + pillarSvg) + paneW / 2;
                    slidingSvg = `
                        <g stroke="#e2e8f0" stroke-width="1.6" fill="none" opacity="0.85">
                            <line x1="${s2Mid + 16}" y1="${arrowY}" x2="${s2Mid - 16}" y2="${arrowY}" />
                            <polyline points="${s2Mid - 9},${arrowY - 5} ${s2Mid - 16},${arrowY} ${s2Mid - 9},${arrowY + 5}" />
                        </g>
                    `;
                }

                let sillSvg = '';
                if (!isFullHeight && !isCorner) {
                    sillSvg = `<rect x="${x - 2}" y="${y + h}" width="${w + 4}" height="4" fill="#1f2421" />`;
                }

                return `
                    <g class="interactive-element window-component" data-window-id="${win.id}" onclick="showElementDetails('${win.id}')" style="cursor: pointer;">
                        <!-- Single unified window outer reveal / frame (RAL 7021) -->
                        <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#1f2421" stroke="#141816" stroke-width="2" />
                        <!-- Continuous glass pane with glare -->
                        <rect x="${x + 4}" y="${y + 4}" width="${w - 8}" height="${h - 8}" fill="url(#glass-glare)" />
                        ${casementSvg}
                        <!-- Inner window frame border (RAL 7021) -->
                        <rect x="${x + 4}" y="${y + 4}" width="${w - 8}" height="${h - 8}" fill="none" stroke="#1f2421" stroke-width="3" />
                        <!-- Window Jamb Reveals (left, right, top) -->
                        ${jambsSvg}
                        <!-- Inner window pillars (${pillarMm} mm, RAL 7021, part of window) -->
                        ${pillarsSvg}
                        ${slidingSvg}
                        ${sillSvg}
                        <!-- Internal pane widths -->
                        ${splitLabelsSvg}
                        <!-- Main Window Dimension Badge -->
                        <text x="${midX}" y="${y + h / 2 - 5}" font-family="'JetBrains Mono', monospace" font-size="11" fill="#ffffff" font-weight="700" text-anchor="middle" filter="drop-shadow(0 1px 2px black)">
                            ${win.name} (${Math.round(win.width / 10)}×${Math.round(win.height / 10)})
                        </text>
                        <text x="${midX}" y="${y + h / 2 + 12}" font-family="'JetBrains Mono', monospace" font-size="8.5" fill="#93c5fd" font-weight="600" text-anchor="middle">
                            hp=${hpVal}
                        </text>
                    </g>
                `;
            }

            const customSashWidths = (Array.isArray(win.sashWidths) && win.sashWidths.length >= 2)
                ? win.sashWidths
                : ((win.id === 'O1' && Math.round(win.width) === 2100) ? [1050, 1050] : ((win.id === 'O1' && Math.round(win.width) === 2500) ? [900, 1600] : null));

            let sashesSvg = '';
            if (customSashWidths && win.hasMullion) {
                const totalSplitMm = customSashWidths.reduce((acc, val) => acc + Number(val || 0), 0) || win.width;
                let accumMm = 0;
                for (let i = 0; i < customSashWidths.length; i++) {
                    const partMm = Number(customSashWidths[i] || 0);
                    const startSvg = x + (w * accumMm) / totalSplitMm;
                    accumMm += partMm;
                    const endSvg = x + (w * accumMm) / totalSplitMm;
                    const partMidX = (startSvg + endSvg) / 2;
                    if (h >= 100) {
                        sashesSvg += `
                            <text x="${partMidX}" y="${y + h - 10}" font-family="'JetBrains Mono', monospace" font-size="8" fill="#cbd5e1" font-weight="600" text-anchor="middle" opacity="0.9">
                                ${Math.round(partMm)}
                            </text>
                        `;
                    }
                    if (i < customSashWidths.length - 1) {
                        const mullionX = endSvg;
                        sashesSvg += `<line x1="${mullionX}" y1="${y + 4}" x2="${mullionX}" y2="${y + h - 4}" stroke="#1f2421" stroke-width="3" />`;
                    }
                }
            } else if (numSashes >= 2 && win.hasMullion) {
                for (let i = 1; i < numSashes; i++) {
                    const mullionX = x + (w * i) / numSashes;
                    sashesSvg += `<line x1="${mullionX}" y1="${y + 4}" x2="${mullionX}" y2="${y + h - 4}" stroke="#1f2421" stroke-width="3" />`;
                }
            }

            // Optional tilt-and-turn casement dashed lines (matching architectural CAD elevation)
            let casementSvg = '';
            if (Array.isArray(win.tiltTurnSashes) && win.tiltTurnSashes.length > 0) {
                const totalSplitMm = customSashWidths
                    ? (customSashWidths.reduce((acc, val) => acc + Number(val || 0), 0) || win.width)
                    : win.width;
                win.tiltTurnSashes.forEach(sashIdx => {
                    const idx = Number(sashIdx) - 1;
                    if (idx >= 0 && idx < numSashes) {
                        let sx1 = x + idx * (w / numSashes) + 4;
                        let sx2 = x + (idx + 1) * (w / numSashes) - 4;
                        if (customSashWidths && idx < customSashWidths.length) {
                            let startMm = 0;
                            for (let k = 0; k < idx; k++) startMm += Number(customSashWidths[k] || 0);
                            const endMm = startMm + Number(customSashWidths[idx] || 0);
                            sx1 = x + (w * startMm) / totalSplitMm + 4;
                            sx2 = x + (w * endMm) / totalSplitMm - 4;
                        }
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
                sillSvg = `<rect x="${x - 2}" y="${y + h}" width="${w + 4}" height="4" fill="#1f2421" />`;
            }

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
                    <!-- Outer reveal / frame (RAL 7021) -->
                    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#1f2421" stroke="#141816" stroke-width="2" />
                    <!-- Glass pane with glare -->
                    <rect x="${x + 4}" y="${y + 4}" width="${w - 8}" height="${h - 8}" fill="url(#glass-glare)" />
                    ${casementSvg}
                    <!-- Inner frame border (RAL 7021) -->
                    <rect x="${x + 4}" y="${y + 4}" width="${w - 8}" height="${h - 8}" fill="none" stroke="#1f2421" stroke-width="3" />
                    <!-- Window Jamb Reveals (left, right, top) -->
                    ${jambsSvg}
                    ${sashesSvg}
                    ${slidingSvg}
                    ${sillSvg}
                    <!-- Dimension Label Badge -->
                    ${labelSvg}
                </g>
            `;
        },

        _renderInteriorKitchen: function (win, x, y, w, h, styleType) {
            const customSashWidths = (Array.isArray(win.sashWidths) && win.sashWidths.length >= 2)
                ? win.sashWidths
                : ((win.id === 'O1' && Math.round(win.width) === 2100) ? [1050, 1050] : ((win.id === 'O1' && Math.round(win.width) === 2500) ? [900, 1600] : null));
            const pillarMm = Number(win.pillarWidth) || 0;
            const totalMm = Number(win.width) || 2500;
            const scale = w / totalMm;
            // Note: kitchen_north_wall looks North (direction: 'east'), so exterior left/right is mirrored horizontally inside the kitchen
            const rightPartMm = customSashWidths ? Number(customSashWidths[1] || 1600) : (totalMm / 2);
            const leftPartMm = customSashWidths ? Number(customSashWidths[0] || 900) : (totalMm / 2);
            const mullionX = customSashWidths
                ? (pillarMm > 0
                    ? (x + rightPartMm * scale + (pillarMm * scale) / 2)
                    : (x + w * (rightPartMm / (leftPartMm + rightPartMm))))
                : (x + w / 2);
            const innerMargin = 10;
            const innerX = x + innerMargin;
            const innerY = y + innerMargin;
            const innerW = w - (innerMargin * 2);
            const innerH = h - (innerMargin * 2);

            let glassFill = '#E0F2FE';
            let strokeColor = '#1f2421'; // RAL 7021
            let strokeWidth = 2;

            if (styleType === 'interior-architecture' || styleType === 'interior-electricity') {
                glassFill = '#FFFFFF';
                strokeColor = '#1f2421'; // RAL 7021
            }

            const mullionSvg = (pillarMm > 0)
                ? `<rect x="${x + rightPartMm * scale}" y="${innerY}" width="${pillarMm * scale}" height="${innerH}" fill="${strokeColor}" />`
                : `<line x1="${mullionX}" y1="${innerY}" x2="${mullionX}" y2="${innerY + innerH}" stroke="${strokeColor}" stroke-width="1.5" />`;

            return `
                <g class="window-component kitchen-window" data-window-id="${win.id}">
                    <!-- Outer Window Frame (RAL 7021) -->
                    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${glassFill}" stroke="${strokeColor}" stroke-width="${strokeWidth}" />
                    <!-- Inner Sash Frame (RAL 7021) -->
                    <rect x="${innerX}" y="${innerY}" width="${innerW}" height="${innerH}" fill="none" stroke="${strokeColor}" stroke-width="1" />
                    <!-- Vertical Split Mullion / Inner Pillar (RAL 7021) -->
                    ${mullionSvg}
                    <!-- Architectural Window Handle -->
                    <rect x="${mullionX - 2.5}" y="${y + h * 0.45}" width="5" height="10" fill="#1f2421" stroke="${strokeColor}" stroke-width="0.5" />
                    <line x1="${mullionX - 2.5}" y1="${y + h * 0.45 + 5}" x2="${mullionX - 12.5}" y2="${y + h * 0.45 + 5}" stroke="#1f2421" stroke-width="2" />
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
                    <!-- Outer Window Frame (RAL 7021) -->
                    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#fffdf9" stroke="#1f2421" stroke-width="2.2" />
                    <!-- Warm Daylight Glass Fill with Sun Glow & Inner Frame (RAL 7021) -->
                    <rect x="${innerX}" y="${innerY}" width="${innerW}" height="${innerH}" fill="url(#warm-daylight-glass)" stroke="#1f2421" stroke-width="1.4" />
                    <!-- Subtle Diagonal Glass Sheen -->
                    <line x1="${innerX + 10}" y1="${innerY + innerH - 12}" x2="${innerX + innerW - 10}" y2="${innerY + 12}" stroke="#ffffff" stroke-width="2" opacity="0.6" />
                    <line x1="${innerX + 25}" y1="${innerY + innerH - 12}" x2="${innerX + innerW - 10}" y2="${innerY + 27}" stroke="#ffffff" stroke-width="1" opacity="0.4" />
                    <!-- Window Handle (Right Side) -->
                    <rect x="${innerX + innerW - 4}" y="${y + h * 0.48}" width="3" height="11" fill="#1f2421" rx="1" />
                    <line x1="${innerX + innerW - 2.5}" y1="${y + h * 0.48 + 5.5}" x2="${innerX + innerW - 11}" y2="${y + h * 0.48 + 5.5}" stroke="#1f2421" stroke-width="1.8" stroke-linecap="round" />
                    <!-- Warm Oak Interior Sill Board (Parapet) -->
                    <rect x="${x - 6}" y="${y + h}" width="${w + 12}" height="4.5" fill="#c88a4b" stroke="#8c5828" stroke-width="0.8" rx="1" />
                    <!-- Technical Badge -->
                    <rect x="${midX - 42}" y="${y + h / 2 - 15}" width="84" height="30" rx="4" fill="#1f2421" fill-opacity="0.86" />
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
                    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#38bdf8" opacity="0.3" stroke="#1f2421" stroke-width="2" />
                    <text x="${x + w / 2}" y="${y + h / 2}" font-family="sans-serif" font-size="12" fill="#1f2421" text-anchor="middle">
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

        FACADE_WALL_SPECS: {
            north_facade: {
                lowerLengthMm: 20590,
                lowerExcludedMm: 0,
                lowerExcludedNote: '',
                lowerBottomMm: 0,
                lowerTopMm: 2800,
                lowerMaterial: 'Clinker Brick (12,010 + 8,580 mm)',
                upperLengthMm: 20505,
                upperExcludedMm: 0,
                upperExcludedNote: '',
                upperBottomMm: 3430,
                upperTopMm: 6130,
                upperMaterial: 'Vertical Timber Slats (20,505 mm; jamb right of O13a excluded)'
            },
            south_facade: {
                lowerLengthMm: 20990,
                lowerExcludedMm: 0,
                lowerExcludedNote: '',
                lowerBottomMm: 0,
                lowerTopMm: 2800,
                lowerMaterial: 'Clinker Brick (6,010 + 14,980 mm)',
                upperLengthMm: 20990,
                upperExcludedMm: 0,
                upperExcludedNote: '',
                upperBottomMm: 3430,
                upperTopMm: 6130,
                upperMaterial: 'Vertical Timber Slats (20,990 mm)'
            },
            west_facade: {
                lowerLengthMm: 21420,
                lowerExcludedMm: 0,
                lowerExcludedNote: '',
                lowerBottomMm: 0,
                lowerTopMm: 2800,
                lowerMaterial: 'Clinker Brick (21,420 mm)',
                grossUpperLengthMm: 8790,
                upperExcludedMm: 400, // 200 mm left of O13b_1 + 200 mm right of O13b_2 (height 1,950 mm from sill +4.18m to +6.13m)
                upperExcludedHeightMm: 1950,
                upperExcludedNote: 'Excl. 400×1,950 mm jambs (200 left of O13b + 200 right of O13b; wood 0–85 below included)',
                upperLengthMm: 8390,
                upperBottomMm: 3430,
                upperTopMm: 6130,
                upperMaterial: 'Vertical Timber Slats (8,790 mm; 2×200 mm jambs above sill)'
            },
            east_facade: {
                grossLowerLengthMm: 21415,
                lowerExcludedMm: 400, // 200 mm left of O7/O6b + 200 mm left of O3
                lowerExcludedNote: 'Excl. 400 mm jambs (200 left of O7 + 200 left of O3)',
                lowerLengthMm: 21015,
                lowerBottomMm: 0,
                lowerTopMm: 2800,
                lowerMaterial: 'Clinker Brick (21,415 − 400 jambs = 21,015 mm)',
                grossUpperLengthMm: 8785,
                upperExcludedMm: 400, // 200 mm left of O9 + 200 mm right of O14b
                upperExcludedNote: 'Excl. 400 mm jambs (200 left of O9 + 200 right of O14b)',
                upperLengthMm: 8385,
                upperBottomMm: 3430,
                upperTopMm: 6130,
                upperMaterial: 'Vertical Timber Slats (8,785 − 400 jambs = 8,385 mm)'
            }
        },

        /**
         * Dynamically calculate net facade material areas (excluding windows/doors and excluded jamb strips),
         * decompose into segments with vertical height > 185 cm (1850 mm) vs <= 185 cm,
         * and separately calculate window jambs (left, right, top at depth = 200 mm) for windows displayed on this view.
         * @param {string} viewId - 'north_facade' | 'south_facade' | 'west_facade' | 'east_facade'
         */
        calculateFacadeAreas: function (viewId) {
            const spec = this.FACADE_WALL_SPECS[viewId];
            if (!spec) return null;

            const thresholdMm = 1850; // 185 cm
            const jambDepthMm = 200;  // 20 cm
            const activeWindows = WindowStore.getByView(viewId) || [];
            const round2 = (v) => Math.round((v + Number.EPSILON) * 100) / 100;

            function computeFloorStats(floorKey, wallLengthMm, floorBotMm, floorTopMm, materialLabel, excludedMm, excludedNote, excludedHeightMm) {
                const floorHeightMm = floorTopMm - floorBotMm;
                const floorWins = activeWindows.filter(w => w.floor === floorKey);
                const exclMm = Number(excludedMm) || 0;
                const exclHeightMm = (typeof excludedHeightMm === 'number' && excludedHeightMm > 0)
                    ? Math.min(floorHeightMm, excludedHeightMm)
                    : floorHeightMm;

                let winSpanSumMm = 0;
                let fullHeightWinSpanMm = 0;
                let winAreaM2 = 0;
                let areaGt185M2 = 0;
                let areaLe185M2 = 0;
                let lengthGt185Mm = 0;
                let lengthLe185Mm = 0;
                const gt185Parts = [];
                const le185Parts = [];

                // Window jambs for windows displayed on this view and floor
                let jambLengthMm = 0;
                let jambAreaM2 = 0;
                const jambItems = [];

                floorWins.forEach(w => {
                    const wWidth = Math.max(0, Number(w.width) || 0);
                    if (wWidth <= 0) return;

                    const rawSill = Number(w.sill) || 0;
                    const rawHeight = Math.max(0, Number(w.height) || 0);
                    const wBot = Math.max(floorBotMm, Math.min(floorTopMm, rawSill));
                    const wTop = Math.max(floorBotMm, Math.min(floorTopMm, rawSill + rawHeight));
                    const effectiveWinH = Math.max(0, wTop - wBot);

                    winSpanSumMm += wWidth;
                    winAreaM2 += (wWidth * effectiveWinH) / 1e6;

                    const hBelow = Math.max(0, wBot - floorBotMm);
                    const hAbove = Math.max(0, floorTopMm - wTop);

                    // Horizontal length along the facade: counted ONCE per X-span even if there is material both above and below the window
                    if (hBelow > 0 || hAbove > 0) {
                        if (hBelow > thresholdMm || hAbove > thresholdMm) {
                            lengthGt185Mm += wWidth;
                        } else {
                            lengthLe185Mm += wWidth;
                        }
                    } else {
                        fullHeightWinSpanMm += wWidth;
                    }

                    if (hBelow > 0 && hAbove > 0 && hBelow <= thresholdMm && hAbove <= thresholdMm) {
                        areaLe185M2 += (wWidth * (hBelow + hAbove)) / 1e6;
                        le185Parts.push(`${w.name} [len ${Math.round(wWidth).toLocaleString()} mm: ${Math.round(hBelow / 10)} cm below + ${Math.round(hAbove / 10)} cm above]`);
                    } else {
                        if (hBelow > 0) {
                            const partM2 = (wWidth * hBelow) / 1e6;
                            const label = `under ${w.name} [len ${Math.round(wWidth).toLocaleString()} mm × ${Math.round(hBelow / 10)} cm]`;
                            if (hBelow > thresholdMm) {
                                areaGt185M2 += partM2;
                                gt185Parts.push(label);
                            } else {
                                areaLe185M2 += partM2;
                                le185Parts.push(label);
                            }
                        }

                        if (hAbove > 0) {
                            const partM2 = (wWidth * hAbove) / 1e6;
                            const label = `above ${w.name} [len ${Math.round(wWidth).toLocaleString()} mm × ${Math.round(hAbove / 10)} cm]`;
                            if (hAbove > thresholdMm) {
                                areaGt185M2 += partM2;
                                gt185Parts.push(label);
                            } else {
                                areaLe185M2 += partM2;
                                le185Parts.push(label);
                            }
                        }
                    }

                    // Calculate window jambs for this window (only jambs defined on w.jambs)
                    const wJambs = Array.isArray(w.jambs) ? w.jambs : [];
                    const wDepth = Number(w.jambDepth) || jambDepthMm;
                    if (wJambs.length > 0) {
                        let wJambLenMm = 0;
                        const sideLabels = [];
                        if (wJambs.includes('left')) {
                            wJambLenMm += rawHeight;
                            sideLabels.push(`L:${Math.round(rawHeight)}`);
                        }
                        if (wJambs.includes('right')) {
                            wJambLenMm += rawHeight;
                            sideLabels.push(`R:${Math.round(rawHeight)}`);
                        }
                        if (wJambs.includes('top')) {
                            wJambLenMm += wWidth;
                            sideLabels.push(`T:${Math.round(wWidth)}`);
                        }
                        const wJambArea = (wJambLenMm * wDepth) / 1e6;
                        jambLengthMm += wJambLenMm;
                        jambAreaM2 += wJambArea;
                        jambItems.push({
                            id: w.id,
                            name: w.name,
                            jambs: wJambs.slice(),
                            lengthMm: Math.round(wJambLenMm),
                            areaM2: round2(wJambArea),
                            summary: `${w.name} (${sideLabels.join('+')} mm = ${round2(wJambArea).toFixed(2)} m²)`
                        });
                    }
                });

                // If excluded jamb strips start at window sill height (exclHeightMm < floorHeightMm),
                // the wall material below those jamb strips (floorHeightMm - exclHeightMm) is still part of the facade!
                const hBelowJamb = Math.max(0, floorHeightMm - exclHeightMm);
                if (exclMm > 0 && hBelowJamb > 0) {
                    const jambUnderM2 = (exclMm * hBelowJamb) / 1e6;
                    const jambUnderLabel = `under jambs [len ${Math.round(exclMm).toLocaleString()} mm × ${Math.round(hBelowJamb / 10)} cm]`;
                    if (hBelowJamb > thresholdMm) {
                        areaGt185M2 += jambUnderM2;
                        lengthGt185Mm += exclMm;
                        gt185Parts.push(jambUnderLabel);
                    } else {
                        areaLe185M2 += jambUnderM2;
                        lengthLe185Mm += exclMm;
                        le185Parts.push(jambUnderLabel);
                    }
                }

                const pierWidthMm = Math.max(0, wallLengthMm - winSpanSumMm);
                const pierAreaM2 = (pierWidthMm * floorHeightMm) / 1e6;
                if (pierWidthMm > 0) {
                    const pierDetail = (viewId === 'east_facade' && floorKey === 'first' && Math.round(pierWidthMm) === 485)
                        ? `485 mm (400 mm front pier + 85 mm background next to O14b)`
                        : `${Math.round(pierWidthMm).toLocaleString()} mm`;
                    const pierLabel = `full-height piers [len ${pierDetail} × ${Math.round(floorHeightMm / 10)} cm]`;
                    if (floorHeightMm > thresholdMm) {
                        areaGt185M2 += pierAreaM2;
                        lengthGt185Mm += pierWidthMm;
                        gt185Parts.unshift(pierLabel);
                    } else {
                        areaLe185M2 += pierAreaM2;
                        lengthLe185Mm += pierWidthMm;
                        le185Parts.unshift(pierLabel);
                    }
                }

                const exactTotalM2 = areaGt185M2 + areaLe185M2;
                const grossAreaM2 = round2(((wallLengthMm + (hBelowJamb > 0 ? exclMm : 0)) * floorHeightMm) / 1e6);
                const totalAreaM2 = round2(exactTotalM2);
                const roundedWinAreaM2 = round2(winAreaM2);
                const roundedLe185M2 = round2(areaLe185M2);
                const roundedGt185M2 = round2(totalAreaM2 - roundedLe185M2);

                const roundedLengthGt185Mm = Math.round(lengthGt185Mm);
                const roundedLengthLe185Mm = Math.round(lengthLe185Mm);
                const totalLengthMm = roundedLengthGt185Mm + roundedLengthLe185Mm;
                const lengthLe185M = round2(roundedLengthLe185Mm / 1000);
                const totalLengthM = round2(totalLengthMm / 1000);
                const lengthGt185M = round2(totalLengthM - lengthLe185M);

                const excludedAreaM2 = round2((exclMm * exclHeightMm) / 1e6);

                return {
                    wallLengthMm,
                    excludedMm: exclMm,
                    excludedAreaM2,
                    excludedNote: excludedNote || '',
                    fullHeightWinSpanMm: Math.round(fullHeightWinSpanMm),
                    floorHeightMm,
                    materialLabel,
                    grossAreaM2,
                    winAreaM2: roundedWinAreaM2,
                    totalAreaM2,
                    areaGt185M2: roundedGt185M2,
                    areaLe185M2: roundedLe185M2,
                    totalLengthMm,
                    lengthGt185Mm: roundedLengthGt185Mm,
                    lengthLe185Mm: roundedLengthLe185Mm,
                    totalLengthM,
                    lengthGt185M,
                    lengthLe185M,
                    gt185Note: gt185Parts.length > 0 ? gt185Parts.join(' + ') : 'None',
                    le185Note: le185Parts.length > 0 ? le185Parts.join(' + ') : 'None (all openings full-height or >185 cm)',
                    jambs: {
                        areaM2: round2(jambAreaM2),
                        lengthMm: Math.round(jambLengthMm),
                        lengthM: round2(jambLengthMm / 1000),
                        items: jambItems,
                        note: jambItems.length > 0 ? jambItems.map(i => i.summary).join(' + ') : 'None'
                    }
                };
            }

            const lower = computeFloorStats(
                'ground',
                spec.lowerLengthMm,
                spec.lowerBottomMm,
                spec.lowerTopMm,
                spec.lowerMaterial,
                spec.lowerExcludedMm,
                spec.lowerExcludedNote,
                spec.lowerExcludedHeightMm
            );
            const upper = computeFloorStats(
                'first',
                spec.upperLengthMm,
                spec.upperBottomMm,
                spec.upperTopMm,
                spec.upperMaterial,
                spec.upperExcludedMm,
                spec.upperExcludedNote,
                spec.upperExcludedHeightMm
            );

            const totalJambsAreaM2 = round2(lower.jambs.areaM2 + upper.jambs.areaM2);
            const totalJambsLengthMm = lower.jambs.lengthMm + upper.jambs.lengthMm;
            const totalJambsLengthM = round2(totalJambsLengthMm / 1000);

            return {
                viewId,
                thresholdCm: 185,
                jambDepthCm: 20,
                jambDepthMm: 200,
                jambMaterialMode: this.jambMaterialMode,
                lower, // (1) = lower.totalAreaM2 / totalLengthMm, (3) = lower.areaGt185M2 / lengthGt185Mm, (5) = lower.areaLe185M2 / lengthLe185Mm
                upper, // (2) = upper.totalAreaM2 / totalLengthMm, (4) = upper.areaGt185M2 / lengthGt185Mm, (6) = upper.areaLe185M2 / lengthLe185Mm
                jambs: {
                    depthMm: 200,
                    depthCm: 20,
                    lower: lower.jambs,
                    upper: upper.jambs,
                    totalAreaM2: totalJambsAreaM2,
                    totalLengthMm: totalJambsLengthMm,
                    totalLengthM: totalJambsLengthM
                },
                combinedTotalM2: round2(lower.totalAreaM2 + upper.totalAreaM2),
                combinedGt185M2: round2(lower.areaGt185M2 + upper.areaGt185M2),
                combinedLe185M2: round2(lower.areaLe185M2 + upper.areaLe185M2),
                combinedTotalLengthMm: lower.totalLengthMm + upper.totalLengthMm,
                combinedTotalLengthM: round2(lower.totalLengthM + upper.totalLengthM)
            };
        },

        /**
         * Render HTML markup for the 6-metric Facade Material Area & Length Summary + Window Jambs panel
         * @param {string} viewId
         */
        renderFacadeAreaSummaryHTML: function (viewId) {
            const stats = this.calculateFacadeAreas(viewId);
            if (!stats) return '';

            const fmt = (val) => val.toFixed(2);
            const fmtMm = (val) => Math.round(val).toLocaleString();
            const L = stats.lower;
            const U = stats.upper;
            const J = stats.jambs;
            const isRal = this.jambMaterialMode === 'ral7021';
            const lPctGt = L.totalAreaM2 > 0 ? Math.round((L.areaGt185M2 / L.totalAreaM2) * 100) : 0;
            const lPctLe = 100 - lPctGt;
            const uPctGt = U.totalAreaM2 > 0 ? Math.round((U.areaGt185M2 / U.totalAreaM2) * 100) : 0;
            const uPctLe = 100 - uPctGt;

            const lExclLine = L.excludedMm > 0
                ? `<div style="color: #dc2626; font-weight: 600;">&minus; Removed from facade: ${L.excludedNote} (&minus;${fmt(L.excludedAreaM2)} m&sup2;)</div>`
                : '';
            const uExclLine = U.excludedMm > 0
                ? `<div style="color: #dc2626; font-weight: 600;">&minus; Removed from facade: ${U.excludedNote} (&minus;${fmt(U.excludedAreaM2)} m&sup2;)</div>`
                : '';

            const jambModeLabel = isRal
                ? 'Option 2: RAL 7021 (Black-Grey #1f2421)'
                : 'Option 1: Same material as floor (Brick on lower / Wood on upper)';

            return `
                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 18px; margin-bottom: 20px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px solid #e2e8f0;">
                        <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                            <span style="font-size: 14px; font-weight: 700; color: #0f172a;">🧱 Dynamic Facade Material &amp; Window Jambs Summary (Excluding Windows &amp; Jambs)</span>
                            <span style="font-size: 11.5px; font-family: 'JetBrains Mono', monospace; background: #e0f2fe; color: #0369a1; padding: 2px 8px; border-radius: 12px; font-weight: 600;">
                                Cutoff: h &gt; 185 cm vs h &le; 185 cm
                            </span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px; font-family: 'JetBrains Mono', monospace; font-size: 12px; flex-wrap: wrap;">
                            <span style="background: #0f172a; color: #f8fafc; padding: 4px 10px; border-radius: 6px; font-weight: 600;">
                                Facade (1)+(2): <strong>${fmt(stats.combinedTotalM2)} m&sup2;</strong> &bull; Len: <strong>${fmtMm(stats.combinedTotalLengthMm)} mm (${fmt(stats.combinedTotalLengthM)} m)</strong>
                            </span>
                            <span style="background: #1f2421; color: #fde68a; padding: 4px 10px; border-radius: 6px; font-weight: 600; border: 1px solid #475569;">
                                Window Jambs (20 cm): <strong>${fmt(J.totalAreaM2)} m&sup2;</strong> &bull; Len: <strong>${fmtMm(J.totalLengthMm)} mm (${fmt(J.totalLengthM)} m)</strong>
                            </span>
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(420px, 1fr)); gap: 14px; margin-bottom: 12px;">
                        <!-- LOWER FLOOR CARD: Metrics (1), (3), (5) -->
                        <div style="background: #ffffff; border: 1px solid #cbd5e1; border-left: 4px solid #334155; border-radius: 8px; padding: 12px 15px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
                            <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px;">
                                <div>
                                    <span style="font-size: 13px; font-weight: 700; color: #0f172a;">Lower Floor (Parter &bull; H = ${Math.round(L.floorHeightMm / 10)} cm)</span>
                                    <span style="font-size: 11px; color: #64748b; margin-left: 6px;">${L.materialLabel}</span>
                                </div>
                                <span style="font-size: 11px; font-family: 'JetBrains Mono', monospace; color: #047857; background: #ecfdf5; border: 1px solid #a7f3d0; padding: 1px 6px; border-radius: 4px; font-weight: 600;">
                                    (1) = (3) + (5) &check;
                                </span>
                            </div>

                            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 8px;">
                                <div style="background: #f1f5f9; padding: 8px 10px; border-radius: 6px; border: 1px solid #e2e8f0;">
                                    <div style="font-size: 10.5px; font-weight: 700; color: #475569; text-transform: uppercase;">1) Total Lower Floor</div>
                                    <div style="font-size: 16px; font-weight: 800; color: #0f172a; font-family: 'JetBrains Mono', monospace; margin-top: 2px;">${fmt(L.totalAreaM2)} m&sup2;</div>
                                    <div style="font-size: 11.5px; font-weight: 700; color: #334155; font-family: 'JetBrains Mono', monospace; margin-top: 2px;">Len: ${fmtMm(L.totalLengthMm)} mm (${fmt(L.totalLengthM)} m)</div>
                                    <div style="font-size: 10px; color: #64748b; font-family: 'JetBrains Mono', monospace; margin-top: 2px;">Gross ${fmt(L.grossAreaM2)} &minus; Win ${fmt(L.winAreaM2)} m&sup2;</div>
                                </div>
                                <div style="background: #eff6ff; padding: 8px 10px; border-radius: 6px; border: 1px solid #bfdbfe;">
                                    <div style="font-size: 10.5px; font-weight: 700; color: #1d4ed8; text-transform: uppercase;">3) Height &gt; 185 cm</div>
                                    <div style="font-size: 16px; font-weight: 800; color: #1e40af; font-family: 'JetBrains Mono', monospace; margin-top: 2px;">${fmt(L.areaGt185M2)} m&sup2;</div>
                                    <div style="font-size: 11.5px; font-weight: 700; color: #1d4ed8; font-family: 'JetBrains Mono', monospace; margin-top: 2px;">Len: ${fmtMm(L.lengthGt185Mm)} mm (${fmt(L.lengthGt185M)} m)</div>
                                    <div style="font-size: 10px; color: #3b82f6; font-family: 'JetBrains Mono', monospace; margin-top: 2px;">${lPctGt}% of lower area</div>
                                </div>
                                <div style="background: #fffbeb; padding: 8px 10px; border-radius: 6px; border: 1px solid #fde68a;">
                                    <div style="font-size: 10.5px; font-weight: 700; color: #b45309; text-transform: uppercase;">5) Height &le; 185 cm</div>
                                    <div style="font-size: 16px; font-weight: 800; color: #92400e; font-family: 'JetBrains Mono', monospace; margin-top: 2px;">${fmt(L.areaLe185M2)} m&sup2;</div>
                                    <div style="font-size: 11.5px; font-weight: 700; color: #b45309; font-family: 'JetBrains Mono', monospace; margin-top: 2px;">Len: ${fmtMm(L.lengthLe185Mm)} mm (${fmt(L.lengthLe185M)} m)</div>
                                    <div style="font-size: 10px; color: #d97706; font-family: 'JetBrains Mono', monospace; margin-top: 2px;">${lPctLe}% (under/above win)</div>
                                </div>
                            </div>

                            <!-- Proportional Split Bar -->
                            <div style="height: 6px; width: 100%; background: #fde68a; border-radius: 3px; overflow: hidden; display: flex; margin-bottom: 6px;">
                                <div style="width: ${lPctGt}%; background: #2563eb; height: 100%;"></div>
                            </div>
                            <div style="font-size: 11px; color: #64748b; line-height: 1.35; font-family: 'JetBrains Mono', monospace;">
                                ${lExclLine}
                                <div><strong style="color: #1e40af;">&gt;185cm:</strong> ${L.gt185Note}</div>
                                <div><strong style="color: #92400e;">&le;185cm:</strong> ${L.le185Note}</div>
                            </div>
                        </div>

                        <!-- UPPER FLOOR CARD: Metrics (2), (4), (6) -->
                        <div style="background: #ffffff; border: 1px solid #cbd5e1; border-left: 4px solid #b45309; border-radius: 8px; padding: 12px 15px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
                            <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px;">
                                <div>
                                    <span style="font-size: 13px; font-weight: 700; color: #0f172a;">Upper Floor (Pi&#281;tro &bull; H = ${Math.round(U.floorHeightMm / 10)} cm)</span>
                                    <span style="font-size: 11px; color: #64748b; margin-left: 6px;">${U.materialLabel}</span>
                                </div>
                                <span style="font-size: 11px; font-family: 'JetBrains Mono', monospace; color: #047857; background: #ecfdf5; border: 1px solid #a7f3d0; padding: 1px 6px; border-radius: 4px; font-weight: 600;">
                                    (2) = (4) + (6) &check;
                                </span>
                            </div>

                            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 8px;">
                                <div style="background: #f1f5f9; padding: 8px 10px; border-radius: 6px; border: 1px solid #e2e8f0;">
                                    <div style="font-size: 10.5px; font-weight: 700; color: #475569; text-transform: uppercase;">2) Total Upper Floor</div>
                                    <div style="font-size: 16px; font-weight: 800; color: #0f172a; font-family: 'JetBrains Mono', monospace; margin-top: 2px;">${fmt(U.totalAreaM2)} m&sup2;</div>
                                    <div style="font-size: 11.5px; font-weight: 700; color: #334155; font-family: 'JetBrains Mono', monospace; margin-top: 2px;">Len: ${fmtMm(U.totalLengthMm)} mm (${fmt(U.totalLengthM)} m)</div>
                                    <div style="font-size: 10px; color: #64748b; font-family: 'JetBrains Mono', monospace; margin-top: 2px;">Gross ${fmt(U.grossAreaM2)} &minus; Win ${fmt(U.winAreaM2)} m&sup2;</div>
                                </div>
                                <div style="background: #eff6ff; padding: 8px 10px; border-radius: 6px; border: 1px solid #bfdbfe;">
                                    <div style="font-size: 10.5px; font-weight: 700; color: #1d4ed8; text-transform: uppercase;">4) Height &gt; 185 cm</div>
                                    <div style="font-size: 16px; font-weight: 800; color: #1e40af; font-family: 'JetBrains Mono', monospace; margin-top: 2px;">${fmt(U.areaGt185M2)} m&sup2;</div>
                                    <div style="font-size: 11.5px; font-weight: 700; color: #1d4ed8; font-family: 'JetBrains Mono', monospace; margin-top: 2px;">Len: ${fmtMm(U.lengthGt185Mm)} mm (${fmt(U.lengthGt185M)} m)</div>
                                    <div style="font-size: 10px; color: #3b82f6; font-family: 'JetBrains Mono', monospace; margin-top: 2px;">${uPctGt}% of upper area</div>
                                </div>
                                <div style="background: #fffbeb; padding: 8px 10px; border-radius: 6px; border: 1px solid #fde68a;">
                                    <div style="font-size: 10.5px; font-weight: 700; color: #b45309; text-transform: uppercase;">6) Height &le; 185 cm</div>
                                    <div style="font-size: 16px; font-weight: 800; color: #92400e; font-family: 'JetBrains Mono', monospace; margin-top: 2px;">${fmt(U.areaLe185M2)} m&sup2;</div>
                                    <div style="font-size: 11.5px; font-weight: 700; color: #b45309; font-family: 'JetBrains Mono', monospace; margin-top: 2px;">Len: ${fmtMm(U.lengthLe185Mm)} mm (${fmt(U.lengthLe185M)} m)</div>
                                    <div style="font-size: 10px; color: #d97706; font-family: 'JetBrains Mono', monospace; margin-top: 2px;">${uPctLe}% (under/above win)</div>
                                </div>
                            </div>

                            <!-- Proportional Split Bar -->
                            <div style="height: 6px; width: 100%; background: #fde68a; border-radius: 3px; overflow: hidden; display: flex; margin-bottom: 6px;">
                                <div style="width: ${uPctGt}%; background: #2563eb; height: 100%;"></div>
                            </div>
                            <div style="font-size: 11px; color: #64748b; line-height: 1.35; font-family: 'JetBrains Mono', monospace;">
                                ${uExclLine}
                                <div><strong style="color: #1e40af;">&gt;185cm:</strong> ${U.gt185Note}</div>
                                <div><strong style="color: #92400e;">&le;185cm:</strong> ${U.le185Note}</div>
                            </div>
                        </div>
                    </div>

                    <!-- WINDOW JAMBS SEPARATE CALCULATION CARD (Depth = 20 cm = 200 mm) -->
                    <div style="background: #ffffff; border: 1px solid #cbd5e1; border-left: 4px solid #1f2421; border-radius: 8px; padding: 11px 15px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
                        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; margin-bottom: 8px;">
                            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                                <span style="font-size: 13px; font-weight: 700; color: #0f172a;">🪟 Window Jambs on This View (O&#347;cie&#380;a Okienne &bull; Depth = 20 cm / 200 mm)</span>
                                <span style="font-size: 11px; font-family: 'JetBrains Mono', monospace; background: ${isRal ? '#1f2421' : '#f1f5f9'}; color: ${isRal ? '#f8fafc' : '#334155'}; padding: 2px 8px; border-radius: 4px; font-weight: 600; border: 1px solid #cbd5e1;">
                                    Display: ${jambModeLabel}
                                </span>
                            </div>
                            <span style="font-size: 11px; font-family: 'JetBrains Mono', monospace; color: #475569;">
                                Calculated separately (left/right = height &times; 200 mm, top = width &times; 200 mm)
                            </span>
                        </div>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 10px;">
                            <div style="background: #f8fafc; padding: 8px 12px; border-radius: 6px; border: 1px solid #e2e8f0;">
                                <div style="font-size: 10.5px; font-weight: 700; color: #475569; text-transform: uppercase;">Lower Floor Window Jambs (${ isRal ? 'RAL 7021' : 'Clinker Brick' })</div>
                                <div style="display: flex; align-items: baseline; gap: 10px; margin-top: 2px;">
                                    <span style="font-size: 15px; font-weight: 800; color: #0f172a; font-family: 'JetBrains Mono', monospace;">${fmt(J.lower.areaM2)} m&sup2;</span>
                                    <span style="font-size: 11.5px; font-weight: 700; color: #334155; font-family: 'JetBrains Mono', monospace;">Len: ${fmtMm(J.lower.lengthMm)} mm (${fmt(J.lower.lengthM)} m)</span>
                                </div>
                                <div style="font-size: 10.5px; color: #64748b; font-family: 'JetBrains Mono', monospace; margin-top: 3px;">${J.lower.note}</div>
                            </div>
                            <div style="background: #f8fafc; padding: 8px 12px; border-radius: 6px; border: 1px solid #e2e8f0;">
                                <div style="font-size: 10.5px; font-weight: 700; color: #475569; text-transform: uppercase;">Upper Floor Window Jambs (${ isRal ? 'RAL 7021' : 'Timber Slats' })</div>
                                <div style="display: flex; align-items: baseline; gap: 10px; margin-top: 2px;">
                                    <span style="font-size: 15px; font-weight: 800; color: #0f172a; font-family: 'JetBrains Mono', monospace;">${fmt(J.upper.areaM2)} m&sup2;</span>
                                    <span style="font-size: 11.5px; font-weight: 700; color: #334155; font-family: 'JetBrains Mono', monospace;">Len: ${fmtMm(J.upper.lengthMm)} mm (${fmt(J.upper.lengthM)} m)</span>
                                </div>
                                <div style="font-size: 10.5px; color: #64748b; font-family: 'JetBrains Mono', monospace; margin-top: 3px;">${J.upper.note}</div>
                            </div>
                            <div style="background: #f1f5f9; padding: 8px 12px; border-radius: 6px; border: 1px solid #cbd5e1;">
                                <div style="font-size: 10.5px; font-weight: 700; color: #0f172a; text-transform: uppercase;">Total Window Jambs on View</div>
                                <div style="display: flex; align-items: baseline; gap: 10px; margin-top: 2px;">
                                    <span style="font-size: 15px; font-weight: 800; color: #0f172a; font-family: 'JetBrains Mono', monospace;">${fmt(J.totalAreaM2)} m&sup2;</span>
                                    <span style="font-size: 11.5px; font-weight: 700; color: #334155; font-family: 'JetBrains Mono', monospace;">Len: ${fmtMm(J.totalLengthMm)} mm (${fmt(J.totalLengthM)} m)</span>
                                </div>
                                <div style="font-size: 10.5px; color: #475569; font-family: 'JetBrains Mono', monospace; margin-top: 3px;">Lower ${fmt(J.lower.areaM2)} m&sup2; + Upper ${fmt(J.upper.areaM2)} m&sup2; (depth 200 mm)</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        },

        /**
         * Mount and bind a reactive Facade Material Area Summary panel
         * @param {string|Element} container
         * @param {string} viewId
         */
        mountFacadeAreaSummary: function (container, viewId) {
            const el = typeof container === 'string' ? document.getElementById(container) : container;
            if (!el) return () => {};

            if (typeof el._unmountFacadeAreaSummary === 'function') {
                el._unmountFacadeAreaSummary();
            }

            const render = () => {
                const html = this.renderFacadeAreaSummaryHTML(viewId);
                const doc = new DOMParser().parseFromString(html, 'text/html');
                el.replaceChildren(...Array.from(doc.body.childNodes));
            };

            render();
            const unsubscribe = WindowStore.subscribe(() => {
                render();
            });
            el._unmountFacadeAreaSummary = unsubscribe;
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
            const summaryNodes = document.querySelectorAll('[data-facade-area-summary]');
            summaryNodes.forEach(node => {
                const viewId = node.getAttribute('data-facade-area-summary');
                if (viewId) {
                    this.mountFacadeAreaSummary(node, viewId);
                }
            });
            this.syncJambVisualsOnPage();
        }
    };

    if (typeof window !== 'undefined') {
        window.setWindowJambOption = function (mode) {
            WindowComponent.setJambMaterialMode(mode);
        };
    }

    return WindowComponent;
}));
