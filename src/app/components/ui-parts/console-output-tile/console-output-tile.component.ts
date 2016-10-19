import { Component, Input, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-console-output-tile',
  templateUrl: './console-output-tile.component.html',
  styleUrls: ['./console-output-tile.component.scss']
})
export class ConsoleOutputTileComponent {
  @Input() logs:Observable<string>;
  private sub:Subscription;

  constructor(private element:ElementRef) {}

  ngOnInit() {
    // handle auto scroll behavior (delay is necessary to synchronize better with log display in view)
    this.sub = this.logs
      .delay(0)
      .subscribe(() => {
        this.element.nativeElement.children[1].scrollTop = this.element.nativeElement.children[1].scrollHeight;
      });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
