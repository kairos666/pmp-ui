import { Injectable } from '@angular/core';
import { LocalStorageService } from './local-storage.service';
import { UUID } from 'angular2-uuid';

const configStorageKey              = 'pmp-ui-pimp-configs';

@Injectable()
export class ConfigStorageService {
  private selectedConfig: PimpConfig = undefined;

  constructor(private localStorage: LocalStorageService) {
    this.init();
  }

  private init(): void {
    // apply LS config if it exists otherwise build a default one
    this.selectedConfig = this.LSConfig;
    if (this.selectedConfig === null) {
      // need default config setting
      this.selectedConfig = this.generateDefaultConfig();
      this.LSConfig = this.selectedConfig;
    }
  };

  public savePimpConfig(
    name: string,
    targetURL: string,
    keepCookies: boolean,
    port: number,
    rules: PimpRule | PimpRule[]
  ): void {
    this.selectedConfig = new PimpConfig(name, targetURL, keepCookies, port, rules);
    this.LSConfig = this.selectedConfig;
  }

  public restorePimpConfig(): PimpConfig {
    this.selectedConfig = this.LSConfig;
    return this.selectedConfig;
  }

  // public getPimpConfigList(): boolean {
  //   return false;
  // }

  // public selectPimpConfig(): boolean {
  //   return false;
  // }

  public get pimpConfig(): PimpConfig {
    if (this.selectedConfig) { return this.selectedConfig; };
    return false;
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

/* CONFIG CLASSES */
class PimpConfig {
  constructor (
    name: string,
    targetURL: string,
    keepCookies: boolean,
    port: number,
    rules: PimpRule | PimpRule[]
  ) {
    return {
      name: name,
      id: UUID.UUID(),
      bsOptions: new BrowserSyncOptions(targetURL, keepCookies, port),
      pimpCmds: (Array.isArray(rules)) ? rules : [rules]
    };
  }
};

class BrowserSyncOptions {
  constructor (
    targetURL: string,
    keepCookies: boolean,
    port: number
  ) {
    return {
      proxy: {
        target: targetURL,
        cookies: {
          stripeDomain: ((keepCookies) ? false : true)
        }
      },
      port: port,
      serveStatic: ['./dist'],
      middleware: [],
      rewriteRules: []
    };
  }
}

class PimpRule {
  constructor (
    urlPattern: string,
    modifs: string[]
  ) {
    return {
      url: urlPattern,
      modifs: modifs
    };
  }
}
