/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { LocalStorageService } from './local-storage.service';
import { PimpRule, ConfigStorageService } from './config-storage.service';
import * as _ from 'lodash'; 

const defaultConfig = {
    name: 'default',
    bsOptions: {
        proxy: {
            target: 'http://www.syntaxsuccess.com/viewarticle/socket.io-with-rxjs-in-angular-2.0',
            cookies: { stripeDomain: false }
        },
        port: 3000,
        serveStatic: ['./dist'],
        middleware: [],
        rewriteRules: []
    },
    pimpCmds: [
        {
            url: '*/viewarticle*',
            modifs: [`
          $('head').append('<link rel="stylesheet" type="text/css" href="/css/main.min.css">');
          $('body').append('<script type="text/javascript" src="/js/main.min.js"></script>');
          $('body').addClass('sample-modifier-rules');
          $('.container').html('<p>replaced text</p>');
      `]
        },
        {
            url: '*/sample-url2*',
            modifs: [`
          $('head').append('<link rel="stylesheet" type="text/css" href="/css/main.min.css">');
          $('body').append('<script type="text/javascript" src="/js/main.min.js"></script>');
          $('body').addClass('sample-modifier-rules2');
      `]
        }
    ]
};

let deepEqual = (obj1, obj2): boolean => {
  return _.isEqual(obj1, obj2);
};

describe('Service: ConfigStorage', () => {
  beforeAll(() => {
    localStorage.clear();
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LocalStorageService, ConfigStorageService]
    });
  });

  it('should have a default config available when no previous config can be found (empty local storage)', inject([ConfigStorageService], (service: ConfigStorageService) => {
    let expected: any = Object.assign({}, service.pimpConfig);
    let baseline: any = Object.assign({}, defaultConfig);
    // strip away uuid
    delete expected['id'];
    expect(deepEqual(expected, baseline)).toBeTruthy();
  }));

  it('should save new configs', inject([ConfigStorageService], (service: ConfigStorageService) => {
    // save new config
    service.savePimpConfig('new config', 'google.com', true, 3002, new PimpRule('*/miam/*', ['console.log("pouet");']));
    let expected: any = Object.assign({}, service.pimpConfig);
    let baseline: any = Object.assign({}, defaultConfig);
    // strip away uuid
    delete expected['id'];
    expect(deepEqual(expected, baseline)).toBeFalsy();
  }));

  it('should retrieve last saved config (from previous test)', inject([ConfigStorageService], (service: ConfigStorageService) => {
    let expected: any = Object.assign({}, service.pimpConfig);
    expect(expected.name).toEqual('new config');
  }));
});
