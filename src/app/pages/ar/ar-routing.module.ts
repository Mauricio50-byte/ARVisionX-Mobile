import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ArPage } from './ar.page';

const routes: Routes = [
  { path: '', component: ArPage }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ArPageRoutingModule {}
