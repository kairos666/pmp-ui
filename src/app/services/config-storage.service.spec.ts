/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { LocalStorageService } from './local-storage.service';
import { ConfigStorageService } from './config-storage.service';
import { PimpRule, PimpConfig, deconstructPimpConfig, defaultConfigGenerator } from '../schema/config';
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
    let expected = service.restorePimpConfig();
    let baselineConfig = defaultConfigGenerator();
    // make sure ID match (UUID is regenrated each time)
    baselineConfig.id = expected.id;
    expect(deepEqual(expected, baselineConfig)).toBeTruthy();
  }));

  it('should save new configs', inject([ConfigStorageService], (service: ConfigStorageService) => {
    // save new config
    let newConfig = new PimpConfig('new config', 'google.com', true, 3002, new PimpRule('*/miam/*', ['console.log("pouet");']));
    service.savePimpConfig(newConfig);
    let expected = service.restorePimpConfig();
    let baselineConfig = defaultConfigGenerator();
    // make sure ID match (UUID is regenrated each time)
    baselineConfig.id = expected.id;
    // strip away uuid
    delete expected['id'];
    expect(deepEqual(expected, baselineConfig)).toBeFalsy();
  }));

  it('should retrieve last saved config (from previous test)', inject([ConfigStorageService], (service: ConfigStorageService) => {
    let expected: any = Object.assign({}, service.restorePimpConfig());
    expect(expected.name).toEqual('new config');
  }));

  it('deconstructPimpConfig function should provide parameters to be build a clone PimpConfig', () => {
    let originalPimpConfig = new PimpConfig('mock', 'mock.com', false, 2666, new PimpRule('mock pattern', ['mock modifs']));
    let deconstructedParameters = deconstructPimpConfig(originalPimpConfig);
    let clonedPimpConfig = new (<any>PimpConfig)(...deconstructedParameters);
    expect(deepEqual(originalPimpConfig, clonedPimpConfig)).toBeTruthy();
  });

  it('should deeply match from PimpConfig to local storage and back to PimpConfig (with deconstruct)', () => {
    let originalPimpConfig = new PimpConfig('mock', 'mock.com', false, 2666, new PimpRule('mock pattern', ['mock modifs']));
    let beforeFeconstructedParameters = deconstructPimpConfig(originalPimpConfig);

    //send to local storage
    localStorage['LS-test'] = JSON.stringify(beforeFeconstructedParameters);

    //retrieve from local storage
    let afterFeconstructedParameters = JSON.parse(localStorage['LS-test']);

    let clonedPimpConfig = new (<any>PimpConfig)(...afterFeconstructedParameters);
    expect(deepEqual(originalPimpConfig, clonedPimpConfig)).toBeTruthy();
  });
});
