import { TenantService } from '../services/tenant.service';

export function tenantInitializerFactory(tenantService: TenantService): () => void {
  return () => tenantService.initialize();
}
