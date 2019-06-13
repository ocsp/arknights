import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HrComponent } from './hr/hr.component';
import { LvlupComponent } from './lvlup/lvlup.component';
import { MaterialComponent } from './material/material.component';
import { MainComponent } from './main/main.component';
import { HelpComponent } from './help/help.component';
import { CharMatComponent } from './char-mat/char-mat.component';

const routes: Routes = [
  { path: 'hr', component: HrComponent },
  { path: 'lvlup', component: LvlupComponent },
  { path: 'material', component: MaterialComponent },
  { path: 'help', component: HelpComponent },
  { path: 'charmat', component: CharMatComponent },
  { path: '', component: MainComponent, pathMatch: 'full' },
  { path: '**', redirectTo: '/' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
