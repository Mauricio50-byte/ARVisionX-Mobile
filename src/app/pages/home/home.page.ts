import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { TargetsService } from '../../core/services/targets.service';
import { Target } from '../../core/models/target.model';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {
  targets: Target[] = [];

  constructor(private auth: AuthService, private router: Router, private targetsService: TargetsService) {}

  ngOnInit() {
    this.targetsService.getTargets().subscribe(list => this.targets = list);
    this.targetsService.fetchTargets();
  }

  async logout() {
    await this.auth.logout();
    this.router.navigate(['/login']);
  }

  onTargetChange(ev: any) {
    const id = ev.detail?.value;
    const t = this.targets.find(x => x.id === id);
    if (t) this.targetsService.setActiveTarget(t);
  }
}
