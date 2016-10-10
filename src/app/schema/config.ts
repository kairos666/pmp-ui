import { UUID } from 'angular2-uuid';

/* CONFIG CLASSES */
export class PimpConfig {
  public name:string;
  public id:string;
  public bsOptions:any;
  public pimpCmds:any;

  constructor (
    name: string,
    targetURL: string,
    keepCookies: boolean,
    port: number,
    rules: PimpRule | PimpRule[],
    manuallySetId?:string
  ) {
    this.name       = name;
    this.id         = (!manuallySetId) ? UUID.UUID() : manuallySetId;
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

export function deconstructPimpConfig(original:PimpConfig):any[] {
  let bsOptions            = original.bsOptions;
  let pimpCmds             = original.pimpCmds;

  let name                 = original.name;
  let targetURL            = bsOptions.proxy.target;
  let keepCookies          = !(bsOptions.proxy.cookies.stripeDomain);
  let port                 = bsOptions.port;
  let PimpRules            = pimpCmds;
  let id                   = original.id;

  return [name, targetURL, keepCookies, port, PimpRules, id];
}

export class ConfigActions {
  public startAllowed:boolean;
  public stopAllowed:boolean;
  public saveAllowed:boolean;
  public restoreAllowed:boolean;
  public restartAllowed:boolean;

  constructor(
    startAllowed:boolean,
    stopAllowed:boolean,
    saveOrRestoreAllowed:boolean
  ) {
    this.startAllowed = startAllowed;
    this.stopAllowed = this.restartAllowed = stopAllowed;
    this.saveAllowed = this.restoreAllowed = saveOrRestoreAllowed;
  }
}

export function defaultConfigGenerator():PimpConfig {
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

export class Notif {
  public type:string;
  public subType:string;
  public payload:string|boolean;

  constructor (type:string, subType:string, payload:string|boolean) {
    this.type = type;
    this.subType = subType;
    this.payload = payload;
  }
}
