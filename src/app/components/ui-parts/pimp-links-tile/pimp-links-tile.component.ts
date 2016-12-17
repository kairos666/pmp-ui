import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router }   from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { copyToClipboard } from '../../../utils/utils-functions';

@Component({
  selector: 'app-pimp-links-tile',
  template: `
    <h3>
      <button type="button" class="btn-edit" (click)="onClickEdit()"><md-icon>mode_edit</md-icon></button>
      <span>Pimp links</span>
    </h3>
    <ul *ngIf="links.length !== 0" class="pimp-links-tile-container link-list">
      <template ngFor let-link [ngForOf]="links">
        <li *ngIf="link.type === 'link'">
          <a [href]="sanitize(link.href)" title="open tab at {{link.href}}" target="_blank">
              <md-icon>{{link.icon}}</md-icon>
              <h4>{{link.title}}</h4>
              <p>{{link.href}}</p>
          </a>
        </li>
        <li *ngIf="link.type === 'copy'">
          <button (click)="onClipboardCopy($event)" title="copy {{link.href}} to clipboard">
              <md-icon>{{link.icon}}</md-icon>
              <h4>{{link.title}}<md-icon>{{link.subIcon}}</md-icon></h4>
              <p class="copy-me">{{link.href}}</p>
          </button>
        </li>
      </template>
    </ul>
    <ul class="no-data item-list" *ngIf="links.length === 0">
      <li>
        <md-icon>not_interested</md-icon>
        <h4>No data</h4>
        <p>Only available when pimp engine is started</p>
      </li>
    </ul>
  `
})
export class PimpLinksTileComponent implements OnInit, OnDestroy {
  @Input() linksStream:Observable<any>;
  private subs:Subscription;
  private links = [];

  constructor(private sanitizer:DomSanitizer, private router:Router) { }

  private sanitize(url:string) {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  private onClickEdit() {
    this.router.navigate(['/configuration']);
  }

  private onClipboardCopy(evt) {
    copyToClipboard(evt);
  }

  ngOnInit() {
    this.subs = this.linksStream.subscribe(links => {
      if(JSON.stringify(links) !== JSON.stringify({})) {
        this.links = [
          { type:'link', href: links.originURL, title: 'Origin URL', icon: 'link' },
          { type:'link', href: links.proxiedURL, title: 'Pimped URL', icon: 'link' },
          { type:'link', href: links.bsUIURL, title: 'BrowserSync interface', icon: 'developer_board' },
          { type:'copy', href: links.pimpSrcFilesPath, title: 'Pimp source files', icon: 'folder_open', subIcon:'content_paste' }
        ];
      } else {
        this.links = [];
      }
    });
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
