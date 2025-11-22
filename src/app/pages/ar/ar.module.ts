import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ArPage } from './ar.page';
import { ArPageRoutingModule } from './ar-routing.module';
import { ArViewComponent } from '../../shared/components/ar-view/ar-view.component';

@NgModule({
  imports: [CommonModule, IonicModule, ArPageRoutingModule],
  declarations: [ArPage, ArViewComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ArPageModule {}
