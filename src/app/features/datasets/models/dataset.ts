export type DatasetType = 'audio' | 'image' | 'video' | 'csv' | 'text' | 'other';

export type DatasetStatus = 'active' | 'processing' | 'archived' | 'error';

export interface Dataset {
  id: number;
  name: string;
  type: DatasetType;
  status: DatasetStatus;

  // Cambiar cuando exista data de Usuarios.
  owner: number | null;

  created_at: string;
}

export interface DatasetPage {
  count: number;
  next: string | null;
  previous: string | null;
  results: Dataset[];
}
