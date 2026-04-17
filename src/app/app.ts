import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { DbService } from './services/db.service';
import { AuthService } from './services/auth.service';
import { ConfirmService } from './services/confirm.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    @if (dbError()) {
      <div class="d-flex justify-content-center align-items-center" style="height:100vh;background:#f8fafc">
        <div class="text-center p-4" style="max-width:460px">
          <i class="bi bi-database-x text-danger" style="font-size:3rem"></i>
          <h5 class="fw-bold mt-3 mb-2">
            @if (dbError() === 'BLOCKED') { Base de datos bloqueada }
            @else if (dbError() === 'TIMEOUT') { Tiempo de espera agotado }
            @else { Error al iniciar la base de datos }
          </h5>
          <p class="text-muted mb-4">
            @if (dbError() === 'BLOCKED') {
              Otra pestaña tiene la base de datos abierta en una versión anterior. Cierra las otras pestañas y recarga.
            } @else if (dbError() === 'TIMEOUT') {
              La base de datos no respondió en 5 segundos. Puede estar bloqueada por otra pestaña o por configuración del navegador.
            } @else {
              {{ dbError() }}
            }
          </p>
          <div class="d-flex gap-2 justify-content-center flex-wrap">
            <button class="btn btn-primary" onclick="location.reload()">
              <i class="bi bi-arrow-clockwise me-1"></i>Recargar
            </button>
            <button class="btn btn-outline-danger" (click)="resetDB()">
              <i class="bi bi-trash me-1"></i>Reiniciar DB
            </button>
          </div>
          <p class="text-muted mt-3" style="font-size:0.78rem">
            "Reiniciar DB" borra todos los datos y recrea la base de datos desde cero.
          </p>
        </div>
      </div>
    } @else if (!dbReady()) {
      <div class="d-flex justify-content-center align-items-center" style="height:100vh">
        <div class="text-center">
          <div class="spinner-border text-primary mb-3" role="status"></div>
          <p class="text-muted">Iniciando base de datos...</p>
        </div>
      </div>
    } @else if (!auth.isLoggedIn()) {
      <router-outlet />
    } @else {
      <div class="app-wrapper">
        <!-- Sidebar -->
        <aside class="sidebar">
          <div class="sidebar-brand">
            <i class="bi bi-building-fill"></i>
            <span>Biblioteca</span>
          </div>

          <nav class="sidebar-nav">
            <p class="sidebar-label">Menú</p>
            <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}" class="sidebar-link">
              <i class="bi bi-house-door-fill"></i>
              <span>Inicio</span>
            </a>
            <a routerLink="/autores" routerLinkActive="active" class="sidebar-link">
              <i class="bi bi-person-lines-fill"></i>
              <span>Autores</span>
            </a>
            <a routerLink="/libros" routerLinkActive="active" class="sidebar-link">
              <i class="bi bi-book-fill"></i>
              <span>Libros</span>
            </a>
            <a routerLink="/prestamos" routerLinkActive="active" class="sidebar-link">
              <i class="bi bi-arrow-left-right"></i>
              <span>Préstamos</span>
            </a>

            <p class="sidebar-label mt-3">Análisis</p>
            <a routerLink="/reportes" [queryParams]="{tab:'stats'}" routerLinkActive="active" class="sidebar-link">
              <i class="bi bi-bar-chart-fill"></i>
              <span>Estadísticas</span>
            </a>
            <a routerLink="/reportes" [queryParams]="{tab:'autores'}" class="sidebar-link sidebar-sublink"
              [class.active]="isReportTab('autores')">
              <i class="bi bi-person-lines-fill"></i>
              <span>Rep. Autores</span>
            </a>
            <a routerLink="/reportes" [queryParams]="{tab:'libros'}" class="sidebar-link sidebar-sublink"
              [class.active]="isReportTab('libros')">
              <i class="bi bi-book-fill"></i>
              <span>Rep. Libros</span>
            </a>
            <a routerLink="/reportes" [queryParams]="{tab:'prestamos'}" class="sidebar-link sidebar-sublink"
              [class.active]="isReportTab('prestamos')">
              <i class="bi bi-arrow-left-right"></i>
              <span>Rep. Préstamos</span>
            </a>
          </nav>

          <div class="sidebar-footer">
            <i class="bi bi-database me-1"></i>IndexedDB
          </div>
        </aside>

        <!-- Main -->
        <div class="main-content">
          <header class="topbar">
            <div class="topbar-left">
              <span class="fw-semibold text-dark" style="font-size:0.95rem">Sistema de Biblioteca</span>
            </div>
            <div class="topbar-right d-flex align-items-center gap-3">
<div class="d-flex align-items-center gap-2">
                <div class="avatar-circle">
                  <i class="bi bi-person-fill"></i>
                </div>
                <div class="d-none d-md-block">
                  <div style="font-size:0.85rem;font-weight:600;line-height:1.2">{{ auth.currentUser()?.nombre }}</div>
                  <div style="font-size:0.75rem;color:#94a3b8">{{ auth.currentUser()?.rol }}</div>
                </div>
                <button class="btn btn-sm btn-outline-secondary ms-1" (click)="logout()" title="Cerrar sesión">
                  <i class="bi bi-box-arrow-right"></i>
                </button>
              </div>
            </div>
          </header>

          <div class="page-body">
            <router-outlet />
          </div>
        </div>
      </div>
    }

    @if (confirm.visible()) {
      <div class="confirm-overlay" (click)="confirm.cancel()">
        <div class="confirm-dialog" (click)="$event.stopPropagation()">
          <div class="confirm-icon">
            <i class="bi bi-exclamation-triangle-fill text-danger"></i>
          </div>
          <h6 class="confirm-title">{{ confirm.title() }}</h6>
          <p class="confirm-message">{{ confirm.message() }}</p>
          <div class="confirm-actions">
            <button class="btn btn-secondary btn-sm" (click)="confirm.cancel()">
              <i class="bi bi-x-lg me-1"></i>Cancelar
            </button>
            <button class="btn btn-sm {{ confirm.confirmClass() }}" (click)="confirm.accept()">
              <i class="bi bi-check-lg me-1"></i>{{ confirm.confirmLabel() }}
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class App implements OnInit {
  dbReady = signal(false);
  dbError = signal('');
  currentTab = signal('');

  constructor(
    public auth: AuthService,
    public confirm: ConfirmService,
    private db: DbService,
    private router: Router
  ) {
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
      const url = this.router.parseUrl(this.router.url);
      this.currentTab.set(url.queryParams['tab'] ?? '');
    });
  }

  isReportTab(tab: string): boolean {
    return this.router.url.includes('/reportes') && this.currentTab() === tab;
  }

  async ngOnInit() {
    try {
      await this.db.init();
      this.dbReady.set(true);
      if (!this.auth.isLoggedIn()) {
        this.router.navigate(['/login']);
      }
    } catch (e: any) {
      this.dbError.set(e?.message ?? 'Error al inicializar la base de datos.');
    }
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  async resetDB() {
    const ok = await this.confirm.open({
      title: 'Reiniciar base de datos',
      message: '¿Borrar todos los datos y reiniciar la base de datos? Esta acción no se puede deshacer.',
      confirmLabel: 'Reiniciar',
      confirmClass: 'btn-danger'
    });
    if (!ok) return;
    await this.db.resetDB();
    location.reload();
  }
}
