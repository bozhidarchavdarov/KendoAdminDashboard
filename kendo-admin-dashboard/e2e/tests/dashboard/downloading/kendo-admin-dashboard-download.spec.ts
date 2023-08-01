import { test, expect } from "@e2ePages/common/prerequisites-setup";
import { ExcelFileSystemUtils } from '@e2eUtils/excel.utils';
import { CellValue } from 'exceljs';

test.describe('Kendo Admin Dashboard - Download Functionality', async () => {

    const downloadedPdfFileName = `Employees*.pdf`;
    const downloadedExcelFileName = `Employees*.xlsx`;
    const excelSheet1Name = 'Sheet1';
    const expectedCellValueBeforeReordering = 'Pesho';
    const columnToDragAndDrop = 'Rating';

    test.beforeEach(async ({page}) => {
        await page.goto('/KendoAdminDashboard');
    });

    test('successfully download PDF file', async ({pages}) => {
        const [download] = await Promise.all([
            pages.kendoAdminDashboardPage.downloadEvent(),
            pages.kendoAdminDashboardPage.clickExportToPdfButton()
        ]);
        expect(download.suggestedFilename(), `Downloading PDF file ${download.suggestedFilename()}`).toMatch(new RegExp(downloadedPdfFileName));
    });

    test('Drag and Drop functionality updates the internal Excel file structure', async ({pages}) => {
        let [download] = await Promise.all([
            pages.kendoAdminDashboardPage.downloadEvent(),
            pages.kendoAdminDashboardPage.clickExportToExcelButton()
        ]);
        expect.soft(download.suggestedFilename(), `Downloading Excel file ${download.suggestedFilename()}`).toMatch(new RegExp(downloadedExcelFileName));

        let workbook = await ExcelFileSystemUtils.getWorkbook(download);
        let excelA3Value: CellValue = ExcelFileSystemUtils.getValueAtCell(workbook, 3, 1, excelSheet1Name);
        // Check the A3 cell value before reordering
        expect.soft(excelA3Value as string, `Expected cell value ${expectedCellValueBeforeReordering} is not correct.
            The actual value is: ${excelA3Value as string}`).toEqual(expectedCellValueBeforeReordering);

        await pages.kendoAdminDashboardPage.dragAndDropByColumnName(columnToDragAndDrop);

        // Check the A3 cell value after reordering
        [download] = await Promise.all([
            pages.kendoAdminDashboardPage.downloadEvent(),
            pages.kendoAdminDashboardPage.clickExportToExcelButton()
        ]);
        workbook = await ExcelFileSystemUtils.getWorkbook(download);
        excelA3Value = ExcelFileSystemUtils.getValueAtCell(workbook, 3, 1, excelSheet1Name);
        expect(excelA3Value as string, `Expected cell value ${columnToDragAndDrop} is not correct.
            The actual value is: ${excelA3Value as string}`).toEqual(columnToDragAndDrop + ": 1");
        await pages.kendoAdminDashboardPage.clearAllDropTargets();
    });
});
