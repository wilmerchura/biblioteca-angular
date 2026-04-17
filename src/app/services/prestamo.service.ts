import { Injectable } from '@angular/core';
import { DbService } from './db.service';
import { Prestamo } from '../models/prestamo.model';

@Injectable({ providedIn: 'root' })
export class PrestamoService {
  private readonly STORE = 'prestamos';

  constructor(private db: DbService) {}

  getAll(): Promise<Prestamo[]> {
    return this.db.getAll<Prestamo>(this.STORE);
  }

  getById(id: number): Promise<Prestamo | undefined> {
    return this.db.getById<Prestamo>(this.STORE, id);
  }

  getByLibro(libroId: number): Promise<Prestamo[]> {
    return this.db.getByIndex<Prestamo>(this.STORE, 'libroId', libroId);
  }

  add(prestamo: Omit<Prestamo, 'id'>): Promise<number> {
    return this.db.add<Omit<Prestamo, 'id'>>(this.STORE, prestamo);
  }

  update(prestamo: Prestamo): Promise<void> {
    return this.db.update<Prestamo>(this.STORE, prestamo);
  }

  delete(id: number): Promise<void> {
    return this.db.delete(this.STORE, id);
  }
}
