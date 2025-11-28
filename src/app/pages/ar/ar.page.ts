import { Component, AfterViewInit, ViewChild, ElementRef, inject, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { TargetsService } from '../../core/services/targets.service';

@Component({
  selector: 'app-ar',
  templateUrl: './ar.page.html',
  styleUrls: ['./ar.page.scss'],
  standalone: false,
})
export class ArPage implements AfterViewInit {
  @ViewChild('arframe', { static: true }) frameRef!: ElementRef<HTMLIFrameElement>;
  private router = inject(Router);
  private targets = inject(TargetsService);
  private zone = inject(NgZone);
  private lastTarget: any = null;
  private supabaseDemoTarget = {
    id: undefined,
    name: 'Local Pattern Demo',
    type: 'pattern',
    pattern: '/assets/pattern-t1.patt',
    modelUrl: '/assets/santiado%20bernabeu.jpg',
    scale: '1 1 1'
  };

  debugInfo = '';

  ngAfterViewInit() {
    const send = (t: any) => {
      const frame = this.frameRef?.nativeElement;
      const win = frame?.contentWindow;
      if (!win) return;
      try {
        win.postMessage({ type: 'SET_TARGET', payload: t }, '*');
      } catch { }
    };
    const shouldFallback = (t: any) => {
      const has = (s: any) => !!(typeof s === 'string' && s.trim());
      if (!t) {
        this.debugInfo = 'No target provided';
        return true;
      }
      if (t.type === 'preset') {
        if (!has(t.modelUrl)) {
          this.debugInfo = `Preset ${t.name} missing modelUrl`;
          return true;
        }
      }
      if (t.type === 'pattern') {
        if (!has(t.pattern)) {
          this.debugInfo = `Pattern ${t.name} missing pattern file`;
          return true;
        }
        if (!has(t.modelUrl)) {
          this.debugInfo = `Pattern ${t.name} missing modelUrl`;
          return true;
        }
      }
      this.debugInfo = `Loaded: ${t.name} (${t.type})`;
      return false;
    };
    this.targets.getActiveTarget().subscribe(t => {
      this.lastTarget = t;
      const fallback = shouldFallback(t);
      if (!fallback) send(t);
    });
    const frame = this.frameRef?.nativeElement;
    if (frame) {
      frame.addEventListener('load', () => {
        if (this.lastTarget) {
          const t = this.lastTarget;
          const fallback = shouldFallback(t);
          if (!fallback) send(t);
        }
      });
    }

    window.addEventListener('message', (ev) => {
      if (ev.data && ev.data.type === 'AR_DEBUG') {
        this.zone.run(() => {
          this.debugInfo = `AR: ${ev.data.msg}`;
        });
      }
    });
  }

  closeAR() {
    this.router.navigate(['/home']);
  }
}
