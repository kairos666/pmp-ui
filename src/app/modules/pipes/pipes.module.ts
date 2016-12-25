import { NgModule } from '@angular/core';

import { MarkdownToHtmlModule } from 'markdown-to-html-pipe';

@NgModule({
  imports: [ MarkdownToHtmlModule ],
  exports: [ MarkdownToHtmlModule ]
})
export class PipesModule { }
