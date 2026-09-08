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

            if (viewId === 'north_facade') {
                return this._renderExteriorNorthFacade(win, x, y, w, h);
            } else if (viewId === 'kitchen_back_wall' || viewId === 'kitchen_north_wall') {
                return this._renderInteriorKitchen(win, x, y, w, h, styleType);
            }

            return this._renderGeneric(win, x, y, w, h);
        },

        _renderExteriorNorthFacade: function (win, x, y, w, h) {
            const isCorner = win.id === 'O13a';
            const isFullHeight = win.id === '14a';
            const midX = x + w / 2;

            let sashesSvg = '';
            if (win.sashes === 2 && win.hasMullion) {
                sashesSvg = `<line x1="${midX}" y1="${y + 4}" x2="${midX}" y2="${y + h - 4}" stroke="#0f172a" stroke-width="2.5" />`;
            }

            // Sill plate
            let sillSvg = '';
            if (!isFullHeight && !isCorner) {
                sillSvg = `<rect x="${x - 5}" y="${y + h}" width="${w + 10}" height="5" fill="#0f172a" />`;
            }

            return `
                <g class="interactive-element window-component" data-window-id="${win.id}" onclick="showElementDetails('${win.id}')" style="cursor: pointer;">
                    <!-- Outer reveal / frame -->
                    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#1e293b" stroke="#0f172a" stroke-width="2" />
                    <!-- Glass pane with glare -->
                    <rect x="${x + 4}" y="${y + 4}" width="${w - 8}" height="${h - 8}" fill="url(#glass-glare)" />
                    <rect x="${x + 4}" y="${y + 4}" width="${w - 8}" height="${h - 8}" fill="none" stroke="#0f172a" stroke-width="3" />
                    ${sashesSvg}
                    ${sillSvg}
                    <!-- Dimension Label Badge -->
                    <text x="${midX}" y="${y + h / 2 - 5}" font-family="'JetBrains Mono', monospace" font-size="${w > 150 ? 11 : 9.5}" fill="#ffffff" font-weight="700" text-anchor="middle" filter="drop-shadow(0 1px 2px black)">
                        ${win.name} (${Math.round(win.width / 10)}×${Math.round(win.height / 10)})
                    </text>
                    <text x="${midX}" y="${y + h / 2 + 12}" font-family="'JetBrains Mono', monospace" font-size="8.5" fill="#93c5fd" font-weight="600" text-anchor="middle">
                        hp=${Math.round(win.sill / 10)}
                    </text>
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

            function update() {
                const win = WindowStore.get(windowId);
                if (!win) {
                    el.innerHTML = '';
                    return;
                }
                el.innerHTML = WindowComponent.createSVG(win, viewId, styleType);
            }

            // Initial render
            update();

            // Subscribe to WindowStore updates
            const unsubscribe = WindowStore.subscribe((id) => {
                if (id === windowId || id === '*') {
                    update();
                }
            });

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
