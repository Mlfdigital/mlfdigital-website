/* MLF Digital – AI-sekretær (chatboble). Bruk:
   <script src="/sekretaer.js" defer data-api="https://ai.mlfdigital.no" data-bedrift="mlf"
     data-navn="MLF Digital" data-tlf="466 30 507" data-epost="post@eksempel.no"
     data-lead="https://jarvis.mlfdigital.no/m/kontakt" data-farge="#d4a54a"
     data-forslag="Hva koster en nettside?|Hvordan jobber du?|Jeg vil ha en gratis demo"></script>
   Alt kundetekst og AI-svar settes med textContent – aldri som HTML. */
(function () {
  "use strict";
  var s = document.currentScript || document.querySelector("script[data-bedrift]");
  if (!s || window.__mlfSekretaer) return;
  window.__mlfSekretaer = true;
  var d = s.dataset;
  var C = {
    api: (d.api || "").replace(/\/$/, ""),
    b: d.bedrift || "mlf",
    navn: d.navn || "oss",
    tlf: d.tlf || "",
    epost: d.epost || "",
    lead: d.lead || "",
    farge: /^#[0-9a-f]{3,8}$/i.test(d.farge || "") ? d.farge : "#d4a54a",
    mb: Math.min(200, Math.max(0, parseInt(d.bunnMobil, 10) || 16)),
    forslag: (d.forslag || "Hva koster det?|Hvordan fungerer det?|Jeg vil bli kontaktet").split("|").slice(0, 4),
    hilsen: d.hilsen || "Hei! Jeg er den digitale sekretæren til " + (d.navn || "oss") + ". Spør meg om priser, tjenester eller hvordan vi jobber – jeg svarer med en gang."
  };
  var NOKKEL = "mlf-sekretaer-" + C.b;
  var lagre = function (v) { try { sessionStorage.setItem(NOKKEL, JSON.stringify(v)); } catch (_) {} };
  var hent = function () { try { return JSON.parse(sessionStorage.getItem(NOKKEL) || "null"); } catch (_) { return null; } };
  var st = hent() || { m: [], sendt: false };

  var vert = document.createElement("div");
  vert.id = "mlf-sekretaer";
  vert.style.cssText = "position:fixed;z-index:2147483000;right:0;bottom:0;width:0;height:0";
  var rot = vert.attachShadow ? vert.attachShadow({ mode: "open" }) : vert;

  var css = "" +
    ":host{all:initial}*{box-sizing:border-box;font-family:Inter,system-ui,-apple-system,'Segoe UI',sans-serif}" +
    ".boble{position:fixed;right:20px;bottom:20px;width:62px;height:62px;border-radius:50%;border:0;cursor:pointer;background:linear-gradient(135deg,#f6dc94,VAR 50%,#8a6224);color:#140f05;box-shadow:0 12px 34px rgba(0,0,0,.45),0 0 0 0 rgba(212,165,74,.55);display:flex;align-items:center;justify-content:center;transition:transform .35s cubic-bezier(.2,1.4,.4,1);animation:puls 2.8s ease-out 1.5s 3}" +
    ".boble:hover{transform:scale(1.08) rotate(-6deg)}.boble:focus-visible{outline:3px solid #fff;outline-offset:3px}" +
    ".boble.aapen{transform:scale(.9)}" +
    ".merke{position:absolute;top:-2px;right:-2px;width:18px;height:18px;border-radius:50%;background:#e5484d;color:#fff;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;border:2px solid #070707}" +
    ".hint{position:fixed;right:92px;bottom:32px;max-width:220px;background:#f5efe3;color:#141210;padding:10px 14px;border-radius:14px 14px 4px 14px;font-size:14px;line-height:1.35;box-shadow:0 10px 30px rgba(0,0,0,.35);opacity:0;transform:translateY(8px);transition:.4s;pointer-events:none}" +
    ".hint.vis{opacity:1;transform:none}" +
    ".panel{position:fixed;right:20px;bottom:96px;width:380px;max-width:calc(100vw - 24px);height:min(600px,calc(100vh - 120px));background:#0e0d0b;color:#f5efe3;border:1px solid rgba(246,220,148,.18);border-radius:22px;box-shadow:0 30px 80px rgba(0,0,0,.6);display:flex;flex-direction:column;overflow:hidden;transform-origin:bottom right;transform:translateY(16px) scale(.94);opacity:0;visibility:hidden;transition:transform .45s cubic-bezier(.2,1.2,.3,1),opacity .25s,visibility 0s .45s}" +
    ".panel.aapen{transform:none;opacity:1;visibility:visible;transition:transform .45s cubic-bezier(.2,1.2,.3,1),opacity .25s}" +
    ".topp{padding:16px 16px 14px;display:flex;align-items:center;gap:12px;background:radial-gradient(120% 140% at 0% 0%,rgba(246,220,148,.16),transparent 60%);border-bottom:1px solid rgba(255,255,255,.07)}" +
    ".ava{width:42px;height:42px;border-radius:50%;background:linear-gradient(135deg,#f6dc94,VAR 50%,#8a6224);display:flex;align-items:center;justify-content:center;color:#140f05;flex:none}" +
    ".tittel{font-weight:600;font-size:15px}.status{font-size:12px;color:#b8b0a4;display:flex;align-items:center;gap:6px;margin-top:2px}" +
    ".prikk{width:7px;height:7px;border-radius:50%;background:#5bd68a;box-shadow:0 0 0 3px rgba(91,214,138,.18)}" +
    ".lukk{margin-left:auto;width:44px;height:44px;border:0;border-radius:12px;background:transparent;color:#f5efe3;cursor:pointer;display:flex;align-items:center;justify-content:center}.lukk:hover{background:rgba(255,255,255,.07)}" +
    ".logg{flex:1;overflow-y:auto;padding:16px 14px;display:flex;flex-direction:column;gap:10px;scroll-behavior:smooth}" +
    ".m{max-width:84%;padding:10px 13px;font-size:14.5px;line-height:1.45;white-space:pre-line;word-wrap:break-word;animation:inn .3s cubic-bezier(.2,1.2,.4,1)}" +
    ".m.a{align-self:flex-start;background:#1b1916;border:1px solid rgba(255,255,255,.06);border-radius:16px 16px 16px 4px}" +
    ".m.u{align-self:flex-end;background:linear-gradient(135deg,#f6dc94,VAR);color:#140f05;border-radius:16px 16px 4px 16px}" +
    ".skriver{align-self:flex-start;display:flex;gap:5px;padding:13px 14px;background:#1b1916;border-radius:16px}" +
    ".skriver i{width:7px;height:7px;border-radius:50%;background:#b8b0a4;animation:prikk 1s infinite}.skriver i:nth-child(2){animation-delay:.15s}.skriver i:nth-child(3){animation-delay:.3s}" +
    ".chips{display:flex;flex-wrap:wrap;gap:8px;padding:0 14px 10px}" +
    ".chip{min-height:36px;padding:0 13px;border-radius:999px;border:1px solid rgba(246,220,148,.35);background:transparent;color:#f6dc94;font-size:13px;cursor:pointer;transition:.2s}.chip:hover{background:rgba(246,220,148,.1)}" +
    ".skjema{align-self:stretch;background:#1b1916;border:1px solid rgba(246,220,148,.25);border-radius:16px;padding:12px;display:flex;flex-direction:column;gap:8px;animation:inn .35s}" +
    ".skjema b{font-size:14px}.skjema label{font-size:12px;color:#b8b0a4}" +
    ".skjema input{height:42px;border-radius:10px;border:1px solid rgba(255,255,255,.14);background:#0e0d0b;color:#f5efe3;padding:0 12px;font-size:15px}" +
    ".skjema .send2{height:44px;border:0;border-radius:12px;background:linear-gradient(135deg,#f6dc94,VAR 50%,#8a6224);color:#140f05;font-weight:700;font-size:15px;cursor:pointer}" +
    ".honning{position:absolute;left:-9999px;width:1px;height:1px;opacity:0}" +
    ".ok{align-self:center;background:rgba(91,214,138,.12);color:#8fe3b0;border-radius:999px;padding:7px 13px;font-size:13px;font-weight:600}" +
    ".bunn{display:flex;gap:8px;padding:10px 12px 8px;border-top:1px solid rgba(255,255,255,.07)}" +
    ".bunn input{flex:1;min-width:0;height:46px;border-radius:999px;border:1px solid rgba(255,255,255,.14);background:#1b1916;color:#f5efe3;padding:0 16px;font-size:15px;outline:none}.bunn input:focus{border-color:VAR}" +
    ".send{width:46px;height:46px;flex:none;border-radius:50%;border:0;cursor:pointer;background:linear-gradient(135deg,#f6dc94,VAR 50%,#8a6224);color:#140f05;display:flex;align-items:center;justify-content:center;transition:transform .2s}.send:active{transform:scale(.9)}" +
    ".fot{text-align:center;font-size:11px;color:#8d867b;padding:0 0 9px}" +
    ".skjult{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}" +
    "@keyframes inn{from{opacity:0;transform:translateY(8px) scale(.98)}to{opacity:1;transform:none}}" +
    "@keyframes prikk{0%,80%,100%{opacity:.25;transform:translateY(0)}40%{opacity:1;transform:translateY(-3px)}}" +
    "@keyframes puls{0%{box-shadow:0 12px 34px rgba(0,0,0,.45),0 0 0 0 rgba(212,165,74,.55)}100%{box-shadow:0 12px 34px rgba(0,0,0,.45),0 0 0 22px rgba(212,165,74,0)}}" +
    "@media (max-width:980px){.panel{bottom:calc(MBpx + 76px);height:min(600px,calc(100vh - MBpx - 100px))}.boble{bottom:MBpx}.hint{bottom:calc(MBpx + 10px)}}" +
    "@media (max-width:520px){.panel{right:0;left:0;bottom:0;width:100%;max-width:none;height:calc(100dvh - 60px);border-radius:22px 22px 0 0}.boble{right:16px;bottom:MBpx}.boble.aapen{opacity:0;pointer-events:none}.hint{right:86px;bottom:calc(MBpx + 10px)}}" +
    "@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}";
  var stil = document.createElement("style");
  stil.textContent = css.split("VAR").join(C.farge).split("MB").join(String(C.mb));
  rot.appendChild(stil);

  function el(tag, cls, tekst) { var e = document.createElement(tag); if (cls) e.className = cls; if (tekst != null) e.textContent = tekst; return e; }
  function ikon(sti, str) {
    var ns = "http://www.w3.org/2000/svg", v = document.createElementNS(ns, "svg");
    v.setAttribute("width", str || 22); v.setAttribute("height", str || 22); v.setAttribute("viewBox", "0 0 24 24");
    v.setAttribute("fill", "none"); v.setAttribute("stroke", "currentColor"); v.setAttribute("stroke-width", "2");
    v.setAttribute("stroke-linecap", "round"); v.setAttribute("stroke-linejoin", "round"); v.setAttribute("aria-hidden", "true");
    sti.forEach(function (p) { var e = document.createElementNS(ns, "path"); e.setAttribute("d", p); v.appendChild(e); });
    return v;
  }
  var CHAT = ["M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z", "M8.5 11h.01M12 11h.01M15.5 11h.01"];
  var X = ["M18 6 6 18", "M6 6l12 12"];

  var boble = el("button", "boble"); boble.type = "button";
  boble.setAttribute("aria-label", "Chat med " + C.navn); boble.setAttribute("aria-expanded", "false");
  boble.appendChild(ikon(CHAT, 26));
  var merke = el("span", "merke", "1"); merke.setAttribute("aria-hidden", "true"); boble.appendChild(merke);
  var hint = el("div", "hint", "Lurer du på noe? Jeg svarer med en gang.");
  hint.setAttribute("aria-hidden", "true");

  var panel = el("div", "panel"); panel.setAttribute("role", "dialog"); panel.setAttribute("aria-label", "Chat med " + C.navn);
  var topp = el("div", "topp"); var ava = el("div", "ava"); ava.appendChild(ikon(CHAT, 22));
  var tt = el("div"); tt.appendChild(el("div", "tittel", "Sekretæren til " + C.navn));
  var sta = el("div", "status"); sta.appendChild(el("span", "prikk")); sta.appendChild(document.createTextNode("Svarer med en gang – døgnet rundt")); tt.appendChild(sta);
  var lukk = el("button", "lukk"); lukk.type = "button"; lukk.setAttribute("aria-label", "Lukk chatten"); lukk.appendChild(ikon(X, 20));
  topp.appendChild(ava); topp.appendChild(tt); topp.appendChild(lukk);
  var logg = el("div", "logg"); logg.setAttribute("aria-live", "polite");
  var chips = el("div", "chips");
  var bunn = el("form", "bunn");
  var lab = el("label", "skjult", "Skriv et spørsmål"); lab.htmlFor = "mlf-spm";
  var inp = el("input"); inp.id = "mlf-spm"; inp.placeholder = "Skriv et spørsmål …"; inp.autocomplete = "off"; inp.maxLength = 600;
  var send = el("button", "send"); send.type = "submit"; send.setAttribute("aria-label", "Send"); send.appendChild(ikon(["M5 12h14", "M13 6l6 6-6 6"], 18));
  bunn.appendChild(lab); bunn.appendChild(inp); bunn.appendChild(send);
  var fot = el("div", "fot", "AI-sekretær levert av MLF Digital · svar kan inneholde feil");
  panel.appendChild(topp); panel.appendChild(logg); panel.appendChild(chips); panel.appendChild(bunn); panel.appendChild(fot);
  rot.appendChild(hint); rot.appendChild(panel); rot.appendChild(boble);

  var opptatt = false, skriver = null;
  function rull() { logg.scrollTop = logg.scrollHeight; }
  function vis(r, t) { logg.appendChild(el("div", "m " + r, t)); rull(); }
  function visChips() {
    chips.textContent = "";
    if (st.m.length > 1) return;
    C.forslag.forEach(function (f) {
      var c = el("button", "chip", f); c.type = "button";
      c.onclick = function () { spor(f); }; chips.appendChild(c);
    });
  }
  function tegn() {
    logg.textContent = "";
    vis("a", C.hilsen);
    st.m.forEach(function (x) { vis(x.r, x.t); });
    if (st.sendt) logg.appendChild(el("div", "ok", "Sendt – " + C.navn + " tar kontakt"));
    visChips(); rull();
  }

  function visSkjema() {
    if (st.sendt || logg.querySelector(".skjema")) return;
    var f = el("form", "skjema");
    f.appendChild(el("b", null, "Legg igjen kontaktinfo, så tar " + C.navn + " kontakt"));
    var l1 = el("label", null, "Navn"), i1 = el("input"); i1.id = "mlf-n"; l1.htmlFor = "mlf-n"; i1.required = true; i1.maxLength = 80; i1.autocomplete = "name";
    var l2 = el("label", null, "Telefon eller e-post"), i2 = el("input"); i2.id = "mlf-k"; l2.htmlFor = "mlf-k"; i2.required = true; i2.maxLength = 120; i2.autocomplete = "tel";
    var hp = el("input", "honning"); hp.tabIndex = -1; hp.setAttribute("aria-hidden", "true"); hp.autocomplete = "off";
    var b = el("button", "send2", "Send"); b.type = "submit";
    [l1, i1, l2, i2, hp, b].forEach(function (x) { f.appendChild(x); });
    f.onsubmit = function (e) {
      e.preventDefault();
      var navn = i1.value.trim(), kontakt = i2.value.trim();
      if (!navn || !kontakt) return;
      b.disabled = true; b.textContent = "Sender …";
      var samtale = st.m.slice(-10).map(function (x) { return (x.r === "u" ? "Kunde: " : "Sekretær: ") + x.t; }).join("\n").slice(-1400);
      var data = { navn: navn, kontakt: kontakt, hva: "Fra AI-sekretæren", om: samtale, nettside: hp.value };
      var ferdig = function (ok) {
        f.remove();
        if (ok) { st.sendt = true; lagre(st); logg.appendChild(el("div", "ok", "Sendt – " + C.navn + " tar kontakt")); vis("a", "Takk, " + navn + "! Beskjeden er sendt. Haster det, ring " + C.tlf + "."); }
        else {
          vis("a", "Jeg fikk ikke sendt beskjeden. Ring " + C.tlf + (C.epost ? " eller send e-post til " + C.epost : "") + ".");
          if (C.epost) { try { location.href = "mailto:" + C.epost + "?subject=" + encodeURIComponent("Henvendelse fra chatten – " + navn) + "&body=" + encodeURIComponent("Navn: " + navn + "\nKontakt: " + kontakt + "\n\n" + samtale); } catch (_) {} }
        }
      };
      if (!C.lead) return ferdig(false);
      var ctl = window.AbortController ? new AbortController() : null;
      if (ctl) setTimeout(function () { ctl.abort(); }, 8000);
      fetch(C.lead, { method: "POST", headers: { "Content-Type": "text/plain" }, body: JSON.stringify(data), signal: ctl ? ctl.signal : undefined })
        .then(function (r) { ferdig(r.ok); }).catch(function () { ferdig(false); });
    };
    logg.appendChild(f); rull();
    setTimeout(function () { i1.focus(); }, 50);
  }

  function spor(tekst) {
    tekst = String(tekst || "").trim().slice(0, 600);
    if (!tekst || opptatt) return;
    opptatt = true; chips.textContent = "";
    st.m.push({ r: "u", t: tekst }); lagre(st); vis("u", tekst); inp.value = "";
    skriver = el("div", "skriver"); skriver.setAttribute("aria-label", "Sekretæren skriver");
    for (var i = 0; i < 3; i++) skriver.appendChild(el("i"));
    logg.appendChild(skriver); rull();
    var ctl = window.AbortController ? new AbortController() : null;
    if (ctl) setTimeout(function () { ctl.abort(); }, 25000);
    var reserve = { svar: "Beklager, jeg får ikke kontakt akkurat nå. Ring " + C.tlf + ", eller legg igjen nummeret ditt her.", kontakt: true };
    fetch(C.api + "/chat?b=" + encodeURIComponent(C.b), {
      method: "POST", headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({ m: st.m.slice(-12).map(function (x) { return { r: x.r, t: x.t.slice(0, 600) }; }) }),
      signal: ctl ? ctl.signal : undefined
    }).then(function (r) { return r.json().catch(function () { return reserve; }); })
      .catch(function () { return reserve; })
      .then(function (j) {
        if (skriver) { skriver.remove(); skriver = null; }
        var svar = (j && typeof j.svar === "string" && j.svar.trim()) ? j.svar : reserve.svar;
        st.m.push({ r: "a", t: svar }); lagre(st); vis("a", svar);
        if (j && j.kontakt) visSkjema();
        opptatt = false;
      });
  }

  var aapen = false;
  function sett(v) {
    aapen = v; panel.classList.toggle("aapen", v); boble.classList.toggle("aapen", v);
    boble.setAttribute("aria-expanded", String(v)); hint.classList.remove("vis");
    if (v) { merke.style.display = "none"; tegn(); setTimeout(function () { inp.focus(); }, 300); } else boble.focus();
  }
  boble.onclick = function () { sett(!aapen); };
  lukk.onclick = function () { sett(false); };
  panel.addEventListener("keydown", function (e) { if (e.key === "Escape") sett(false); });
  bunn.onsubmit = function (e) { e.preventDefault(); spor(inp.value); };
  if (st.m.length) merke.style.display = "none";
  setTimeout(function () { if (!aapen && !st.m.length) { hint.classList.add("vis"); setTimeout(function () { hint.classList.remove("vis"); }, 6000); } }, 4000);

  (document.body || document.documentElement).appendChild(vert);
})();
