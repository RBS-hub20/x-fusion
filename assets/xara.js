/*
  XARA AI — X FUSION assistant widget (V1, front-end only, no backend).
  Shared by index.html and join.html. Injects its own CSS and markup.

  Answers come ONLY from the KB / reply text below. Keep figures here in sync
  with the pages (Myfxbook snapshot, complan, risk math).
  Any element with [data-xara-open] opens the chat.
*/
(function () {
  'use strict';
  if (window.__xara) return;
  window.__xara = true;

  // TODO: replace telegram/whatsapp with the real Telegram public channel and WhatsApp links.
  var LINKS = {
    signup: 'https://exfusion.ibportal.io/auth/register?e=ngR3pfn8_UR8xMmKU83_fNom1EFgJZ_f6l5_GL-rMsI&a=1',
    telegram: '#telegram-channel',
    whatsapp: '#whatsapp-link'
  };

  var AVATAR = 'assets/xara-ai-face.jpg';
  var TYPING_MS = 800;

  /* ---------------- Styles ---------------- */
  var css = [
    '.xara,.xara *{box-sizing:border-box}',
    '.xara{--xo1:#FF3B30;--xo2:#FF7A2F;--xg:linear-gradient(135deg,#FF3B30,#FF7A2F);font-family:"Inter",system-ui,-apple-system,sans-serif;-webkit-font-smoothing:antialiased}',
    '.xara-launch{position:fixed;right:24px;bottom:24px;z-index:60;display:flex;align-items:center;gap:10px;border:0;padding:0;background:none;cursor:pointer;color:#fff;font:inherit}',
    '.xara-launch .xara-tag{height:30px;padding:0 12px;border-radius:999px;display:flex;align-items:center;font-size:12px;font-weight:700;letter-spacing:.04em;background:rgba(10,10,14,.85);border:1px solid rgba(255,122,47,.45);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);box-shadow:0 6px 20px rgba(0,0,0,.5)}',
    '.xara-launch .xara-tag b{background:var(--xg);-webkit-background-clip:text;background-clip:text;color:transparent}',
    '.xara-orb{position:relative;width:64px;height:64px;border-radius:50%;flex:none;padding:2px;background:var(--xg);box-shadow:0 0 0 4px rgba(255,90,40,.12),0 0 28px rgba(255,80,40,.55),0 10px 28px rgba(0,0,0,.6);transition:transform .2s ease}',
    '.xara-orb img{width:100%;height:100%;border-radius:50%;object-fit:cover;display:block;border:2px solid #0A0A0E}',
    '.xara-launch:hover .xara-orb{transform:scale(1.06)}',
    '.xara-launch:focus-visible{outline:none}.xara-launch:focus-visible .xara-orb{box-shadow:0 0 0 3px #fff,0 0 28px rgba(255,80,40,.55)}',
    '.xara-dot{position:absolute;right:2px;bottom:3px;width:14px;height:14px;border-radius:50%;background:#22C55E;border:2px solid #0A0A0E}',
    '.xara-dot::after{content:"";position:absolute;inset:-2px;border-radius:50%;border:2px solid #22C55E;animation:xara-ping 1.8s ease-out infinite}',
    '@keyframes xara-ping{0%{transform:scale(1);opacity:.8}100%{transform:scale(2.2);opacity:0}}',
    '.xara.open .xara-launch{display:none}',

    '.xara-panel{position:fixed;right:24px;bottom:24px;z-index:1000;width:380px;height:520px;max-height:calc(100vh - 48px);display:none;flex-direction:column;overflow:hidden;color:#fff;background:#0A0A0E;border:1px solid rgba(255,255,255,.1);border-radius:20px;box-shadow:0 30px 80px rgba(0,0,0,.7),0 0 50px rgba(255,80,40,.15)}',
    '.xara.open .xara-panel{display:flex;animation:xara-in .22s ease-out}',
    '@keyframes xara-in{from{opacity:0;transform:translateY(12px) scale(.98)}to{opacity:1;transform:none}}',
    '.xara-head{flex:none;display:flex;align-items:center;gap:12px;padding:14px 14px 14px 16px;border-bottom:1px solid rgba(255,255,255,.08);background:linear-gradient(180deg,rgba(255,90,40,.1),transparent)}',
    '.xara-head img{width:42px;height:42px;border-radius:50%;object-fit:cover;border:2px solid var(--xo2);flex:none}',
    '.xara-head div{flex:1;min-width:0}',
    '.xara-title{margin:0;font-size:14.5px;font-weight:700;line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.xara-title b{background:var(--xg);-webkit-background-clip:text;background-clip:text;color:transparent}',
    '.xara-status{margin:2px 0 0;font-size:12px;color:#9CA3AF;display:flex;align-items:center;gap:6px}',
    '.xara-status i{width:7px;height:7px;border-radius:50%;background:#22C55E;box-shadow:0 0 8px #22C55E}',
    '.xara-x{flex:none;width:36px;height:36px;border-radius:50%;border:0;background:rgba(255,255,255,.06);color:#fff;display:grid;place-items:center;cursor:pointer}',
    '.xara-x:hover{background:rgba(255,255,255,.12)}.xara-x svg{width:18px;height:18px}',
    '.xara-x:focus-visible,.xara-chip:focus-visible,.xara-act:focus-visible,.xara-send:focus-visible{outline:2px solid var(--xo2);outline-offset:2px}',

    '.xara-log{flex:1;overflow-y:auto;overscroll-behavior:contain;padding:16px 14px;display:flex;flex-direction:column;gap:10px;scroll-behavior:smooth}',
    '.xara-row{display:flex;gap:8px;align-items:flex-end;max-width:100%}',
    '.xara-row.bot img{width:32px;height:32px;border-radius:50%;object-fit:cover;flex:none}',
    '.xara-row.user{justify-content:flex-end}',
    '.xara-msg{max-width:82%;padding:10px 13px;border-radius:16px;font-size:13.5px;line-height:1.5;overflow-wrap:anywhere}',
    '.xara-row.bot .xara-msg{background:#17171D;border:1px solid rgba(255,255,255,.07);border-bottom-left-radius:5px;color:#E5E7EB}',
    '.xara-row.user .xara-msg{background:var(--xg);color:#fff;border-bottom-right-radius:5px;box-shadow:0 6px 18px rgba(255,60,30,.3)}',
    '.xara-msg a{color:#FF9A5C;font-weight:700;text-decoration:underline;text-underline-offset:2px}',
    '.xara-msg b{color:#fff}.xara-msg ol,.xara-msg ul{margin:6px 0 0;padding-left:18px}.xara-msg li{margin:2px 0}',
    '.xara-msg .xara-risk{display:block;margin-top:8px;padding:8px 10px;border-radius:10px;font-size:12px;color:#FCD9B8;background:rgba(255,122,47,.08);border:1px solid rgba(255,122,47,.3)}',
    '.xara-msg .xara-math{display:block;margin-top:8px;padding:8px 10px;border-radius:10px;font-size:12.5px;background:rgba(255,77,79,.07);border:1px solid rgba(255,77,79,.3)}',
    '.xara-msg .mono{font-family:"JetBrains Mono",ui-monospace,monospace;font-size:12.5px}',
    '.xara-chips,.xara-acts{display:flex;flex-wrap:wrap;gap:6px;padding-left:40px}',
    '.xara-chip{height:32px;padding:0 12px;border-radius:999px;border:1px solid rgba(255,122,47,.45);background:rgba(255,122,47,.06);color:#fff;font:inherit;font-size:12.5px;font-weight:600;cursor:pointer;white-space:nowrap}',
    '.xara-chip:hover{background:rgba(255,122,47,.16)}',
    '.xara-acts{flex-direction:column;align-items:stretch}',
    '.xara-act{display:flex;align-items:center;justify-content:center;min-height:42px;padding:0 14px;border-radius:999px;font-size:13px;font-weight:700;color:#fff;text-decoration:none;text-align:center}',
    '.xara-act.primary{background:var(--xg);box-shadow:inset 0 1px 0 rgba(255,255,255,.3),0 8px 20px rgba(255,60,30,.35)}',
    '.xara-act.ghost{background:#111;border:1px solid var(--xo2)}',
    '.xara-typing{display:flex;gap:4px;padding:14px 14px}',
    '.xara-typing i{width:7px;height:7px;border-radius:50%;background:#9CA3AF;animation:xara-bounce 1s infinite ease-in-out}',
    '.xara-typing i:nth-child(2){animation-delay:.15s}.xara-typing i:nth-child(3){animation-delay:.3s}',
    '@keyframes xara-bounce{0%,80%,100%{transform:translateY(0);opacity:.5}40%{transform:translateY(-4px);opacity:1}}',

    '.xara-form{flex:none;display:flex;gap:8px;padding:12px;border-top:1px solid rgba(255,255,255,.08);background:#0A0A0E}',
    '.xara-form input{flex:1;min-width:0;height:44px;padding:0 14px;border-radius:999px;border:1px solid rgba(255,255,255,.12);background:#15151B;color:#fff;font:inherit;font-size:16px;outline:none}',
    '.xara-form input:focus{border-color:var(--xo2)}',
    '.xara-send{flex:none;width:44px;height:44px;border-radius:50%;border:0;background:var(--xg);color:#fff;display:grid;place-items:center;cursor:pointer;box-shadow:0 6px 16px rgba(255,60,30,.4)}',
    '.xara-send svg{width:18px;height:18px}',
    '.xara-foot{flex:none;margin:0;padding:0 12px 10px;font-size:10.5px;color:#6B7280;text-align:center;background:#0A0A0E}',

    '@media (max-width:767px){',
    '  .xara-launch{right:16px;bottom:calc(90px + env(safe-area-inset-bottom))}',
    '  .xara-launch{gap:0}',
    '  .xara-launch .xara-tag{position:absolute;left:50%;bottom:-9px;z-index:1;transform:translateX(-50%);height:18px;padding:0 7px;font-size:9px;white-space:nowrap}',
    '  .xara-panel{inset:0;right:0;bottom:0;width:100%;height:100%;height:100dvh;max-height:none;border-radius:0;border:0}',
    '  .xara-head{padding-top:calc(14px + env(safe-area-inset-top))}',
    '  .xara-form{padding-bottom:calc(12px + env(safe-area-inset-bottom))}',
    '}',
    '@media (prefers-reduced-motion:reduce){.xara-dot::after,.xara-typing i{animation:none}.xara.open .xara-panel{animation:none}.xara-log{scroll-behavior:auto}}'
  ].join('\n');

  /* ---------------- Knowledge / copy ---------------- */
  function money(n) {
    var cents = Math.round(n * 100) % 100 !== 0;
    return '$' + n.toLocaleString('en-US', { minimumFractionDigits: cents ? 2 : 0, maximumFractionDigits: 2 });
  }

  var T = {
    en: {
      welcome: "Hi! I'm XARA AI, your X FUSION assistant. Ask me about SONIC.AI, how to start with $10, complan, or TAG Markets. I reply in your language.",
      risk: '⚠️ Trading involves risk. Past performance is not indicative of future results. No profit guarantee. Only risk what you can afford to lose.',
      placeholder: 'Type your question…',
      linkSoon: 'That link is being set up — our team will add it soon.',
      steps: function () {
        return '<b>How to start with X FUSION</b><ol><li>Create FREE account here: <a href="' + LINKS.signup.replace(/&/g, '&amp;') + '" target="_blank" rel="noopener">Sign up on the X FUSION IB-Portal</a></li>' +
          '<li>Deposit <b>$10+</b> only if affordable</li><li>Connect Copy X to SONIC.AI</li></ol>' +
          'Trading involves risk. Past performance is not indicative of future results. No profit guarantee.';
      },
      minNote: function (d) { return 'The minimum deposit is <b>$10</b> — ' + money(d) + ' is below that. Example below uses $10.'; },
      boost: function (d) {
        return '<b>Boost / exposure — example with ' + money(d) + '</b><ul>' +
          '<li>Copy trade SONIC.AI = <b>x24</b> → <b>' + money(d * 24) + '</b> MT5 exposure</li>' +
          '<li>Manual trade = <b>x12</b> → ' + money(d * 12) + ' MT5 exposure</li></ul>' +
          'This is <b>exposure, NOT withdrawable cash</b>.' +
          '<span class="xara-math"><b>Risk math at x24:</b> a 1% move against you = <b>-' + money(d * 0.24) + '</b> = <b>-24%</b> of your ' + money(d) + '. A <b>4.17%</b> adverse move = account <b>wiped</b>.<br>At x12: 1% = -12% of deposit, 8.33% adverse = wipe.</span>';
      },
      leadIntro: 'Ready? Start here 👇',
      leadSignup: '🚀 Create FREE Account — Sign Up',
      zoomSignup: 'Register first here so we can help you after Zoom 👇',
      leadTg: 'Join FREE Public Channel',
      leadWa: 'Send me private message on WhatsApp',
      sonic: '<b>SONIC.AI</b> is the AI Gold (XAU/USD) copy-trading strategy we use through <b>Copy X</b>, running on MetaTrader 5 with TAG Markets.<br><br><b>Myfxbook (snapshot 5 Nov 2026)</b><ul>' +
        '<li>Gain <b>+31.40%</b> · Abs. Gain <b>+29.48%</b></li><li>Monthly <b>1.13%</b> · Drawdown <b>0.86%</b></li>' +
        '<li>Balance <b>$141,236.01</b> · Profit <b>$35,662.50</b></li></ul>' +
        '<b>Copy X:</b> 790,300 followers · 236 trading days · Performance fee 30% (70% you).',
      complan: '<b>X FUSION Complan</b> — profit only on <b>real market gains</b>.<ul>' +
        '<li><b>Split:</b> 70% client / 25% affiliate / 5% trader</li>' +
        '<li><b>Lot commission:</b> L1 $2 · L2–L4 $1 · L5–L10 $0.50</li>' +
        '<li><b>Profit share (15.5% total):</b> L1 3.5% · L2 2.5% · L3 2% · L4–L7 0.5% each · L8 1.5% · L9 2% · L10 2%</li>' +
        '<li><b>Infinity Bonus:</b> 10K volume 1.5% up to 40M volume 7.5%</li>' +
        '<li><b>Pool:</b> $500K = 1% + $1/lot · $1M = 1% + $1.5/lot</li></ul>' +
        'No income is promised — earnings depend on real trading results and real activity.',
      safety: '<b>Honest answer:</b> no investment is risk-free, and nothing here is guaranteed.' +
        '<ul><li>SONIC.AI uses <b>x24 exposure</b> — a 4.17% adverse move can wipe a deposit.</li>' +
        '<li><b>FSC Mauritius:</b> TAG Markets is listed as Investment Dealer (28/03/2024), but licence GB21026474 / tagmarkets.com is not shown on the register.</li>' +
        '<li><b>FSCA South Africa:</b> FSP 55237 — Category I only (advice).</li>' +
        '<li><b>Regulator warnings:</b> Austria FMA (20 Feb 2026), Luxembourg CSSF (10 Jun 2026), Québec AMF (18 Sep 2026).</li></ul>' +
        'Please verify on each register yourself before depositing.',
      zoom: function (t) {
        return '<b>Daily live Zoom</b> — 2 PM, 4 PM and 6 PM Dubai time (GMT+4).' + (t ? '<br>Your time: <b>' + t + '</b>.' : '') +
          "<br><br>I'll send you the Zoom link via WhatsApp/Telegram 👇";
      },
      zoomWa: 'Get Zoom link on WhatsApp',
      zoomTg: 'Get Zoom link on Telegram',
      tag: 'Our broker partner is <b>TAG Markets</b> (T-A-G, not ZAG). You open your trading account there and trade on <b>MetaTrader 5</b>, then connect <b>Copy X</b> to SONIC.AI.',
      platform: 'Platforms: <b>MetaTrader 5</b> (your TAG Markets trading account) and <b>Copy X</b> — the copy-trading app where you search “Sonic” and connect to SONIC.AI.',
      bix: '<b>BIX Card</b> is available as a secondary product. Our team can share the details — message us 👇',
      soon: function (n) { return '<b>' + n + '</b> — coming soon. Available now: SONIC.AI Gold copy-trading and BIX Card.'; },
      nomoney: "That's completely okay — please never deposit money you need for daily life. 💛<br><br>You can start by <b>learning for free</b>: join our daily Zoom (2 PM, 4 PM, 6 PM Dubai time) and our FREE Public Channel. No pressure — start only when it's affordable.",
      geo: 'Sorry, X FUSION is not available in your region due to local regulations.',
      greet: 'Hi! 👋 What would you like to know?',
      thanks: "You're welcome! Anything else I can help with?",
      human: 'Sure — message our team directly 👇',
      fallback: "I'm not sure about that one, and I don't want to guess. I can help with: how to start, SONIC.AI, complan, boost & risk, TAG Markets, Zoom schedule and safety. Or ask our team directly 👇",
      chips: {
        start: 'How to start? 💰', sonic: 'What is SONIC.AI?', complan: 'Complan / Earnings', safety: 'Is it safe? ⚠️', zoom: 'Join Zoom',
        boost: 'Boost & risk math', tag: 'About TAG Markets'
      }
    },
    tl: {
      risk: '⚠️ May risk ang trading. Hindi garantiya ng future results ang nakaraang performance. Walang garantisadong kita. Mag-risk lang ng perang kaya mong mawala.',
      placeholder: 'I-type ang tanong mo…',
      linkSoon: 'Inaayos pa ang link na ito — idadagdag ito ng team namin agad.',
      steps: function () {
        return '<b>Paano magsimula sa X FUSION</b><ol><li>Gumawa ng FREE account dito: <a href="' + LINKS.signup.replace(/&/g, '&amp;') + '" target="_blank" rel="noopener">Mag-sign up sa X FUSION IB-Portal</a></li>' +
          '<li>Mag-deposit ng <b>$10 pataas</b> — kung kaya lang ng budget</li><li>I-connect ang Copy X sa SONIC.AI</li></ol>' +
          'May risk ang trading. Hindi garantiya ng future results ang nakaraang performance. Walang garantisadong kita.';
      },
      minNote: function (d) { return 'Ang minimum deposit ay <b>$10</b> — mas mababa ang ' + money(d) + '. $10 ang gamit sa example sa ibaba.'; },
      boost: function (d) {
        return '<b>Boost / exposure — example sa ' + money(d) + '</b><ul>' +
          '<li>Copy trade SONIC.AI = <b>x24</b> → <b>' + money(d * 24) + '</b> MT5 exposure</li>' +
          '<li>Manual trade = <b>x12</b> → ' + money(d * 12) + ' MT5 exposure</li></ul>' +
          'Ito ay <b>exposure, HINDI cash na pwedeng i-withdraw</b>.' +
          '<span class="xara-math"><b>Risk math sa x24:</b> kapag 1% ang galaw laban sa iyo = <b>-' + money(d * 0.24) + '</b> = <b>-24%</b> ng ' + money(d) + ' mo. Kapag <b>4.17%</b> ang adverse move = <b>ubos</b> ang account.<br>Sa x12: 1% = -12% ng deposit, 8.33% adverse = ubos.</span>';
      },
      leadIntro: 'Handa ka na? Dito magsimula 👇',
      leadSignup: '🚀 Gumawa ng FREE Account — Sign Up',
      zoomSignup: 'Mag-register ka muna dito para matulungan ka namin pagkatapos ng Zoom 👇',
      leadTg: 'Sumali sa FREE Public Channel',
      leadWa: 'Mag-private message sa WhatsApp',
      sonic: 'Ang <b>SONIC.AI</b> ay AI Gold (XAU/USD) copy-trading strategy na ginagamit namin sa <b>Copy X</b>, sa MetaTrader 5 kasama ang TAG Markets.<br><br><b>Myfxbook (snapshot 5 Nov 2026)</b><ul>' +
        '<li>Gain <b>+31.40%</b> · Abs. Gain <b>+29.48%</b></li><li>Monthly <b>1.13%</b> · Drawdown <b>0.86%</b></li>' +
        '<li>Balance <b>$141,236.01</b> · Profit <b>$35,662.50</b></li></ul>' +
        '<b>Copy X:</b> 790,300 followers · 236 trading days · Performance fee 30% (70% sa iyo).',
      complan: '<b>X FUSION Complan</b> — may kita lang kapag may <b>totoong market gains</b>.<ul>' +
        '<li><b>Hatian:</b> 70% client / 25% affiliate / 5% trader</li>' +
        '<li><b>Lot commission:</b> L1 $2 · L2–L4 $1 · L5–L10 $0.50</li>' +
        '<li><b>Profit share (15.5% total):</b> L1 3.5% · L2 2.5% · L3 2% · L4–L7 0.5% bawat isa · L8 1.5% · L9 2% · L10 2%</li>' +
        '<li><b>Infinity Bonus:</b> 10K volume 1.5% hanggang 40M volume 7.5%</li>' +
        '<li><b>Pool:</b> $500K = 1% + $1/lot · $1M = 1% + $1.5/lot</li></ul>' +
        'Walang ipinapangakong kita — nakadepende ito sa totoong trading results at totoong activity.',
      safety: '<b>Tapat na sagot:</b> walang investment na walang risk, at walang garantiya dito.' +
        '<ul><li>Gumagamit ang SONIC.AI ng <b>x24 exposure</b> — kayang ubusin ng 4.17% adverse move ang deposit.</li>' +
        '<li><b>FSC Mauritius:</b> nakalista ang TAG Markets bilang Investment Dealer (28/03/2024), pero hindi makita sa register ang licence GB21026474 / tagmarkets.com.</li>' +
        '<li><b>FSCA South Africa:</b> FSP 55237 — Category I lang (advice).</li>' +
        '<li><b>Regulator warnings:</b> Austria FMA (20 Feb 2026), Luxembourg CSSF (10 Jun 2026), Québec AMF (18 Sep 2026).</li></ul>' +
        'I-verify mo muna sa bawat register bago mag-deposit.',
      zoom: function (t) {
        return '<b>Araw-araw na live Zoom</b> — 2 PM, 4 PM at 6 PM Dubai time (GMT+4).' + (t ? '<br>Sa oras mo: <b>' + t + '</b>.' : '') +
          '<br><br>Ipapadala ko ang Zoom link sa WhatsApp/Telegram 👇';
      },
      zoomWa: 'Kunin ang Zoom link sa WhatsApp',
      zoomTg: 'Kunin ang Zoom link sa Telegram',
      tag: 'Ang broker partner namin ay <b>TAG Markets</b> (T-A-G, hindi ZAG). Doon ka magbubukas ng trading account at mag-trade sa <b>MetaTrader 5</b>, tapos i-connect ang <b>Copy X</b> sa SONIC.AI.',
      platform: 'Platforms: <b>MetaTrader 5</b> (ang TAG Markets trading account mo) at <b>Copy X</b> — ang copy-trading app kung saan hahanapin mo ang “Sonic” at ico-connect sa SONIC.AI.',
      bix: 'Available ang <b>BIX Card</b> bilang secondary product. Ibibigay ng team namin ang details — mag-message ka 👇',
      soon: function (n) { return '<b>' + n + '</b> — coming soon. Available ngayon: SONIC.AI Gold copy-trading at BIX Card.'; },
      nomoney: 'Okay lang talaga iyan — huwag mong i-deposit ang perang kailangan mo sa araw-araw. 💛<br><br>Pwede kang magsimula sa <b>libreng pag-aaral</b>: sumali sa daily Zoom namin (2 PM, 4 PM, 6 PM Dubai time) at sa FREE Public Channel. Walang pressure — magsimula ka lang kapag kaya na.',
      geo: 'Pasensya na, hindi available ang X FUSION sa lugar mo dahil sa local regulations.',
      greet: 'Hello po! 👋 Ano ang gusto mong malaman?',
      thanks: 'Walang anuman! May iba ka pa bang tanong?',
      human: 'Sige — i-message mo ang team namin 👇',
      fallback: 'Hindi ako sigurado diyan, at ayokong manghula. Matutulungan kita sa: paano magsimula, SONIC.AI, complan, boost at risk, TAG Markets, Zoom schedule at safety. O i-message mo ang team namin 👇',
      chips: {
        start: 'Paano magsimula? 💰', sonic: 'Ano ang SONIC.AI?', complan: 'Complan / Kita', safety: 'Ligtas ba? ⚠️', zoom: 'Sumali sa Zoom',
        boost: 'Boost at risk math', tag: 'Tungkol sa TAG Markets'
      }
    }
  };

  /* ---------------- Language detection ---------------- */
  var TL_STRONG = ['paano','pano','ano','magkano','po','ng','mga','wala','walang','pera','kumita','sumali','gusto','pwede','puwede','saan','kailan','bakit','salamat','hindi','talaga','ligtas','magsimula','kumusta','kamusta','musta','yung','naman','kasi','lang','nyo','niyo','natin','ba','opo','totoo','meron','dito','ilan','sino','kayo','ako','akin','ikaw','iyo','kita','magdeposit','mag-deposit','mag-start','sali','puhunan','kaya','sana','pala','din','rin','ito','iyan','yan'];
  var TL_WEAK = ['sa','na','ko','mo','ka','oo','tayo','siya','may'];
  var lang = 'en';
  function detectLang(text) {
    var words = text.toLowerCase().match(/[a-zñ'-]+/g) || [];
    var score = 0, en = 0;
    words.forEach(function (w) {
      if (TL_STRONG.indexOf(w) !== -1) score += 2;
      else if (TL_WEAK.indexOf(w) !== -1) score += 1;
      else if (w.length > 2) en += 1;
    });
    if (score >= 2) return 'tl';
    if (en >= 2) return 'en';
    return lang;
  }

  /* ---------------- Intents ---------------- */
  var INTENTS = [
    ['geo', /austria|österreich|osterreich|luxemb(o|u)rg|qu[eé]bec/],
    ['nomoney', /no money|don'?t have (any )?money|can'?t afford|cannot afford|\bbroke\b|no budget|walang pera|wala (akong|pa akong|ako ng|pa) ?pera|kulang (ang |sa )?pera|walang (pambayad|budget|puhunan)|wala akong puhunan/],
    ['soon', /neo ?\.? ?fx|\bbit ?1\b|bit exchange|bitexchange/],
    ['bix', /\bbix\b|\bcard\b/],
    ['zoom', /zoom|meeting|webinar|live session|orientation|presentation|schedule/],
    ['complan', /complan|comp plan|compensation|\bearn|income|\bkita\b|kumita|commission|komisyon|affiliate|referr|recruit|profit share|infinity|bonus|\bpool\b|downline|70\/25\/5|\bsplit\b|hatian/],
    ['start', /\bstart|\bbegin|\bjoin\b|sign ?-?up|regist|create (an |a |my )?account|mag-?register|magpa-?rehistro|rehistro|open (an |a )?account|\bdeposit|\binvest|minimum|how much|paano.*(simula|sali|start|mag)|magsimula|sumali|\bsali\b|mag-?start|mag-?deposit|magkano|puhunan/],
    ['boost', /x ?24|x ?12|\bboost|exposure|leverage|\bwipe|margin|liquidat|\blugi|\btalo\b/],
    ['sonic', /sonic|myfxbook|performance|track record|\bgain|drawdown|\bresult|\bsignal|\bbot\b|robot/],
    ['safety', /\bsafe|scam|legit|\brisk|regulat|licen[cs]e|ligtas|totoo|guarantee|garantiya|sure profit|sigurado|\btrust|\bfsca?\b|\bfma\b|cssf|\bamf\b|warning/],
    ['tag', /\btag\b|tag markets|\bzag\b|\bbroker/],
    ['platform', /\bmt5\b|metatrader|meta trader|copy ?-?x|copy trad|platform|\bapp\b/],
    ['human', /human|\bagent|real person|\btao\b|your team|whatsapp|telegram|contact|kausap|\badmin|support|private message/],
    ['greet', /^(hi|hello|hey|yo|good (morning|afternoon|evening)|kumusta|kamusta|musta|magandang)\b/],
    ['thanks', /thank|salamat|\bty\b|tnx/]
  ];
  function intentOf(text) {
    var t = text.toLowerCase();
    for (var i = 0; i < INTENTS.length; i++) if (INTENTS[i][1].test(t)) return INTENTS[i][0];
    return 'fallback';
  }
  function amountOf(text) {
    var m = text.replace(/,/g, '').match(/\$\s?(\d+(?:\.\d+)?)|(\d+(?:\.\d+)?)\s?(?:usd|dollars?|\$)/i);
    return m ? parseFloat(m[1] || m[2]) : null;
  }

  function zoomLocal() {
    try {
      var tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (!tz || tz === 'Asia/Dubai' || tz === 'Asia/Muscat') return '';
      var now = new Date(), fmt = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' });
      var times = [14, 16, 18].map(function (h) {
        return fmt.format(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), h - 4, 0)));
      });
      return times.join(', ') + ' (' + tz.replace(/_/g, ' ') + ')';
    } catch (e) { return ''; }
  }

  /* ---------------- Replies ---------------- */
  var geoBlocked = false;
  function leadActs(L) {
    return [{ label: L.leadSignup, href: LINKS.signup, kind: 'primary' }, { label: L.leadTg, href: LINKS.telegram, kind: 'primary' }, { label: L.leadWa, href: LINKS.whatsapp, kind: 'ghost' }];
  }
  function chipsFor(L, keys) { return keys.map(function (k) { return L.chips[k]; }); }

  function reply(intent, text) {
    var L = T[lang], out = [];
    if (intent === 'geo') geoBlocked = true;
    if (geoBlocked && /^(geo|start|boost|human|zoom|tag|platform)$/.test(intent)) return [{ html: L.geo }];

    switch (intent) {
      case 'start': {
        var d = amountOf(text), note = '';
        if (d !== null && d < 10) { note = L.minNote(d); d = 10; }
        if (d === null) d = 100;
        out.push({ html: L.steps() });
        out.push({ html: (note ? note + '<br><br>' : '') + L.boost(d) + '<span class="xara-risk">' + L.risk + '</span>' });
        out.push({ html: L.leadIntro, acts: leadActs(L), chips: chipsFor(L, ['complan', 'safety', 'zoom']) });
        break;
      }
      case 'boost': {
        var b = amountOf(text);
        out.push({ html: L.boost(b && b >= 10 ? b : 100) + '<span class="xara-risk">' + L.risk + '</span>', chips: chipsFor(L, ['start', 'safety']) });
        break;
      }
      case 'complan':
        out.push({ html: L.complan + '<span class="xara-risk">' + L.risk + '</span>', chips: chipsFor(L, ['start', 'boost', 'zoom']) });
        break;
      case 'sonic':
        out.push({ html: L.sonic + '<span class="xara-risk">' + L.risk + '</span>', chips: chipsFor(L, ['boost', 'start', 'safety']) });
        break;
      case 'safety':
        out.push({ html: L.safety + '<span class="xara-risk">' + L.risk + '</span>', chips: chipsFor(L, ['boost', 'zoom']) });
        break;
      case 'zoom':
        out.push({ html: L.zoom(zoomLocal()), acts: [{ label: L.zoomWa, href: LINKS.whatsapp, kind: 'primary' }, { label: L.zoomTg, href: LINKS.telegram, kind: 'ghost' }] });
        out.push({ html: L.zoomSignup, acts: [{ label: L.leadSignup, href: LINKS.signup, kind: 'primary' }] });
        break;
      case 'tag':
        out.push({ html: L.tag, chips: chipsFor(L, ['start', 'safety']) });
        break;
      case 'platform':
        out.push({ html: L.platform, chips: chipsFor(L, ['sonic', 'start']) });
        break;
      case 'bix':
        out.push({ html: L.bix, acts: [{ label: L.leadWa, href: LINKS.whatsapp, kind: 'ghost' }] });
        break;
      case 'soon': {
        var n = /neo/i.test(text) ? 'NEO.FX' : 'Bit1 / BIT Exchange';
        out.push({ html: L.soon(n), chips: chipsFor(L, ['sonic', 'complan']) });
        break;
      }
      case 'nomoney':
        out.push({ html: L.nomoney, acts: [{ label: L.leadTg, href: LINKS.telegram, kind: 'ghost' }], chips: chipsFor(L, ['zoom', 'sonic']) });
        break;
      case 'geo':
        out.push({ html: L.geo });
        break;
      case 'human':
        out.push({ html: L.human, acts: leadActs(L) });
        break;
      case 'greet':
        out.push({ html: L.greet, chips: chipsFor(L, ['start', 'sonic', 'complan', 'safety', 'zoom']) });
        break;
      case 'thanks':
        out.push({ html: L.thanks, chips: chipsFor(L, ['start', 'zoom']) });
        break;
      default:
        out.push({ html: L.fallback, acts: leadActs(L), chips: chipsFor(L, ['start', 'sonic', 'complan']) });
    }
    return out;
  }

  /* ---------------- DOM ---------------- */
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  var style = el('style'); style.textContent = css; document.head.appendChild(style);

  var root = el('div', 'xara');
  root.innerHTML =
    '<button class="xara-launch" type="button" aria-label="Open XARA AI chat" aria-expanded="false" aria-controls="xaraPanel">' +
      '<span class="xara-tag"><b>XARA AI</b></span>' +
      '<span class="xara-orb"><img src="' + AVATAR + '" alt="" width="64" height="64"><span class="xara-dot" title="Online"></span></span>' +
    '</button>' +
    '<section class="xara-panel" id="xaraPanel" role="dialog" aria-modal="false" aria-label="XARA AI chat">' +
      '<header class="xara-head">' +
        '<img src="' + AVATAR + '" alt="" width="42" height="42">' +
        '<div><p class="xara-title"><b>XARA AI</b> — X FUSION Assistant</p><p class="xara-status"><i></i>Online • Replies instantly</p></div>' +
        '<button class="xara-x" type="button" aria-label="Close chat"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
      '</header>' +
      '<div class="xara-log" role="log" aria-live="polite"></div>' +
      '<form class="xara-form" autocomplete="off">' +
        '<input type="text" name="q" maxlength="400" aria-label="Message XARA AI">' +
        '<button class="xara-send" type="submit" aria-label="Send"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h13M12 5l7 7-7 7"/></svg></button>' +
      '</form>' +
      '<p class="xara-foot">XARA gives general info only, not financial advice.</p>' +
    '</section>';
  document.body.appendChild(root);

  var launch = root.querySelector('.xara-launch'), panel = root.querySelector('.xara-panel');
  var log = root.querySelector('.xara-log'), form = root.querySelector('.xara-form'), input = form.querySelector('input');
  var started = false, busy = false, lastFocus = null, mobileMq = window.matchMedia('(max-width:767px)');
  input.placeholder = T.en.placeholder;

  function scrollDown() { log.scrollTop = log.scrollHeight; }

  function addBot(m) {
    var row = el('div', 'xara-row bot');
    row.appendChild(el('img', null)).src = AVATAR;
    row.firstChild.alt = ''; row.firstChild.width = 32; row.firstChild.height = 32;
    row.appendChild(el('div', 'xara-msg', m.html));
    log.appendChild(row);
    if (m.acts) {
      var acts = el('div', 'xara-acts');
      m.acts.forEach(function (a) {
        var link = el('a', 'xara-act ' + a.kind);
        link.textContent = a.label; link.href = a.href;
        if (!/^#/.test(a.href)) { link.target = '_blank'; link.rel = 'noopener noreferrer'; }
        acts.appendChild(link);
      });
      log.appendChild(acts);
    }
    if (m.chips && m.chips.length) {
      var chips = el('div', 'xara-chips');
      m.chips.forEach(function (c) {
        var b = el('button', 'xara-chip'); b.type = 'button'; b.textContent = c;
        chips.appendChild(b);
      });
      log.appendChild(chips);
    }
    scrollDown();
  }
  function addUser(text) {
    var row = el('div', 'xara-row user'), msg = el('div', 'xara-msg');
    msg.textContent = text;
    row.appendChild(msg); log.appendChild(row); scrollDown();
  }
  function typing(on) {
    var t = log.querySelector('.xara-typing-row');
    if (on && !t) {
      t = el('div', 'xara-row bot xara-typing-row');
      t.innerHTML = '<img src="' + AVATAR + '" alt="" width="32" height="32"><div class="xara-msg xara-typing" aria-label="XARA is typing"><i></i><i></i><i></i></div>';
      log.appendChild(t); scrollDown();
    } else if (!on && t) t.remove();
  }

  function ask(text, fromChip) {
    text = String(text || '').trim();
    if (!text || busy) return;
    addUser(text);
    if (!fromChip) lang = detectLang(text);
    input.placeholder = T[lang].placeholder;
    var msgs = reply(intentOf(text), text);
    busy = true;
    var i = 0;
    (function next() {
      typing(true);
      setTimeout(function () {
        typing(false);
        addBot(msgs[i++]);
        if (i < msgs.length) next(); else busy = false;
      }, i === 0 ? TYPING_MS : 450);
    })();
  }

  function open() {
    if (root.classList.contains('open')) return;
    lastFocus = document.activeElement;
    root.classList.add('open');
    launch.setAttribute('aria-expanded', 'true');
    if (mobileMq.matches) document.documentElement.style.overflow = 'hidden';
    if (!started) {
      started = true;
      addBot({
        html: T.en.welcome + '<span class="xara-risk">' + T.en.risk + '</span>',
        acts: [{ label: T.en.leadSignup, href: LINKS.signup, kind: 'primary' }],
        chips: [T.en.chips.start, T.en.chips.sonic, T.en.chips.complan, T.en.chips.safety, T.en.chips.zoom]
      });
    }
    setTimeout(function () { (mobileMq.matches ? root.querySelector('.xara-x') : input).focus(); }, 50);
  }
  function close() {
    root.classList.remove('open');
    launch.setAttribute('aria-expanded', 'false');
    document.documentElement.style.overflow = '';
    (lastFocus && lastFocus.focus ? lastFocus : launch).focus();
  }

  launch.addEventListener('click', open);
  root.querySelector('.xara-x').addEventListener('click', close);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && root.classList.contains('open')) close(); });
  form.addEventListener('submit', function (e) { e.preventDefault(); var v = input.value; input.value = ''; ask(v); });
  log.addEventListener('click', function (e) {
    var chip = e.target.closest('.xara-chip');
    if (chip) { ask(chip.textContent, true); return; }
    var act = e.target.closest('.xara-act');
    if (act && /^#/.test(act.getAttribute('href'))) { e.preventDefault(); addBot({ html: T[lang].linkSoon }); }
  });
  // "Chat With Us" (and anything else marked) opens XARA instead of jumping.
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-xara-open]');
    if (t) { e.preventDefault(); open(); }
  });

  window.XARA = { open: open, close: close, ask: function (q) { open(); ask(q); } };
})();
