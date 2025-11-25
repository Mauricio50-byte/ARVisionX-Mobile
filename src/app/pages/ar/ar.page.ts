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

  ngAfterViewInit() {
    const send = (t: any) => {
      const frame = this.frameRef?.nativeElement;
      const win = frame?.contentWindow;
      if (!win) return;
      try {
        win.postMessage({ type: 'SET_TARGET', payload: t }, window.location.origin);
      } catch {}
    };
    this.targets.getActiveTarget().subscribe(t => send(t));
  }

  closeAR() {
    this.router.navigate(['/home']);
  }
}
