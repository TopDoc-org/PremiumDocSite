export type ComponentType = 'custom-jasbir' | 'custom-sachin' | 'standard' | 'clinic' | 'fallback';

export interface TenantEntry {
  doctorId: string | null;
  component: ComponentType;
}

/**
 * Static domain-to-doctor mapping.
 * To onboard a new doctor: add their domain(s) here and redeploy.
 */
export const DOMAIN_REGISTRY: Record<string, TenantEntry> = {
  // Production domains
  'premiumdoc.knocdoc.in':          { doctorId: '0e828c42-82da-4c56-bf35-a3e205161b92',       component: 'custom-jasbir' },
  'premium-doc-site.vercel.app':    { doctorId: 'sachin',       component: 'custom-sachin' },

  // Dev / fallback
  'localhost':              { doctorId: null,        component: 'fallback' },
  '127.0.0.1':             { doctorId: null,        component: 'fallback' },
};
