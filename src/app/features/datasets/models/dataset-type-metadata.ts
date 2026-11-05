import { DatasetType } from './dataset';

export type TypeMetadataKind = 'text' | 'number' | 'list';

export interface TypeMetadataField {
  key: string;
  label: string;
  kind: TypeMetadataKind;
  placeholder: string;
}

export const TYPE_METADATA_FIELDS: Record<DatasetType, TypeMetadataField[]> = {
  audio: [
    {
      key: 'microphone',
      label: 'Micrófono',
      kind: 'text',
      placeholder: 'Ej.: Hidrófono DolphinEar DE200',
    },
    {
      key: 'sample_rate',
      label: 'Frecuencia de muestreo (Hz)',
      kind: 'number',
      placeholder: 'Ej.: 44100',
    },
  ],
  image: [{ key: 'resolution', label: 'Resolución', kind: 'text', placeholder: 'Ej.: 1920x1080' }],
  video: [
    { key: 'fps', label: 'Cuadros por segundo (fps)', kind: 'number', placeholder: 'Ej.: 30' },
    { key: 'resolution', label: 'Resolución', kind: 'text', placeholder: 'Ej.: 3840x2160' },
  ],
  csv: [
    {
      key: 'columns',
      label: 'Columnas',
      kind: 'list',
      placeholder: 'Ej.: fecha, piscina, od_mg_l',
    },
    { key: 'delimiter', label: 'Delimitador', kind: 'text', placeholder: 'Ej.: ,' },
  ],
  text: [],
  other: [],
};
