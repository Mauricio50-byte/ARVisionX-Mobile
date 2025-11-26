import { Component, AfterViewInit, ViewChild, ElementRef, inject } from '@angular/core';
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
  private lastTarget: any = null;
  private supabaseDemoTarget = {
    id: undefined,
    name: 'Local Pattern Demo',
    type: 'pattern',
    pattern: '/assets/pattern-t1.patt',
    modelUrl: '/assets/santiado%20bernabeu.jpg',
    scale: '1 1 1'
  };

  ngAfterViewInit() {
    const send = (t: any) => {
      const frame = this.frameRef?.nativeElement;
      const win = frame?.contentWindow;
      if (!win) return;
      try {
        win.postMessage({ type: 'SET_TARGET', payload: t }, window.location.origin);
      } catch {}
    };
    const shouldFallback = (t: any) => {
      const has = (s: any) => !!(typeof s === 'string' && s.trim());
      if (!t) return true;
      if (t.type === 'preset') return !has(t.modelUrl);
      if (t.type === 'pattern') return !(has(t.pattern) && has(t.modelUrl));
      return true;
    };
    this.targets.getActiveTarget().subscribe(t => {
      this.lastTarget = t;
      send(shouldFallback(t) ? this.supabaseDemoTarget : t);
    });
    const frame = this.frameRef?.nativeElement;
    if (frame) {
      frame.addEventListener('load', () => {
        if (this.lastTarget) {
          const t = this.lastTarget;
          send(shouldFallback(t) ? this.supabaseDemoTarget : t);
        }
      });
    }
  }

  closeAR() {
    this.router.navigate(['/home']);
  }
}
