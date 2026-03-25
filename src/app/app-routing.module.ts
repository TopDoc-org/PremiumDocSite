import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { JasbirProfileComponent } from './components/custom/jasbir/jasbir-profile.component';
import { DemoProfileComponent } from './components/demo/demo-profile.component';
import { AdminHomeComponent } from './components/admin-home/admin-home.component';
import { MultiDoctorComponent } from './components/templates/multi-doctor/multi-doctor.component';
import { TenantRouterComponent } from './components/tenant-router/tenant-router.component';
import { ErrorPageComponent } from './components/error-page/error-page.component';
import { TenantGuard } from './guards/tenant.guard';
import { TenantConfigResolver } from './resolvers/tenant-config.resolver';

const routes: Routes = [
  // Tenant-resolved route (custom domains hit root path)
  {
    path: '',
    component: TenantRouterComponent,
    canActivate: [TenantGuard],
    resolve: { config: TenantConfigResolver },
    pathMatch: 'full'
  },
  // Static routes (dev / admin)
  { path: 'jasbir', component: JasbirProfileComponent },
  { path: 'demo', component: DemoProfileComponent },
  { path: 'admin', component: AdminHomeComponent },
  { path: 'multi-doctor', component: MultiDoctorComponent },
  { path: 'error', component: ErrorPageComponent },
  { path: '**', redirectTo: 'error' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
