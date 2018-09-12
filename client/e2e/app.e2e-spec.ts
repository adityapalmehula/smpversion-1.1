import { SmartPathshalaPage } from './app.po';

describe('smart-pathshala App', () => {
  let page: SmartPathshalaPage;

  beforeEach(() => {
    page = new SmartPathshalaPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!!');
  });
});
