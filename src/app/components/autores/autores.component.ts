import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatepickerDirective } from '../../directives/datepicker.directive';
import { AutorService } from '../../services/autor.service';
import { ConfirmService } from '../../services/confirm.service';
import { Autor } from '../../models/autor.model';

declare const bootstrap: any;

@Component({
  selector: 'app-autores',
  standalone: true,
  imports: [CommonModule, FormsModule, DatepickerDirective],
  templateUrl: './autores.component.html'
})
export class AutoresComponent implements OnInit {
  autores = signal<Autor[]>([]);
  form: Autor = this.emptyForm();
  editando = false;
  private modal: any;

  constructor(private autorService: AutorService, private confirm: ConfirmService) {}

  async ngOnInit() {
    await this.cargar();
  }

  ngAfterViewInit() {
    const el = document.getElementById('modalAutor');
    if (el) this.modal = new bootstrap.Modal(el);
  }

  private emptyForm(): Autor {
    return { nombre: '', apellido: '', nacionalidad: '', fechaNacimiento: '' };
  }

  async cargar() {
    this.autores.set(await this.autorService.getAll());
  }

  abrirNuevo() {
    this.form = this.emptyForm();
    this.editando = false;
    this.modal?.show();
  }

  abrirEditar(autor: Autor) {
    this.form = { ...autor };
    this.editando = true;
    this.modal?.show();
  }

  async guardar() {
    if (this.editando) {
      await this.autorService.update(this.form);
    } else {
      await this.autorService.add(this.form);
    }
    this.modal?.hide();
    await this.cargar();
  }

  async eliminar(id: number) {
    const ok = await this.confirm.open({ title: 'Eliminar autor', message: '¿Eliminar este autor? Esta acción no se puede deshacer.', confirmLabel: 'Eliminar' });
    if (!ok) return;
    await this.autorService.delete(id);
    await this.cargar();
  }
}
