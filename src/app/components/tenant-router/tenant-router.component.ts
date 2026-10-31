import {
  Component, OnInit, ViewChild, ViewContainerRef,
  Injector, createNgModule
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { TenantService } from '../../services/tenant.service';
import { LAZY_COMPONENT_REGISTRY } from './lazy-component-registry';

@Component({
  selector: 'app-tenant-router',
  template: `
    <ng-container #outlet></ng-container>
    <div *ngIf="loadError" class="tenant-error">
      <h2>Unable to load profile</h2>
      <p>Please try again later.</p>
    </div>
  `,
})
export class TenantRouterComponent implements OnInit {
  @ViewChild('outlet', { read: ViewContainerRef, static: true }) outlet!: ViewContainerRef;

  loadError = false;

  constructor(
    private tenantService: TenantService,
    private route: ActivatedRoute,
    private titleService: Title,
    private meta: Meta,
    private injector: Injector
  ) {}

  async ngOnInit(): Promise<void> {
    const componentType = this.tenantService.componentType;
    const config = this.route.snapshot.data['config'] || this.tenantService.config;

    if (config?.meta) {
      this.titleService.setTitle(config.meta.title);
      this.meta.updateTag({ name: 'description', content: config.meta.description });
      if (config.meta.ogImage) {
        this.meta.updateTag({ property: 'og:image', content: config.meta.ogImage });
      }
    }

    if (!componentType || componentType === 'fallback') {
      this.loadError = true;
      return;
    }

    const entry = LAZY_COMPONENT_REGISTRY[componentType];
    if (!entry) {
      this.loadError = true;
      return;
    }

    try {
      const moduleClass = await entry.moduleImport();
      const moduleRef = createNgModule(moduleClass, this.injector);
      const componentClass = moduleClass.entry;

      this.outlet.clear();
      const componentRef = this.outlet.createComponent(componentClass, {
        ngModuleRef: moduleRef
      });

      // Pass config to standard orchestrator
      if (componentType === 'standard' && config) {
        (componentRef.instance as any).config = config;
      }
    } catch (e) {
      console.error('Failed to lazy-load component:', e);
      this.loadError = true;
    }
  }
}
