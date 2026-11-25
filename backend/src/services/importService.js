const ExcelJS = require('exceljs');

const SPECS = {
    products: {
        required: ['name', 'price', 'stock'],
        fields: {
            name: ['name', 'назва', 'товар'],
            category_id: ['category_id', 'category id', 'категорія id', 'id категорії'],
            category: ['category', 'категорія'],
            price: ['price', 'ціна'],
            cost_price: ['cost_price', 'cost price', 'собівартість'],
            stock: ['stock', 'залишок', 'кількість'],
            unit: ['unit', 'одиниця', 'од.'],
            barcode: ['barcode', 'штрихкод']
        }
    },
    sales: {
        required: ['quantity', 'unit_price', 'sale_date'],
        requiredAny: ['product_id', 'product_name'],
        fields: {
            product_id: ['product_id', 'product id', 'id товару', 'товар id'],
            product_name: ['product_name', 'product name', 'product', 'назва товару', 'товар'],
            category_name: ['category_name', 'category name', 'category', 'категорія'],
            quantity: ['quantity', 'кількість'],
            unit_price: ['unit_price', 'unit price', 'ціна за одиницю'],
            sale_date: ['sale_date', 'sale date', 'дата продажу']
        }
    },
    financial: {
        required: ['year', 'revenue', 'profit', 'assets'],
        fields: {
            year: ['year', 'рік'],
            revenue: ['revenue', 'дохід'],
            profit: ['profit', 'прибуток'],
            assets: ['assets', 'активи'],
            profitability: ['profitability', 'рентабельність'],
            liquidity: ['liquidity', 'ліквідність'],
            asset_turnover: ['asset_turnover', 'asset turnover', 'оборотність активів']
        }
    }
};

const MAX_ROWS = 2000;

function badRequest(message) {
    const error = new Error(message);
    error.status = 400;
    return error;
}

function normalizeHeader(value) {
    return String(value == null ? '' : value)
        .replace(/^\uFEFF/, '')
        .trim()
        .toLowerCase()
        .replace(/[\s_-]+/g, '');
}

function cellValue(value) {
    if (value && typeof value === 'object' && !(value instanceof Date)) {
        if (value.text != null) return value.text;
        if (Array.isArray(value.richText)) return value.richText.map(part => part.text).join('');
        if (value.result != null) return value.result;
    }
    return value;
}

function parseCsv(text) {
    const records = [];
    let cells = [];
    let value = '';
    let quoted = false;
    let line = 1;
    let recordLine = 1;

    for (let i = 0; i < text.length; i += 1) {
        const char = text[i];
        if (quoted) {
            if (char === '"' && text[i + 1] === '"') {
                value += '"';
                i += 1;
            } else if (char === '"') {
                quoted = false;
            } else {
                value += char;
                if (char === '\n') line += 1;
            }
        } else if (char === '"' && value.length === 0) {
            quoted = true;
        } else if (char === ',') {
            cells.push(value);
            value = '';
        } else if (char === '\n' || char === '\r') {
            cells.push(value);
            if (cells.some(cell => String(cell).trim() !== '')) {
                records.push({ rowNumber: recordLine, cells });
            }
            cells = [];
            value = '';
            if (char === '\r' && text[i + 1] === '\n') i += 1;
            line += 1;
            recordLine = line;
        } else {
            value += char;
        }
    }

    if (quoted) throw badRequest('CSV-файл містить незакриті лапки.');
    cells.push(value);
    if (cells.some(cell => String(cell).trim() !== '')) records.push({ rowNumber: recordLine, cells });
    if (records.length < 2) throw badRequest('Файл не містить рядків із даними.');
    return records;
}

async function readFile(buffer, filename) {
    const extension = String(filename || '').toLowerCase().split('.').pop();
    if (extension === 'csv') {
        return parseCsv(buffer.toString('utf8'));
    }
    if (extension !== 'xlsx') throw badRequest('Підтримуються лише файли CSV та XLSX.');

    const workbook = new ExcelJS.Workbook();
    try {
        await workbook.xlsx.load(buffer);
    } catch (error) {
        throw badRequest('Не вдалося прочитати файл XLSX. Перевірте його формат.');
    }
    const worksheet = workbook.worksheets[0];
    if (!worksheet) throw badRequest('У файлі XLSX немає аркуша з даними.');

    const records = [];
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        const cells = row.values.slice(1).map(cellValue);
        if (cells.some(cell => cell != null && String(cell).trim() !== '')) {
            records.push({ rowNumber, cells });
        }
    });
    if (records.length < 2) throw badRequest('Файл не містить рядків із даними.');
    return records;
}

function mapHeaders(type, headers) {
    const spec = SPECS[type];
    if (!spec) throw badRequest('Невідомий тип даних для імпорту.');

    const aliases = new Map();
    Object.keys(spec.fields).forEach(field => {
        spec.fields[field].forEach(alias => aliases.set(normalizeHeader(alias), field));
    });

    const fields = headers.map(header => aliases.get(normalizeHeader(header)) || null);
    const mappedFields = fields.filter(Boolean);
    const duplicates = mappedFields.filter((field, index) => mappedFields.indexOf(field) !== index);
    if (duplicates.length) {
        throw badRequest(`У файлі є дублікати стовпців: ${Array.from(new Set(duplicates)).join(', ')}.`);
    }

    const missing = spec.required.filter(field => !mappedFields.includes(field));
    if (spec.requiredAny && !spec.requiredAny.some(field => mappedFields.includes(field))) {
        missing.push(spec.requiredAny.join(' або '));
    }
    if (missing.length) {
        throw badRequest(`У файлі відсутні обов’язкові стовпці: ${missing.join(', ')}.`);
    }
    return fields;
}

function numberValue(value, label, errors, options) {
    if (value == null || String(value).trim() === '') {
        if (options.required) errors.push(`Не заповнено поле «${label}».`);
        return undefined;
    }

    const normalized = typeof value === 'string'
        ? value.trim().replace(/\s/g, '').replace(',', '.')
        : value;
    const number = Number(normalized);
    if (!Number.isFinite(number)) {
        errors.push(`Поле «${label}» має бути числом.`);
        return undefined;
    }
    if (options.integer && !Number.isInteger(number)) {
        errors.push(`Поле «${label}» має бути цілим числом.`);
        return undefined;
    }
    if (options.minimum != null && number < options.minimum) {
        errors.push(`Поле «${label}» має бути не менше ${options.minimum}.`);
        return undefined;
    }
    if (options.maximum != null && number > options.maximum) {
        errors.push(`Поле «${label}» має бути не більше ${options.maximum}.`);
        return undefined;
    }
    return number;
}

function dateValue(value, errors) {
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
        return value.toISOString().slice(0, 10);
    }
    const date = String(value == null ? '' : value).trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        errors.push('Поле «sale_date» має бути датою у форматі YYYY-MM-DD.');
        return undefined;
    }
    const parsed = new Date(`${date}T00:00:00.000Z`);
    if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) {
        errors.push('Поле «sale_date» містить некоректну дату.');
        return undefined;
    }
    return date;
}

function normalizeRow(type, values) {
    const errors = [];
    const data = {};
    const has = key => Object.prototype.hasOwnProperty.call(values, key);
    const text = (key, label, required) => {
        const result = values[key] == null ? '' : String(values[key]).trim();
        if (required && !result) errors.push(`Не заповнено поле «${label}».`);
        return result;
    };

    if (type === 'products') {
        data.name = text('name', 'name', true);
        data.price = numberValue(values.price, 'price', errors, { required: true, minimum: 0 });
        data.stock = numberValue(values.stock, 'stock', errors, { required: true, integer: true, minimum: 0 });
        data.cost_price = has('cost_price')
            ? numberValue(values.cost_price, 'cost_price', errors, { minimum: 0 }) ?? 0
            : 0;
        data.category_id = has('category_id') && String(values.category_id).trim() !== ''
            ? numberValue(values.category_id, 'category_id', errors, { integer: true, minimum: 1 })
            : null;
        data.category = has('category') && String(values.category).trim()
            ? String(values.category).trim()
            : null;
        data.unit = has('unit') && String(values.unit).trim() ? String(values.unit).trim() : 'pcs';
        data.barcode = has('barcode') && String(values.barcode).trim() ? String(values.barcode).trim() : null;
    } else if (type === 'sales') {
        if (has('product_id') && String(values.product_id).trim() !== '') {
            data.product_id = numberValue(values.product_id, 'product_id', errors, { required: true, integer: true, minimum: 1 });
        } else {
            data.product_name = text('product_name', 'product', true);
        }
        data.category_name = has('category_name') && String(values.category_name).trim()
            ? String(values.category_name).trim()
            : null;
        data.quantity = numberValue(values.quantity, 'quantity', errors, { required: true, integer: true, minimum: 1 });
        data.unit_price = numberValue(values.unit_price, 'unit_price', errors, { required: true, minimum: 0 });
        data.sale_date = dateValue(values.sale_date, errors);
    } else if (type === 'financial') {
        data.year = numberValue(values.year, 'year', errors, { required: true, integer: true, minimum: 1900, maximum: 2200 });
        data.revenue = numberValue(values.revenue, 'revenue', errors, { required: true, minimum: 0 });
        data.profit = numberValue(values.profit, 'profit', errors, { required: true });
        data.assets = numberValue(values.assets, 'assets', errors, { required: true, minimum: 0 });
        if (has('profitability') && String(values.profitability).trim() !== '') {
            data.profitability = numberValue(values.profitability, 'profitability', errors, {});
        }
        if (has('liquidity')) {
            data.liquidity = String(values.liquidity == null ? '' : values.liquidity).trim() === ''
                ? null
                : numberValue(values.liquidity, 'liquidity', errors, {});
        }
        if (has('asset_turnover') && String(values.asset_turnover).trim() !== '') {
            data.asset_turnover = numberValue(values.asset_turnover, 'asset_turnover', errors, {});
        }
    } else {
        errors.push('Невідомий тип даних для імпорту.');
    }

    return { data, errors };
}

function mapRecords(type, records, fields) {
    return records.slice(1).map(record => {
        const errors = [];
        if (record.cells.length > fields.length) {
            errors.push(`Очікується ${fields.length} стовпців, отримано ${record.cells.length}.`);
        }
        const values = {};
        fields.forEach((field, index) => {
            if (field) values[field] = record.cells[index];
        });
        const normalized = normalizeRow(type, values);
        return {
            rowNumber: record.rowNumber,
            values: normalized.data,
            errors: errors.concat(normalized.errors)
        };
    });
}

async function validateDatabase(type, rows, db) {
    const candidates = rows.filter(row => row.errors.length === 0);
    if (!candidates.length) return;

    if (type === 'products') {
        const categoryIds = Array.from(new Set(candidates.map(row => row.values.category_id).filter(Boolean)));
        const categoryNames = Array.from(new Set(candidates.map(row => row.values.category).filter(Boolean)));
        const existingCategories = categoryIds.length || categoryNames.length
            ? await db('categories')
                .where(function () {
                    if (categoryIds.length) this.whereIn('id', categoryIds);
                    if (categoryNames.length) {
                        if (categoryIds.length) this.orWhereIn('name', categoryNames);
                        else this.whereIn('name', categoryNames);
                    }
                })
                .select('id', 'name')
            : [];
        const categoriesById = new Map(existingCategories.map(category => [Number(category.id), category.name]));
        const categoriesByName = new Map(existingCategories.map(category => [category.name.toLowerCase(), Number(category.id)]));
        const barcodeRows = candidates.filter(row => row.values.barcode);
        const barcodes = barcodeRows.map(row => row.values.barcode);
        const existingBarcodes = barcodes.length
            ? await db('products').whereIn('barcode', barcodes).pluck('barcode')
            : [];
        const usedBarcodes = new Set(existingBarcodes);

        candidates.forEach(row => {
            const { category, category_id, barcode } = row.values;
            if (category) {
                const matchedId = categoriesByName.get(category.toLowerCase());
                if (!matchedId) {
                    row.errors.push(`Категорію «${category}» не знайдено.`);
                } else if (category_id && Number(category_id) !== matchedId) {
                    row.errors.push('Назва категорії не відповідає category_id.');
                } else {
                    row.values.category_id = matchedId;
                }
            }
            if (category_id && !categoriesById.has(Number(category_id))) {
                row.errors.push(`Категорію з ID ${category_id} не знайдено.`);
            }
            delete row.values.category;
            if (barcode) {
                if (usedBarcodes.has(barcode)) row.errors.push(`Штрихкод «${barcode}» уже використовується.`);
                else if (row.errors.length === 0) usedBarcodes.add(barcode);
            }
        });
    }

    if (type === 'sales') {
        const productIds = Array.from(new Set(candidates.map(row => row.values.product_id).filter(Boolean)));
        const productNames = Array.from(new Set(candidates.map(row => row.values.product_name).filter(Boolean)));
        const products = [];
        if (productIds.length) {
            products.push(...await db('products').whereIn('id', productIds).select('id', 'name', 'stock'));
        }
        if (productNames.length) {
            products.push(...await db('products')
                .leftJoin('categories', 'products.category_id', 'categories.id')
                .whereIn('products.name', productNames)
                .select('products.id', 'products.name', 'products.stock', 'categories.name as category_name'));
        }
        const byId = new Map(products.map(product => [Number(product.id), product]));
        const available = new Map(products.map(product => [Number(product.id), Number(product.stock)]));

        candidates.forEach(row => {
            const { product_name, category_name, quantity } = row.values;
            let productId = row.values.product_id && Number(row.values.product_id);
            if (!productId && product_name) {
                const normalizedName = product_name.toLowerCase();
                const normalizedCategory = category_name && category_name.toLowerCase();
                const matches = products.filter(product =>
                    product.name.toLowerCase() === normalizedName &&
                    (!normalizedCategory || (product.category_name || '').toLowerCase() === normalizedCategory)
                );
                if (matches.length === 0) {
                    row.errors.push(`Товар «${product_name}» не знайдено.`);
                } else if (matches.length > 1) {
                    row.errors.push(`Знайдено кілька товарів «${product_name}». Уточніть категорію.`);
                } else {
                    productId = Number(matches[0].id);
                    row.values.product_id = productId;
                }
            }
            delete row.values.product_name;
            delete row.values.category_name;
            if (row.errors.length) return;
            if (!byId.has(productId)) {
                row.errors.push(`Товар з ID ${productId} не знайдено.`);
            } else if (quantity > available.get(productId)) {
                row.errors.push(`Недостатньо залишку товару ${productId}: доступно ${available.get(productId)}.`);
            } else {
                available.set(productId, available.get(productId) - quantity);
            }
        });
    }

    if (type === 'financial') {
        const seenYears = new Set();
        candidates.forEach(row => {
            const year = Number(row.values.year);
            if (seenYears.has(year)) row.errors.push(`Рік ${year} повторюється у файлі.`);
            seenYears.add(year);
        });
    }
}

async function prepareImport(type, buffer, filename, db) {
    if (!SPECS[type]) throw badRequest('Невідомий тип даних для імпорту.');
    let records;
    try {
        records = await readFile(buffer, filename);
    } catch (error) {
        if (!error.status) error.status = 400;
        throw error;
    }
    const headers = records[0].cells.map(cell => String(cell == null ? '' : cell).trim());
    const fields = mapHeaders(type, headers);
    const rows = mapRecords(type, records, fields);
    if (rows.length > MAX_ROWS) throw badRequest(`Файл може містити не більше ${MAX_ROWS} рядків даних.`);
    await validateDatabase(type, rows, db);
    return {
        columns: fields.filter(Boolean),
        rows,
        validCount: rows.filter(row => row.errors.length === 0).length,
        invalidCount: rows.filter(row => row.errors.length > 0).length
    };
}

module.exports = { prepareImport, MAX_ROWS };
