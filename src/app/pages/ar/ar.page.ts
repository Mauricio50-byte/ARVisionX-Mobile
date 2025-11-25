import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-ar',
  templateUrl: './ar.page.html',
  styleUrls: ['./ar.page.scss'],
  standalone: false,
})
export class ArPage {
  private router = inject(Router);

  closeAR() {
    this.router.navigate(['/home']);
  }
}
