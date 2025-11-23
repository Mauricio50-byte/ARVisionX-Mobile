import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HomePage } from './home.page';
import { TargetsTableComponent } from '../../shared/components/targets-table/targets-table.component';
import { ImportJsonComponent } from '../../shared/components/import-json/import-json.component';
import { UserProfileComponent } from '../../shared/components/user-profile/user-profile.component';
import { HeaderActionsComponent } from '../../shared/components/header-actions/header-actions.component';
import { HomePageRoutingModule } from './home-routing.module';

@NgModule({
  imports: [CommonModule, IonicModule, FormsModule, ReactiveFormsModule, HomePageRoutingModule],
  declarations: [HomePage, TargetsTableComponent, ImportJsonComponent, UserProfileComponent, HeaderActionsComponent]
})
export class HomePageModule {}
