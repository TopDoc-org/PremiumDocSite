export interface IDoctorSiteConfig {
  doctorId: string;
  profileType: 'standard' | string;
  theme: ISiteTheme;
  meta: ISiteMeta;
  sections: ISection[];
}

export interface ISiteTheme {
  primaryColor: string;
  accentColor: string;
  gradientFrom: string;
  gradientTo: string;
  fontPair?: string;
}

export interface ISiteMeta {
  title: string;
  description: string;
  favicon?: string;
  ogImage?: string;
}

export interface ISection {
  type: string;
  id: string;
  data: any;
  style?: ISectionStyle;
}

export interface ISectionStyle {
  background?: string;
  padding?: string;
  className?: string;
}

export interface IDomainMapping {
  doctorId: string;
  profileType: string;
}
