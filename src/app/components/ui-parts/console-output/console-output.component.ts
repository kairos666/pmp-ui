/* tslint:disable:no-unused-variable */
import { Component, Input, Output, OnInit, OnDestroy, EventEmitter, HostListener, ElementRef } from '@angular/core';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';

@Component({
  selector: 'app-console-output',
  template: '<pre *ngFor="let log of logs | async">{{log}}</pre>',
  styleUrls: ['./console-output.component.scss']
})
export class ConsoleOutputComponent implements OnInit, OnDestroy {
  @Input()  logs:Observable<string>;
  @Output() autoscroll = new EventEmitter();
  private scrollStream = new BehaviorSubject(new ScrollState(true, 0 ));
  private sub:Subscription;

  constructor(private element:ElementRef) {}

  ngOnInit() {
    this.autoscroll.emit(this.scrollStream.value.autoScroll);

    // handle auto scroll behavior (delay is necessary to synchronize better with log display in view)
    let currentScrollState = this.scrollStream.value;
    this.sub = this.logs
      .filter(() => { return this.scrollStream.value.autoScroll; })
      .delay(1)
      .do(() => { this.scrollStream.next(new ScrollState(currentScrollState.autoScroll, currentScrollState.scroll, true)); })
      .subscribe(() => {
        this.element.nativeElement.scrollTop = this.element.nativeElement.scrollHeight;
      });
  }

  public goToBottom():void {
    let currentScrollState = this.scrollStream.value;
    let newScrollState = new ScrollState(true, currentScrollState.scroll, currentScrollState.skipNext);
    this.scrollStream.next(newScrollState);
    this.autoscroll.emit(this.scrollStream.value.autoScroll);
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  @HostListener('scroll', ['$event'])
  private scrollSpy(event) {
    // autoscroll/manual scroll event handling
    let currentScrollState = this.scrollStream.value;
    let newAutoScrollValue:boolean;
    if (!currentScrollState.skipNext) {
      // manual scroll detected --> stop autoscroll
      newAutoScrollValue = false;
      this.autoscroll.emit(newAutoScrollValue);
    } else {
      // autoscroll detected --> keep autoscroll in same state as before
      newAutoScrollValue = currentScrollState.autoScroll;
    }
    let newScrollState = new ScrollState(newAutoScrollValue, event.target.scrollTop);
    this.scrollStream.next(newScrollState);
  }
}

class ScrollState {
  public autoScroll:boolean;
  public scroll:number;
  public skipNext:boolean;
  
  constructor(autoScroll:boolean, scroll:number, skipNext?:boolean) {
    this.autoScroll = autoScroll;
    this.scroll = scroll;
    this.skipNext = (skipNext !== undefined) ? skipNext : false;
  }
}
