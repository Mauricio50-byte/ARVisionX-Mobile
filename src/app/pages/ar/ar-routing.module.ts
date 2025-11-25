import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ArPage } from './ar.page';
import { AuthGuard } from '../../core/guards/auth.guard';

const routes: Routes = [
  { path: '', component: ArPage, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ArPageRoutingModule {}

