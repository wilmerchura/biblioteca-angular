export type EstadoPrestamo = 'activo' | 'devuelto';

export interface Prestamo {
  id?: number;
  libroId: number;
  nombreLector: string;
  fechaPrestamo: string;
  fechaDevolucion: string;
  estado: EstadoPrestamo;
}
