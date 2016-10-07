import { Injectable } from '@angular/core';
import { LocalStorageService } from './local-storage.service';
import { PimpConfig, PimpRule } from '../schema/config';

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
      this.LSConfig = this.generateDefaultConfig();
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
    return this.localStorage.getObject(configStorageKey);
  };
  private set LSConfig (data: PimpConfig) {
    this.localStorage.setObject(configStorageKey, data);
  };

  private generateDefaultConfig(): PimpConfig {
    let defaultName                 = 'default';
    let defaultTargetURL            = 'http://www.syntaxsuccess.com/viewarticle/socket.io-with-rxjs-in-angular-2.0';
    let defaultKeepCookies          = true;
    let defaultPort                 = 3000;
    let defaultPimpRuleA: PimpRule  = new PimpRule(
      '*/viewarticle*',
      [`
          $('head').append('<link rel="stylesheet" type="text/css" href="/css/main.min.css">');
          $('body').append('<script type="text/javascript" src="/js/main.min.js"></script>');
          $('body').addClass('sample-modifier-rules');
          $('.container').html('<p>replaced text</p>');
      `]
    );
    let defaultPimpRuleB: PimpRule  = new PimpRule(
      '*/sample-url2*',
      [`
          $('head').append('<link rel="stylesheet" type="text/css" href="/css/main.min.css">');
          $('body').append('<script type="text/javascript" src="/js/main.min.js"></script>');
          $('body').addClass('sample-modifier-rules2');
      `]
    );

    return new PimpConfig(defaultName, defaultTargetURL, defaultKeepCookies, defaultPort, [defaultPimpRuleA, defaultPimpRuleB]);
  }
}
