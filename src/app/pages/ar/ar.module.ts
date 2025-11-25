import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ArPage } from './ar.page';
import { ArPageRoutingModule } from './ar-routing.module';

@NgModule({
  imports: [CommonModule, IonicModule, ArPageRoutingModule],
  declarations: [ArPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ArPageModule {}
