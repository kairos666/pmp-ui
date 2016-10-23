import { Component, Input, Output, OnInit, OnDestroy, EventEmitter } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Component({
  selector: 'app-engine-indicator-tile',
  templateUrl: './engine-indicator-tile.component.html',
  styleUrls: ['./engine-indicator-tile.component.scss']
})
export class EngineIndicatorTileComponent implements OnInit, OnDestroy {
  @Input() status:Observable<string>;
  @Input() connection:Observable<boolean>;
  @Input() availableActions:Observable<any>;
  @Output() startClicked = new EventEmitter();
  @Output() stopClicked = new EventEmitter();
  private engineStatus:string;
  private isConnected:boolean;
  private isStartAllowed:boolean;
  private isStopAllowed:boolean;
  private killSubs = new Subject();

  constructor() { }

  ngOnInit() {
    // connection subscription
    this.connection.takeUntil(this.killSubs).subscribe(isConnected => { this.isConnected = isConnected; });

    // status subscription
    this.status.takeUntil(this.killSubs).subscribe(status => { this.engineStatus = status; });

    // available actions subscription
    this.availableActions.takeUntil(this.killSubs).subscribe(aActions => { 
      this.isStartAllowed = aActions.startAllowed;
      this.isStopAllowed = aActions.stopAllowed;  
    });
  }

  ngOnDestroy() {
    this.killSubs.next(true);
  }
}
