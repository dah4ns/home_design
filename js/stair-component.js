/**
 * stair-component.js
 * Reusable SVG Staircase Component & Object Store with dynamic geometric calculation,
 * parametric reactive data-binding, and customizable architectural attributes.
 */
(function (root, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        const stairsData = require('../data/stairs.js');
        module.exports = factory(stairsData);
    } else {
        root.StairComponent = factory(root.BUILDING_STAIRS_DATA || (root.BUILDING_WINDOWS_DATA && root.BUILDING_WINDOWS_DATA.stairs));
    }
}(typeof self !== 'undefined' ? self : this, function (initialData) {

    // Internal In-Memory Store
    const _stairs = {};
    const _listeners = [];

    // Load initial data if provided
    const sourceData = (initialData && initialData.stairs) ? initialData.stairs : (initialData || {});
    for (const key in sourceData) {
        if (Object.prototype.hasOwnProperty.call(sourceData, key)) {
            _stairs[key] = JSON.parse(JSON.stringify(sourceData[key]));
        }
    }

    // Default main staircase fallback if empty
    if (!_stairs['main_staircase']) {
        _stairs['main_staircase'] = {
            id: 'main_staircase',
            name: 'Main Staircase (Schody)',
            room: '1.07 Komunikacja / Korytarz',
            viewId: 'stairs_north_wall',
            flooring_height: 0,
            width: 1000,
            step_height: 175,
            step_length: 260,
            plank_height: 40,
            stair_slab: 193,
            x: 2549,
            global_x: 16361,
            total_risers: 19,
            turn_steps_count: 4,
            straight_risers_count: 15,
            straight_treads_count: 14,
            straight_flight_run: 3640,
            end_x: 7189,
            total_rise: 3325,
            top_floor_elevation: 3330,
            balustrade_height: 900,
            show_planks: false,
            line_thickness: 1.0
        };
    }

    const StairComponent = {
        /**
         * Get a staircase object by ID
         * @param {string} id
         * @returns {object|null}
         */
        get: function (id = 'main_staircase') {
            if (!_stairs[id]) return null;
            return JSON.parse(JSON.stringify(_stairs[id]));
        },

        /**
         * Get all staircases
         * @returns {object}
         */
        getAll: function () {
            return JSON.parse(JSON.stringify(_stairs));
        },

        /**
         * Update staircase properties and notify subscribers
         * @param {string} id
         * @param {object} updates
         * @returns {object}
         */
        update: function (id, updates) {
            if (!_stairs[id]) {
                _stairs[id] = { id: id };
            }
            if (updates.step_length !== undefined && updates.end_x === undefined) {
                delete _stairs[id]._use_end_x;
            }
            if (updates.end_x !== undefined) {
                _stairs[id]._use_end_x = true;
            }
            Object.assign(_stairs[id], updates);
            this.recalculate(id);
            this._notify(id, _stairs[id]);
            this.autoMountAll();
            return this.get(id);
        },

        /**
         * Subscribe to updates
         * @param {function} callback
         */
        subscribe: function (callback) {
            if (typeof callback === 'function') {
                _listeners.push(callback);
            }
        },

        _notify: function (id, stair) {
            _listeners.forEach(fn => {
                try {
                    fn(id, stair);
                } catch (e) {
                    console.error('StairComponent listener error:', e);
                }
            });
        },

        /**
         * Recalculate derived geometric properties for a staircase
         * @param {string} id
         */
        recalculate: function (id = 'main_staircase') {
            const s = _stairs[id];
            if (!s) return;

            s.turn_steps_count = s.turn_steps_count || 4;
            s.straight_risers_count = s.straight_risers_count || 15;
            s.straight_treads_count = s.straight_treads_count || (s.straight_risers_count - 1);
            s.total_risers = s.turn_steps_count + s.straight_risers_count;

            if (s._use_end_x && typeof s.end_x !== 'undefined' && typeof s.x !== 'undefined') {
                s.straight_flight_run = s.end_x - s.x - (s.width || 1000);
                s.step_length = Math.round((s.straight_flight_run / s.straight_treads_count) * 100) / 100;
            } else if (typeof s.step_length !== 'undefined') {
                s.straight_flight_run = s.straight_treads_count * s.step_length;
                s.end_x = s.x + (s.width || 1000) + s.straight_flight_run;
            } else if (typeof s.end_x !== 'undefined') {
                s.straight_flight_run = s.end_x - s.x - (s.width || 1000);
                s.step_length = Math.round((s.straight_flight_run / s.straight_treads_count) * 100) / 100;
            }

            s.total_rise = s.total_risers * s.step_height;
            s.top_floor_elevation = s.flooring_height + s.total_rise;
        },

        /**
         * Calculate SVG coordinates based on view scale & floor datum
         * @param {object} stair
         * @param {number} scale Default 0.1 (1 SVG unit = 10 mm)
         * @param {number} floorY Default 640 (Finished ground floor datum)
         * @returns {object}
         */
        computeGeometry: function (stair, scale = 0.1, floorY = 640) {
            this.recalculate(stair.id || 'main_staircase');
            const s = stair;

            const floorSvgY = floorY - (s.flooring_height * scale);
            const xSvg = s.x * scale;
            const widthSvg = s.width * scale;
            const stepHSvg = s.step_height * scale;
            const stepLSvg = s.step_length * scale;
            const plankHSvg = (s.plank_height || 40) * scale;
            const stairSlabSvg = ((typeof s.stair_slab !== 'undefined') ? s.stair_slab : 193) * scale;
            // Architectural Rule for Stair Concrete Skeleton with Finished Wood Planks:
            // 1. First step has concrete height: (step_height - plank_height)
            //    so that in total the first step will have step_height together with the plank.
            // 2. Last horizontal step (Step 18) is at:
            //    top_floor_elevation - step_height - plank_height
            //    so that with the plank, the rise from the last step to the top floor is exactly step_height.
            const firstStepH = s.step_height - (s.plank_height || 40);
            const firstStepHSvg = firstStepH * scale;

            // Turn steps concrete tops (Steps 1 to 4)
            const yStep1 = floorSvgY - firstStepHSvg;
            const yStep2 = yStep1 - stepHSvg;
            const yStep3 = yStep2 - stepHSvg;
            const yStep4 = yStep3 - stepHSvg;

            const flightStartX = xSvg + widthSvg;
            const flightStartY = yStep4; // Flight starts at top of step 4

            // Last horizontal step concrete top (Step 18)
            const lastStepConcreteElevation = s.top_floor_elevation - s.step_height - (s.plank_height || 40);
            const lastStepTopY = floorSvgY - (lastStepConcreteElevation * scale);

            const flightEndX = flightStartX + (s.straight_treads_count * stepLSvg);
            const topFloorSvgY = floorSvgY - (s.top_floor_elevation * scale);

            // Intermediate risers across the 14 straight treads (Steps 5 to 18)
            const straightRiserHSvg = (flightStartY - lastStepTopY) / s.straight_treads_count;

            // Step lines / points for straight flight (5 to 18)
            const flightSteps = [];
            for (let i = 0; i < s.straight_treads_count; i++) {
                const stepNum = s.turn_steps_count + 1 + i;
                const riserX = flightStartX + (i * stepLSvg);
                const bottomY = flightStartY - (i * straightRiserHSvg);
                const topY = bottomY - straightRiserHSvg;
                const nextX = riserX + stepLSvg;

                flightSteps.push({
                    stepNumber: stepNum,
                    riserX: riserX,
                    bottomY: bottomY,
                    topY: topY,
                    treadEndX: nextX,
                    treadY: topY
                });
            }

            // Step 19 (Final riser to top landing)
            const topRiserX = flightEndX;
            const topRiserBottomY = lastStepTopY;
            const topRiserTopY = topFloorSvgY;

            return {
                scale,
                floorSvgY,
                xSvg,
                widthSvg,
                stepHSvg,
                stepLSvg,
                plankHSvg,
                stairSlabSvg,
                firstStepHSvg,
                yStep1,
                yStep2,
                yStep3,
                yStep4,
                flightStartX,
                flightStartY,
                flightEndX,
                flightEndY: topFloorSvgY,
                lastStepTopY,
                flightSteps,
                topRiser: {
                    x: topRiserX,
                    bottomY: topRiserBottomY,
                    topY: topRiserTopY
                },
                soffit: {
                    x1: flightStartX,
                    y1: flightStartY,
                    x2: flightEndX,
                    y2: topRiserBottomY
                },
                slab: {
                    thickness: stairSlabSvg,
                    p1: { x: flightStartX, y: flightStartY },
                    p2: { x: flightEndX, y: topRiserBottomY },
                    p3: { x: flightEndX, y: topRiserBottomY + stairSlabSvg },
                    p4: { x: flightStartX, y: flightStartY + stairSlabSvg }
                }
            };
        },

        /**
         * Render SVG markup for the entire staircase
         * @param {object|string} stairOrId
         * @param {object} options
         * @returns {string} SVG inner markup
         */
        createSVG: function (stairOrId, options = {}) {
            const stair = typeof stairOrId === 'string' ? this.get(stairOrId) : stairOrId;
            if (!stair) return '';

            const scale = options.scale || 0.1;
            const floorY = options.floorY || 640;
            const geom = this.computeGeometry(stair, scale, floorY);
            const strokeColor = options.strokeColor || '#4a3f35';
            const lineWidth = stair.line_thickness || 1.0;
            const showPlanks = (typeof options.showPlanks !== 'undefined') ? options.showPlanks : Boolean(stair.show_planks);

            // 0. Stair Slab (Structural slab under flight, parallel to soffit, vertical height = stair_slab)
            const slabSvg = `
                <!-- Stair Slab (Vertical height = ${stair.stair_slab || 193} mm, parallel to soffit) -->
                <polygon points="${geom.slab.p1.x.toFixed(1)},${geom.slab.p1.y.toFixed(1)} ${geom.slab.p2.x.toFixed(1)},${geom.slab.p2.y.toFixed(1)} ${geom.slab.p3.x.toFixed(1)},${geom.slab.p3.y.toFixed(1)} ${geom.slab.p4.x.toFixed(1)},${geom.slab.p4.y.toFixed(1)}" 
                         fill="#fdfbf7" stroke="${strokeColor}" stroke-width="${lineWidth}" />
            `;

            // 1. Soffit line (Adjacent to all step corners: from (354.9, 570.0) to (718.9, 325.0))
            const soffitSvg = `
                <!-- Stair Underside Soffit Line (Strictly adjacent to all step corners) -->
                <line x1="${geom.soffit.x1.toFixed(1)}" y1="${geom.soffit.y1.toFixed(1)}" 
                      x2="${geom.soffit.x2.toFixed(1)}" y2="${geom.soffit.y2.toFixed(1)}" 
                      stroke="${strokeColor}" stroke-width="${lineWidth}" />
            `;

            // 2. Part A: 4 First Turn Stairs (X = xSvg .. xSvg + widthSvg)
            const turnX1 = geom.xSvg;
            const turnX2 = geom.flightStartX;
            const turnMidX = turnX1 + (geom.widthSvg / 2);

            const yStep1 = geom.yStep1;
            const yStep2 = geom.yStep2;
            const yStep3 = geom.yStep3;
            const yStep4 = geom.yStep4;

            let turnPlanksSvg = '';
            if (showPlanks) {
                turnPlanksSvg = `
                    <rect x="${(turnX1 - 1).toFixed(1)}" y="${(yStep1 - geom.plankHSvg).toFixed(1)}" width="${(geom.widthSvg + 2).toFixed(1)}" height="${geom.plankHSvg.toFixed(1)}" rx="1" fill="url(#oak-wood-grad)" stroke="#7c4d1e" stroke-width="0.8" />
                    <rect x="${(turnX1 - 1).toFixed(1)}" y="${(yStep2 - geom.plankHSvg).toFixed(1)}" width="${(geom.widthSvg + 2).toFixed(1)}" height="${geom.plankHSvg.toFixed(1)}" rx="1" fill="url(#oak-wood-grad)" stroke="#7c4d1e" stroke-width="0.8" />
                    <rect x="${(turnX1 - 1).toFixed(1)}" y="${(yStep3 - geom.plankHSvg).toFixed(1)}" width="${((geom.widthSvg / 2) + 2).toFixed(1)}" height="${geom.plankHSvg.toFixed(1)}" rx="1" fill="url(#oak-wood-grad)" stroke="#7c4d1e" stroke-width="0.8" />
                    <rect x="${(turnMidX - 1).toFixed(1)}" y="${(yStep4 - geom.plankHSvg).toFixed(1)}" width="${((geom.widthSvg / 2) + 2).toFixed(1)}" height="${geom.plankHSvg.toFixed(1)}" rx="1" fill="url(#oak-wood-grad)" stroke="#7c4d1e" stroke-width="0.8" />
                `;
            }

            const turnSvg = `
                <!-- ==================== A. THE 4 FIRST STAIRS: 1 STRAIGHT + 3 WINDER (STAIRS 1 TO 4) ==================== -->
                <g onclick="showElementDetails('stair_turn')" style="cursor: pointer;">
                    <!-- Lower 3-Step Base Enclosure Block -->
                    <rect x="${turnX1.toFixed(1)}" y="${yStep3.toFixed(1)}" width="${geom.widthSvg.toFixed(1)}" height="${(geom.floorSvgY - yStep3).toFixed(1)}" fill="#fdfbf7" stroke="${strokeColor}" stroke-width="${lineWidth}" />

                    <!-- STAIR 1 (STRAIGHT): Front Approach Riser Line -->
                    <line x1="${turnX1.toFixed(1)}" y1="${yStep1.toFixed(1)}" x2="${turnX2.toFixed(1)}" y2="${yStep1.toFixed(1)}" stroke="${strokeColor}" stroke-width="${lineWidth}" />

                    <!-- STAIR 2 (WINDER): Clean Front Face Line -->
                    <line x1="${turnX1.toFixed(1)}" y1="${yStep2.toFixed(1)}" x2="${turnX2.toFixed(1)}" y2="${yStep2.toFixed(1)}" stroke="${strokeColor}" stroke-width="${lineWidth}" />

                    <!-- STAIR 3 (WINDER TOP SURFACE ON LEFT) -->
                    <line x1="${turnX1.toFixed(1)}" y1="${yStep3.toFixed(1)}" x2="${turnMidX.toFixed(1)}" y2="${yStep3.toFixed(1)}" stroke="${strokeColor}" stroke-width="${lineWidth}" />

                    <!-- STAIR 4 (RIGHT PART ONLY): Vertical Riser & Tread -->
                    <rect x="${turnMidX.toFixed(1)}" y="${yStep4.toFixed(1)}" width="${(geom.widthSvg / 2).toFixed(1)}" height="${(yStep3 - yStep4).toFixed(1)}" fill="#fdfbf7" stroke="${strokeColor}" stroke-width="${lineWidth}" />
                    <line x1="${turnMidX.toFixed(1)}" y1="${yStep3.toFixed(1)}" x2="${turnMidX.toFixed(1)}" y2="${yStep4.toFixed(1)}" stroke="${strokeColor}" stroke-width="${lineWidth}" />
                    <line x1="${turnMidX.toFixed(1)}" y1="${yStep4.toFixed(1)}" x2="${turnX2.toFixed(1)}" y2="${yStep4.toFixed(1)}" stroke="${strokeColor}" stroke-width="${lineWidth}" />

                    ${turnPlanksSvg}
                </g>
            `;

            // 3. Part B: Straight flight (Steps 5 to 19)
            // Color is #fdfbf7 (matching the first part turn) with thin stroke #4a3f35
            // Each step polygon is strictly adjacent to the diagonal soffit line
            let flightStepsSvg = '';
            geom.flightSteps.forEach(st => {
                let plankSvg = '';
                if (showPlanks) {
                    plankSvg = `<rect x="${(st.riserX - 1.0).toFixed(1)}" y="${(st.treadY - geom.plankHSvg).toFixed(1)}" width="${(geom.stepLSvg + 2.0).toFixed(1)}" height="${geom.plankHSvg.toFixed(1)}" rx="1" fill="url(#oak-wood-grad)" stroke="#7c4d1e" stroke-width="0.8" />`;
                }
                flightStepsSvg += `
                    <!-- Step ${st.stepNumber}: Riser at X = ${st.riserX.toFixed(1)} (Y = ${st.bottomY.toFixed(1)} -> ${st.topY.toFixed(1)}), Tread X = ${st.riserX.toFixed(1)}..${st.treadEndX.toFixed(1)} -->
                    <polygon points="${st.riserX.toFixed(1)},${st.bottomY.toFixed(1)} ${st.riserX.toFixed(1)},${st.topY.toFixed(1)} ${st.treadEndX.toFixed(1)},${st.treadY.toFixed(1)}" fill="#fdfbf7" stroke="${strokeColor}" stroke-width="${lineWidth}" />
                    ${plankSvg}
                `;
            });

            // Step 19 (Top Landing Riser to +3,325 m / +3,33 m on vertical line)
            const topStepSvg = `
                <!-- Step 19 (Top Landing Riser to +3,325 m): Riser at X = ${geom.topRiser.x.toFixed(1)} (Y = ${geom.topRiser.bottomY.toFixed(1)} -> ${geom.topRiser.topY.toFixed(1)}) -->
                <line x1="${geom.topRiser.x.toFixed(1)}" y1="${geom.topRiser.bottomY.toFixed(1)}" x2="${geom.topRiser.x.toFixed(1)}" y2="${geom.topRiser.topY.toFixed(1)}" stroke="${strokeColor}" stroke-width="${lineWidth}" />
            `;

            return `
                ${slabSvg}
                ${soffitSvg}
                ${turnSvg}
                <!-- ==================== B. STAIRS 5 TO 19: STRAIGHT FLIGHT (MATCHING COLOR & ZERO GAP SKELETON) ==================== -->
                ${flightStepsSvg}
                ${topStepSvg}
            `;
        },

        /**
         * Render into DOM elements matching selector or with data-stair-component
         * @param {string} stairId Default 'main_staircase'
         * @param {string|Element} target
         */
        render: function (stairId = 'main_staircase', target = null) {
            const stair = this.get(stairId);
            if (!stair) return;

            let el = null;
            if (typeof target === 'string') {
                el = document.querySelector(target);
            } else if (target && target.nodeType) {
                el = target;
            } else {
                el = document.querySelector(`[data-stair-component="${stairId}"]`);
            }

            if (el) {
                el.innerHTML = this.createSVG(stair);
            }
        },

        /**
         * Auto-mount all containers marked with data-stair-component
         */
        autoMountAll: function () {
            if (typeof document === 'undefined') return;
            const elements = document.querySelectorAll('[data-stair-component]');
            elements.forEach(el => {
                const stairId = el.getAttribute('data-stair-component') || 'main_staircase';
                el.innerHTML = this.createSVG(stairId);
            });
        }
    };

    return StairComponent;
}));
