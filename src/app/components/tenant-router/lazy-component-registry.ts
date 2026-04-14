import { ComponentType } from '../../config/domain-registry';

export interface LazyModuleEntry {
  moduleImport: () => Promise<any>;
}

export const LAZY_COMPONENT_REGISTRY: Partial<Record<ComponentType, LazyModuleEntry>> = {
  'custom-jasbir': {
    moduleImport: () => import('../custom/jasbir/jasbir.module').then(m => m.JasbirModule)
  },
  'custom-sachin': {
    moduleImport: () => import('../custom/sachin/sachin.module').then(m => m.SachinModule)
  },
  'standard': {
    moduleImport: () => import('../page-orchestrator/standard.module').then(m => m.StandardModule)
  },
  'clinic': {
    moduleImport: () => import('../templates/multi-doctor/clinic.module').then(m => m.ClinicModule)
  }
};
