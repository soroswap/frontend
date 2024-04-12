
export enum TenantName {
  Amplitude = 'amplitude',
  Pendulum = 'pendulum',
  Foucoco = 'foucoco',
  Local = 'local',
}

export const enum ThemeName {
  Amplitude = TenantName.Amplitude,
  Pendulum = TenantName.Pendulum,
}

export const tenantTheme: Record<ThemeName, 'light' | 'dark'> = {
  [ThemeName.Amplitude]: 'dark',
  [ThemeName.Pendulum]: 'light',
};
