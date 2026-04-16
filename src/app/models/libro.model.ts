export interface Libro {
  id?: number;
  titulo: string;
  isbn: string;
  anio: number;
  genero: string;
  autorId: number;
  cantidad: number;
  disponible: number;
}
