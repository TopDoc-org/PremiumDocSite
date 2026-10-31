import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DemoProfileComponent } from './components/demo/demo-profile.component';
import { AdminHomeComponent } from './components/admin-home/admin-home.component';
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
  // Dev convenience routes (lazy-loaded via TenantRouter)
  {
    path: 'jasbir',
    component: TenantRouterComponent,
    canActivate: [TenantGuard],
    resolve: { config: TenantConfigResolver },
    data: { doctorId: '0e828c42-82da-4c56-bf35-a3e205161b92', component: 'custom-jasbir' }
  },
  {
    path: 'sachin',
    component: TenantRouterComponent,
    canActivate: [TenantGuard],
    resolve: { config: TenantConfigResolver },
    data: { doctorId: 'sachin', component: 'custom-sachin' }
  },
  // Static routes (dev / admin)
  { path: 'demo', component: DemoProfileComponent },
  { path: 'admin', component: AdminHomeComponent },
  { path: 'error', component: ErrorPageComponent },
  { path: '**', redirectTo: 'error' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
