import { Injectable, signal } from '@angular/core';
import { DbService } from './db.service';
import { Usuario } from '../models/usuario.model';

const SESSION_KEY = 'biblioteca_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  currentUser = signal<Usuario | null>(this.loadSession());

  constructor(private db: DbService) {}

  private loadSession(): Usuario | null {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  isLoggedIn(): boolean {
    return this.currentUser() !== null;
  }

  async login(username: string, password: string): Promise<boolean> {
    const user = await this.db.getByIndexSingle<Usuario>('usuarios', 'username', username);
    if (user && user.password === password) {
      const safe = { ...user, password: '' };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(safe));
      this.currentUser.set(safe);
      return true;
    }
    return false;
  }

  logout(): void {
    sessionStorage.removeItem(SESSION_KEY);
    this.currentUser.set(null);
  }
}
