/**
 * window-store.js
 * In-memory reactive data access layer for building views and window openings.
 * Supports subscription-based updates, localStorage caching, multi-view queries,
 * and directional coordinate shifts.
 * Version: 1.1.0
 */
(function (root, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        module.exports = factory(require('../data/windows.js'));
    } else {
        root.WindowStore = factory(root.WINDOW_DATABASE);
    }
}(typeof self !== 'undefined' ? self : this, function (initialData) {
    const STORAGE_KEY_WINDOWS = 'jetski_home_windows_db';
    const STORAGE_KEY_VIEWS = 'jetski_home_views_db';
    let subscribers = [];
    let state = {
        windows: {},
        views: {}
    };

    // View ID aliases for backward compatibility
    const VIEW_ALIASES = {
        'kitchen_back_wall': 'kitchen_north_wall'
    };

    function resolveViewId(viewId) {
        return VIEW_ALIASES[viewId] || viewId;
    }

    function init() {
        const baseWindows = (initialData && initialData.windows) ? initialData.windows : {};
        const baseViews = (initialData && initialData.views) ? initialData.views : {};

        // Deep clone base data
        state.windows = JSON.parse(JSON.stringify(baseWindows));
        state.views = JSON.parse(JSON.stringify(baseViews));

        // Check if there are saved user modifications in localStorage (browser only)
        if (typeof window !== 'undefined' && window.localStorage) {
            try {
                // Compute signature of canonical disk data
                const currentDiskSignature = JSON.stringify({
                    views: baseViews,
                    windows: baseWindows
                });
                const savedDiskSignature = window.localStorage.getItem('jetski_db_disk_signature');

                if (savedDiskSignature !== currentDiskSignature) {
                    // Database files on disk have been edited! Purge stale localStorage so disk changes take effect
                    window.localStorage.removeItem(STORAGE_KEY_WINDOWS);
                    window.localStorage.removeItem(STORAGE_KEY_VIEWS);
                    window.localStorage.setItem('jetski_db_disk_signature', currentDiskSignature);
                } else {
                    // Only restore cached tweaks if the underlying files have not been edited
                    const savedWindows = window.localStorage.getItem(STORAGE_KEY_WINDOWS);
                    if (savedWindows) {
                        const parsed = JSON.parse(savedWindows);
                        Object.keys(parsed).forEach(id => {
                            if (state.windows[id]) {
                                state.windows[id] = { ...state.windows[id], ...parsed[id] };
                            } else {
                                state.windows[id] = parsed[id];
                            }
                        });
                    }

                    const savedViews = window.localStorage.getItem(STORAGE_KEY_VIEWS);
                    if (savedViews) {
                        const parsedViews = JSON.parse(savedViews);
                        Object.keys(parsedViews).forEach(id => {
                            if (state.views[id]) {
                                state.views[id] = { ...state.views[id], ...parsedViews[id] };
                            } else {
                                state.views[id] = parsedViews[id];
                            }
                        });
                    }
                }
            } catch (err) {
                console.warn('WindowStore: Could not load from localStorage:', err);
            }
        }

        // Live fetch from data/windows.json if served over HTTP (e.g. live-server / local web server)
        if (typeof window !== 'undefined' && window.fetch && window.location && window.location.protocol.startsWith('http')) {
            fetch('data/windows.json?t=' + Date.now())
                .then(res => res.json())
                .then(json => {
                    if (json && (json.views || json.windows)) {
                        let changed = false;
                        if (json.views) {
                            Object.keys(json.views).forEach(vId => {
                                if (JSON.stringify(state.views[vId]) !== JSON.stringify(json.views[vId])) {
                                    state.views[vId] = JSON.parse(JSON.stringify(json.views[vId]));
                                    changed = true;
                                }
                            });
                        }
                        if (json.windows) {
                            Object.keys(json.windows).forEach(wId => {
                                if (JSON.stringify(state.windows[wId]) !== JSON.stringify(json.windows[wId])) {
                                    state.windows[wId] = JSON.parse(JSON.stringify(json.windows[wId]));
                                    changed = true;
                                }
                            });
                        }
                        if (changed) {
                            subscribers.forEach(cb => cb('*', null, WindowStore.getAll()));
                            window.dispatchEvent(new CustomEvent('window-updated', { detail: { id: '*', liveSync: true } }));
                            window.dispatchEvent(new CustomEvent('view-updated', { detail: { id: '*', liveSync: true } }));
                        }
                    }
                })
                .catch(() => {});
        }
    }

    init();

    const WindowStore = {
        /**
         * Get a single window by ID
         * @param {string} id
         * @returns {object|null}
         */
        get: function (id) {
            if (!state.windows[id]) return null;
            return JSON.parse(JSON.stringify(state.windows[id]));
        },
        getWindow: function (id) {
            return this.get(id);
        },

        /**
         * Get all windows as a dictionary
         * @returns {object}
         */
        getAll: function () {
            return JSON.parse(JSON.stringify(state.windows));
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
            const list = [];
            Object.values(state.windows).forEach(win => {
                if (win.views) {
                    const mappedViews = win.views.map(resolveViewId);
                    if (mappedViews.includes(canonicalId) || win.views.includes(viewId)) {
                        list.push(JSON.parse(JSON.stringify(win)));
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
            if (!state.views[canonicalId]) return null;
            return JSON.parse(JSON.stringify(state.views[canonicalId]));
        },

        /**
         * Get all registered views as a dictionary
         * @returns {object}
         */
        getAllViews: function () {
            return JSON.parse(JSON.stringify(state.views));
        },

        /**
         * Dynamically update a view's metadata (e.g. positionOnMap, floor, direction, length)
         * @param {string} viewId
         * @param {object} updates
         * @returns {object} updated view
         */
        updateView: function (viewId, updates) {
            const canonicalId = resolveViewId(viewId);
            if (!state.views[canonicalId]) {
                throw new Error(`WindowStore: View with ID "${viewId}" does not exist.`);
            }

            if (updates.positionOnMap !== undefined) {
                updates.positionOnMap = Number(updates.positionOnMap);
                updates.leftEdge = updates.positionOnMap;
            } else if (updates.leftEdge !== undefined) {
                updates.leftEdge = Number(updates.leftEdge);
                updates.positionOnMap = updates.leftEdge;
            }

            if (updates.length !== undefined) {
                updates.length = Number(updates.length);
            }

            state.views[canonicalId] = {
                ...state.views[canonicalId],
                ...updates,
                id: canonicalId
            };

            // Persist to localStorage
            if (typeof window !== 'undefined' && window.localStorage) {
                try {
                    window.localStorage.setItem(STORAGE_KEY_VIEWS, JSON.stringify(state.views));
                } catch (err) {
                    console.warn('WindowStore: Could not save views to localStorage:', err);
                }
            }

            const updatedCopy = JSON.parse(JSON.stringify(state.views[canonicalId]));

            // Notify subscribers
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
         * Dynamically update a window's properties and notify all subscribers / views
         * @param {string} id
         * @param {object} updates - e.g. { x: 8450, sill: 1100, width: 1950, height: 1400 }
         * @returns {object} updated window
         */
        update: function (id, updates) {
            if (!state.windows[id]) {
                throw new Error(`WindowStore: Window with ID "${id}" does not exist.`);
            }

            // Sanitize geometric numeric fields if provided
            const numericFields = ['x', 'sill', 'width', 'height'];
            numericFields.forEach(field => {
                if (updates[field] !== undefined) {
                    updates[field] = Number(updates[field]);
                }
            });

            state.windows[id] = {
                ...state.windows[id],
                ...updates,
                id: id // preserve ID
            };

            // Persist to localStorage
            if (typeof window !== 'undefined' && window.localStorage) {
                try {
                    window.localStorage.setItem(STORAGE_KEY_WINDOWS, JSON.stringify(state.windows));
                } catch (err) {
                    console.warn('WindowStore: Could not save to localStorage:', err);
                }
            }

            const updatedCopy = JSON.parse(JSON.stringify(state.windows[id]));

            // Notify subscribers
            subscribers.forEach(callback => {
                try {
                    callback(id, updatedCopy, WindowStore.getAll());
                } catch (cbErr) {
                    console.error('WindowStore: Subscriber error:', cbErr);
                }
            });

            // Dispatch global DOM event for multi-component synchronization
            if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
                window.dispatchEvent(new CustomEvent('window-updated', {
                    detail: { id: id, window: updatedCopy }
                }));
            }

            return updatedCopy;
        },

        /**
         * Shift a window's global horizontal coordinate by deltaX mm
         * @param {string} id
         * @param {number} deltaX - offset in mm, e.g. +100 or -100
         * @returns {object} updated window
         */
        shiftWindow: function (id, deltaX) {
            const win = this.get(id);
            if (!win) throw new Error(`Window "${id}" not found`);
            const newX = win.x + Number(deltaX);
            return this.update(id, { x: newX });
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
         * Reset store back to the canonical initial database values
         */
        resetToDefaults: function () {
            if (typeof window !== 'undefined' && window.localStorage) {
                window.localStorage.removeItem(STORAGE_KEY_WINDOWS);
                window.localStorage.removeItem(STORAGE_KEY_VIEWS);
            }
            init();
            // Notify all subscribers of full reset
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
         * Export current database state as JSON string
         * @returns {string}
         */
        toJSON: function () {
            return JSON.stringify({
                version: "1.1.0",
                exportedAt: new Date().toISOString(),
                views: state.views,
                windows: state.windows
            }, null, 2);
        }
    };

    return WindowStore;
}));
