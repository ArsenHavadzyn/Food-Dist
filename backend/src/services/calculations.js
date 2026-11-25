// Service with financial calculation utilities

// All functions are pure and return numeric results (or null on invalid input)

function calcProfitability(profit, revenue) {
    if (!revenue || isNaN(revenue) || isNaN(profit)) return 0;
    return +(profit / revenue * 100).toFixed(2); // percent
}

function calcLiquidity(currentAssets, currentLiabilities) {
    if (!currentLiabilities || isNaN(currentAssets) || isNaN(currentLiabilities)) return null;
    return +(currentAssets / currentLiabilities).toFixed(2);
}

function calcFundoviddacha(revenue, fixedAssets) {
    if (!fixedAssets || isNaN(revenue) || isNaN(fixedAssets)) return 0;
    return +(revenue / fixedAssets).toFixed(4);
}

function calcProductivity(revenue, employees) {
    if (!employees || isNaN(revenue) || isNaN(employees)) return 0;
    return +(revenue / employees).toFixed(2);
}

function calcMaterialIntensity(materialCosts, revenue) {
    if (!revenue || isNaN(materialCosts) || isNaN(revenue)) return 0;
    return +(materialCosts / revenue).toFixed(4);
}

function calcAssetTurnover(revenue, assets) {
    if (!assets || isNaN(revenue) || isNaN(assets)) return 0;
    return +(revenue / assets).toFixed(4);
}

module.exports = {
    calcProfitability,
    calcLiquidity,
    calcFundoviddacha,
    calcProductivity,
    calcMaterialIntensity,
    calcAssetTurnover
};
