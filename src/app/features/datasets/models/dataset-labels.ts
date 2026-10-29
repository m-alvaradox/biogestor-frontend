import { DatasetStatus, DatasetType } from './dataset';

export const DATASET_TYPE_LABELS: Record<DatasetType, string> = {
  audio: 'Audio',
  image: 'Imagen',
  video: 'Video',
  csv: 'CSV',
  text: 'Texto',
  other: 'Otro',
};

export const DATASET_STATUS_LABELS: Record<DatasetStatus, string> = {
  active: 'Activo',
  processing: 'Procesando',
  archived: 'Archivado',
  error: 'Error',
};

export const NO_STATUS_LABEL = 'Sin estado';
