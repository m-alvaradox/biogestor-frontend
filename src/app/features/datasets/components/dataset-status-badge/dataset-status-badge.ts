import { Component, computed, input } from '@angular/core';
import { Badge, BadgeTone } from '../../../../shared/ui/badge/badge';
import { DatasetStatus } from '../../models/dataset';
import { DATASET_STATUS_LABELS, NO_STATUS_LABEL } from '../../models/dataset-labels';

const STATUS_TONES: Record<DatasetStatus, BadgeTone> = {
  active: 'success',
  processing: 'warning',
  archived: 'muted',
  error: 'danger',
};

@Component({
  imports: [Badge],
  selector: 'app-dataset-status-badge',
  templateUrl: './dataset-status-badge.html',
})
export class DatasetStatusBadge {
  readonly status = input.required<DatasetStatus | '' | null>();

  readonly label = computed(() => {
    const status = this.status();
    return status ? DATASET_STATUS_LABELS[status] : NO_STATUS_LABEL;
  });

  readonly tone = computed<BadgeTone>(() => {
    const status = this.status();
    return status ? STATUS_TONES[status] : 'neutral';
  });
}
