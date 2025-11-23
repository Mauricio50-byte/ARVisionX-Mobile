import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

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

  ngOnInit() {
    const u = this.auth.getCurrentUser();
    if (u) {
      this.auth.userProfile$(u.uid).subscribe(p => this.displayName = p?.displayName || '');
    }
  }

  async logout() {
    await this.auth.logout();
    this.router.navigate(['/login']);
  }
}
