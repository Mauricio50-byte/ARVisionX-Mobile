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
        const url = target.modelUrl;
        const ext = (url.split('.').pop() || '').toLowerCase();

        // Limpia atributos previos
        model.removeAttribute('gltf-model');
        model.removeAttribute('obj-model');
        model.removeAttribute('collada-model');
        model.removeAttribute('geometry');
        model.removeAttribute('material');

        if (ext === 'glb' || ext === 'gltf') {
          model.setAttribute('gltf-model', url);
        } else if (ext === 'obj') {
          model.setAttribute('obj-model', `obj: ${url}`);
        } else if (ext === 'dae') {
          model.setAttribute('collada-model', url);
        } else if (['png','jpg','jpeg','webp','svg'].includes(ext)) {
          model.setAttribute('geometry', 'primitive: plane; height: 1; width: 1');
          model.setAttribute('material', `src: ${url}; transparent: true`);
        }
        model.setAttribute('scale', target.scale);
      }
    });
  }
}
