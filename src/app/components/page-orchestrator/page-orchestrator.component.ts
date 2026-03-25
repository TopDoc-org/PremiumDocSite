import { Component, Input, OnInit, ElementRef } from '@angular/core';
import { IDoctorSiteConfig, ISection } from '../../models/doctor-site-config.model';

@Component({
  selector: 'app-page-orchestrator',
  templateUrl: './page-orchestrator.component.html',
  styleUrls: ['./page-orchestrator.component.scss']
})
export class PageOrchestratorComponent implements OnInit {
  @Input() config!: IDoctorSiteConfig;

  constructor(private elRef: ElementRef) {}

  ngOnInit() {
    this.applyThemeToHost();
  }

  private applyThemeToHost() {
    const el = this.elRef.nativeElement;
    el.style.setProperty('--primary', this.config.theme.primaryColor);
    el.style.setProperty('--accent', this.config.theme.accentColor);
    el.style.setProperty('--gradient-from', this.config.theme.gradientFrom);
    el.style.setProperty('--gradient-to', this.config.theme.gradientTo);
  }

  getSectionStyle(section: ISection): { [key: string]: string } {
    const styles: { [key: string]: string } = {};
    if (section.style?.background) {
      styles['background'] = section.style.background;
    }
    if (section.style?.padding) {
      styles['padding'] = section.style.padding;
    }
    return styles;
  }

  trackBySection(index: number, section: ISection): string {
    return section.id;
  }
}
