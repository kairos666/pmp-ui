import { UUID } from 'angular2-uuid';

/* CONFIG CLASSES */
export class PimpConfig {
  public name:string;
  public id:string;
  public bsOptions:BrowserSyncOptions;
  public pimpCmds:PimpRule[];

  constructor (
    name: string,
    targetURL: string,
    keepCookies: boolean,
    port: number,
    rules: PimpRule | PimpRule[]
  ) {
    this.name       = name;
    this.id         = UUID.UUID();
    this.bsOptions  = new BrowserSyncOptions(targetURL, keepCookies, port);
    this.pimpCmds   = (Array.isArray(rules)) ? rules : [rules];
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

export class PimpRule {
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
