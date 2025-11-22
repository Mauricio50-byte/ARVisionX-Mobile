import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: 'login.page.html',
  styleUrls: ['login.page.scss'],
  standalone: false,
})
export class LoginPage {
  email = '';
  password = '';

  constructor(private auth: AuthService, private router: Router) {}

  async onSubmit() {
    try {
      await this.auth.login(this.email, this.password);
      this.router.navigate(['/home']);
    } catch (e) {}
  }
}
