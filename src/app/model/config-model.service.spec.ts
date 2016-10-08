/* tslint:disable:no-unused-variable */

import { TestBed, inject } from '@angular/core/testing';
import { ConfigModelService } from './config-model.service';
import { ConfigStorageService } from '../services/config-storage.service';
import { PmpEngineConnectorService } from '../services/pmp-engine-connector.service';
import { LocalStorageService } from '../services/local-storage.service';
import { defaultConfig } from '../../../e2e/mocks/default-config';
import { deepEqual } from '../../../e2e/helpers/utils';
import { PimpConfig, PimpRule } from '../schema/config';

// mock couple
import { SocketConnectorService } from '../services/socket-connector.service';
import { MockSocketConnectorServiceA } from '../../../e2e/mocks/mock-socket-connectorA.service';
import { MockSocketConnectorServiceB } from '../../../e2e/mocks/mock-socket-connectorB.service';

describe('Service: ConfigModel INIT', () => {
  beforeAll(() => {
    localStorage.clear();
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        LocalStorageService, 
        { provide: SocketConnectorService, useClass: MockSocketConnectorServiceA}, 
        ConfigStorageService, 
        PmpEngineConnectorService, 
        ConfigModelService
      ]
    });


  });

  it('should provide a PimpConfig shortly after instanciation', done => { 
    let service: ConfigModelService = TestBed.get(ConfigModelService);
    // first item --> init result
    service.configStream.first().subscribe(config => {
      let actualConfig = config;
      let baselineConfig = defaultConfig;
      // strip away uuid
      delete actualConfig['id'];
      expect(deepEqual(actualConfig, baselineConfig)).toBeTruthy();
      done();
    });
  }, 6000);
});

describe('Service: ConfigModel COMMANDS', () => {
  beforeAll(() => {
    localStorage.clear();
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        LocalStorageService, 
        { provide: SocketConnectorService, useClass: MockSocketConnectorServiceB}, 
        ConfigStorageService, 
        PmpEngineConnectorService, 
        ConfigModelService
      ]
    });


  });

  it('should provide a PimpConfig shortly after CONFIG-COMMAND', done => { 
    let storage: ConfigStorageService = TestBed.get(ConfigStorageService);
    let connector: PmpEngineConnectorService = TestBed.get(PmpEngineConnectorService);
    let service: ConfigModelService = new ConfigModelService(storage, connector);
    // second item --> cmd call result (init first one is done before)
    service.configStream.first().subscribe(config => {
      let actualConfig = config;
      let baselineConfig = defaultConfig;
      // strip away uuid
      delete actualConfig['id'];
      // !!! mock service always returns defaultConfig
      expect(deepEqual(actualConfig, baselineConfig)).toBeTruthy();
      done();
    });

    // fire COMMAND
    setTimeout(() => { connector.startPmpEngine(new PimpConfig('mock', 'mock.com', false, 2666, new PimpRule('mock pattern', ['mock modifs']))); }, 600);
    setTimeout(() => { connector.getPmpEngineConfig(); }, 1200);
  }, 6000);
});
