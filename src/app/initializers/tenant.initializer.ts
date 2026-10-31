import { TenantService } from '../services/tenant.service';

export function tenantInitializerFactory(tenantService: TenantService): () => Promise<void> {
  return () => tenantService.initialize();
}
