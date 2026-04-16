import { Injectable } from '@angular/core';
import { DbService } from './db.service';
import { Libro } from '../models/libro.model';

@Injectable({ providedIn: 'root' })
export class LibroService {
  private readonly STORE = 'libros';

  constructor(private db: DbService) {}

  getAll(): Promise<Libro[]> {
    return this.db.getAll<Libro>(this.STORE);
  }

  getById(id: number): Promise<Libro | undefined> {
    return this.db.getById<Libro>(this.STORE, id);
  }

  getByAutor(autorId: number): Promise<Libro[]> {
    return this.db.getByIndex<Libro>(this.STORE, 'autorId', autorId);
  }

  add(libro: Omit<Libro, 'id'>): Promise<number> {
    return this.db.add<Omit<Libro, 'id'>>(this.STORE, libro);
  }

  update(libro: Libro): Promise<void> {
    return this.db.update<Libro>(this.STORE, libro);
  }

  delete(id: number): Promise<void> {
    return this.db.delete(this.STORE, id);
  }

  async updateDisponible(id: number, delta: number): Promise<void> {
    const libro = await this.getById(id);
    if (!libro) return;
    libro.disponible = Math.max(0, Math.min(libro.cantidad, libro.disponible + delta));
    return this.update(libro);
  }
}
