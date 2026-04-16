import { Injectable } from '@angular/core';
import { DbService } from './db.service';
import { Autor } from '../models/autor.model';

@Injectable({ providedIn: 'root' })
export class AutorService {
  private readonly STORE = 'autores';

  constructor(private db: DbService) {}

  getAll(): Promise<Autor[]> {
    return this.db.getAll<Autor>(this.STORE);
  }

  getById(id: number): Promise<Autor | undefined> {
    return this.db.getById<Autor>(this.STORE, id);
  }

  add(autor: Omit<Autor, 'id'>): Promise<number> {
    return this.db.add<Omit<Autor, 'id'>>(this.STORE, autor);
  }

  update(autor: Autor): Promise<void> {
    return this.db.update<Autor>(this.STORE, autor);
  }

  delete(id: number): Promise<void> {
    return this.db.delete(this.STORE, id);
  }
}
