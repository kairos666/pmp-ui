/* tslint:disable:no-unused-variable */

import { TestBed } from '@angular/core/testing';
import { Observable } from 'rxjs';
import { LogsService } from './logs-model.service';
import { PmpEngineConnectorService } from '../services/pmp-engine-connector.service';
import { deepEqual } from '../../../e2e/helpers/utils';

// mock
import { MockPmpEngineConnectorService } from '../../../e2e/mocks/mock-pmp-engine-connector.serviceA';

describe('Service: LogsModel', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: PmpEngineConnectorService, useClass: MockPmpEngineConnectorService}, 
        LogsService
      ]
    });
  });

  it('should register logs with a threshold of 100 elements', done => { 
    let mockService:MockPmpEngineConnectorService = TestBed.get(PmpEngineConnectorService);
    let service:LogsService = TestBed.get(LogsService);
    
    Observable.interval(15).take(120).map(i => 'mock log ' + i).subscribe(log => {
            mockService.testTriggerpmpEngineEvts('log', log);
        },
        undefined,
        () => {
            expect(service.allLogs.length).toEqual(100); 
            done(); 
        }
    );
  });
  it('should register errors with a threshold of 100 elements', done => { 
    let mockService:MockPmpEngineConnectorService = TestBed.get(PmpEngineConnectorService);
    let service:LogsService = TestBed.get(LogsService);
    
    Observable.interval(15).take(120).map(i => 'mock error ' + i).subscribe(err => {
            mockService.testTriggerpmpEngineEvts('error', err);
        },
        undefined,
        () => {
            expect(service.allLogs.length).toEqual(100); 
            done(); 
        }
    );
  });
  it('should register a mix of logs & errors with a threshold of 100 elements', done => { 
    let mockService:MockPmpEngineConnectorService = TestBed.get(PmpEngineConnectorService);
    let service:LogsService = TestBed.get(LogsService);
    
    Observable.interval(15).take(120).map(i => {
            if (i % 2 === 0) {
                return { subType:'log', payload:'mock log ' + i };
            } else {
                return { subType:'error', payload:'mock error ' + i };
            }
        }).subscribe(msg => {
            mockService.testTriggerpmpEngineEvts(msg.subType, msg.payload);
        },
        undefined,
        () => {
            expect(service.allLogs.length).toEqual(100); 
            done(); 
        }
    );
  });
  it('should output a stream of all logs at each changes with a threshold of 100 elements', done => {
    let mockService:MockPmpEngineConnectorService = TestBed.get(PmpEngineConnectorService);
    let service:LogsService = TestBed.get(LogsService);
    
    let iterationCount = 120;
    let outputCount = -1; // account for initial output
    service.logsStream.subscribe(() => { 
        outputCount++;
    });

    Observable.interval(15).take(iterationCount).map(i => 'mock log ' + i).subscribe(
        log => { mockService.testTriggerpmpEngineEvts('log', log); },
        undefined,
        () => { 
            expect(outputCount).toEqual(iterationCount);
            expect(service.allLogs.length).toEqual(100);
            done();
        }
    );
  });
  it('should allow clearing logs accordingly to its state', () => {
      let mockService:MockPmpEngineConnectorService = TestBed.get(PmpEngineConnectorService);
      let service:LogsService = TestBed.get(LogsService);

      let isClearable:boolean;
      service.isClearable.subscribe(clearability => {
          isClearable = clearability;
      });
      // currently no logs
      expect(isClearable).toBeFalsy();

      // apply some logs registering
      Observable.range(1, 5).map(i => 'mock log ' + i).subscribe(
        log => { mockService.testTriggerpmpEngineEvts('log', log); }
      );
      expect(isClearable).toBeTruthy();

      // clear all logs and check
      service.clear();
      expect(isClearable).toBeFalsy();
  });
});
