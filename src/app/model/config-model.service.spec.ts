/* tslint:disable:no-unused-variable */

import { TestBed, inject } from '@angular/core/testing';
import { ConfigModelService } from './config-model.service';
import { ConfigStorageService } from '../services/config-storage.service';
import { PmpEngineConnectorService } from '../services/pmp-engine-connector.service';
import { LocalStorageService } from '../services/local-storage.service';
import { defaultConfig } from '../../../e2e/mocks/default-config';
import { deepEqual } from '../../../e2e/helpers/utils';
import { PimpConfig } from '../schema/config';

// mock couple
import { SocketConnectorService } from '../services/socket-connector.service';
import { MockSocketConnectorService } from '../../../e2e/mocks/mock-socket-connectorA.service';

describe('Service: ConfigModel', () => {
  beforeAll(() => {
    localStorage.clear();
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        LocalStorageService, 
        { provide: SocketConnectorService, useClass: MockSocketConnectorService}, 
        ConfigStorageService, 
        PmpEngineConnectorService, 
        ConfigModelService
      ]
    });


  });

  it('should provide a PimpConfig shortly after instanciation', done => { 
    let service: ConfigModelService = TestBed.get(ConfigModelService);
    service.configStream.first().subscribe(config => {
      let actualConfig = config;
      let baselineConfig = defaultConfig;
      // strip away uuid
      delete actualConfig['id'];
      expect(deepEqual(actualConfig, baselineConfig)).toBeTruthy();
      done();
    });
  }, 4000);
});
