import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatepickerDirective } from '../../directives/datepicker.directive';
import { PrestamoService } from '../../services/prestamo.service';
import { LibroService } from '../../services/libro.service';
import { ConfirmService } from '../../services/confirm.service';
import { Prestamo } from '../../models/prestamo.model';
import { Libro } from '../../models/libro.model';

declare const bootstrap: any;

@Component({
  selector: 'app-prestamos',
  standalone: true,
  imports: [CommonModule, FormsModule, DatepickerDirective],
  templateUrl: './prestamos.component.html'
})
export class PrestamosComponent implements OnInit {
  prestamos = signal<Prestamo[]>([]);
  libros = signal<Libro[]>([]);
  private hoy = new Date().toISOString().split('T')[0];
  prestamosVencidos = computed(() =>
    this.prestamos().filter(p => p.estado === 'activo' && !!p.fechaDevolucion && p.fechaDevolucion < this.hoy)
  );
  form: Prestamo = this.emptyForm();
  editando = false;
  errorMsg = '';
  private estadoAnterior: 'activo' | 'devuelto' = 'activo';
  private modal: any;

  constructor(
    private prestamoService: PrestamoService,
    private libroService: LibroService,
    private confirm: ConfirmService
  ) {}

  async ngOnInit() {
    await Promise.all([this.cargarPrestamos(), this.cargarLibros()]);
  }

  ngAfterViewInit() {
    const el = document.getElementById('modalPrestamo');
    if (el) this.modal = new bootstrap.Modal(el);
  }

  private emptyForm(): Prestamo {
    const hoy = new Date().toISOString().split('T')[0];
    return { libroId: 0, nombreLector: '', fechaPrestamo: hoy, fechaDevolucion: '', estado: 'activo' };
  }

  async cargarPrestamos() {
    this.prestamos.set(await this.prestamoService.getAll());
  }

  async cargarLibros() {
    this.libros.set(await this.libroService.getAll());
  }

  tituloLibro(libroId: number): string {
    return this.libros().find(l => l.id === libroId)?.titulo ?? 'Sin libro';
  }

  disponibleLibro(libroId: number): number {
    return this.libros().find(l => l.id === libroId)?.disponible ?? 0;
  }

  librosDisponibles(): Libro[] {
    return this.libros().filter(l => l.disponible > 0);
  }

  abrirNuevo() {
    this.form = this.emptyForm();
    this.editando = false;
    this.errorMsg = '';
    this.modal?.show();
  }

  abrirEditar(prestamo: Prestamo) {
    this.form = { ...prestamo };
    this.estadoAnterior = prestamo.estado;
    this.editando = true;
    this.errorMsg = '';
    this.modal?.show();
  }

  async guardar() {
    this.errorMsg = '';
    const data = { ...this.form, libroId: Number(this.form.libroId) } as Prestamo;

    if (!this.editando) {
      const libro = this.libros().find(l => l.id === data.libroId);
      if (!libro || libro.disponible <= 0) {
        this.errorMsg = 'No hay ejemplares disponibles de ese libro.';
        return;
      }
      await this.prestamoService.add(data);
      await this.libroService.updateDisponible(data.libroId, -1);
    } else {
      await this.prestamoService.update(data);
      if (this.estadoAnterior === 'activo' && data.estado === 'devuelto') {
        await this.libroService.updateDisponible(data.libroId, +1);
      } else if (this.estadoAnterior === 'devuelto' && data.estado === 'activo') {
        const libro = this.libros().find(l => l.id === data.libroId);
        if (!libro || libro.disponible <= 0) {
          this.errorMsg = 'No hay ejemplares disponibles para reactivar este préstamo.';
          return;
        }
        await this.libroService.updateDisponible(data.libroId, -1);
      }
    }

    this.modal?.hide();
    await Promise.all([this.cargarPrestamos(), this.cargarLibros()]);
  }

  async eliminar(prestamo: Prestamo) {
    const ok = await this.confirm.open({ title: 'Eliminar préstamo', message: '¿Eliminar este préstamo? Esta acción no se puede deshacer.', confirmLabel: 'Eliminar' });
    if (!ok) return;
    await this.prestamoService.delete(prestamo.id!);
    if (prestamo.estado === 'activo') {
      await this.libroService.updateDisponible(prestamo.libroId, +1);
    }
    await Promise.all([this.cargarPrestamos(), this.cargarLibros()]);
  }

  esVencido(prestamo: Prestamo): boolean {
    if (prestamo.estado !== 'activo' || !prestamo.fechaDevolucion) return false;
    return prestamo.fechaDevolucion < new Date().toISOString().split('T')[0];
  }

  estadoLabel(prestamo: Prestamo): string {
    if (this.esVencido(prestamo)) return 'Vencido';
    return prestamo.estado === 'activo' ? 'Activo' : 'Devuelto';
  }

  estadoBadge(prestamo: Prestamo): string {
    if (this.esVencido(prestamo)) return 'bg-danger';
    return prestamo.estado === 'activo' ? 'bg-warning text-dark' : 'bg-success';
  }
}
