export type DatasetType = 'audio' | 'image' | 'video' | 'csv' | 'text' | 'other';

export type DatasetStatus = 'active' | 'processing' | 'archived' | 'error';

export interface DatasetOwner {
  id: number;
  name: string;
}

export interface Dataset {
  id: number;
  name: string;
  type: DatasetType;
  status: DatasetStatus | '' | null;
  owner: DatasetOwner | null;
  created_at: string;
}

export interface DatasetPage {
  count: number;
  next: string | null;
  previous: string | null;
  results: Dataset[];
}

export interface DatasetStorage {
  s3_uri: string | null;
  file_format: string | null;
  size_bytes: number | null;
  file_count: number | null;
}

export interface DatasetDetail extends Dataset {
  species: string | null;
  farm: string | null;
  pool: string | null;
  capture_date: string | null;
  type_metadata: Record<string, unknown> | null;
  storage: DatasetStorage;
}
