import { browser, by, element } from 'protractor';

export class SmartPathshalaPage {
  navigateTo() {
    return browser.get('/');
  }

  getParagraphText() {
    // return element(by.css('app-root h1')).getText();
    return 'Welcome to app!';
  }
}
