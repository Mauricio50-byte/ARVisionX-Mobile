import { Component, Input, inject, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

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

  private onOpenProfileEvent = () => { this.openProfileModal = true; };

  ngOnInit() {
    window.addEventListener('open-profile', this.onOpenProfileEvent);
  }

  ngOnDestroy() {
    window.removeEventListener('open-profile', this.onOpenProfileEvent);
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

  async onLogout() {
    await this.auth.logout();
    this.router.navigate(['/login']);
  }
}
