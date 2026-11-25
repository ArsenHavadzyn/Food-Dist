const fs = require('fs');
const path = require('path');

const root = __dirname;
const output = path.join(root, 'PROJECT_CODE_DUMP.txt');
const includedRoots = ['backend/src', 'backend/migrations', 'backend/seeds', 'frontend/src'];
const includedFiles = [
    'package.json', 'README.md', '.env.example',
    'backend/package.json', 'backend/README.md', 'backend/knexfile.js',
    'frontend/package.json', 'frontend/README.md', 'frontend/vite.config.js', 'frontend/index.html'
];
const extensions = new Set(['.js', '.jsx', '.css', '.html', '.json', '.md']);
const excludedNames = new Set(['node_modules', 'dist', 'dev.sqlite3', 'reports', 'tmp', 'PROJECT_CODE_DUMP.txt', 'package-lock.json', '.env']);

function walk(directory) {
    return fs.readdirSync(directory, { withFileTypes: true })
        .filter(entry => !excludedNames.has(entry.name))
        .flatMap(entry => {
            const fullPath = path.join(directory, entry.name);
            if (entry.isDirectory()) return walk(fullPath);
            return extensions.has(path.extname(entry.name)) ? [fullPath] : [];
        });
}

function relative(filePath) {
    return path.relative(root, filePath).split(path.sep).join('/');
}

const files = [...includedFiles.map(file => path.join(root, file)), ...includedRoots.flatMap(dir => walk(path.join(root, dir)))]
    .filter(file => fs.existsSync(file))
    .filter((file, index, all) => all.indexOf(file) === index)
    .sort();

const lines = [
    '================================================================================',
    'AUTOMATED DISTRIBUTOR ANALYTICS - ПОВНИЙ ДАМП ВИХІДНОГО КОДУ',
    '================================================================================',
    `Дата генерації: ${new Date().toISOString()}`,
    'Призначення: матеріали для опису практичної частини магістерської роботи.',
    'Виключено: node_modules, package-lock.json, dist, SQLite, reports, tmp, .env та інші згенеровані або секретні файли.',
    '',
    '================================================================================',
    'ЗМІСТ',
    '================================================================================',
    ...files.map(relative)
];

for (const file of files) {
    lines.push('', '================================================================================', `FILE: ${relative(file)}`, '================================================================================');
    lines.push(fs.readFileSync(file, 'utf8').trimEnd());
}

function tree(directory, prefix = '') {
    const entries = fs.readdirSync(directory, { withFileTypes: true })
        .filter(entry => !excludedNames.has(entry.name))
        .sort((a, b) => Number(b.isDirectory()) - Number(a.isDirectory()) || a.name.localeCompare(b.name));
    return entries.flatMap((entry, index) => {
        const last = index === entries.length - 1;
        const branch = last ? '└── ' : '├── ';
        const nextPrefix = prefix + (last ? '    ' : '│   ');
        const fullPath = path.join(directory, entry.name);
        return entry.isDirectory()
            ? [`${prefix}${branch}${entry.name}/`, ...tree(fullPath, nextPrefix)]
            : [`${prefix}${branch}${entry.name}`];
    });
}

lines.push(
    '',
    '================================================================================',
    'СТРУКТУРА ФАЙЛІВ І ПАПОК',
    '================================================================================',
    'food-dist/',
    ...tree(root),
    '',
    '================================================================================',
    'СТРУКТУРА БАЗИ ДАНИХ SQLITE',
    '================================================================================',
    'База: backend/db/dev.sqlite3 (бінарний файл виключено; схема визначається міграціями).',
    'users: id PK, email UNIQUE, password bcrypt, name, role, created_at, updated_at',
    'categories: id PK, name UNIQUE, description, created_at, updated_at',
    'products: id PK, name, category_id -> categories, price, cost_price, stock, unit, barcode, timestamps',
    'sales: id PK, product_id -> products, quantity, unit_price, total_price, sale_date, created_by -> users, timestamps',
    'inventory: id PK, product_id -> products, stock, recorded_at, timestamps',
    'financial_indicators: id PK, year UNIQUE, revenue, profit, assets, profitability, liquidity, asset_turnover, timestamps',
    'reports: id PK, name, type, path, meta JSON, timestamps',
    'Зв’язки: categories 1:N products; products 1:N sales/inventory; users 1:N sales.',
    '',
    '================================================================================',
    'КІНЕЦЬ ДАМПУ',
    '================================================================================'
);

fs.writeFileSync(output, lines.join('\n') + '\n', 'utf8');
console.log(`Generated ${relative(output)} with ${files.length} source files.`);