import { Component, Input, inject, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { TargetsService } from '../../../core/services/targets.service';

@Component({
  selector: 'app-header-actions',
  templateUrl: './header-actions.component.html',
  styleUrls: ['./header-actions.component.scss'],
  standalone: false
})
export class HeaderActionsComponent implements OnInit, OnDestroy {
  @Input() title = 'Panel de Targets';
  @Input() displayName = 'Usuario';
  openProfileModal = false;
  private router = inject(Router);
  private auth = inject(AuthService);
  private targets = inject(TargetsService);
  activeTargetName = '';
  private targetSub: any;

  private onOpenProfileEvent = () => { this.openProfileModal = true; };

  ngOnInit() {
    window.addEventListener('open-profile', this.onOpenProfileEvent);
    this.targetSub = this.targets.getActiveTarget().subscribe(t => this.activeTargetName = t?.name || '');
  }

  ngOnDestroy() {
    window.removeEventListener('open-profile', this.onOpenProfileEvent);
    if (this.targetSub) this.targetSub.unsubscribe?.();
  }

  get displayInitials(): string {
    const n = (this.displayName || '').trim();
    if (!n) return 'U';
    const parts = n.split(/\s+/).filter(Boolean);
    const a = parts[0]?.[0] || '';
    const b = parts.length > 1 ? (parts[1]?.[0] || '') : '';
    return (a + b).toUpperCase();
  }

  onOpenProfile() {
    this.openProfileModal = true;
  }

  onNavigateAr() {
    this.router.navigate(['/ar']);
  }

  onOpenTargets() {
    window.dispatchEvent(new Event('open-targets'));
  }

  async onLogout() {
    await this.auth.logout();
    this.router.navigate(['/login']);
  }
}
