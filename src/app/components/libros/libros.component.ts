import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LibroService } from '../../services/libro.service';
import { AutorService } from '../../services/autor.service';
import { ConfirmService } from '../../services/confirm.service';
import { Libro } from '../../models/libro.model';
import { Autor } from '../../models/autor.model';

declare const bootstrap: any;

@Component({
  selector: 'app-libros',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './libros.component.html'
})
export class LibrosComponent implements OnInit {
  libros = signal<Libro[]>([]);
  autores = signal<Autor[]>([]);
  form: Libro = this.emptyForm();
  editando = false;
  private modal: any;

  constructor(
    private libroService: LibroService,
    private autorService: AutorService,
    private confirm: ConfirmService
  ) {}

  async ngOnInit() {
    await Promise.all([this.cargarLibros(), this.cargarAutores()]);
  }

  ngAfterViewInit() {
    const el = document.getElementById('modalLibro');
    if (el) this.modal = new bootstrap.Modal(el);
  }

  private emptyForm(): Libro {
    return { titulo: '', isbn: '', anio: new Date().getFullYear(), genero: '', autorId: 0, cantidad: 1, disponible: 1 };
  }

  async cargarLibros() {
    this.libros.set(await this.libroService.getAll());
  }

  async cargarAutores() {
    this.autores.set(await this.autorService.getAll());
  }

  nombreAutor(autorId: number): string {
    const autor = this.autores().find(a => a.id === autorId);
    return autor ? `${autor.nombre} ${autor.apellido}` : 'Sin autor';
  }

  abrirNuevo() {
    this.form = this.emptyForm();
    this.editando = false;
    this.modal?.show();
  }

  abrirEditar(libro: Libro) {
    this.form = { ...libro };
    this.editando = true;
    this.modal?.show();
  }

  async guardar() {
    const data = {
      ...this.form,
      autorId: Number(this.form.autorId),
      cantidad: Number(this.form.cantidad),
      disponible: this.editando
        ? Number(this.form.disponible)
        : Number(this.form.cantidad)
    };
    if (this.editando) {
      await this.libroService.update(data as Libro);
    } else {
      await this.libroService.add(data);
    }
    this.modal?.hide();
    await this.cargarLibros();
  }

  async eliminar(id: number) {
    const ok = await this.confirm.open({ title: 'Eliminar libro', message: '¿Eliminar este libro? Esta acción no se puede deshacer.', confirmLabel: 'Eliminar' });
    if (!ok) return;
    await this.libroService.delete(id);
    await this.cargarLibros();
  }
}
