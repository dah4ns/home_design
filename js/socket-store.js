/**
 * socket-store.js
 * Reactive data access layer for 2D Floor Plan Electrical Sockets ('sockets' entity type).
 * Backed by the abstract PersistenceService (js/persistence.js) and seeded from
 * explicit default definitions in `data/sockets.js` (DEFAULT_SOCKETS_DATA).
 */
(function (root, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        module.exports = factory(
            require('./persistence.js'),
            require('../data/sockets.js')
        );
    } else {
        root.SocketStore = factory(
            root.PersistenceService,
            root.DEFAULT_SOCKETS_DATA || root.BUILDING_SOCKETS_DATA
        );
    }
}(typeof self !== 'undefined' ? self : this, function (PersistenceService, initialSocketsData) {
    'use strict';

    const ENTITY_TYPE = 'sockets';
    const LEGACY_STORAGE_KEY = 'home_design_floor_objects_v1';

    const DEFAULT_CATALOG = (initialSocketsData && initialSocketsData.catalog) ? initialSocketsData.catalog : {
        socket_pe: {
            type: 'socket_pe',
            name: 'Gniazdo ze stykiem ochronnym',
            shortCode: 'G',
            color: '#ef4444',
            defaultHeightMm: 300,
            snapToWall: true,
            standard: 'PN-EN 60617 / ProfiCAD 528'
        },
        socket_pe_shutter: {
            type: 'socket_pe_shutter',
            name: 'Gniazdo ze stykiem ochronnym i zaślepką',
            shortCode: 'GZ',
            color: '#ef4444',
            defaultHeightMm: 300,
            snapToWall: true,
            standard: 'PN-EN 60617 / ProfiCAD 1589 (IP44)'
        },
        socket_floor: {
            type: 'socket_floor',
            name: 'Gniazdo podłogowe',
            shortCode: 'GP',
            color: '#ef4444',
            defaultHeightMm: 0,
            snapToWall: false,
            standard: 'PN-EN 60617 Floor Box'
        }
    };

    const DEFAULT_SOCKETS = Array.isArray(initialSocketsData && (initialSocketsData.defaultSockets || initialSocketsData.sockets))
        ? (initialSocketsData.defaultSockets || initialSocketsData.sockets)
        : [];

    function normalizeSocketItem(item) {
        if (!item || typeof item !== 'object') return null;
        const copy = { ...item };

        // Migrate legacy socket type identifiers if present
        if (copy.type === 'socket_1' || copy.type === 'socket_2') {
            copy.type = 'socket_pe';
        } else if (copy.type === 'socket_ip44') {
            copy.type = 'socket_pe_shutter';
        } else if (copy.type === 'floor_box') {
            copy.type = 'socket_floor';
        }

        if (typeof copy.id !== 'string' || !copy.id) return null;
        if (copy.floor !== 'ground' && copy.floor !== 'first') return null;
        if (!DEFAULT_CATALOG[copy.type]) return null;

        copy.x = Number(copy.x);
        copy.z = Number(copy.z);
        if (!Number.isFinite(copy.x) || !Number.isFinite(copy.z)) return null;

        const def = DEFAULT_CATALOG[copy.type];
        copy.heightMm = Number.isFinite(Number(copy.heightMm)) ? Number(copy.heightMm) : def.defaultHeightMm;
        copy.rotation = Number.isFinite(Number(copy.rotation)) ? ((Number(copy.rotation) % 360) + 360) % 360 : 0;
        copy.label = typeof copy.label === 'string' ? copy.label : '';
        copy.snappedToWall = Boolean(copy.snappedToWall);
        return copy;
    }

    if (!PersistenceService) {
        throw new Error('SocketStore requires PersistenceService (js/persistence.js) to be loaded first.');
    }

    PersistenceService.registerType(ENTITY_TYPE, {
        collectionKind: 'list',
        defaults: DEFAULT_SOCKETS,
        filePath: 'data/sockets.json',
        legacyStorageKey: LEGACY_STORAGE_KEY,
        normalizeItem: normalizeSocketItem,
        metadata: (initialSocketsData && initialSocketsData.metadata) || {
            isDefaultSeed: false,
            entityType: ENTITY_TYPE
        }
    });

    function _nextSequenceNumber() {
        const all = PersistenceService.getAll(ENTITY_TYPE) || [];
        let maxSeq = all.length;
        all.forEach(item => {
            if (item && typeof item.id === 'string') {
                const m = item.id.match(/^obj_(\d+)_/);
                if (m) {
                    const n = parseInt(m[1], 10);
                    if (n > maxSeq) maxSeq = n;
                }
            }
        });
        return maxSeq + 1;
    }

    const SocketStore = {
        /**
         * Return a copy of the socket type catalog (`socket_pe`, `socket_pe_shutter`, `socket_floor`)
         * @returns {object}
         */
        getCatalog: function () {
            return JSON.parse(JSON.stringify(DEFAULT_CATALOG));
        },

        /**
         * Return canonical default sockets from `data/sockets.js`
         * @returns {Array<object>}
         */
        getDefaults: function () {
            return PersistenceService.getDefaults(ENTITY_TYPE) || [];
        },

        /**
         * Get all active (persisted) sockets across all floors
         * @returns {Array<object>}
         */
        getAll: function () {
            return PersistenceService.getAll(ENTITY_TYPE) || [];
        },

        /**
         * Get all sockets on a specific floor ('ground' | 'first')
         * @param {'ground'|'first'} floor
         * @returns {Array<object>}
         */
        getByFloor: function (floor) {
            return this.getAll().filter(s => s.floor === floor);
        },

        /**
         * Get a single socket by ID
         * @param {string} id
         * @returns {object|null}
         */
        get: function (id) {
            return PersistenceService.getById(ENTITY_TYPE, id);
        },

        /**
         * Add and persist a new electrical socket
         * @param {object} props - { floor, type, x, z, heightMm, rotation, label }
         * @returns {object} created socket
         */
        add: function (props) {
            const typeKey = (props && DEFAULT_CATALOG[props.type]) ? props.type : 'socket_pe';
            const def = DEFAULT_CATALOG[typeKey];
            const seq = _nextSequenceNumber();
            const id = (props && props.id) ? String(props.id) : ('obj_' + seq + '_' + (Date.now() % 100000));
            const newSocket = {
                id,
                floor: (props && props.floor === 'first') ? 'first' : 'ground',
                type: typeKey,
                x: Math.round(Number(props && props.x !== undefined ? props.x : 0)),
                z: Math.round(Number(props && props.z !== undefined ? props.z : 0)),
                heightMm: (props && props.heightMm !== undefined) ? Number(props.heightMm) : def.defaultHeightMm,
                rotation: (props && props.rotation !== undefined) ? Number(props.rotation) : 0,
                label: (props && typeof props.label === 'string') ? props.label : (def.shortCode + seq)
            };
            return PersistenceService.upsert(ENTITY_TYPE, id, newSocket);
        },

        /**
         * Update an existing socket's properties (e.g. x, z, rotation, heightMm, label, type) and persist
         * @param {string} id
         * @param {object} updates
         * @returns {object|null}
         */
        update: function (id, updates) {
            const existing = this.get(id);
            if (!existing) return null;
            return PersistenceService.upsert(ENTITY_TYPE, id, updates);
        },

        /**
         * Replace and persist the entire sockets list
         * @param {Array<object>} socketsList
         * @returns {Array<object>}
         */
        saveAll: function (socketsList) {
            return PersistenceService.saveAll(ENTITY_TYPE, socketsList);
        },

        /**
         * Remove a socket by ID and persist
         * @param {string} id
         * @returns {boolean}
         */
        remove: function (id) {
            return PersistenceService.remove(ENTITY_TYPE, id);
        },

        /**
         * Check whether a socket (or the sockets collection) differs from canonical default values
         * @param {string} [id]
         * @returns {boolean}
         */
        isModified: function (id) {
            if (id) {
                return PersistenceService.isModified(ENTITY_TYPE, id);
            }
            return PersistenceService.hasModifications(ENTITY_TYPE);
        },

        hasSavedChanges: function () {
            return PersistenceService.hasModifications(ENTITY_TYPE);
        },

        /**
         * Reset all sockets back to the canonical defaults in `data/sockets.js`
         * @returns {Array<object>}
         */
        resetToDefaults: function () {
            return PersistenceService.resetToDefaults(ENTITY_TYPE);
        },

        /**
         * Subscribe to socket additions, moves, updates, or resets
         * @param {Function} callback (id, item, allSockets, meta) => void
         * @returns {Function} unsubscribe
         */
        subscribe: function (callback) {
            return PersistenceService.subscribe(ENTITY_TYPE, callback);
        },

        /**
         * Export current sockets collection as formatted JSON matching `data/sockets.json`
         * @returns {string}
         */
        toJSON: function () {
            const payload = PersistenceService.exportFilePayload(ENTITY_TYPE);
            if (payload) {
                payload.catalog = this.getCatalog();
            }
            return JSON.stringify(payload, null, 2);
        }
    };

    return SocketStore;
}));
