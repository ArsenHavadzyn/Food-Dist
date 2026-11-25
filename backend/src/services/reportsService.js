const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const knex = require('../db/knex');

const reportsDir = path.resolve(__dirname, '..', '..', 'public', 'reports');
if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

function findSystemFont() {
    const candidates = [];
    if (process.platform === 'win32') {
        const windir = process.env.WINDIR || 'C:\\Windows';
        candidates.push(path.join(windir, 'Fonts', 'arial.ttf'));
        candidates.push(path.join(windir, 'Fonts', 'arialuni.ttf'));
        candidates.push(path.join(windir, 'Fonts', 'arialbd.ttf'));
        candidates.push(path.join(windir, 'Fonts', 'tahoma.ttf'));
        candidates.push(path.join(windir, 'Fonts', 'verdana.ttf'));
    } else if (process.platform === 'darwin') {
        candidates.push('/Library/Fonts/Arial.ttf');
        candidates.push('/Library/Fonts/Helvetica.ttf');
    } else {
        candidates.push('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf');
        candidates.push('/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf');
        candidates.push('/usr/share/fonts/truetype/freefont/FreeSans.ttf');
    }
    for (const p of candidates) {
        try { if (fs.existsSync(p)) return p; } catch (e) { }
    }
    return null;
}

async function generatePdf(name, title, rows) {
    const fileName = `${Date.now()}_${String(name || 'report').replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
    const filePath = path.join(reportsDir, fileName);

    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 40 });
            const stream = fs.createWriteStream(filePath);
            doc.pipe(stream);

            // Try to find a system font that supports Cyrillic and register it
            const fontPath = findSystemFont();
            if (fontPath) {
                try {
                    doc.registerFont('Main', fontPath);
                    doc.registerFont('Main-Bold', fontPath);
                    doc.font('Main');
                } catch (e) {
                    console.warn('Failed to register system font for PDF generation:', e);
                    doc.font('Helvetica');
                }
            } else {
                // fallback to built-in fonts (may not support Cyrillic)
                doc.font('Helvetica');
            }

            // Header
            doc.fontSize(18).font('Main-Bold').text(title || name, { align: 'center' });
            doc.moveDown(0.3);
            doc.fontSize(10).font('Main').text(`Звіт згенеровано: ${new Date().toLocaleString()}`, { align: 'right' });
            doc.moveDown(0.6);

            // Short description
            doc.fontSize(11).font('Main-Bold').text('Опис');
            doc.font('Main').fontSize(10).text('Цей звіт сформовано автоматично. Нижче наведено таблицю записів та підсумкові показники.');
            doc.moveDown(0.6);

            // Summary KPIs
            const totalRows = rows.length || 0;
            const totalRevenue = rows.reduce((s, r) => s + Number(r.revenue || r.total_price || 0), 0);
            // left and right aligned summary
            const left = `Кількість записів: ${totalRows}`;
            const right = `Загальна виручка: ${Number(totalRevenue).toFixed(2)}`;
            const summaryY = doc.y;
            doc.fontSize(10).text(left, { continued: true });
            doc.text(right, { align: 'right' });
            doc.moveDown(0.6);

            // Table header
            const startX = doc.x;
            const usableWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
            const col1 = Math.floor(usableWidth * 0.7);
            const col2 = usableWidth - col1;

            doc.font('Main-Bold').fontSize(10).text('Товар', startX, doc.y, { width: col1 });
            doc.text('Виручка', startX + col1, doc.y, { width: col2, align: 'right' });
            doc.moveDown(0.3);
            doc.font('Main').fontSize(10);

            // Rows
            for (const r of rows) {
                const nameVal = r.product || r.name || r.product || '';
                const revVal = Number(r.revenue || r.total_price || 0).toFixed(2);

                // If close to page bottom, add new page
                if (doc.y > doc.page.height - doc.page.margins.bottom - 50) doc.addPage();

                doc.text(String(nameVal), startX, doc.y, { width: col1 });
                doc.text(revVal, startX + col1, doc.y, { width: col2, align: 'right' });
                doc.moveDown(0.3);
            }

            doc.moveDown(0.5);
            doc.fontSize(9).fillColor('gray').text('Пояснення: звіт містить агреговані дані продажів. Використовуйте фільтрацію в інтерфейсі для деталізації.', { align: 'left' });

            doc.end();

            stream.on('finish', async () => {
                try {
                    const [id] = await knex('reports').insert({ name, type: 'pdf', path: `/public/reports/${fileName}`, meta: JSON.stringify({ rowsCount: rows.length }) });
                    resolve({ id, path: `/public/reports/${fileName}` });
                } catch (e) { reject(e); }
            });
            stream.on('error', reject);
        } catch (e) { reject(e); }
    });
}

async function generateExcel(name, title, rows) {
    const fileName = `${Date.now()}_${name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.xlsx`;
    const filePath = path.join(reportsDir, fileName);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Report');
    if (rows.length) {
        const keys = Object.keys(rows[0]);
        sheet.addRow(keys);
        rows.forEach(r => sheet.addRow(keys.map(k => r[k])));
    }
    await workbook.xlsx.writeFile(filePath);
    const [id] = await knex('reports').insert({ name, type: 'xlsx', path: `/public/reports/${fileName}`, meta: JSON.stringify({ rowsCount: rows.length }) });
    return { id, path: `/public/reports/${fileName}` };
}

module.exports = { generatePdf, generateExcel };
