import { Component, OnInit, AfterViewInit, signal, ElementRef, ViewChild, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { AutorService } from '../../services/autor.service';
import { LibroService } from '../../services/libro.service';
import { PrestamoService } from '../../services/prestamo.service';
import { Autor } from '../../models/autor.model';
import { Libro } from '../../models/libro.model';
import { Prestamo } from '../../models/prestamo.model';

declare const Chart: any;

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reportes.component.html'
})
export class ReportesComponent implements OnInit, AfterViewInit {
  @ViewChild('chartEstados') chartEstadosRef!: ElementRef;
  @ViewChild('chartGeneros') chartGenerosRef!: ElementRef;
  @ViewChild('chartLibrosPrestados') chartLibrosPrestadosRef!: ElementRef;

  autores = signal<Autor[]>([]);
  libros = signal<Libro[]>([]);
  prestamos = signal<Prestamo[]>([]);

  stats = signal({ autores: 0, libros: 0, prestamos: 0, activos: 0, devueltos: 0, vencidos: 0, sinStock: 0 });
  hoy = new Date().toISOString().split('T')[0];
  topLibros = signal<{ titulo: string; total: number }[]>([]);
  topAutores = signal<{ nombre: string; total: number }[]>([]);
  tabActivo = signal<'stats' | 'autores' | 'libros' | 'prestamos'>('stats');
  fechaImpresion = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  tabLabel() {
    const labels: Record<string, string> = { stats: 'Estadísticas', autores: 'Autores', libros: 'Libros', prestamos: 'Préstamos' };
    return labels[this.tabActivo()] ?? 'General';
  }

  private charts: any[] = [];
  private dataReady = false;

  constructor(
    private autorService: AutorService,
    private libroService: LibroService,
    private prestamoService: PrestamoService,
    private route: ActivatedRoute
  ) {
    effect(() => {
      if (this.tabActivo() === 'stats' && this.dataReady) {
        setTimeout(() => this.renderCharts(), 50);
      }
    });
  }

  async ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const tab = params['tab'] as 'stats' | 'autores' | 'libros' | 'prestamos';
      if (tab) this.tabActivo.set(tab);
    });

    const [autores, libros, prestamos] = await Promise.all([
      this.autorService.getAll(),
      this.libroService.getAll(),
      this.prestamoService.getAll()
    ]);

    this.autores.set(autores);
    this.libros.set(libros);
    this.prestamos.set(prestamos);

    const hoy = this.hoy;
    const activos = prestamos.filter(p => p.estado === 'activo').length;
    const devueltos = prestamos.filter(p => p.estado === 'devuelto').length;
    const vencidos = prestamos.filter(p => p.estado === 'activo' && !!p.fechaDevolucion && p.fechaDevolucion < hoy).length;
    const sinStock = libros.filter(l => l.disponible === 0).length;

    this.stats.set({ autores: autores.length, libros: libros.length, prestamos: prestamos.length, activos, devueltos, vencidos, sinStock });

    // Top 5 libros más prestados
    const conteoLibros = new Map<number, number>();
    prestamos.forEach(p => conteoLibros.set(p.libroId, (conteoLibros.get(p.libroId) ?? 0) + 1));
    const topLibros = [...conteoLibros.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, total]) => ({ titulo: libros.find(l => l.id === id)?.titulo ?? '?', total }));
    this.topLibros.set(topLibros);

    // Top 5 autores con más libros
    const conteoAutores = new Map<number, number>();
    libros.forEach(l => conteoAutores.set(l.autorId, (conteoAutores.get(l.autorId) ?? 0) + 1));
    const topAutores = [...conteoAutores.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, total]) => {
        const a = autores.find(a => a.id === id);
        return { nombre: a ? `${a.nombre} ${a.apellido}` : '?', total };
      });
    this.topAutores.set(topAutores);

    this.dataReady = true;
    this.renderCharts();
  }

  ngAfterViewInit() {
    if (this.dataReady) this.renderCharts();
  }

  private renderCharts() {
    if (!this.chartEstadosRef) return;
    this.charts.forEach(c => c.destroy());
    this.charts = [];

    const { activos, devueltos, vencidos } = this.stats();
    const activosNormales = activos - vencidos;

    // Doughnut: estados de préstamos
    this.charts.push(new Chart(this.chartEstadosRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Activos', 'Vencidos', 'Devueltos'],
        datasets: [{ data: [activosNormales, vencidos, devueltos], backgroundColor: ['#f59e0b', '#ef4444', '#10b981'], borderWidth: 0 }]
      },
      options: { responsive: true, plugins: { legend: { position: 'bottom' } }, cutout: '65%' }
    }));

    // Bar: libros por género
    const generoCounts = new Map<string, number>();
    this.libros().forEach(l => generoCounts.set(l.genero, (generoCounts.get(l.genero) ?? 0) + 1));
    const generos = [...generoCounts.keys()];
    const generoCantidades = generos.map(g => generoCounts.get(g)!);

    this.charts.push(new Chart(this.chartGenerosRef.nativeElement, {
      type: 'bar',
      data: {
        labels: generos.length ? generos : ['Sin datos'],
        datasets: [{
          label: 'Libros',
          data: generos.length ? generoCantidades : [0],
          backgroundColor: '#3b82f6',
          borderRadius: 8,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: '#f1f5f9' } }, x: { grid: { display: false } } }
      }
    }));

    // Horizontal bar: top libros prestados
    const tl = this.topLibros();
    this.charts.push(new Chart(this.chartLibrosPrestadosRef.nativeElement, {
      type: 'bar',
      data: {
        labels: tl.length ? tl.map(l => l.titulo) : ['Sin datos'],
        datasets: [{
          label: 'Préstamos',
          data: tl.length ? tl.map(l => l.total) : [0],
          backgroundColor: '#8b5cf6',
          borderRadius: 8,
          borderSkipped: false
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { x: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: '#f1f5f9' } }, y: { grid: { display: false } } }
      }
    }));
  }

  esVencido(p: Prestamo): boolean {
    return p.estado === 'activo' && !!p.fechaDevolucion && p.fechaDevolucion < this.hoy;
  }

  estadoLabel(p: Prestamo): string {
    if (this.esVencido(p)) return 'Vencido';
    return p.estado === 'activo' ? 'Activo' : 'Devuelto';
  }

  estadoBadge(p: Prestamo): string {
    if (this.esVencido(p)) return 'bg-danger';
    return p.estado === 'activo' ? 'bg-warning text-dark' : 'bg-success';
  }

  nombreAutor(autorId: number): string {
    const a = this.autores().find(a => a.id === autorId);
    return a ? `${a.nombre} ${a.apellido}` : '—';
  }

  nombreLibro(libroId: number): string {
    return this.libros().find(l => l.id === libroId)?.titulo ?? '—';
  }

  librosDeAutor(autorId: number): number {
    return this.libros().filter(l => l.autorId === autorId).length;
  }

  imprimir() {
    window.print();
  }

  ngOnDestroy() {
    this.charts.forEach(c => c.destroy());
  }
}
