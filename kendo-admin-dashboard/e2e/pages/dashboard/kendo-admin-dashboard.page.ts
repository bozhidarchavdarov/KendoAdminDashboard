import { Locator, Page} from '@playwright/test';
import { BasePage } from '../common/base.page';
import { StringUtils } from '../utils/string.utils';

export class KendoAdminDashboardPage extends BasePage {

    constructor(page: Page) {
       super(page);
    }

    private readonly kendoGrid = 'kendo-grid ';
    private readonly exportToExcelButton = this.kendoGrid + '#exportToExcelId';
    private readonly exportToPdfButton = this.kendoGrid + '#exportToPdfId';
    private readonly kendoGridToolbar = 'kendo-grid-toolbar ';
    private readonly searchBar = this.kendoGridToolbar + '#inputId';
    private readonly dropTargetPanel = 'kendo-grid-group-panel';
    private readonly gridList = this.kendoGrid + 'kendo-grid-list ';
    private readonly gridAllRows = this.kendoGrid + 'tr.k-table-row';
    private readonly gridDataRows = this.kendoGrid + 'tbody tr.k-table-row'
    private readonly reorderedRows = this.kendoGrid + 'tr[kendogridgroupheader] td .k-reset';
    private readonly gridNoRecords = this.gridList + '.k-grid-norecords';
    private readonly removeDropTargetButton = '.k-chip-remove-action';
    private readonly kendoPager = this.kendoGrid + 'kendo-pager';
    private readonly nextPageButton = this.kendoPager + '.k-i-caret-alt-right';

    /**
    * Search via the Kendo search bar
    * @param {string} text
    */
    async setTextIntoKendoGridSearchBar(text: string): Promise<void> {
        await this.setInputField(this.searchBar, text);
    }

    /**
    * Clear the Kendo search bar
    */
    async clearSearchBar(): Promise<void> {
        await this.clearInputField(this.searchBar);
    }

    /**
    * Click Export to Excel button
    */
    async clickExportToExcelButton(): Promise<void> {
        await this.clickElement(this.exportToExcelButton);
    }

    /**
    * Click Export to PDF button
    */
    async clickExportToPdfButton(): Promise<void> {
        await this.clickElement(this.exportToPdfButton);
    }

    /**
    * Check if grid has any results
    */
    async isGridEmpty(): Promise<boolean> {
        return this.isElementVisible(this.gridNoRecords, {timeout: 3000});
    }

    /**
    * Has next available page
    */
    async hasNextPage(): Promise<boolean> {
        if ((await this.isElementVisible(this.nextPageButton)) && !(await this.isElementDisabled(this.nextPageButton))) {
            return true;
        } else {
            return false;
        }
    }

    /**
    * Click next grid page
    */
    async clickNextPage(): Promise<void> {
        if (await this.isElementVisible(this.nextPageButton) && !(await this.isElementDisabled(this.nextPageButton))) {
            await this.clickElement(this.nextPageButton);
        }
    }

    /**
    * Get the row element from a Kendo grid
    * @param {Array<string>} rowValues
    * @param {string} rowSelector
    */
    async getGridRowElement(rowValues: Array<string>): Promise<Locator | null> {
        await this.waitForElementToBeVisible(this.gridAllRows);
        const itemsList: Locator = this.page.locator(this.gridAllRows);
        const rowCount = await itemsList.count();
        if (rowCount === 0) {
           process.stdout.write('The grid does not contain any row\n');
           return null;
        }
        for (let i = 0; i < rowCount; i++) {
           const itemText = await this.getTextOfElementsByLocator(itemsList.nth(i));
           if (StringUtils.exactMatchStringsInArrays(itemText, rowValues)) {
                return itemsList.nth(i);
           }
        }
        const hasMorePages = await this.hasNextPage();
        if (hasMorePages) {
            await this.clickNextPage();
            return this.getGridRowElement(rowValues);
        } else {
            return null;
        }
     }

    /**
    * Check if the grid contains particular row
    * @param {Array<string>} rowValues
    */
    async hasRowValues(rowValues: Array<string>): Promise<boolean> {
        if (await this.isGridEmpty()) {
            return false;
        } else {
            const foundElement = await this.getGridRowElement(rowValues);
            return foundElement !== null;
        }
    }

    /**
    * Drag and drop a column by name
    * @param {string} columnName
    */
    async dragAndDropByColumnName(columnName: string): Promise<void> {
        const desiredColumnByName = this.page.locator("th[role='columnheader']", {hasText: columnName}).locator("a");
        const targetElement = this.page.locator(this.dropTargetPanel);
        await this.waitForElementToBeVisible(desiredColumnByName)
        await this.dragAndDropElementByLocator(desiredColumnByName, targetElement);
    }

    /**
    * Get the reordered rows count
    */
    async getReorderedGridRowsCount(): Promise<number> {
        await this.waitForElementToBeVisible(this.reorderedRows, {timeout: 2000});
        return this.countElements(this.reorderedRows);
    }

    /**
    * Get the first reordered grid header row index by column name
    * @param {string} columnName
    */
    async getReorderedGridHeaderIndex(columnName: string): Promise<string | null> {
        await this.waitForElementToBeVisible(this.reorderedRows);
        const reorderedColumnHeader = this.page.locator("//p[@class='k-reset' and contains(text(),'" +
            columnName + "')]/ancestor::tr[@kendogridgroupheader]").first();
        return this.getAttribute(reorderedColumnHeader, 'aria-rowindex');
    }

    /**
    * Get only the rows which contains data, the table headers are excluded
    */
    async getOnlyDataGridRowsCount(): Promise<number> {
        await this.waitForElementToBeVisible(this.gridDataRows, {timeout: 2000});
        return this.countElements(this.gridDataRows);
    }

    /**
    * Teardown method for removing all dropped filters if the remove button is visible
    */
    async clearAllDropTargets(): Promise<void> {
        if (await this.isElementVisible(this.page.locator(this.removeDropTargetButton).first())) {
            const removeTargetButtonsCount = await this.page.locator(this.removeDropTargetButton).count();
            for (let i = 0; i < removeTargetButtonsCount; i++) {
                await this.clickElement(this.removeDropTargetButton);
            }
        }
    }
}
