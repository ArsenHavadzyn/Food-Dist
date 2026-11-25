const test = require('node:test');
const assert = require('node:assert/strict');

const {
    calcProfitability,
    calcLiquidity,
    calcFundoviddacha,
    calcProductivity,
    calcMaterialIntensity,
    calcAssetTurnover
} = require('../src/services/calculations');
const { analyze } = require('../src/services/factorService');

test('рентабельність обчислюється у відсотках', () => {
    assert.equal(calcProfitability(250, 1000), 25);
});

test('рентабельність зберігає від’ємний результат для збитку', () => {
    assert.equal(calcProfitability(-125, 1000), -12.5);
});

test('рентабельність повертає нуль для некоректного прибутку', () => {
    assert.equal(calcProfitability(Number.NaN, 1000), 0);
});

test('рентабельність повертає нуль, якщо дохід дорівнює нулю', () => {
    assert.equal(calcProfitability(100, 0), 0);
});

test('коефіцієнт ліквідності обчислюється з округленням до двох знаків', () => {
    assert.equal(calcLiquidity(1000, 300), 3.33);
});

test('коефіцієнт ліквідності повертає null за нульових зобов’язань', () => {
    assert.equal(calcLiquidity(1000, 0), null);
});

test('коефіцієнт ліквідності повертає null для некоректних активів', () => {
    assert.equal(calcLiquidity(Number.NaN, 300), null);
});

test('фондовіддача обчислюється з точністю до чотирьох знаків', () => {
    assert.equal(calcFundoviddacha(1000, 300), 3.3333);
});

test('фондовіддача повертає нуль, якщо основні засоби дорівнюють нулю', () => {
    assert.equal(calcFundoviddacha(1000, 0), 0);
});

test('продуктивність праці обчислюється на одного працівника', () => {
    assert.equal(calcProductivity(1000, 3), 333.33);
});

test('продуктивність праці повертає нуль за відсутності працівників', () => {
    assert.equal(calcProductivity(1000, 0), 0);
});

test('матеріаломісткість обчислюється як частка витрат у доході', () => {
    assert.equal(calcMaterialIntensity(250, 1000), 0.25);
});

test('оборотність активів обчислюється з точністю до чотирьох знаків', () => {
    assert.equal(calcAssetTurnover(1000, 300), 3.3333);
});

test('факторний аналіз повертає дохід, вплив факторів і пояснення', () => {
    const result = analyze(1000, 2);

    assert.deepEqual(
        {
            fixedAssets: result.fixedAssets,
            assetTurnover: result.assetTurnover,
            revenue: result.revenue,
            impactFixed: result.impactFixed,
            impactTurn: result.impactTurn
        },
        {
            fixedAssets: 1000,
            assetTurnover: 2,
            revenue: 2000,
            impactFixed: 20,
            impactTurn: 20
        }
    );
    assert.match(result.explanation, /Revenue = FixedAssets \* AssetTurnover/);
});
