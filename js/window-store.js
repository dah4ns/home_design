/**
 * window-store.js
 * Reactive data access layer for building views and window/door openings.
 * Backed by the abstract PersistenceService (js/persistence.js) and seeded from
 * explicit default definitions in `data/windows.js` (DEFAULT_WINDOWS_DATA) and
 * `data/views.js` (DEFAULT_VIEWS_DATA).
 * Version: 2.0.0
 */
(function (root, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        let viewsData = null;
        try {
            viewsData = require('../data/views.js');
        } catch (e) {
            viewsData = null;
        }
        module.exports = factory(
            require('./persistence.js'),
            require('../data/windows.js'),
            viewsData
        );
    } else {
        root.WindowStore = factory(
            root.PersistenceService,
            root.DEFAULT_WINDOWS_DATA || root.WINDOW_DATABASE,
            root.DEFAULT_VIEWS_DATA || root.BUILDING_VIEWS_DATA
        );
    }
}(typeof self !== 'undefined' ? self : this, function (PersistenceService, initialWindowsData, initialViewsData) {
    'use strict';

    const ENTITY_WINDOWS = 'windows';
    const ENTITY_VIEWS = 'views';
    const LEGACY_KEY_WINDOWS = 'jetski_home_windows_db';
    const LEGACY_KEY_VIEWS = 'jetski_home_views_db';

    let subscribers = [];

    // View ID aliases for backward compatibility
    const VIEW_ALIASES = {
        'kitchen_back_wall': 'kitchen_north_wall'
    };

    function resolveViewId(viewId) {
        return VIEW_ALIASES[viewId] || viewId;
    }

    const defaultWindows = (initialWindowsData && (initialWindowsData.defaultWindows || initialWindowsData.windows))
        ? (initialWindowsData.defaultWindows || initialWindowsData.windows)
        : {};

    const defaultViews = (initialViewsData && (initialViewsData.defaultViews || initialViewsData.views))
        ? (initialViewsData.defaultViews || initialViewsData.views)
        : ((initialWindowsData && (initialWindowsData.defaultViews || initialWindowsData.views)) || {});

    if (!PersistenceService) {
        throw new Error('WindowStore requires PersistenceService (js/persistence.js) to be loaded first.');
    }

    // Register 'windows' and 'views' entity types with explicit default seed values
    PersistenceService.registerType(ENTITY_WINDOWS, {
        collectionKind: 'map',
        defaults: defaultWindows,
        filePath: 'data/windows.json',
        legacyStorageKey: LEGACY_KEY_WINDOWS,
        metadata: (initialWindowsData && initialWindowsData.metadata) || {
            isDefaultSeed: false,
            entityType: ENTITY_WINDOWS
        }
    });

    PersistenceService.registerType(ENTITY_VIEWS, {
        collectionKind: 'map',
        defaults: defaultViews,
        filePath: 'data/views.json',
        legacyStorageKey: LEGACY_KEY_VIEWS,
        metadata: (initialViewsData && initialViewsData.metadata) || {
            isDefaultSeed: false,
            entityType: ENTITY_VIEWS
        }
    });

    // Forward external/cross-tab PersistenceService events to WindowStore subscribers
    PersistenceService.subscribe(ENTITY_WINDOWS, function (id, item, allWindows, meta) {
        if (meta && (meta.externalSync || meta.adapterChanged)) {
            subscribers.forEach(cb => {
                try {
                    cb(id || '*', item, allWindows);
                } catch (err) {
                    console.error('WindowStore: Subscriber error:', err);
                }
            });
            if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
                window.dispatchEvent(new CustomEvent('window-updated', { detail: { id: id || '*', storageSync: true } }));
            }
        }
    });

    PersistenceService.subscribe(ENTITY_VIEWS, function (id, item, _allViews, meta) {
        if (meta && (meta.externalSync || meta.adapterChanged)) {
            subscribers.forEach(cb => {
                try {
                    cb('view:' + (id || '*'), item, WindowStore.getAll());
                } catch (err) {
                    console.error('WindowStore: Subscriber error:', err);
                }
            });
            if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
                window.dispatchEvent(new CustomEvent('view-updated', { detail: { id: id || '*', storageSync: true } }));
            }
        }
    });

    const WindowStore = {
        /**
         * Get a single window by ID (active persisted state or default if unmodified)
         * @param {string} id
         * @returns {object|null}
         */
        get: function (id) {
            return PersistenceService.getById(ENTITY_WINDOWS, id);
        },
        getWindow: function (id) {
            return this.get(id);
        },

        /**
         * Get the canonical DEFAULT value of a single window by ID (from `data/windows.js`)
         * @param {string} id
         * @returns {object|null}
         */
        getDefault: function (id) {
            return PersistenceService.getDefaultById(ENTITY_WINDOWS, id);
        },
        getDefaultWindow: function (id) {
            return this.getDefault(id);
        },

        /**
         * Get all canonical DEFAULT windows as a dictionary
         * @returns {object}
         */
        getAllDefaults: function () {
            return PersistenceService.getDefaults(ENTITY_WINDOWS) || {};
        },

        /**
         * Check if a specific window has been modified from its default value
         * @param {string} id
         * @returns {boolean}
         */
        isModified: function (id) {
            return PersistenceService.isModified(ENTITY_WINDOWS, id);
        },

        /**
         * Check if any window or view has persisted modifications
         * @returns {boolean}
         */
        hasSavedChanges: function () {
            return PersistenceService.hasModifications(ENTITY_WINDOWS) || PersistenceService.hasModifications(ENTITY_VIEWS);
        },

        /**
         * Get all active windows as a dictionary
         * @returns {object}
         */
        getAll: function () {
            return PersistenceService.getAll(ENTITY_WINDOWS) || {};
        },
        getAllWindows: function () {
            return this.getAll();
        },

        /**
         * Get all windows that belong to a specific view
         * @param {string} viewId
         * @returns {Array<object>}
         */
        getByView: function (viewId) {
            const canonicalId = resolveViewId(viewId);
            const allWindows = this.getAll();
            const list = [];
            Object.values(allWindows).forEach(win => {
                if (win && win.views) {
                    const mappedViews = win.views.map(resolveViewId);
                    if (mappedViews.includes(canonicalId) || win.views.includes(viewId)) {
                        list.push(win);
                    }
                }
            });
            return list;
        },

        /**
         * Get a view definition by ID
         * @param {string} viewId - e.g. 'north_facade' or 'kitchen_north_wall'
         * @returns {object|null}
         */
        getView: function (viewId) {
            const canonicalId = resolveViewId(viewId);
            return PersistenceService.getById(ENTITY_VIEWS, canonicalId);
        },

        /**
         * Get all registered views as a dictionary
         * @returns {object}
         */
        getAllViews: function () {
            return PersistenceService.getAll(ENTITY_VIEWS) || {};
        },

        /**
         * Dynamically update a view's metadata and persist via PersistenceService
         * @param {string} viewId
         * @param {object} updates
         * @returns {object} updated view
         */
        updateView: function (viewId, updates) {
            const canonicalId = resolveViewId(viewId);
            const currentView = this.getView(canonicalId);
            if (!currentView) {
                throw new Error(`WindowStore: View with ID "${viewId}" does not exist.`);
            }

            const patch = { ...updates };
            if (patch.positionOnMap !== undefined) {
                patch.positionOnMap = Number(patch.positionOnMap);
                patch.leftEdge = patch.positionOnMap;
            } else if (patch.leftEdge !== undefined) {
                patch.leftEdge = Number(patch.leftEdge);
                patch.positionOnMap = patch.leftEdge;
            }

            if (patch.length !== undefined) {
                patch.length = Number(patch.length);
            }

            const updatedCopy = PersistenceService.upsert(ENTITY_VIEWS, canonicalId, patch);

            subscribers.forEach(callback => {
                try {
                    callback('view:' + canonicalId, updatedCopy, WindowStore.getAll());
                } catch (cbErr) {
                    console.error('WindowStore: Subscriber error:', cbErr);
                }
            });

            if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
                window.dispatchEvent(new CustomEvent('view-updated', {
                    detail: { id: canonicalId, view: updatedCopy }
                }));
            }

            return updatedCopy;
        },

        /**
         * Dynamically update a window's properties, persist via PersistenceService, and notify all subscribers
         * @param {string} id
         * @param {object} updates - e.g. { x: 8450, sill: 1100, width: 1950, height: 1400 }
         * @returns {object} updated window
         */
        update: function (id, updates) {
            const currentWin = this.get(id);
            if (!currentWin) {
                throw new Error(`WindowStore: Window with ID "${id}" does not exist.`);
            }

            const patch = { ...updates };
            const numericFields = ['x', 'y', 'sill', 'width', 'height'];
            numericFields.forEach(field => {
                if (patch[field] !== undefined) {
                    patch[field] = Number(patch[field]);
                }
            });

            const updatedCopy = PersistenceService.upsert(ENTITY_WINDOWS, id, patch);

            subscribers.forEach(callback => {
                try {
                    callback(id, updatedCopy, WindowStore.getAll());
                } catch (cbErr) {
                    console.error('WindowStore: Subscriber error:', cbErr);
                }
            });

            if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
                window.dispatchEvent(new CustomEvent('window-updated', {
                    detail: { id: id, window: updatedCopy }
                }));
            }

            return updatedCopy;
        },

        /**
         * Shift a window's global horizontal coordinate along its active axis (X for North/South walls, Y for West/East walls)
         * @param {string} id
         * @param {number} delta - offset in mm, e.g. +100 or -100
         * @param {'x'|'y'} [axis] - optional explicit axis ('x' or 'y'); defaults based on window's wall
         * @returns {object} updated window
         */
        shiftWindow: function (id, delta, axis) {
            const win = this.get(id);
            if (!win) throw new Error(`Window "${id}" not found`);
            const targetAxis = axis || ((win.wall === 'west' || win.wall === 'east') ? 'y' : 'x');
            if (targetAxis === 'y') {
                const newY = (win.y !== undefined ? Number(win.y) : 0) + Number(delta);
                return this.update(id, { y: newY });
            } else {
                const newX = (win.x !== undefined ? Number(win.x) : 0) + Number(delta);
                return this.update(id, { x: newX });
            }
        },

        /**
         * Reset a single window back to its canonical default value from `data/windows.js`
         * @param {string} id
         * @returns {object|null}
         */
        resetWindowToDefault: function (id) {
            const restored = PersistenceService.resetItemToDefault(ENTITY_WINDOWS, id);
            if (restored) {
                subscribers.forEach(callback => {
                    try {
                        callback(id, restored, WindowStore.getAll());
                    } catch (cbErr) {
                        console.error('WindowStore: Subscriber error:', cbErr);
                    }
                });
                if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
                    window.dispatchEvent(new CustomEvent('window-updated', { detail: { id, window: restored, reset: true } }));
                }
            }
            return restored;
        },

        /**
         * Subscribe to window and view data mutations
         * @param {Function} callback (id, updatedObject, allData) => void
         * @returns {Function} unsubscribe function
         */
        subscribe: function (callback) {
            subscribers.push(callback);
            return function unsubscribe() {
                subscribers = subscribers.filter(cb => cb !== callback);
            };
        },

        /**
         * Reset all windows and views back to their canonical default values
         */
        resetToDefaults: function () {
            PersistenceService.resetToDefaults(ENTITY_WINDOWS);
            PersistenceService.resetToDefaults(ENTITY_VIEWS);

            subscribers.forEach(callback => {
                try {
                    callback('*', null, WindowStore.getAll());
                } catch (cbErr) {
                    console.error('WindowStore: Subscriber error:', cbErr);
                }
            });
            if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
                window.dispatchEvent(new CustomEvent('window-updated', { detail: { id: '*', reset: true } }));
                window.dispatchEvent(new CustomEvent('view-updated', { detail: { id: '*', reset: true } }));
            }
        },

        /**
         * Export current database state as JSON string matching `data/windows.json`
         * @returns {string}
         */
        toJSON: function () {
            const windowsState = this.getAll();
            const viewsState = this.getAllViews();
            return JSON.stringify({
                _role: "PERSISTED_DATA_EXPORT",
                entityType: "windows",
                version: "2.0.0",
                exportedAt: new Date().toISOString(),
                adapter: PersistenceService.getAdapterName(),
                views: viewsState,
                defaultWindows: windowsState,
                windows: windowsState
            }, null, 2);
        }
    };

    return WindowStore;
}));
