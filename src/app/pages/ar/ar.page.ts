import { Component, ElementRef, OnDestroy, AfterViewInit, ViewChild, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TargetsService } from '../../core/services/targets.service';
import { Target } from '../../core/models/target.model';

@Component({
  selector: 'app-ar',
  templateUrl: './ar.page.html',
  styleUrls: ['./ar.page.scss'],
  standalone: false,
})
export class ArPage implements AfterViewInit, OnDestroy {
  @ViewChild('scene', { static: true }) sceneRef!: ElementRef<HTMLElement>;
  @ViewChild('wrapper', { static: true }) wrapperRef!: ElementRef<HTMLElement>;
  private router = inject(Router);
  private targets = inject(TargetsService);
  private markerEl: HTMLElement | null = null;
  private unsub: any;
  private resizeObserver?: ResizeObserver;
  activeTargetName = '';
  loading = true;
  error = '';

  ngAfterViewInit() {
    const tryInit = () => {
      const scene = this.sceneRef?.nativeElement as HTMLElement;
      const ok = !!(window as any).AFRAME && !!scene;
      if (!ok) {
        setTimeout(tryInit, 300);
        return;
      }
      scene.addEventListener('arjs-video-loaded', () => { this.loading = false; this.placeVideoInWrapper(); });
      scene.addEventListener('camera-error', () => { this.error = 'Error al acceder a la cámara'; this.loading = false; });
      this.unsub = this.targets.getActiveTarget().subscribe(t => { this.activeTargetName = t?.name || ''; this.applyTarget(t); });
    };
    tryInit();
  }

  ngOnDestroy() {
    if (this.unsub) this.unsub.unsubscribe?.();
    this.clearMarker();
    this.resizeObserver?.disconnect();
  }

  private clearMarker() {
    const scene = this.sceneRef?.nativeElement as HTMLElement;
    if (this.markerEl && scene) {
      try { scene.removeChild(this.markerEl); } catch {}
    }
    this.markerEl = null;
  }

  private applyTarget(target: Target) {
    const scene = this.sceneRef?.nativeElement as HTMLElement;
    if (!scene) return;
    this.clearMarker();

    const pattern = (target.pattern || '').trim();
    let marker: HTMLElement;
    if ((target.type || 'preset') === 'preset') {
      marker = document.createElement('a-marker');
      marker.setAttribute('preset', (pattern || 'hiro'));
    } else {
      const lower = pattern.toLowerCase();
      if (lower.endsWith('.patt') || lower.endsWith('.mind')) {
        marker = document.createElement('a-marker');
        marker.setAttribute('type', 'pattern');
        marker.setAttribute('url', pattern);
      } else {
        const base = pattern.replace(/\.(png|jpg|jpeg|webp|svg)$/i, '');
        marker = document.createElement('a-nft');
        marker.setAttribute('type', 'nft');
        marker.setAttribute('url', base);
        marker.setAttribute('smooth', 'true');
        marker.setAttribute('smoothCount', '10');
        marker.setAttribute('smoothTolerance', '.01');
        marker.setAttribute('smoothThreshold', '5');
      }
    }

    const modelUrl = (target.modelUrl || '').trim();
    const scale = (target.scale || '1 1 1');
    const lowerModel = modelUrl.toLowerCase();
    let content: HTMLElement;
    if (lowerModel.endsWith('.gltf') || lowerModel.endsWith('.glb')) {
      content = document.createElement('a-entity');
      content.setAttribute('gltf-model', modelUrl);
      content.setAttribute('scale', scale);
      content.setAttribute('position', '0 0 0');
    } else if (lowerModel.match(/\.(png|jpg|jpeg|webp|svg)$/)) {
      content = document.createElement('a-image');
      content.setAttribute('src', modelUrl);
      content.setAttribute('scale', scale);
      content.setAttribute('position', '0 0 0');
    } else {
      content = document.createElement('a-entity');
      content.setAttribute('scale', scale);
      content.setAttribute('position', '0 0 0');
    }

    marker.appendChild(content);
    marker.addEventListener('arjs-nft-loaded', () => { this.loading = false; });
    scene.appendChild(marker);
    this.markerEl = marker;
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  openTargetsFromAr() {
    this.router.navigate(['/home'], { queryParams: { openTargets: 1 } });
  }

  async requestCamera() {
    this.error = '';
    this.loading = true;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      stream.getTracks().forEach(t => t.stop());
      this.loading = false;
    } catch (e: any) {
      this.error = 'Permiso de cámara denegado o no disponible';
      this.loading = false;
    }
  }

  private placeVideoInWrapper() {
    try {
      const wrap = this.wrapperRef?.nativeElement as HTMLElement;
      const vid = document.getElementById('arjs-video') as HTMLVideoElement | null;
      if (!wrap || !vid) return;
      if (vid.parentElement !== wrap) {
        wrap.appendChild(vid);
      }
      vid.playsInline = true;
      vid.style.position = 'absolute';
      vid.style.top = '0';
      vid.style.left = '0';
      vid.style.right = '0';
      vid.style.bottom = '0';
      vid.style.width = '100%';
      vid.style.height = '100%';
      vid.style.objectFit = 'cover';
      vid.style.zIndex = '0';
      wrap.style.overflow = 'hidden';

      const updateSize = () => {
        const w = wrap.clientWidth || window.innerWidth;
        const vw = vid.videoWidth || 1280;
        const vh = vid.videoHeight || 720;
        const ratio = vh / vw;
        wrap.style.height = `${Math.round(w * ratio)}px`;
      };
      updateSize();
      if (!this.resizeObserver) {
        this.resizeObserver = new ResizeObserver(() => updateSize());
        this.resizeObserver.observe(wrap);
        window.addEventListener('resize', updateSize);
        window.addEventListener('orientationchange', updateSize);
      }
    } catch {}
  }
}
