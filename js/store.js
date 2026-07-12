/**
 * Local storage wrapper with safe fallbacks.
 */
const NS = 'solar-estimator';

class Store {
    constructor() { this.namespace = NS; this.allowed = this._detect(); }
    _detect() {
        try {
            const k = '__t__';
            localStorage.setItem(k, k); localStorage.removeItem(k);
            return localStorage;
        } catch (e) { return null; }
    }
    _key(key) { return `${this.namespace}:${key}`; }
    get(key, fallback = null) {
        try {
            const raw = this.allowed ? this.allowed.getItem(this._key(key)) : sessionStorage.getItem(this._key(key));
            return raw === null || raw === undefined ? fallback : JSON.parse(raw);
        } catch { return fallback; }
    }
    set(key, value) {
        try {
            const raw = JSON.stringify(value);
            if (this.allowed) this.allowed.setItem(this._key(key), raw);
            else sessionStorage.setItem(this._key(key), raw);
            return true;
        } catch { return false; }
    }
    remove(key) {
        if (this.allowed) this.allowed.removeItem(this._key(key));
        else sessionStorage.removeItem(this._key(key));
    }
    clear() {
        if (this.allowed) {
            const toRemove = [];
            for (let i = 0; i < this.allowed.length; i++) {
                const k = this.allowed.key(i);
                if (k && k.startsWith(`${this.namespace}:`)) toRemove.push(k);
            }
            toRemove.forEach((k) => this.allowed.removeItem(k));
        }
    }
}

export const store = new Store();

class Repository {
    constructor(collection) { this.collection = collection; }
    list() { return store.get(this.collection, []); }
    get(id) { return this.list().find((p) => p.id === id) || null; }
    save(item) {
        const list = this.list();
        if (!item.id) item.id = this.collection + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
        item.updatedAt = Date.now();
        item.createdAt = item.createdAt || Date.now();
        const i = list.findIndex((p) => p.id === item.id);
        if (i >= 0) list[i] = item; else list.unshift(item);
        store.set(this.collection, list);
        return item;
    }
    remove(id) { store.set(this.collection, this.list().filter((p) => p.id !== id)); }
    clear() { store.remove(this.collection); }
    all() { return this.list(); }
    findById(id) { return this.get(id); }
    update(id, patch) {
        const item = this.get(id);
        if (!item) return null;
        return this.save({ ...item, ...patch });
    }
}

export const projects = new Repository('projects');
export const invoices = new Repository('invoices');
export const customers = new Repository('customers');
export const team = new Repository('team');
export const tasks = new Repository('tasks');
export const payments = new Repository('payments');
export const notifications = new Repository('notifications');
export const activities = new Repository('activities');
export const loyalty = new Repository('loyalty');
export const notes = new Repository('notes');

export const settings = {
    get(key, fb = null) { return store.get(`setting:${key}`, fb); },
    set(key, value) { return store.set(`setting:${key}`, value); },
    all() { return store.get('setting:all', {}); }
};
