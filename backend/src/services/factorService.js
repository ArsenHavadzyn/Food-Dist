// Service for simple factor analysis

function analyze(fixedAssets, assetTurnover) {
    fixedAssets = Number(fixedAssets) || 0;
    assetTurnover = Number(assetTurnover) || 0;
    const revenue = +(fixedAssets * assetTurnover).toFixed(2);

    // Sensitivity: how revenue changes with 1% change in each factor
    const delta = 0.01;
    const revFixedUp = +((fixedAssets * (1 + delta)) * assetTurnover).toFixed(2);
    const revTurnUp = +(fixedAssets * (assetTurnover * (1 + delta))).toFixed(2);
    const impactFixed = +((revFixedUp - revenue).toFixed(2));
    const impactTurn = +((revTurnUp - revenue).toFixed(2));

    const explanation = `Revenue = FixedAssets * AssetTurnover. При зростанні FixedAssets на 1% до ${+(fixedAssets * (1 + delta)).toFixed(2)}, дохід зміниться на ${impactFixed}. При зростанні AssetTurnover на 1% до ${+(assetTurnover * (1 + delta)).toFixed(4)}, дохід зміниться на ${impactTurn}.`;

    return { fixedAssets, assetTurnover, revenue, impactFixed, impactTurn, explanation };
}

module.exports = { analyze };
