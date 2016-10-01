import { PmpUiPage } from './app.po';

describe('pmp-ui App', function() {
  let page: PmpUiPage;

  beforeEach(() => {
    page = new PmpUiPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
