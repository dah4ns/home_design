/**
 * persistence.js
 * Abstract Persistence Layer for all movable and configurable architectural entities
 * (windows, views, stairs, electric sockets, etc.).
 *
 * Design Principles:
 * 1. Explicit Separation of Defaults vs. Persisted State:
 *    - Canonical default seed values live in one file per entity type (`data/windows.js`,
 *      `data/views.js`, `data/stairs.js`, `data/sockets.js`).
 *    - Runtime user changes (moving windows, adding/dragging sockets, adjusting stairs)
 *      are read from and written to the active Storage Adapter.
 * 2. Pluggable Storage Adapter Architecture:
 *    - Currently active adapter: `LocalStorageAdapter` (persists to `window.localStorage`).
 *    - Prepared future adapter: `FileStorageAdapter` (persists directly to `data/<type>.json`
 *      files via a local HTTP endpoint or the browser File System Access API).
 *    - Switching the entire application's persistence backend requires changing only
 *      `PersistenceService.useAdapter('file', options)` in one place.
 */
(function (root, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        module.exports = factory();
    } else {
        root.PersistenceService = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    const STORAGE_PREFIX = 'jetski_persistence_v2:';
    const DEFSIG_PREFIX = 'jetski_persistence_v2:defsig:';

    function deepClone(val) {
        if (val === undefined || val === null) return val;
        return JSON.parse(JSON.stringify(val));
    }

    function isEqualJSON(a, b) {
        return JSON.stringify(a) === JSON.stringify(b);
    }

    // =========================================================================
    // 1. STORAGE ADAPTER IMPLEMENTATIONS
    // =========================================================================

    /**
     * In-Memory Adapter (used in Node.js or when Web Storage is disabled)
     */
    class MemoryStorageAdapter {
        constructor() {
            this.name = 'memory';
            this._store = Object.create(null);
            this._meta = Object.create(null);
        }

        readRaw(entityType) {
            return this._store[entityType] !== undefined ? deepClone(this._store[entityType]) : null;
        }

        writeRaw(entityType, data) {
            this._store[entityType] = deepClone(data);
            return true;
        }

        removeRaw(entityType) {
            delete this._store[entityType];
            return true;
        }

        readMeta(key) {
            return this._meta[key] !== undefined ? deepClone(this._meta[key]) : null;
        }

        writeMeta(key, val) {
            this._meta[key] = deepClone(val);
        }

        subscribeExternal() {
            return function unsubscribe() {};
        }
    }

    /**
     * LocalStorage Adapter (Active Default Adapter)
     * Stores each entity type under `jetski_persistence_v2:<entityType>` and
     * transparently migrates legacy localStorage keys on first load.
     */
    class LocalStorageAdapter {
        constructor(options = {}) {
            this.name = 'localStorage';
            this.prefix = options.prefix || STORAGE_PREFIX;
            this.defSigPrefix = options.defSigPrefix || DEFSIG_PREFIX;
        }

        _hasLocalStorage() {
            try {
                return typeof window !== 'undefined' && Boolean(window.localStorage);
            } catch (e) {
                return false;
            }
        }

        _key(entityType) {
            return this.prefix + entityType;
        }

        readRaw(entityType, legacyKey) {
            if (!this._hasLocalStorage()) return null;
            try {
                const key = this._key(entityType);
                let raw = window.localStorage.getItem(key);

                // Seamless one-time migration from legacy storage key if v2 key is not yet populated
                if (raw === null && legacyKey) {
                    const legacyRaw = window.localStorage.getItem(legacyKey);
                    if (legacyRaw !== null) {
                        raw = legacyRaw;
                        window.localStorage.setItem(key, legacyRaw);
                    }
                }

                if (raw === null) return null;
                return JSON.parse(raw);
            } catch (err) {
                console.warn('PersistenceService (LocalStorageAdapter): Failed to read "' + entityType + '"', err);
                return null;
            }
        }

        writeRaw(entityType, data, legacyKey) {
            if (!this._hasLocalStorage()) return false;
            try {
                const serialized = JSON.stringify(data);
                window.localStorage.setItem(this._key(entityType), serialized);
                // Keep legacy key in sync if specified so any external tools inspecting old keys still work
                if (legacyKey) {
                    window.localStorage.setItem(legacyKey, serialized);
                }
                return true;
            } catch (err) {
                console.warn('PersistenceService (LocalStorageAdapter): Failed to write "' + entityType + '"', err);
                return false;
            }
        }

        removeRaw(entityType, legacyKey) {
            if (!this._hasLocalStorage()) return false;
            try {
                window.localStorage.removeItem(this._key(entityType));
                if (legacyKey) {
                    window.localStorage.removeItem(legacyKey);
                }
                return true;
            } catch (err) {
                console.warn('PersistenceService (LocalStorageAdapter): Failed to remove "' + entityType + '"', err);
                return false;
            }
        }

        readMeta(key) {
            if (!this._hasLocalStorage()) return null;
            try {
                const raw = window.localStorage.getItem(this.defSigPrefix + key);
                return raw ? JSON.parse(raw) : null;
            } catch (e) {
                return null;
            }
        }

        writeMeta(key, val) {
            if (!this._hasLocalStorage()) return;
            try {
                window.localStorage.setItem(this.defSigPrefix + key, JSON.stringify(val));
            } catch (e) {
                // Ignore quota/storage errors
            }
        }

        subscribeExternal(onExternalUpdate) {
            if (typeof window === 'undefined' || typeof window.addEventListener !== 'function') {
                return function unsubscribe() {};
            }
            const handler = (e) => {
                if (!e || !e.key) return;
                if (e.key.indexOf(this.prefix) === 0) {
                    const entityType = e.key.slice(this.prefix.length);
                    let parsed = null;
                    if (e.newValue) {
                        try {
                            parsed = JSON.parse(e.newValue);
                        } catch (err) {
                            return;
                        }
                    }
                    onExternalUpdate(entityType, parsed);
                }
            };
            window.addEventListener('storage', handler);
            return function unsubscribe() {
                window.removeEventListener('storage', handler);
            };
        }
    }

    /**
     * FileStorageAdapter (Prepared for future direct-to-file persistence)
     * Maps each entityType to its dedicated file (`data/<entityType>.json`).
     * Can persist via a local dev server REST endpoint (`PUT /api/data/<entityType>`)
     * or via a custom `writeFileCallback(filePath, jsonString)` hook.
     */
    class FileStorageAdapter {
        constructor(options = {}) {
            this.name = 'file';
            this.baseUrl = options.baseUrl || '/api/data';
            this.writeFileCallback = options.writeFileCallback || null;
            this._cache = Object.create(null);
            this._meta = Object.create(null);
        }

        readRaw(entityType) {
            return this._cache[entityType] !== undefined ? deepClone(this._cache[entityType]) : null;
        }

        writeRaw(entityType, data, _legacyKey, fileEnvelope) {
            this._cache[entityType] = deepClone(data);
            const payloadToSave = fileEnvelope || data;

            if (typeof this.writeFileCallback === 'function') {
                try {
                    this.writeFileCallback(entityType, payloadToSave);
                } catch (err) {
                    console.warn('PersistenceService (FileStorageAdapter): writeFileCallback failed', err);
                }
            } else if (typeof window !== 'undefined' && typeof window.fetch === 'function') {
                fetch(this.baseUrl + '/' + encodeURIComponent(entityType), {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payloadToSave, null, 2)
                }).catch((err) => {
                    console.warn('PersistenceService (FileStorageAdapter): HTTP file write failed', err);
                });
            }
            return true;
        }

        removeRaw(entityType) {
            delete this._cache[entityType];
            return true;
        }

        readMeta(key) {
            return this._meta[key] !== undefined ? deepClone(this._meta[key]) : null;
        }

        writeMeta(key, val) {
            this._meta[key] = deepClone(val);
        }

        subscribeExternal() {
            return function unsubscribe() {};
        }
    }

    // =========================================================================
    // 2. ENTITY REGISTRY & PERSISTENCE SERVICE CORE
    // =========================================================================

    const _registry = Object.create(null);
    let _activeAdapter = (typeof window !== 'undefined' && window.localStorage)
        ? new LocalStorageAdapter()
        : new MemoryStorageAdapter();
    let _unsubscribeAdapter = null;

    function _bindAdapterExternalEvents() {
        if (_unsubscribeAdapter) {
            _unsubscribeAdapter();
            _unsubscribeAdapter = null;
        }
        if (_activeAdapter && typeof _activeAdapter.subscribeExternal === 'function') {
            _unsubscribeAdapter = _activeAdapter.subscribeExternal((entityType, newRawData) => {
                const entry = _registry[entityType];
                if (!entry) return;
                _hydrateEntityState(entityType);
                _notifyListeners(entityType, '*', entry.state, { externalSync: true });
            });
        }
    }

    _bindAdapterExternalEvents();

    /**
     * Hydrate `entry.state` for `entityType` by combining `entry.defaults` with
     * any persisted data from `_activeAdapter`.
     *
     * Smart per-item default reconciliation for `'map'` collections:
     * - Compares each item's current default in `data/<type>.js` against the last-seen
     *   default snapshot (`defsig`).
     * - If an item in `localStorage` matches the OLD default (meaning the user never
     *   customized that specific item) and the disk default changed, the new disk default
     *   wins automatically.
     * - If the user customized that item, the user's persisted override is kept!
     */
    function _hydrateEntityState(entityType) {
        const entry = _registry[entityType];
        if (!entry) return;

        const defaultsCopy = deepClone(entry.defaults);
        const persistedRaw = _activeAdapter.readRaw(entityType, entry.legacyStorageKey);

        if (entry.collectionKind === 'list') {
            const rawList = Array.isArray(persistedRaw)
                ? persistedRaw
                : (Array.isArray(defaultsCopy) ? defaultsCopy : []);
            entry.state = rawList
                .map(item => (typeof entry.normalizeItem === 'function' ? entry.normalizeItem(deepClone(item)) : deepClone(item)))
                .filter(Boolean);
            return;
        }

        // 'map' collection (keyed by item.id, e.g. windows, views, stairs)
        const prevDefaults = _activeAdapter.readMeta(entityType) || {};
        const merged = deepClone(defaultsCopy) || {};

        if (persistedRaw && typeof persistedRaw === 'object' && !Array.isArray(persistedRaw)) {
            Object.keys(persistedRaw).forEach(id => {
                const savedItem = persistedRaw[id];
                const currentDef = defaultsCopy[id];
                const prevDef = prevDefaults[id];

                if (currentDef && prevDef && !isEqualJSON(currentDef, prevDef)) {
                    // The default file on disk was edited for this item!
                    // Keep savedItem ONLY if the user had modified it away from prevDef;
                    // otherwise adopt the newly updated disk default.
                    const wasUserModified = !isEqualJSON(savedItem, prevDef);
                    if (wasUserModified) {
                        merged[id] = { ...deepClone(currentDef), ...deepClone(savedItem), id };
                    } else {
                        merged[id] = deepClone(currentDef);
                    }
                } else if (currentDef) {
                    merged[id] = { ...deepClone(currentDef), ...deepClone(savedItem), id };
                } else {
                    merged[id] = deepClone(savedItem);
                }

                if (typeof entry.normalizeItem === 'function') {
                    merged[id] = entry.normalizeItem(merged[id]);
                }
            });
        }

        entry.state = merged;
        _activeAdapter.writeMeta(entityType, defaultsCopy);
    }

    function _persistEntityState(entityType) {
        const entry = _registry[entityType];
        if (!entry) return false;
        const fileEnvelope = PersistenceService.exportFilePayload(entityType);
        return _activeAdapter.writeRaw(entityType, entry.state, entry.legacyStorageKey, fileEnvelope);
    }

    function _notifyListeners(entityType, id, itemOrNull, meta = {}) {
        const entry = _registry[entityType];
        if (!entry) return;
        const snapshot = deepClone(entry.state);
        const itemCopy = itemOrNull ? deepClone(itemOrNull) : null;

        entry.listeners.forEach(fn => {
            try {
                fn(id, itemCopy, snapshot, meta);
            } catch (err) {
                console.error('PersistenceService listener error for "' + entityType + '":', err);
            }
        });

        if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
            window.dispatchEvent(new CustomEvent('persistence-updated', {
                detail: {
                    entityType,
                    id,
                    item: itemCopy,
                    ...meta
                }
            }));
        }
    }

    const PersistenceService = {
        adapters: {
            MemoryStorageAdapter,
            LocalStorageAdapter,
            FileStorageAdapter
        },

        /**
         * Get the currently active storage adapter instance
         */
        getAdapter: function () {
            return _activeAdapter;
        },

        /**
         * Get the name of the active storage adapter ('localStorage' | 'file' | 'memory')
         */
        getAdapterName: function () {
            return _activeAdapter ? _activeAdapter.name : 'none';
        },

        /**
         * Replace the active storage adapter at runtime and re-hydrate all registered entity types.
         * @param {object} adapterInstance
         */
        setAdapter: function (adapterInstance) {
            if (!adapterInstance || typeof adapterInstance.readRaw !== 'function') {
                throw new Error('PersistenceService.setAdapter: Invalid storage adapter provided.');
            }
            _activeAdapter = adapterInstance;
            _bindAdapterExternalEvents();
            Object.keys(_registry).forEach(entityType => {
                _hydrateEntityState(entityType);
                _notifyListeners(entityType, '*', null, { adapterChanged: true });
            });
            return _activeAdapter;
        },

        /**
         * Convenience helper to switch adapter by mode name: 'localStorage' | 'file' | 'memory'
         * @param {'localStorage'|'file'|'memory'} mode
         * @param {object} [options]
         */
        useAdapter: function (mode, options = {}) {
            if (mode === 'file') {
                return this.setAdapter(new FileStorageAdapter(options));
            }
            if (mode === 'memory') {
                return this.setAdapter(new MemoryStorageAdapter(options));
            }
            return this.setAdapter(new LocalStorageAdapter(options));
        },

        /**
         * Register an entity type with its explicit default values and schema configuration.
         * @param {string} entityType - e.g. 'windows', 'views', 'stairs', 'sockets'
         * @param {object} config
         * @param {object|Array} config.defaults - Canonical default seed values from `data/<type>.js`
         * @param {'map'|'list'} [config.collectionKind='map'] - 'map' (ID dictionary) or 'list' (Array of objects with `id`)
         * @param {string} [config.filePath] - Target JSON file path (e.g. 'data/windows.json')
         * @param {string} [config.legacyStorageKey] - Optional legacy localStorage key to migrate from
         * @param {Function} [config.normalizeItem] - Optional sanitizer/migrator per item
         * @param {object} [config.metadata] - Optional file metadata for export
         */
        registerType: function (entityType, config = {}) {
            const collectionKind = config.collectionKind === 'list' ? 'list' : 'map';
            const defaults = deepClone(config.defaults !== undefined ? config.defaults : (collectionKind === 'list' ? [] : {}));

            if (_registry[entityType]) {
                _registry[entityType].defaults = defaults;
                if (config.filePath) _registry[entityType].filePath = config.filePath;
                if (config.legacyStorageKey) _registry[entityType].legacyStorageKey = config.legacyStorageKey;
                if (config.normalizeItem) _registry[entityType].normalizeItem = config.normalizeItem;
                if (config.metadata) _registry[entityType].metadata = deepClone(config.metadata);
                _hydrateEntityState(entityType);
                return _registry[entityType];
            }

            _registry[entityType] = {
                entityType,
                collectionKind,
                defaults,
                filePath: config.filePath || ('data/' + entityType + '.json'),
                legacyStorageKey: config.legacyStorageKey || null,
                normalizeItem: config.normalizeItem || null,
                metadata: deepClone(config.metadata || {}),
                state: collectionKind === 'list' ? [] : {},
                listeners: []
            };

            _hydrateEntityState(entityType);
            return _registry[entityType];
        },

        /**
         * Check if an entity type is registered
         * @param {string} entityType
         * @returns {boolean}
         */
        isRegistered: function (entityType) {
            return Boolean(_registry[entityType]);
        },

        /**
         * Get a deep copy of the canonical DEFAULT values for an entity type
         * @param {string} entityType
         * @returns {object|Array}
         */
        getDefaults: function (entityType) {
            const entry = _registry[entityType];
            if (!entry) return null;
            return deepClone(entry.defaults);
        },

        /**
         * Get a deep copy of a single entity's canonical DEFAULT value by ID
         * @param {string} entityType
         * @param {string} id
         * @returns {object|null}
         */
        getDefaultById: function (entityType, id) {
            const entry = _registry[entityType];
            if (!entry) return null;
            if (entry.collectionKind === 'list') {
                const found = (entry.defaults || []).find(item => item && item.id === id);
                return found ? deepClone(found) : null;
            }
            return entry.defaults && entry.defaults[id] ? deepClone(entry.defaults[id]) : null;
        },

        /**
         * Get all active (persisted + default) entities for `entityType`
         * @param {string} entityType
         * @returns {object|Array}
         */
        getAll: function (entityType) {
            const entry = _registry[entityType];
            if (!entry) return null;
            return deepClone(entry.state);
        },

        /**
         * Get a single active entity by ID
         * @param {string} entityType
         * @param {string} id
         * @returns {object|null}
         */
        getById: function (entityType, id) {
            const entry = _registry[entityType];
            if (!entry) return null;
            if (entry.collectionKind === 'list') {
                const found = entry.state.find(item => item && item.id === id);
                return found ? deepClone(found) : null;
            }
            return entry.state[id] ? deepClone(entry.state[id]) : null;
        },

        /**
         * Check whether a specific entity differs from its canonical default value
         * @param {string} entityType
         * @param {string} id
         * @returns {boolean}
         */
        isModified: function (entityType, id) {
            const active = this.getById(entityType, id);
            const def = this.getDefaultById(entityType, id);
            return !isEqualJSON(active, def);
        },

        /**
         * Check whether any entity in `entityType` differs from its canonical defaults
         * @param {string} entityType
         * @returns {boolean}
         */
        hasModifications: function (entityType) {
            const entry = _registry[entityType];
            if (!entry) return false;
            return !isEqualJSON(entry.state, entry.defaults);
        },

        /**
         * Insert or update a single entity by ID and persist immediately via the active adapter
         * @param {string} entityType
         * @param {string} id
         * @param {object} patchOrItem
         * @returns {object} updated entity copy
         */
        upsert: function (entityType, id, patchOrItem) {
            const entry = _registry[entityType];
            if (!entry) {
                throw new Error('PersistenceService.upsert: Unregistered entity type "' + entityType + '"');
            }

            let updatedItem;
            if (entry.collectionKind === 'list') {
                const idx = entry.state.findIndex(item => item && item.id === id);
                if (idx >= 0) {
                    updatedItem = { ...entry.state[idx], ...deepClone(patchOrItem), id };
                    if (typeof entry.normalizeItem === 'function') {
                        updatedItem = entry.normalizeItem(updatedItem);
                    }
                    entry.state[idx] = updatedItem;
                } else {
                    updatedItem = { ...deepClone(patchOrItem), id };
                    if (typeof entry.normalizeItem === 'function') {
                        updatedItem = entry.normalizeItem(updatedItem);
                    }
                    entry.state.push(updatedItem);
                }
            } else {
                const existing = entry.state[id] || {};
                updatedItem = { ...existing, ...deepClone(patchOrItem), id };
                if (typeof entry.normalizeItem === 'function') {
                    updatedItem = entry.normalizeItem(updatedItem);
                }
                entry.state[id] = updatedItem;
            }

            _persistEntityState(entityType);
            _notifyListeners(entityType, id, updatedItem, { action: 'upsert' });
            return deepClone(updatedItem);
        },

        /**
         * Replace and persist the entire collection for `entityType`
         * @param {string} entityType
         * @param {object|Array} newCollection
         * @returns {object|Array}
         */
        saveAll: function (entityType, newCollection) {
            const entry = _registry[entityType];
            if (!entry) {
                throw new Error('PersistenceService.saveAll: Unregistered entity type "' + entityType + '"');
            }

            if (entry.collectionKind === 'list') {
                const arr = Array.isArray(newCollection) ? deepClone(newCollection) : [];
                entry.state = arr
                    .map(item => (typeof entry.normalizeItem === 'function' ? entry.normalizeItem(item) : item))
                    .filter(Boolean);
            } else {
                const map = (newCollection && typeof newCollection === 'object') ? deepClone(newCollection) : {};
                Object.keys(map).forEach(k => {
                    if (typeof entry.normalizeItem === 'function') {
                        map[k] = entry.normalizeItem(map[k]);
                    }
                });
                entry.state = map;
            }

            _persistEntityState(entityType);
            _notifyListeners(entityType, '*', null, { action: 'saveAll' });
            return deepClone(entry.state);
        },

        /**
         * Remove a single entity by ID and persist
         * @param {string} entityType
         * @param {string} id
         * @returns {boolean}
         */
        remove: function (entityType, id) {
            const entry = _registry[entityType];
            if (!entry) return false;

            let removed = false;
            if (entry.collectionKind === 'list') {
                const beforeLen = entry.state.length;
                entry.state = entry.state.filter(item => item && item.id !== id);
                removed = entry.state.length !== beforeLen;
            } else if (entry.state[id] !== undefined) {
                delete entry.state[id];
                removed = true;
            }

            if (removed) {
                _persistEntityState(entityType);
                _notifyListeners(entityType, id, null, { action: 'remove' });
            }
            return removed;
        },

        /**
         * Reset a single entity back to its canonical default value
         * @param {string} entityType
         * @param {string} id
         * @returns {object|null}
         */
        resetItemToDefault: function (entityType, id) {
            const entry = _registry[entityType];
            if (!entry) return null;
            const def = this.getDefaultById(entityType, id);
            if (!def) {
                this.remove(entityType, id);
                return null;
            }
            return this.upsert(entityType, id, def);
        },

        /**
         * Clear all persisted modifications for `entityType` and restore canonical default values
         * @param {string} entityType
         * @returns {object|Array}
         */
        resetToDefaults: function (entityType) {
            const entry = _registry[entityType];
            if (!entry) return null;
            _activeAdapter.removeRaw(entityType, entry.legacyStorageKey);
            entry.state = deepClone(entry.defaults);
            _notifyListeners(entityType, '*', null, { action: 'reset', reset: true });
            return deepClone(entry.state);
        },

        /**
         * Subscribe to state changes for `entityType`
         * @param {string} entityType
         * @param {Function} callback (id, item, allItems, meta) => void
         * @returns {Function} unsubscribe
         */
        subscribe: function (entityType, callback) {
            const entry = _registry[entityType];
            if (!entry || typeof callback !== 'function') {
                return function unsubscribe() {};
            }
            entry.listeners.push(callback);
            return function unsubscribe() {
                entry.listeners = entry.listeners.filter(cb => cb !== callback);
            };
        },

        /**
         * Build the structured file payload for `data/<entityType>.json`
         * @param {string} entityType
         * @returns {object}
         */
        exportFilePayload: function (entityType) {
            const entry = _registry[entityType];
            if (!entry) return null;
            const cap = entityType.charAt(0).toUpperCase() + entityType.slice(1);
            const defaultKey = 'default' + cap;
            const activeCopy = deepClone(entry.state);
            return {
                _role: 'PERSISTED_DATA_EXPORT',
                entityType: entityType,
                exportedAt: new Date().toISOString(),
                adapter: this.getAdapterName(),
                filePath: entry.filePath,
                metadata: deepClone(entry.metadata),
                [defaultKey]: activeCopy,
                [entityType]: activeCopy
            };
        },

        /**
         * Export formatted JSON string for `entityType` (ready to save to `data/<entityType>.json`)
         * @param {string} entityType
         * @returns {string}
         */
        exportJSON: function (entityType) {
            const payload = this.exportFilePayload(entityType);
            return payload ? JSON.stringify(payload, null, 2) : '{}';
        }
    };

    return PersistenceService;
}));
