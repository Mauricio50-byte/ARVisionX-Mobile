import { Component, AfterViewInit, inject } from '@angular/core';
import { TargetsService } from '../../../core/services/targets.service';

@Component({
  selector: 'app-ar-view',
  templateUrl: './ar-view.component.html',
  styleUrls: ['./ar-view.component.scss'],
  standalone: false,
})
export class ArViewComponent implements AfterViewInit {
  private targets = inject(TargetsService);

  ngAfterViewInit() {
    this.targets.getActiveTarget().subscribe(target => {
      const marker = document.querySelector('#dynamic-marker') as any;
      if (!marker) return;
      if (target.type === 'preset') {
        marker.setAttribute('preset', target.pattern);
      } else {
        marker.setAttribute('type', target.type);
        marker.setAttribute('url', target.pattern);
      }
      const model = document.querySelector('#model-container') as any;
      if (model && target.modelUrl) {
        model.setAttribute('gltf-model', target.modelUrl);
        model.setAttribute('scale', target.scale);
      }
    });
  }
}
