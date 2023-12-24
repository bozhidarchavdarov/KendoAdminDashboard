import {Download, expect, Locator, Page} from '@playwright/test';

export class BasePage {
    protected page: Page;
    private readonly loadingElement = '#spinnerMask';
    private readonly comboboxInput = ' .clr-combobox-input';

    constructor(page: Page) {
       this.page = page;
    }

    /**
    * Fetch the OS name via NodeJS
    */
    async getOperationSystemName(): Promise<string> {
        return process.platform;
    }

    // new comment
    /**
     * Get element locator
     * @param {string | Locator} element
     * @param elementOptions optional
     * @param {boolean = true} singleElement
     * @param {boolean = true} firstElement
     * @return {Locator}
     */
    getLocator(element: string | Locator, elementOptions?, singleElement: boolean = true, firstElement: boolean = true): Locator {
      let elementLocator: Locator;
      if (typeof element === "string") {
        elementLocator = this.page.locator(element);
        if (elementOptions) {
          elementLocator = this.page.locator(element, elementOptions);
        }
      } else {
        elementLocator = element;
      }
      if (singleElement) {
        if (firstElement) {
          return elementLocator.first();
        } else {
          return elementLocator.last();
        }
      } else {
        return elementLocator;
      }
    }

    /**
     * Is element visible
     * @param {string | Locator} element
     * @param elementOptions optional
     * @param {number} timeout
     * @return {Promise<boolean>}
     */
    async isElementVisible(element: string | Locator, elementOptions?, timeout?: number): Promise<boolean> {
      if (timeout) {
        try {
          await this.getLocator(element, elementOptions).waitFor({state: 'visible', timeout: timeout});
        } catch (e) {
          return false;
        }
        return true;
      } else {
        return this.getLocator(element, elementOptions).isVisible();
      }
    }

    /**
     * Wait element to be present on the page
     * @param {string | Locator} element
     * @param elementOptions optional
     * @param {number} timeout
     * @return {Promise<void>}
     */
    async waitForElementToBeAttached(element: string | Locator, elementOptions?, timeout: number = 6000): Promise<void> {
      await this.getLocator(element, elementOptions).waitFor({state: 'attached', timeout: timeout});
    }

    /**
    * Clear input field's value
    * @param {string} elementSelector
    */
    async clearInputField(elementSelector: string): Promise<void> {
        await this.page.locator(elementSelector).clear();
    }

    /**
     * Click on element
     * @param {string | Locator} element
     * @param elementOptions optional
     * @param clickOptions clickOptions optional
     * @param timeout optional
     * @return {Promise<void>}
     */
    async clickElement(element: string | Locator, elementOptions?, clickOptions?, timeout?): Promise<void> {
      const firstElementLocator = this.getLocator(element, elementOptions);
      const lastElementLocator = this.getLocator(element, elementOptions, true, false);
      await this.waitForElementToBeVisible(lastElementLocator, timeout);
      await firstElementLocator.click(clickOptions);
    }

    /**
     * Does element contain specific class
     * @param {string | Locator} element
     * @param {string} expectedClass
     * @param elementOptions optional
     */
    async hasClass(element: string | Locator, expectedClass: string, elementOptions?): Promise<boolean> {
      const classes = await this.getAttribute(this.getLocator(element, elementOptions), 'class');
      if (classes) {
        return classes.split(' ').indexOf(expectedClass) > -1;
      }
      return false;
    }

    /**
     * Populate text into an element
     * @param {string | Locator} element
     * @param {string | number} inputValue
     * @param {boolean} clearBeforeInput default value is true
     * @param {boolean} pressEnter default value is false
     * @param {boolean} pressCtrAndA default value is false
     * @param {number} delayTime
     * @param {boolean= false} isType
     * @return {Promise<void>}
     */
    async setInputField(element: string | Locator, inputValue: string | number, clearBeforeInput: boolean = true,
                        pressEnter: boolean = false, pressCtrAndA: boolean = false, delayTime: number = 0, isType: boolean = false): Promise<void> {
      const elementLocator: Locator = this.getLocator(element);
      await this.waitForElementToBeAttached(elementLocator);

      if (clearBeforeInput) {
        await elementLocator.fill('');
      }
      if (pressCtrAndA) {
        const osName = await this.getOperationSystemName();
        // "Darwin" is the default name for MacOS. Source: https://nodejs.org/api/process.html#process_process_platform
        if (osName === 'darwin') {
          await this.page.keyboard.press('Meta+A');
        } else {
          await elementLocator.press('Control+A');
        }
      }
      if (isType) {
        await elementLocator.type(inputValue.toString().trim(), {delay: delayTime});
      } else {
        if (await this.hasClass(elementLocator, 'angular-editor-textarea')) {
          await elementLocator.type(inputValue.toString().trim(), {delay: delayTime});
        } else {
          await elementLocator.fill(inputValue.toString().trim());
        }
      }

      if (pressEnter) {
        await elementLocator.press('Enter');
      }
    }

    /**
     * Get text of element
     * @param {string | Locator} element
     * @param {boolean = false} expectToBeVisible
     * @param elementOptions optional
     * @param {number} timeout optional
     * @return {Promise<string>}
     */
    async getTextOfElement(element: string | Locator, expectToBeVisible: boolean = false, elementOptions?, timeout?: number): Promise<string> {
      const elementLocator: Locator = this.getLocator(element, elementOptions, true, false);
      if (expectToBeVisible) {
        await this.waitForElementToBeVisible(element, elementOptions, timeout);
      } else {
        await this.hasAtLeastOneElement(elementLocator);
      }
      try {
        const rawText = await elementLocator.innerText();
        return rawText.trim();
      } catch (e) {
        return '';
      }
    }

    /**
     * Checks if given element matches at least one element on the page or not
     * @param {string | Locator} element the element
     * @param elementOptions options
     * @returns {Promise<boolean>} <b>true</b> if the provided element matches at least 1 element on the page,
     *    <b>false</b> otherwise;
     */
    async hasAtLeastOneElement(element: string | Locator, elementOptions?): Promise<boolean> {
      return ((await this.getLocator(element, elementOptions, false).count()) > 0);
    }

    /**
     * Wait element to be visible on the page
     * @param {string | Locator} element
     * @param elementOptions optional
     * @param {number} timeout
     * @return {Promise<void>}
     */
    async waitForElementToBeVisible(element: string | Locator, elementOptions?, timeout: number = 6000): Promise<void> {
      await this.getLocator(element, elementOptions).waitFor({state: 'visible', timeout: timeout});
    }

    /**
    * Get text from array of elements
    * @param {Locator} elementsLocator
    */
    async getTextOfElementsByLocator(elementsLocator: Locator): Promise<Array<string>> {
        try {
            const tempArray = await elementsLocator.allInnerTexts();
            return Array.from(tempArray, item => item.trim());
        } catch (e) {
            return [];
        }
    }

    /**
     * Is element enabled
     * @param {string | Locator} element
     * @param elementOptions optional
     * @param {number} timeout
     * @return {Promise<boolean>}
     */
    async isElementEnabled(element: string | Locator, elementOptions?, timeout: number = 0): Promise<boolean> {
      return this.getLocator(element, elementOptions).isEnabled({timeout: timeout});
    }

    /**
     * Is field disabled
     * @param {string | Locator} element
     * @param elementOptions optional
     * @param {number} timeout = 0
     * @return {Promise<boolean>}
     */
    async isElementDisabled(element: string | Locator, elementOptions?, timeout: number = 0): Promise<boolean> {
      return this.getLocator(element, elementOptions).isDisabled({timeout: timeout});
    }

    /**
     * Count elements
     * @param {string | Locator} element
     * @param elementOptions optional
     */
    async countElements(element: string | Locator, elementOptions?): Promise<number> {
      let numberOfElements: number;
      try {
        numberOfElements = await this.getLocator(element, elementOptions, false).count();
      } catch (e) {
        return 0;
      }
      return numberOfElements;
    }

    /**
    * Drag and drop an element
    * @param elementLocatorFrom
    * @param elementLocatorTo
    */
    async dragAndDropElementByLocator(elementLocatorFrom: Locator, elementLocatorTo: Locator): Promise<void> {
        await elementLocatorTo.scrollIntoViewIfNeeded();
        const box = (await elementLocatorTo.boundingBox());
        await elementLocatorFrom.hover();
        await this.page.mouse.down();
        // @ts-ignore: Object is possibly 'null'.
        await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await this.page.waitForTimeout(500);
        await elementLocatorTo.hover();
        await this.page.mouse.up();
        await this.page.waitForTimeout(500);
    }

    /**
    * Drag and drop an element
    * @param elementSelectorFrom
    * @param elementSelectorTo
    */
    async dragAndDropElement(elementSelectorFrom: string, elementSelectorTo: string): Promise<void> {
        await this.dragAndDropElementByLocator(this.page.locator(elementSelectorFrom), this.page.locator(elementSelectorTo));
    }

    /**
     * Click download button and wait for file downloading
     * @param {number} timeout default value is 2 min
     * @param {boolean} isSuccessful default value is true
     * @return {Promise<Download>}
     */
    async downloadEvent(timeout: number = 120000, isSuccessful: boolean = true): Promise<Download> {
      const downloadObject = await this.page.waitForEvent('download', {timeout: timeout});
      if (isSuccessful) {
        const downloadFailure = await downloadObject.failure();
        expect(downloadFailure, `Download failure detected: "${downloadFailure}"\n`).toBeNull();
      }
      return downloadObject;
    }

    /**
     * Get current URL
     */
    getCurrentURL(): string {
      return this.page.url();
    }

    /**
     * Get specific attribute from an element
     * @param {string | Locator} element
     * @param {string} attributeName
     * @param elementOptions optional
     * @param {number} timeout
     */
    async getAttribute(element: string | Locator, attributeName: string, elementOptions?, timeout?: number): Promise<string> {
      await this.waitForElementToBeAttached(element, elementOptions, timeout);
      return this.getLocator(element, elementOptions).getAttribute(attributeName, {timeout: timeout});
    }

    /**
     * Get the expected response
     * @param {RegExp} urlRegExp
     * @param {number} statusCode
     * @param {string?} body
     * @returns {Promise<Response>}
     */
    // async waitForResponseToMatch(urlRegExp: RegExp, statusCode: Array<number> = [200], body?: string): Promise<Response> {
    //   if (body) {
    //     return this.page.waitForResponse(async (response) => response.url().match(urlRegExp) && statusCode.includes(response.status()) && (await response.body()).toString().includes(body));
    //   } else {
    //     return this.page.waitForResponse(response => response.url().match(urlRegExp) && statusCode.includes(response.status()));
    //   }
    // }
}
