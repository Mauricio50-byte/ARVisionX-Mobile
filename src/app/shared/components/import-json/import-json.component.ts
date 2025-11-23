import { Component, EventEmitter, inject, Output } from '@angular/core';
import { TargetsService } from '../../../core/services/targets.service';

@Component({
  selector: 'app-import-json',
  templateUrl: './import-json.component.html',
  styleUrls: ['./import-json.component.scss'],
  standalone: false
})
export class ImportJsonComponent {
  private targets = inject(TargetsService);
  jsonUrl = '';
  loading = false;
  @Output() closed = new EventEmitter<void>();

  async loadFromUrl() {
    if (!this.jsonUrl || this.loading) return;
    this.loading = true;
    await this.targets.fetchTargetsFromJson(this.jsonUrl);
    this.loading = false;
  }

  async onFileSelected(ev: any) {
    const file = ev.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const list = JSON.parse(reader.result as string);
        this.targets.setTargetsFromList(list);
      } catch {}
    };
    reader.readAsText(file);
  }
}
