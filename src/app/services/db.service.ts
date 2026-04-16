import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DbService {
  private db: IDBDatabase | null = null;
  private readonly DB_NAME = 'BibliotecaDB';
  private readonly DB_VERSION = 2;
  private initPromise: Promise<void> | null = null;

  init(): Promise<void> {
    if (this.initPromise) return this.initPromise;
    this.initPromise = this.openDB();
    return this.initPromise;
  }

  private openDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('TIMEOUT'));
      }, 5000);

      let request: IDBOpenDBRequest;
      try {
        request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
      } catch (e) {
        clearTimeout(timeout);
        reject(e);
        return;
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('autores')) {
          const s = db.createObjectStore('autores', { keyPath: 'id', autoIncrement: true });
          s.createIndex('apellido', 'apellido', { unique: false });
        }
        if (!db.objectStoreNames.contains('libros')) {
          const s = db.createObjectStore('libros', { keyPath: 'id', autoIncrement: true });
          s.createIndex('autorId', 'autorId', { unique: false });
          s.createIndex('titulo', 'titulo', { unique: false });
        }
        if (!db.objectStoreNames.contains('prestamos')) {
          const s = db.createObjectStore('prestamos', { keyPath: 'id', autoIncrement: true });
          s.createIndex('libroId', 'libroId', { unique: false });
          s.createIndex('estado', 'estado', { unique: false });
        }
        if (!db.objectStoreNames.contains('usuarios')) {
          const s = db.createObjectStore('usuarios', { keyPath: 'id', autoIncrement: true });
          s.createIndex('username', 'username', { unique: true });
          s.add({ username: 'admin', password: 'admin123', nombre: 'Administrador', rol: 'admin' });
        }
      };

      request.onsuccess = (event) => {
        clearTimeout(timeout);
        this.db = (event.target as IDBOpenDBRequest).result;
        this.db.onversionchange = () => {
          this.db?.close();
          this.db = null;
          this.initPromise = null;
        };
        resolve();
      };

      request.onerror = () => {
        clearTimeout(timeout);
        reject(request.error);
      };

      request.onblocked = () => {
        clearTimeout(timeout);
        reject(new Error('BLOCKED'));
      };
    });
  }

  resetDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db?.close();
      this.db = null;
      this.initPromise = null;
      const req = indexedDB.deleteDatabase(this.DB_NAME);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  private getStore(storeName: string, mode: IDBTransactionMode = 'readonly'): IDBObjectStore {
    if (!this.db) throw new Error('DB no inicializada');
    return this.db.transaction(storeName, mode).objectStore(storeName);
  }

  getAll<T>(storeName: string): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const req = this.getStore(storeName).getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  getById<T>(storeName: string, id: number): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      const req = this.getStore(storeName).get(id);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  getByIndex<T>(storeName: string, indexName: string, value: IDBValidKey): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const req = this.getStore(storeName).index(indexName).getAll(value);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  getByIndexSingle<T>(storeName: string, indexName: string, value: IDBValidKey): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      const req = this.getStore(storeName).index(indexName).get(value);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  add<T>(storeName: string, item: T): Promise<number> {
    return new Promise((resolve, reject) => {
      const req = this.getStore(storeName, 'readwrite').add(item);
      req.onsuccess = () => resolve(req.result as number);
      req.onerror = () => reject(req.error);
    });
  }

  update<T>(storeName: string, item: T): Promise<void> {
    return new Promise((resolve, reject) => {
      const req = this.getStore(storeName, 'readwrite').put(item);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  delete(storeName: string, id: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const req = this.getStore(storeName, 'readwrite').delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }
}
