import { Component, EventEmitter, Output, Input, OnInit, OnDestroy } from '@angular/core';
import { ConfigActions } from '../../../schema/config';
import { Observable, Subject } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy  {
  private engineStatus:string;
  private isConnected:boolean;
  private isStartAllowed = true;
  private isStopAllowed = true;
  private killSubs = new Subject();
  @Input() statusStream: Observable<string>;
  @Input() connectionStream: Observable<boolean>;
  @Input() availableActionsStream: Observable<ConfigActions>;
  @Output() onMenuCall = new EventEmitter();
  @Output() onStartClick = new EventEmitter();
  @Output() onStopClick = new EventEmitter();

  constructor() {}

  ngOnInit():void {
    // handle available actions changes
    this.availableActionsStream.takeUntil(this.killSubs).subscribe(aActions => {
      this.isStartAllowed = aActions.startAllowed;
      this.isStopAllowed = aActions.stopAllowed;
    });

    // handle engine status changes
    this.statusStream.takeUntil(this.killSubs).subscribe(status => {
      this.engineStatus = status;
    });

    // handle connection status changes
    this.connectionStream.takeUntil(this.killSubs).subscribe(isConnected => {
      this.isConnected = isConnected;
    });
  }

  ngOnDestroy():void {
    this.killSubs.next(true);
  }
}
