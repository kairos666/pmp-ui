import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router }   from '@angular/router';
import { Observable, Subscription } from 'rxjs';

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
    <p *ngIf="links.length === 0" class="no-data"><md-icon>not_interested</md-icon> Data available only when pimp engine is started</p>
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
    let successCopyingToClipboard;
    try {
      // create selection range
      let rangeObj = document.createRange();
      rangeObj.selectNodeContents(evt.currentTarget.querySelector('.copy-me'));

      // copy to clipboard
      let selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(rangeObj);
      successCopyingToClipboard = document.execCommand('copy');

      // remove selection
      selection.removeAllRanges();
      selection.empty();

    } catch (err) {
      console.log('unable to copy to clipboard', err);
      successCopyingToClipboard = false;
    }
    console.log(successCopyingToClipboard);
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
