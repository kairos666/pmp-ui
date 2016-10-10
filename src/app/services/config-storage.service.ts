import { Injectable } from '@angular/core';
import { LocalStorageService } from './local-storage.service';
import { PimpConfig, deconstructPimpConfig, defaultConfigGenerator } from '../schema/config';

const configStorageKey              = 'pmp-ui-pimp-configs';

@Injectable()
export class ConfigStorageService {
  constructor(private localStorage: LocalStorageService) {
    this.init();
  }

  private init(): void {
    // apply LS config if it exists otherwise build a default one
    if (this.LSConfig === null) {
      // set default config in local storage
      this.LSConfig = defaultConfigGenerator();
    }
  };

  public savePimpConfig (config: PimpConfig): void {
    this.LSConfig = config;
  }

  // public getPimpConfigList(): boolean {
  //   return false;
  // }

  // public selectPimpConfig(): boolean {
  //   return false;
  // }

  public restorePimpConfig(): PimpConfig {
    return this.LSConfig;
  }

  // getter & setter for local storage
  private get LSConfig (): PimpConfig {
    let pimpParams = this.localStorage.getObject(configStorageKey);
    if (pimpParams === null) { return null; };
    return new (<any>PimpConfig)(...pimpParams);
  };
  private set LSConfig (data: PimpConfig) {
    let pimpParams = deconstructPimpConfig(data);
    this.localStorage.setObject(configStorageKey, pimpParams);
  };
}
