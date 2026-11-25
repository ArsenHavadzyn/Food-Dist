const http = require('http');
const https = require('https');
const { URL } = require('url');
const knex = require('../db/knex');
const factorService = require('./factorService');

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama2';
const OLLAMA_TIMEOUT_MS = Number(process.env.OLLAMA_TIMEOUT_MS) || 300000;

function safeParseJson(text) {
    try {
        return JSON.parse(text);
    } catch (e) {
        // try to extract JSON block
        const m = text.match(/\{[\s\S]*\}/);
        if (m) {
            try { return JSON.parse(m[0]); } catch (e2) { return null; }
        }
        return null;
    }
}

function callOllama(messages) {
    const systemMessage = messages.find(message => message.role === 'system');
    const userMessages = messages.filter(message => message.role !== 'system');
    const prompt = userMessages.map(message => message.content).join('\n\n');
    const payload = JSON.stringify({
        model: OLLAMA_MODEL,
        prompt,
        system: systemMessage ? systemMessage.content : undefined,
        stream: false,
        format: 'json',
        think: false,
        options: {
            num_predict: 1200,
            temperature: 0.2
        }
    });
    const url = new URL(OLLAMA_BASE_URL);
    // Ollama typical endpoint for generation
    const path = `${url.pathname.replace(/\/$/, '')}/api/generate`;
    const isHttps = url.protocol === 'https:';
    const options = {
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload)
        },
        timeout: OLLAMA_TIMEOUT_MS
    };

    const client = isHttps ? https : http;

    return new Promise((resolve, reject) => {
        const req = client.request(options, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        const parsed = JSON.parse(data);
                        // Try common Ollama response shapes
                        let text = null;
                        if (parsed.output && Array.isArray(parsed.output) && parsed.output.length) {
                            text = parsed.output[0];
                        } else if (parsed.results && Array.isArray(parsed.results) && parsed.results[0] && parsed.results[0].content && Array.isArray(parsed.results[0].content)) {
                            text = parsed.results[0].content.join('\n');
                        } else if (parsed.response) {
                            text = parsed.response;
                        } else if (typeof parsed === 'string') {
                            text = parsed;
                        } else {
                            // Fallback: try to find first string in object
                            const findString = obj => {
                                if (!obj) return null;
                                if (typeof obj === 'string') return obj;
                                if (Array.isArray(obj)) return obj.map(findString).find(Boolean) || null;
                                if (typeof obj === 'object') return Object.values(obj).map(findString).find(Boolean) || null;
                                return null;
                            };
                            text = findString(parsed);
                        }

                        resolve(text || '');
                    } catch (e) {
                        reject(new Error('Invalid AI response'));
                    }
                } else {
                    reject(new Error(`AI API error ${res.statusCode}`));
                }
            });
        });
        req.on('error', err => {
            // map network errors to friendly message
            if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
                reject(new Error('Локальний AI-сервіс недоступний. Переконайтеся, що Ollama запущено.'));
            } else {
                reject(err);
            }
        });
        req.on('timeout', () => { req.destroy(new Error('Локальний AI-сервіс не відповів вчасно. Спробуйте ще раз або виберіть компактнішу модель.')); });
        req.write(payload);
        req.end();
    });
}

function buildSystemPrompt() {
    return `You are an economic analyst AI assistant. Respond only in clear Ukrainian and return valid JSON without markdown. Analyze only the provided data and never invent values, facts, causes, or business details. Separate observed facts from assumptions; if a cause is not proven by the data, say "можливим фактором може бути...". Use correct terms: revenue = виручка, profit = прибуток, profitability = рентабельність, asset_turnover = оборотність активів. Do not call revenue or profitability the same thing. The factor section is a sensitivity scenario for a 1% change, not proof of the actual historical contribution. Explain which factor has greater impact only when the provided impact values differ; if they are equal, state that the scenario impacts are equal. Do not recommend actions based on invented causes. If there are no negative changes, explicitly say that negative dynamics were not identified. Return exactly these JSON keys: summary, positiveFactors, negativeFactors, risks, recommendations, factorAnalysisExplanation. Keep the result concise and practical.`;
}

function negativeTrendLabels(deltas) {
    const labels = {
        revenue: 'Зменшення виручки',
        profit: 'Зменшення прибутку',
        assets: 'Зменшення активів',
        profitability: 'Зниження рентабельності',
        liquidity: 'Зниження ліквідності',
        asset_turnover: 'Зниження оборотності активів'
    };

    return Object.keys(labels)
        .filter(key => deltas[key] != null && deltas[key] < 0)
        .map(key => `${labels[key]} на ${Math.abs(deltas[key]).toFixed(2)}% за аналізований період`);
}

async function analyzePeriod(startYear, endYear) {
    // fetch rows
    const rows = await knex('financial_indicators').whereBetween('year', [startYear, endYear]).orderBy('year', 'asc');
    if (!rows || rows.length < 2) throw new Error('Not enough data for the requested period');

    const first = rows[0];
    const last = rows[rows.length - 1];

    const ctx = {
        period: { startYear, endYear },
        first: { year: first.year, revenue: Number(first.revenue), profit: Number(first.profit), assets: Number(first.assets), profitability: Number(first.profitability), liquidity: first.liquidity ? Number(first.liquidity) : null, asset_turnover: first.asset_turnover ? Number(first.asset_turnover) : null },
        last: { year: last.year, revenue: Number(last.revenue), profit: Number(last.profit), assets: Number(last.assets), profitability: Number(last.profitability), liquidity: last.liquidity ? Number(last.liquidity) : null, asset_turnover: last.asset_turnover ? Number(last.asset_turnover) : null }
    };

    // compute simple deltas where possible
    const deltas = {};
    ['revenue', 'profit', 'assets', 'profitability', 'liquidity', 'asset_turnover'].forEach(key => {
        const a = ctx.first[key];
        const b = ctx.last[key];
        if (a != null && b != null && a !== 0) {
            deltas[key] = +(((b - a) / Math.abs(a)) * 100).toFixed(2);
        } else {
            deltas[key] = null;
        }
    });

    // factor analysis using existing service for the last year
    const factorRes = factorService.analyze(ctx.last.assets, ctx.last.asset_turnover);
    const analysisContext = {
        context: ctx,
        deltas,
        factor: {
            ...factorRes,
            interpretation: 'Сценарна чутливість виручки при збільшенні кожного фактора на 1%; це не фактичний внесок фактора в історичну зміну.'
        }
    };

    const messages = [
        { role: 'system', content: buildSystemPrompt() },
        { role: 'user', content: `Context JSON:\n${JSON.stringify(analysisContext, null, 2)}` }
    ];

    const aiText = await callOllama(messages);
    const parsed = safeParseJson(aiText || '');
    if (!parsed) throw new Error('AI returned non-JSON or malformed response');

    // Basic validation of expected keys
    const required = ['summary', 'positiveFactors', 'negativeFactors', 'risks', 'recommendations', 'factorAnalysisExplanation'];
    for (const k of required) {
        if (!(k in parsed)) {
            const returnedKeys = Object.keys(parsed).join(', ') || '(none)';
            throw new Error(`AI response missing key: ${k}; returned keys: ${returnedKeys}`);
        }
    }

    const observedNegativeFactors = negativeTrendLabels(deltas);
    parsed.negativeFactors = Array.isArray(parsed.negativeFactors) ? parsed.negativeFactors : [];
    observedNegativeFactors.forEach(factor => {
        if (!parsed.negativeFactors.some(item => String(item).trim().toLowerCase() === factor.toLowerCase())) {
            parsed.negativeFactors.unshift(factor);
        }
    });
    if (parsed.negativeFactors.length === 0) {
        parsed.negativeFactors.push('За наданими показниками негативної динаміки не виявлено');
    }

    // attach meta
    return { meta: { startYear, endYear, requestedAt: new Date().toISOString() }, input: { ctx, deltas, factor: factorRes }, result: parsed };
}

async function explainKpi(kpi, year) {
    // fetch requested year plus previous for context
    const y = Number(year);
    if (!y) throw new Error('Invalid year');
    const rows = await knex('financial_indicators').whereIn('year', [y - 1, y]).orderBy('year', 'asc');
    if (!rows || rows.length === 0) throw new Error('No data for requested year');
    const target = rows.find(r => r.year === y) || rows[rows.length - 1];
    const prev = rows.find(r => r.year === y - 1) || null;

    const units = {
        revenue: 'грошові одиниці',
        profit: 'грошові одиниці',
        profitability: '%',
        assets: 'грошові одиниці',
        liquidity: 'коефіцієнт',
        asset_turnover: 'коефіцієнт оборотності'
    };
    const value = target[kpi] !== undefined ? Number(target[kpi]) : null;
    const previous = prev && prev[kpi] !== undefined ? Number(prev[kpi]) : null;
    const ctx = {
        year: y,
        value,
        previous,
        unit: units[kpi] || 'не визначено',
        change: value != null && previous != null ? +(value - previous).toFixed(4) : null,
        changePercent: value != null && previous != null && previous !== 0 ? +(((value - previous) / Math.abs(previous)) * 100).toFixed(2) : null
    };

    const messages = [
        { role: 'system', content: buildSystemPrompt() },
        { role: 'user', content: `Explain the KPI '${kpi}' for year ${y} based only on this JSON:\n${JSON.stringify({ kpi, ctx }, null, 2)}` }
    ];

    const aiText = await callOllama(messages);
    const parsed = safeParseJson(aiText || '');
    if (!parsed) throw new Error('AI returned non-JSON or malformed response');
    // Expected fields in explain: meaning, dynamics, assessment, possibleCauses, conclusion
    return { meta: { year: y }, input: ctx, result: parsed };
}

module.exports = { analyzePeriod, explainKpi };
