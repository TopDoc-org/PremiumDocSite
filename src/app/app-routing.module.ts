import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { JasbirProfileComponent } from './components/custom/jasbir/jasbir-profile.component';
import { DemoProfileComponent } from './components/demo/demo-profile.component';

const routes: Routes = [
  { path: '', redirectTo: 'jasbir', pathMatch: 'full' },
  { path: 'jasbir', component: JasbirProfileComponent },
  { path: 'demo', component: DemoProfileComponent },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
