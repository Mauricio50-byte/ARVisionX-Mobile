import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Target } from '../../../core/models/target.model';

@Component({
  selector: 'app-targets-table',
  templateUrl: './targets-table.component.html',
  styleUrls: ['./targets-table.component.scss'],
  standalone: false
})
export class TargetsTableComponent {
  @Input() items: Target[] = [];
  @Output() edit = new EventEmitter<Target>();
  @Output() remove = new EventEmitter<number>();
  @Output() close = new EventEmitter<void>();

  q = '';
  filtered: Target[] = [];

  ngOnChanges() {
    this.applyFilter();
  }

  onSearchChange(ev: any) {
    this.q = (ev.detail?.value || '').toString();
    this.applyFilter();
  }

  applyFilter() {
    const s = this.q.trim().toLowerCase();
    this.filtered = !s ? this.items : this.items.filter(t => (t.name || '').toLowerCase().includes(s));
  }

  onEdit(t: Target) {
    this.edit.emit(t);
  }

  onDelete(t: Target) {
    if (t.id != null) this.remove.emit(t.id);
  }
}
