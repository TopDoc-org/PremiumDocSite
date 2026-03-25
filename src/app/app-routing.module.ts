import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { JasbirProfileComponent } from './components/custom/jasbir/jasbir-profile.component';
import { DemoProfileComponent } from './components/demo/demo-profile.component';
import { AdminHomeComponent } from './components/admin-home/admin-home.component';
import { MultiDoctorComponent } from './components/templates/multi-doctor/multi-doctor.component';

const routes: Routes = [
  { path: '', redirectTo: 'jasbir', pathMatch: 'full' },
  { path: 'jasbir', component: JasbirProfileComponent },
  { path: 'demo', component: DemoProfileComponent },
  { path: 'admin', component: AdminHomeComponent },
  { path: 'multi-doctor', component: MultiDoctorComponent },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
