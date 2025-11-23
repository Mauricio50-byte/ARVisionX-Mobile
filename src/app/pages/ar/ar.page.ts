import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { TargetsService } from '../../core/services/targets.service';

@Component({
  selector: 'app-ar',
  templateUrl: 'ar.page.html',
  styleUrls: ['ar.page.scss'],
  standalone: false
})
export class ArPage implements OnInit {
  displayName = '';
  private auth = inject(AuthService);
  private router = inject(Router);
  private targets = inject(TargetsService);

  ngOnInit() {
    const u = this.auth.getCurrentUser();
    if (u) {
      this.auth.userProfile$(u.uid).subscribe(p => this.displayName = p?.displayName || '');
    }
    this.targets.fetchTargets();
  }

  async logout() {
    await this.auth.logout();
    this.router.navigate(['/login']);
  }
}
