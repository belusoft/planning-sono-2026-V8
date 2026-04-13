/**
 * functions/gas-proxy.js — Netlify Function
 * Proxy transparent vers Google Apps Script
 * BeluSoft-Tchapy © 2026 · Luc BERGAME
 *
 * Variables d'environnement Netlify requises :
 *   GAS_URL    = https://script.google.com/macros/s/.../exec
 *   GAS_SECRET = votre_secret_partagé
 */
exports.handler = async (event) => {
  const GAS_URL    = process.env.GAS_URL;
  const GAS_SECRET = process.env.GAS_SECRET;

  const CORS = {
    'Access-Control-Allow-Origin':  '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type':                 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS, body: '' };
  }

  if (!GAS_URL || !GAS_SECRET) {
    return { statusCode: 500, headers: CORS,
      body: JSON.stringify({ error: 'Variables env GAS_URL/GAS_SECRET manquantes' }) };
  }

  try {
    // ── GET : charger les données ──
    if (event.httpMethod === 'GET') {
      const params = event.queryStringParameters || {};
      const action = params.action || 'ping';
      const qs     = Object.keys(params).map(k => k+'='+encodeURIComponent(params[k])).join('&');
      const res    = await fetch(GAS_URL + '?' + qs);
      const data   = await res.json();
      return { statusCode: 200, headers: CORS, body: JSON.stringify(data) };
    }

    // ── POST : sauvegarder les données ──
    if (event.httpMethod === 'POST') {
      const body    = JSON.parse(event.body || '{}');
      body.secret   = GAS_SECRET; // Injecté côté serveur — jamais visible côté client
      const res     = await fetch(GAS_URL, {
        method:  'POST',
        headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
        body:    JSON.stringify(body),
        redirect: 'follow',
      });
      const text = await res.text();
      return { statusCode: 200, headers: CORS, body: text };
    }

    return { statusCode: 405, headers: CORS,
      body: JSON.stringify({ error: 'Méthode non autorisée' }) };

  } catch(e) {
    console.error('[gas-proxy]', e.message);
    return { statusCode: 500, headers: CORS,
      body: JSON.stringify({ error: e.message }) };
  }
};
