/* tslint:disable:no-unused-variable */

import { TestBed, inject } from '@angular/core/testing';
import { ConfigModelService } from './config-model.service';
import { ConfigStorageService } from '../services/config-storage.service';
import { PmpEngineConnectorService } from '../services/pmp-engine-connector.service';
import { LocalStorageService } from '../services/local-storage.service';
import { deepEqual } from '../../../e2e/helpers/utils';
import { PimpConfig, PimpRule, ConfigActions, defaultConfigGenerator } from '../schema/config';

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
      let baselineConfig = defaultConfigGenerator();
      // make sure ID match (UUID is regenrated each time)
      baselineConfig.id = actualConfig.id;
      expect(deepEqual(actualConfig, baselineConfig)).toBeTruthy();
      done();
    });
  }, 6000);
});

describe('Service: ConfigModel OUTPUTS', () => {
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

  it('should provide a PimpConfig from engine shortly after CONFIG-COMMAND is triggered', done => { 
    let testConfig = new PimpConfig('mock', 'mock.com', false, 2666, new PimpRule('mock pattern', ['mock modifs']));
    let baselineConfig = defaultConfigGenerator();
    let storage: ConfigStorageService = TestBed.get(ConfigStorageService);
    let connector: PmpEngineConnectorService = TestBed.get(PmpEngineConnectorService);
    let service: ConfigModelService = new ConfigModelService(storage, connector);

    // setup (start engine with custom config)
    setTimeout(() => { 
      // make sure that current app config is default
      let expectedConfig = service.config;
      // make sure ID match (UUID is regenrated each time)
      baselineConfig.id = expectedConfig.id;
      expect(deepEqual(expectedConfig, baselineConfig)).toBeTruthy('config is not default at this point');
      // start with default config
      expect(service.start()).toBeTruthy('couldn\'t start engine');
      // update config afterwards (because identical configs aren't outputed)
      expect(service.updateConfig(testConfig)).toBeTruthy('couldn\'t update config'); 
    }, 600);
    
    setTimeout(() => {
      // make sure that current app config has changed for mock after starting
      expect(deepEqual(service.config, baselineConfig)).toBeFalsy('config is not different from default at this point');

      // detect config coming from engine
      service.configStream.subscribe(config => {
        expect(deepEqual(config, baselineConfig)).toBeTruthy('config retrieved from engine is different');
        done();
      });
      // fire CONFIG COMMAND
      connector.getPmpEngineConfig(); 
    }, 1200);
  }, 6000);

  it('all actions are disallowed at start', done => {
    let expectedArray = [
      new ConfigActions(false, false, false)
    ];
    let cursor = 0;
    let service: ConfigModelService = TestBed.get(ConfigModelService);
    // get first allowed actions after init (before any update could be made)
    service.availableConfigActionsStream.first().subscribe(allowedActions => {
      expect(deepEqual(allowedActions, expectedArray[cursor])).toBeTruthy();
      cursor++;
      if (cursor === expectedArray.length) { done(); };
    });
  }, 6000);
  it('all actions are disallowed at start, then allow start (engine stopped)', done => {
    let expectedArray = [
      new ConfigActions(false, false, false),
      new ConfigActions(true, false, false)
    ];
    let cursor = 0;
    let service: ConfigModelService = TestBed.get(ConfigModelService);
    // get 2 first allowed actions after init (take after init state)
    service.availableConfigActionsStream.take(expectedArray.length).subscribe(allowedActions => {
      expect(deepEqual(allowedActions, expectedArray[cursor])).toBeTruthy();
      cursor++;
      if (cursor === expectedArray.length) { done(); };
    });
  }, 6000);

  it('all actions are disallowed at start, then allow start (engine stopped), then nothing (pending), then stop, restart (engine started)', done => {
    let expectedArray = [
      new ConfigActions(false, false, false),
      new ConfigActions(true, false, false),
      new ConfigActions(false, false, false),
      new ConfigActions(false, true, false)
    ];
    let cursor = 0;
    let storage: ConfigStorageService = TestBed.get(ConfigStorageService);
    let connector: PmpEngineConnectorService = TestBed.get(PmpEngineConnectorService);
    let service: ConfigModelService = new ConfigModelService(storage, connector);
    // get first allowed actions after init (before any update could be made)
    service.availableConfigActionsStream.first().subscribe(allowedActions => {
      expect(deepEqual(allowedActions, expectedArray[cursor])).toBeTruthy();
      cursor++;
      if (cursor === expectedArray.length) { done(); };
    });
    // capture actions available after each status changes
    connector.pmpEngineDataStatusStream.subscribe(status => {
      expect(deepEqual(service.availableConfigActions, expectedArray[cursor])).toBeTruthy();
      cursor++;
      if (cursor === expectedArray.length) { done(); };
    });
    setTimeout(() => { service.start(); }, 600);
  }, 6000);

  it('updating config results in allowing save/restore from localStorage', done => {
    let testConfig = new PimpConfig('mock', 'mock.com', false, 2666, new PimpRule('mock pattern', ['mock modifs']));
    let service: ConfigModelService = TestBed.get(ConfigModelService);
    
    // setup (start engine with default config)
    setTimeout(() => { 
      // start with default config
      expect(service.start()).toBeTruthy('couldn\'t start engine');

      // check if save/restore is still forbidden
      let beforeAActions = service.availableConfigActions;
      expect(beforeAActions.saveAllowed).toBeFalsy('should\'t be true BEFORE config update');
      expect(beforeAActions.restoreAllowed).toBeFalsy('should\'t be true BEFORE config update');

      // listen to changes (first change is for pending state, therefore only consider second update)
      service.availableConfigActionsStream.skip(1).first().subscribe(allowedActions => {
          expect(allowedActions.saveAllowed).toBeTruthy('should\'t be false AFTER config update');
          expect(allowedActions.restoreAllowed).toBeTruthy('should\'t be false AFTER config update');
        },
        undefined,
        done
      );

      // update config afterwards (because identical configs aren't outputed)
      expect(service.updateConfig(testConfig)).toBeTruthy('couldn\'t update config'); 
    }, 600);
  }, 6000);

  it('updating config and save to localStorage', done => {
    // setup test
    let testConfig = new PimpConfig('mock', 'mock.com', false, 2666, new PimpRule('mock pattern', ['mock modifs']));
    let service: ConfigModelService = TestBed.get(ConfigModelService);
    
    setTimeout(() => { 
        // check that current app config is default
        let previouslySavedConfig = service.config;
        let baselineConfig = defaultConfigGenerator();
        // make sure ID match (UUID is regenrated each time)
        baselineConfig.id = previouslySavedConfig.id;
        expect(deepEqual(previouslySavedConfig, baselineConfig)).toBeTruthy('is not default config');
        // update config
        service.updateConfig(testConfig);
        // get updatedConfig
        let newConfig = service.config;
        // check if config is new one
        expect(deepEqual(newConfig, testConfig)).toBeTruthy('updated config doesn\'t match expectations A');

        // test end setup (skip first one)
        service.availableConfigActionsStream.skip(1).subscribe(afterSaveAActions => {
          // check that current app config is still updatedConfig
          expect(deepEqual(newConfig, testConfig)).toBeTruthy('updated config doesn\'t match expectations B');
          // check that save/restore isn't possible anymore
          expect(afterSaveAActions.saveAllowed).toBeFalsy('shouldn\'t be true AFTER save action');
          expect(afterSaveAActions.restoreAllowed).toBeFalsy('shouldn\'t be true AFTER save action');
          done();
        });

        // fire SAVE COMMAND
        expect(service.save()).toBeTruthy('couldn\'t save');
      }, 600);
  });
  it('updating config and restore from localStorage', done => {
    // setup test
    let testConfig = new PimpConfig('mock', 'mock.com', false, 2666, new PimpRule('mock pattern', ['mock modifs']));
    let service: ConfigModelService = TestBed.get(ConfigModelService);

    setTimeout(() => { 
      // get previouslySavedConfig (default)
      let previouslySavedConfig = service.config;
      // update config
      service.updateConfig(testConfig);
      // check that current app config is different than previouslySavedConfig (default)
      let newConfig = service.config;
      expect(deepEqual(newConfig, testConfig)).toBeTruthy('updated config doesn\'t match expectations A');
      // test end setup (skip first one)
      service.availableConfigActionsStream.skip(1).subscribe(afterRestoreAActions => {
        // check that current app config is previouslySavedConfig (default)
        let restoredConfig = service.config;
        expect(deepEqual(restoredConfig, previouslySavedConfig)).toBeTruthy('updated config doesn\'t match expectations B');
        // check that save/restore isn't possible anymore
        expect(afterRestoreAActions.saveAllowed).toBeFalsy('shouldn\'t be true AFTER save action');
        expect(afterRestoreAActions.restoreAllowed).toBeFalsy('shouldn\'t be true AFTER save action');
        done();
      });

      // fire RESTORE COMMAND
      expect(service.restore()).toBeTruthy('couldn\'t restore');
    }, 600);
  });
});
