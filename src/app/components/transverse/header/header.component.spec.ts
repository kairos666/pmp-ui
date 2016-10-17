/* tslint:disable:no-unused-variable */
import { Component, DebugElement  } from '@angular/core';
import { TestBed, ComponentFixture, async } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MaterialModule } from '@angular/material';
import { HeaderComponent } from './header.component';
import { deepEqual } from '../../../../../e2e/helpers/utils';
import { ConfigActions } from '../../../schema/config';
import { Observable, BehaviorSubject } from 'rxjs';

@Component({
 selector  : 'app-test-cmp',
 template  : `<app-header [statusStream]="statusStream"
                          [connectionStream]="connectionStream"
                          [availableActionsStream]="availableActionStream" 
                          (onMenuCall)="onMenu($event)"
                          (onStartClick)="onStart($event)"
                          (onStopClick)="onStop($event)">
             </app-header>`
})
class TestCmpWrapperComponent { 
    private statusStream;
    private connectionStream;
    private availableActionStream;
    public statusSubject = new BehaviorSubject('stopped');
    public connectionSubject = new BehaviorSubject(false);
    public actionsSubject = new BehaviorSubject(new ConfigActions(false, false, false));

    constructor() {
      this.statusStream = this.statusSubject.asObservable().filter(x => { return this.connectionSubject.value; });
      this.availableActionStream = this.actionsSubject.asObservable();
      this.connectionStream = this.connectionSubject.asObservable();

      // handle disconnected
      this.connectionStream.subscribe(isConnected => {
        if (!isConnected) {
          this.actionsSubject.next(new ConfigActions(false, false, false));
        }
      });
    }

    private onMenu():void {
      console.log('menu Open clicked');
    }
    private onStartClick():void {
      console.log('start btn clicked');
    }
    private onStopClick():void {
      console.log('stop btn clicked');
    }
}

describe('Component: Header', () => {
  let fixture:ComponentFixture<TestCmpWrapperComponent>;
  let component:TestCmpWrapperComponent;
  let cmpntDOM:DebugElement;

  beforeEach( async(() => {
    TestBed.configureTestingModule({
      declarations: [ TestCmpWrapperComponent, HeaderComponent ],
      imports: [
        MaterialModule.forRoot()
      ]
    })
    .compileComponents(); // compile template and css

    fixture = TestBed.createComponent(TestCmpWrapperComponent);
    component = fixture.componentInstance;
    cmpntDOM = fixture.debugElement;
  }));

  it('should be disconnected (have disconnected class and no start/stop buttons)', async(() => {
    fixture.detectChanges(); // allow to apply input entries

    // disconnected class
    let elEngineIndicator = cmpntDOM.query(By.css('.engine-indicator')).nativeElement;
    expect(elEngineIndicator.classList).toContain('disconnected', 'do not have disconnected class');

    // engine buttons
    let engineBtns = cmpntDOM.queryAll(By.css('.btn-engine'));
    expect(engineBtns.length).toEqual(0, 'shouldn\'t have start/stop buttons');
  }));

  it('should match engine status changes on process-status indicator (started | pending | stopped)', async(() => {
    fixture.detectChanges(); // allow to apply input entries

    let elProcStat = cmpntDOM.query(By.css('.process-status')).nativeElement;
    // when still disconnected it shouldn't work
    expect(elProcStat.classList).not.toContain('stopped', 'has received status class update before connection');

    // stopped class (initial)
    component.connectionSubject.next(true);
    component.statusSubject.next('stopped');
    fixture.detectChanges();
    expect(elProcStat.classList).toContain('stopped', 'do not have stopped class');

    // pending class
    component.statusSubject.next('pending');
    fixture.detectChanges();
    expect(elProcStat.classList).toContain('pending', 'do not have pending class');

    // started class
    component.statusSubject.next('started');
    fixture.detectChanges();
    expect(elProcStat.classList).toContain('started', 'do not have started class');
  }));

  it('should match available actions changes on engine indicator (start | stop | none)', async(() => {
    component.connectionSubject.next(true);
    fixture.detectChanges(); // allow to apply input entries

    let engineBtns = () => { return cmpntDOM.queryAll(By.css('.btn-engine')); };
    let engineStartBtn = () => { return cmpntDOM.query(By.css('.btn-engine.start')); };
    let engineStopBtn = () => { return cmpntDOM.query(By.css('.btn-engine.stop')); };

    // no actions allowed
    expect(engineBtns().length).toEqual(0, 'shouldn\'t have start/stop buttons');

    // start is allowed
    component.actionsSubject.next(new ConfigActions(true, false, false));
    fixture.detectChanges();
    expect(engineBtns().length).toEqual(1);
    expect(engineStartBtn()).toBeDefined();
    expect(engineStopBtn()).toBeNull();

    // stop is allowed
    component.actionsSubject.next(new ConfigActions(false, true, false));
    fixture.detectChanges();
    expect(engineBtns().length).toEqual(1);
    expect(engineStartBtn()).toBeNull();
    expect(engineStopBtn()).toBeDefined();
  }));
});
