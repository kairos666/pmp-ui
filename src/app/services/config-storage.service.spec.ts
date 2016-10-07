/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { LocalStorageService } from './local-storage.service';
import { ConfigStorageService } from './config-storage.service';
import { PimpRule, PimpConfig } from '../schema/config';
import { defaultConfig } from '../../../e2e/mocks/default-config';
import { deepEqual } from '../../../e2e/helpers/utils';

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
    let expected: any = Object.assign({}, service.restorePimpConfig());
    let baseline: any = Object.assign({}, defaultConfig);
    // strip away uuid
    delete expected['id'];
    expect(deepEqual(expected, baseline)).toBeTruthy();
  }));

  it('should save new configs', inject([ConfigStorageService], (service: ConfigStorageService) => {
    // save new config
    let newConfig = new PimpConfig('new config', 'google.com', true, 3002, new PimpRule('*/miam/*', ['console.log("pouet");']));
    service.savePimpConfig(newConfig);
    let expected: any = Object.assign({}, service.restorePimpConfig());
    let baseline: any = Object.assign({}, defaultConfig);
    // strip away uuid
    delete expected['id'];
    expect(deepEqual(expected, baseline)).toBeFalsy();
  }));

  it('should retrieve last saved config (from previous test)', inject([ConfigStorageService], (service: ConfigStorageService) => {
    let expected: any = Object.assign({}, service.restorePimpConfig());
    expect(expected.name).toEqual('new config');
  }));
});
