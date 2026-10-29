import { Component, computed, input } from '@angular/core';
import { Badge } from '../../../../shared/ui/badge/badge';
import { DatasetType } from '../../models/dataset';
import { DATASET_TYPE_LABELS } from '../../models/dataset-labels';

@Component({
  imports: [Badge],
  selector: 'app-dataset-type-badge',
  templateUrl: './dataset-type-badge.html',
})
export class DatasetTypeBadge {
  readonly type = input.required<DatasetType>();

  readonly label = computed(() => DATASET_TYPE_LABELS[this.type()]);
}
