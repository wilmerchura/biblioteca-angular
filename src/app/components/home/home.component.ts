import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AutorService } from '../../services/autor.service';
import { LibroService } from '../../services/libro.service';
import { PrestamoService } from '../../services/prestamo.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="p-4">
      <!-- Header -->
      <div class="mb-4">
        <h4 class="fw-bold text-dark mb-1">Panel de Control</h4>
        <p class="text-muted mb-0" style="font-size:0.9rem">Resumen del sistema de biblioteca</p>
      </div>

      <!-- Stats -->
      <div class="row g-3 mb-4">
        <div class="col-sm-4">
          <div class="card h-100" style="border-left: 4px solid #3b82f6 !important;">
            <div class="card-body d-flex align-items-center gap-3 py-3">
              <div class="rounded-3 p-3" style="background:#eff6ff">
                <i class="bi bi-person-lines-fill fs-4 text-primary"></i>
              </div>
              <div>
                <div class="text-muted" style="font-size:0.78rem;text-transform:uppercase;letter-spacing:.06em;font-weight:600">Autores</div>
                <div class="fw-bold fs-3 lh-1">{{ totalAutores() }}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-sm-4">
          <div class="card h-100" style="border-left: 4px solid #10b981 !important;">
            <div class="card-body d-flex align-items-center gap-3 py-3">
              <div class="rounded-3 p-3" style="background:#f0fdf4">
                <i class="bi bi-book-fill fs-4 text-success"></i>
              </div>
              <div>
                <div class="text-muted" style="font-size:0.78rem;text-transform:uppercase;letter-spacing:.06em;font-weight:600">Libros</div>
                <div class="fw-bold fs-3 lh-1">{{ totalLibros() }}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-sm-4">
          <div class="card h-100" style="border-left: 4px solid #f59e0b !important;">
            <div class="card-body d-flex align-items-center gap-3 py-3">
              <div class="rounded-3 p-3" style="background:#fffbeb">
                <i class="bi bi-arrow-left-right fs-4 text-warning"></i>
              </div>
              <div>
                <div class="text-muted" style="font-size:0.78rem;text-transform:uppercase;letter-spacing:.06em;font-weight:600">Préstamos</div>
                <div class="fw-bold fs-3 lh-1">{{ totalPrestamos() }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Access -->
      <div class="row g-3">
        <div class="col-md-4">
          <div class="card h-100">
            <div class="card-body text-center py-4">
              <div class="mb-3" style="background:#eff6ff;width:64px;height:64px;border-radius:16px;display:flex;align-items:center;justify-content:center;margin:0 auto">
                <i class="bi bi-person-lines-fill fs-3 text-primary"></i>
              </div>
              <h6 class="fw-bold mb-1">Autores</h6>
              <p class="text-muted mb-3" style="font-size:0.82rem">Gestiona los autores registrados</p>
              <a routerLink="/autores" class="btn btn-primary btn-sm px-4">
                Ir a Autores <i class="bi bi-arrow-right ms-1"></i>
              </a>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card h-100">
            <div class="card-body text-center py-4">
              <div class="mb-3" style="background:#f0fdf4;width:64px;height:64px;border-radius:16px;display:flex;align-items:center;justify-content:center;margin:0 auto">
                <i class="bi bi-book-fill fs-3 text-success"></i>
              </div>
              <h6 class="fw-bold mb-1">Libros</h6>
              <p class="text-muted mb-3" style="font-size:0.82rem">Catálogo y control de stock</p>
              <a routerLink="/libros" class="btn btn-success btn-sm px-4">
                Ir a Libros <i class="bi bi-arrow-right ms-1"></i>
              </a>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card h-100">
            <div class="card-body text-center py-4">
              <div class="mb-3" style="background:#fffbeb;width:64px;height:64px;border-radius:16px;display:flex;align-items:center;justify-content:center;margin:0 auto">
                <i class="bi bi-arrow-left-right fs-3 text-warning"></i>
              </div>
              <h6 class="fw-bold mb-1">Préstamos</h6>
              <p class="text-muted mb-3" style="font-size:0.82rem">Control de préstamos y devoluciones</p>
              <a routerLink="/prestamos" class="btn btn-warning btn-sm px-4">
                Ir a Préstamos <i class="bi bi-arrow-right ms-1"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class HomeComponent implements OnInit {
  totalAutores = signal(0);
  totalLibros = signal(0);
  totalPrestamos = signal(0);

  constructor(
    private autorService: AutorService,
    private libroService: LibroService,
    private prestamoService: PrestamoService
  ) {}

  async ngOnInit() {
    const [autores, libros, prestamos] = await Promise.all([
      this.autorService.getAll(),
      this.libroService.getAll(),
      this.prestamoService.getAll()
    ]);
    this.totalAutores.set(autores.length);
    this.totalLibros.set(libros.length);
    this.totalPrestamos.set(prestamos.length);
  }
}
