const test = require('node:test');
const assert = require('node:assert/strict');
const ExcelJS = require('exceljs');
const { prepareImport } = require('../src/services/importService');

test('CSV import maps headers, parses quoted decimals, and reports invalid rows', async () => {
    const csv = [
        'year,revenue,profit,assets',
        '2025,"1250,50","-250,25",5000',
        'not-a-year,900,100,1000'
    ].join('\r\n');

    const result = await prepareImport('financial', Buffer.from(csv), 'financial.csv', null);

    assert.equal(result.validCount, 1);
    assert.equal(result.invalidCount, 1);
    assert.deepEqual(result.rows[0], {
        rowNumber: 2,
        values: { year: 2025, revenue: 1250.5, profit: -250.25, assets: 5000 },
        errors: []
    });
    assert.equal(result.rows[1].rowNumber, 3);
    assert.match(result.rows[1].errors[0], /year/);
});

test('XLSX import reads worksheet rows and rejects missing required columns', async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Data');
    worksheet.addRow(['year', 'revenue', 'profit', 'assets']);
    worksheet.addRow([2026, 2500, 500, 3000]);
    const buffer = Buffer.from(await workbook.xlsx.writeBuffer());

    const result = await prepareImport('financial', buffer, 'financial.xlsx', null);
    assert.equal(result.validCount, 1);
    assert.equal(result.rows[0].values.year, 2026);

    await assert.rejects(
        prepareImport('financial', Buffer.from('year,revenue\n2026,100'), 'wrong.csv', null),
        { status: 400, message: /profit, assets/ }
    );
});

test('financial import preserves explicitly supplied ratios and nullable liquidity', async () => {
    const csv = [
        'year,revenue,profit,assets,profitability,liquidity,asset_turnover',
        '2027,90250,4000,54000,4.58,,1.7593'
    ].join('\n');

    const result = await prepareImport('financial', Buffer.from(csv), 'financial-test.csv', null);

    assert.equal(result.validCount, 1);
    assert.deepEqual(result.rows[0].values, {
        year: 2027,
        revenue: 90250,
        profit: 4000,
        assets: 54000,
        profitability: 4.58,
        liquidity: null,
        asset_turnover: 1.7593
    });
});
