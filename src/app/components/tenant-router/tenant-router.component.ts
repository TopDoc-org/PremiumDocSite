import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { TenantService } from '../../services/tenant.service';
import { ComponentType } from '../../config/domain-registry';
import { IDoctorSiteConfig } from '../../models/doctor-site-config.model';

@Component({
  selector: 'app-tenant-router',
  templateUrl: './tenant-router.component.html',
})
export class TenantRouterComponent implements OnInit {
  componentType: ComponentType | null = null;
  config: IDoctorSiteConfig | null = null;

  constructor(
    private tenantService: TenantService,
    private route: ActivatedRoute,
    private titleService: Title,
    private meta: Meta
  ) {}

  ngOnInit(): void {
    this.componentType = this.tenantService.componentType;
    this.config = this.route.snapshot.data['config'] || this.tenantService.config;

    if (this.config?.meta) {
      this.titleService.setTitle(this.config.meta.title);
      this.meta.updateTag({ name: 'description', content: this.config.meta.description });
      if (this.config.meta.ogImage) {
        this.meta.updateTag({ property: 'og:image', content: this.config.meta.ogImage });
      }
    }
  }
}
