// Design System — sections
// Each section: sketchy audit/wireframe + final spec rendered side by side.

const { useState } = React;

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────
function Section({ id, num, title, sub, children }) {
  return (
    <section className="ds-section" id={id}>
      <h2 className="ds-section-h">
        <span className="ds-section-num">{num}</span>
        {title}
      </h2>
      {sub && <p className="ds-section-sub">{sub}</p>}
      {children}
    </section>
  );
}

function Sketch({ label, tag, dashed, children, style }) {
  return (
    <div className={"sketch" + (dashed ? " dashed" : "")} style={style}>
      {label && <span className="sketch-label">{label}</span>}
      {tag && <span className="sketch-tag">{tag}</span>}
      {children}
    </div>
  );
}

// Compute simple WCAG contrast ratio for the audit table
function hexToRgb(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c+c).join('');
  return [0,2,4].map(i => parseInt(hex.substr(i,2), 16));
}
function lum([r,g,b]) {
  const a = [r,g,b].map(v => { v /= 255; return v <= 0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4); });
  return 0.2126*a[0] + 0.7152*a[1] + 0.0722*a[2];
}
function contrast(c1, c2) {
  const L1 = lum(hexToRgb(c1)), L2 = lum(hexToRgb(c2));
  return ((Math.max(L1,L2)+0.05) / (Math.min(L1,L2)+0.05)).toFixed(2);
}
function ContrastChip({ ratio, large }) {
  const r = parseFloat(ratio);
  const passAAA = large ? r >= 4.5 : r >= 7;
  const passAA = large ? r >= 3 : r >= 4.5;
  const cls = passAAA ? 'pass-aaa' : passAA ? 'pass-aa' : 'fail';
  const label = passAAA ? 'AAA' : passAA ? 'AA' : 'FAIL';
  return <span className={"contrast-chip " + cls}>{ratio} · {label}</span>;
}

// ─────────────────────────────────────────────────────────
// 00 — INTRO
// ─────────────────────────────────────────────────────────
function Intro() {
  return (
    <Section id="intro" num="00" title="Intro & principles"
      sub="Where we're at, what's working, what to fix.">
      <div className="row-2">
        <Sketch label="What this app is">
          <p style={{margin: '4px 0 10px'}}>
            ~120 HTML pages: psychometric questionnaires (PHQ-9, GAD-7, MADRS, RAADS-R…),
            clinical case vignettes, parent guides, training tools. Single dark-theme
            stylesheet shared by all pages.
          </p>
          <div className="callout">used in clinical setting → trust &amp; clarity matter more than novelty</div>
        </Sketch>

        <Sketch label="Audit verdict" tag="HONEST">
          <ul style={{margin: 0, paddingLeft: 18}}>
            <li>Strong: shared tokens, consistent dark surface, neomorphic answer-buttons feel tactile</li>
            <li>Mixed: glassmorphism + neomorphism + flat all coexist — visual inconsistency</li>
            <li>Weak: 14 category colors with no system, low contrast on muted text, very generic font</li>
            <li>Risk: glow effects + saturated gradients can feel “game-y” for a clinical tool</li>
          </ul>
        </Sketch>
      </div>

      <h3 style={{fontFamily: "'Caveat', cursive", fontSize: 26, marginTop: 28, marginBottom: 8}}>
        Five principles we propose adopting
      </h3>
      <div className="row-3" style={{marginTop: 6}}>
        <Sketch label="1 · Sober first">
          <p style={{margin: 0, fontSize: 14}}>
            This is a clinical tool. Restraint &gt; novelty. Reserve color &amp; motion for
            meaningful feedback (selection, severity, alert).
          </p>
        </Sketch>
        <Sketch label="2 · Color = meaning">
          <p style={{margin: 0, fontSize: 14}}>
            Each hue earns its place: severity, category identity, action.
            No decorative gradients on body surfaces.
          </p>
        </Sketch>
        <Sketch label="3 · Pick ONE depth metaphor">
          <p style={{margin: 0, fontSize: 14}}>
            Today: glass + neomorphic + flat. Tomorrow: <b>neomorphic for inputs</b>,
            <b> flat-glass for surfaces</b>, nothing else.
          </p>
        </Sketch>
        <Sketch label="4 · Print-aware">
          <p style={{margin: 0, fontSize: 14}}>
            Clinicians print results. Every component must degrade to ink-on-paper
            (already partly done — extend the pattern).
          </p>
        </Sketch>
        <Sketch label="5 · Min 44px touch">
          <p style={{margin: 0, fontSize: 14}}>
            Already enforced on mobile. Promote to a global rule:
            never below 44 × 44 for any tap target.
          </p>
        </Sketch>
        <Sketch label="6 · Reduced motion is default-friendly">
          <p style={{margin: 0, fontSize: 14}}>
            <code>prefers-reduced-motion</code> already wired. Keep new animations under
            200ms &amp; non-essential.
          </p>
        </Sketch>
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────
// 01 — TOKEN ARCHITECTURE
// ─────────────────────────────────────────────────────────
function Tokens() {
  return (
    <Section id="tokens" num="01" title="Token architecture"
      sub="Add a semantic layer on top of existing primitive tokens — don't rename.">
      <div className="row-2">
        <Sketch label="Today (primitive only)">
<pre style={{fontFamily: "'JetBrains Mono', monospace", fontSize: 11, margin: 0, color: 'var(--ink-soft)', whiteSpace: 'pre-wrap'}}>{`--color-primary:        #0ea5e9
--color-bg-dark:        #0f172a
--color-bg-card:        rgba(30,41,59,0.9)
--color-text-primary:   #f8fafc
--color-text-muted:     #b0bec9
--neo-bg:               #1e293b
--neo-raised:           5px 5px 10px ...`}</pre>
          <p style={{marginTop: 10}} className="annot">
            Problem: every component reaches for primitives directly. Hard to retheme.
          </p>
        </Sketch>

        <Sketch label="Proposed (3-tier)" tag="ADD">
<pre style={{fontFamily: "'JetBrains Mono', monospace", fontSize: 11, margin: 0, color: 'var(--ink)', whiteSpace: 'pre-wrap'}}>{`/* Tier 1 — primitives (keep existing) */
--color-primary, --color-bg-dark, ...

/* Tier 2 — semantic (NEW) */
--surface-page:    var(--color-bg-dark)
--surface-raised:  var(--color-bg-card)
--surface-sunken:  var(--neo-bg)
--text-strong:     var(--color-text-primary)
--text-default:    var(--color-text-secondary)
--text-muted:      var(--color-text-muted)
--text-subtle:     var(--color-text-dimmed)
--action-primary:  var(--color-primary)
--feedback-ok:     var(--color-success)
--feedback-warn:   var(--color-warning)
--feedback-error:  var(--color-danger)

/* Tier 3 — component (per file) */
.btn-primary { background: var(--action-primary); }`}</pre>
        </Sketch>
      </div>
      <p className="callout" style={{marginTop: 12}}>
        Migration is mechanical: leave primitives, add semantics, gradually move components to semantic tokens.
      </p>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────
// 02 — COLOR (audit)
// ─────────────────────────────────────────────────────────
function ColorSection() {
  const surfaces = [
    { name: 'bg-dark',          hex: '#0f172a', use: 'page background base' },
    { name: 'bg-dark-secondary',hex: '#1e293b', use: 'secondary surface / neo-bg' },
    { name: 'card',             hex: '#1e293b', use: 'glass-card body (90% alpha)' },
  ];
  const text = [
    { name: 'text-primary',  hex: '#f8fafc', label: 'Headings · 24px+',  ratio: contrast('#f8fafc', '#0f172a'), large: false },
    { name: 'text-secondary',hex: '#e2e8f0', label: 'Body · 16px',       ratio: contrast('#e2e8f0', '#0f172a'), large: false },
    { name: 'text-muted',    hex: '#b0bec9', label: 'Muted · captions',  ratio: contrast('#b0bec9', '#0f172a'), large: false },
    { name: 'text-dimmed',   hex: '#8896a7', label: 'Dimmed · 14px+',    ratio: contrast('#8896a7', '#0f172a'), large: true  },
  ];
  const accents = [
    { name: 'primary',     hex: '#0ea5e9' },
    { name: 'primary-light', hex: '#38bdf8' },
    { name: 'primary-dark',hex: '#0284c7' },
    { name: 'success',     hex: '#22c55e' },
    { name: 'warning',     hex: '#f59e0b' },
    { name: 'danger',      hex: '#ef4444' },
    { name: 'info',        hex: '#3b82f6' },
  ];

  return (
    <Section id="color" num="02" title="Color · core palette"
      sub="Sky-on-slate dark theme. Audited against #0f172a background.">

      <h3 style={{fontFamily: "'Caveat', cursive", fontSize: 22, color: 'var(--accent)', margin: '0 0 8px'}}>Surfaces</h3>
      <Sketch>
        <table className="tokens">
          <thead><tr><th></th><th>token</th><th>hex</th><th>use</th></tr></thead>
          <tbody>
            {surfaces.map(s => (
              <tr key={s.name}>
                <td className="swatch-cell"><span className="swatch" style={{background: s.hex}} /></td>
                <td>--color-{s.name}</td>
                <td>{s.hex}</td>
                <td>{s.use}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Sketch>

      <h3 style={{fontFamily: "'Caveat', cursive", fontSize: 22, color: 'var(--accent)', margin: '24px 0 8px'}}>
        Text · contrast against #0f172a
      </h3>
      <Sketch>
        <table className="tokens">
          <thead><tr><th></th><th>token</th><th>hex</th><th>use</th><th>contrast</th></tr></thead>
          <tbody>
            {text.map(t => (
              <tr key={t.name}>
                <td className="swatch-cell"><span className="swatch" style={{background: t.hex}} /></td>
                <td>--color-{t.name}</td>
                <td>{t.hex}</td>
                <td>{t.label}</td>
                <td><ContrastChip ratio={t.ratio} large={t.large} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="annot" style={{marginTop: 10}}>
          ⚠ <code>text-dimmed</code> only passes AA at 18px+ / bold. Don't use it for body copy or 14px UI labels.
        </p>
      </Sketch>

      <h3 style={{fontFamily: "'Caveat', cursive", fontSize: 22, color: 'var(--accent)', margin: '24px 0 8px'}}>
        Accents &amp; feedback
      </h3>
      <Sketch>
        <div className="row-fit">
          {accents.map(a => (
            <div key={a.name} style={{display: 'flex', flexDirection: 'column', gap: 4}}>
              <span className="swatch lg" style={{background: a.hex}} />
              <code style={{fontFamily: "'JetBrains Mono', monospace", fontSize: 11}}>--color-{a.name}</code>
              <code style={{fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'var(--ink-faint)'}}>{a.hex}</code>
            </div>
          ))}
        </div>
      </Sketch>

      <div className="dodont">
        <div className="do">
          <p style={{margin: '6px 0 0', fontSize: 14}}>Use <code>--color-primary</code> for the single primary action per screen, and for the active filter / answer.</p>
        </div>
        <div className="dont">
          <p style={{margin: '6px 0 0', fontSize: 14}}>Don't use the gradient <code>primary → primary-dark</code> on more than one surface per view — it loses meaning.</p>
        </div>
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────
// 03 — CATEGORY PALETTE (the big audit)
// ─────────────────────────────────────────────────────────
function CategorySection() {
  // current category colors (gradient end-stops from index.html)
  const cats = [
    { key: 'TND',          fr: 'Troubles Neurodéveloppementaux', hex: '#7c3aed', family: 'violet' },
    { key: 'Psychose',     fr: 'Psychose',                       hex: '#6d28d9', family: 'violet' },
    { key: 'Humeur',       fr: 'Troubles de l\'Humeur',          hex: '#2563eb', family: 'blue' },
    { key: 'Réhab',        fr: 'Réhabilitation',                 hex: '#0284c7', family: 'blue' },
    { key: 'Recherche',    fr: 'Ressources & Formation',         hex: '#0284c7', family: 'blue' },
    { key: 'Trauma',       fr: 'Trauma',                         hex: '#4f46e5', family: 'indigo' },
    { key: 'Crise',        fr: 'Crise Suicidaire',               hex: '#3e6b99', family: 'slate-blue' },
    { key: 'Anxiété',      fr: 'Troubles Anxieux',               hex: '#047857', family: 'green' },
    { key: 'Enfant',       fr: 'Enfant & Adolescent',            hex: '#0d7c72', family: 'teal' },
    { key: 'Personnalité', fr: 'Troubles de la Personnalité',    hex: '#b45309', family: 'amber' },
    { key: 'Cas clinique', fr: 'Cas Cliniques',                  hex: '#92400e', family: 'amber' },
    { key: 'Substance',    fr: 'Troubles d\'Usage',              hex: '#db2777', family: 'pink' },
    { key: 'Trans-cult.',  fr: 'Psychiatrie Transculturelle',    hex: '#db2777', family: 'pink' },
    { key: 'Guides',       fr: 'Guides & Ressources',            hex: '#64748b', family: 'slate' },
  ];
  const families = [...new Set(cats.map(c => c.family))];

  return (
    <Section id="categories" num="03" title="Category palette · audit"
      sub="14 clinical domains. Today: 5 hue-collisions, no governance. Proposal: regroup into 9 distinct hues.">

      <Sketch label="Today · 14 categories" tag="AS-IS">
        <div className="row-fit">
          {cats.map(c => (
            <div key={c.key} style={{
              borderRadius: 6, padding: '10px 12px', color: 'white',
              background: c.hex, fontFamily: "'Inter', sans-serif",
              fontSize: 12, fontWeight: 600, lineHeight: 1.3,
              border: '1.5px solid var(--paper-stroke)', position: 'relative'
            }}>
              <div style={{fontSize: 11, opacity: 0.85, fontWeight: 500}}>{c.family}</div>
              <div>{c.key}</div>
              <code style={{fontSize: 9, fontFamily: "'JetBrains Mono', monospace", opacity: 0.85}}>{c.hex}</code>
            </div>
          ))}
        </div>
        <p className="annot" style={{marginTop: 12}}>
          ⚠ Collisions: <b>TND vs Psychose</b> (both violet), <b>Humeur vs Réhab vs Recherche</b> (all blue),
          <b> Personnalité vs Cas clinique</b> (both amber), <b>Substance vs Transculturelle</b> (both pink).
          Users can't reliably tell categories apart.
        </p>
      </Sketch>

      <Sketch label="Proposed · 9 hue families, semantic mapping" tag="TO-BE" style={{marginTop: 24}}>
        <table className="tokens">
          <thead>
            <tr>
              <th>family</th>
              <th>swatch</th>
              <th>assigned to</th>
              <th>rationale</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>violet</td>
              <td><span className="swatch" style={{background: '#7c3aed'}} /></td>
              <td>TND <i style={{color: 'var(--ink-faint)'}}>(neuro umbrella)</i></td>
              <td>highest abstraction, brain-domain</td></tr>
            <tr><td>indigo-deep</td>
              <td><span className="swatch" style={{background: '#5b21b6'}} /></td>
              <td>Psychose</td>
              <td>shift Psychose darker, clearly distinct from TND</td></tr>
            <tr><td>blue</td>
              <td><span className="swatch" style={{background: '#2563eb'}} /></td>
              <td>Humeur</td>
              <td>blue = mood, classical convention</td></tr>
            <tr><td>cyan</td>
              <td><span className="swatch" style={{background: '#0891b2'}} /></td>
              <td>Réhab</td>
              <td>kept separate from Humeur — recovery hue</td></tr>
            <tr><td>indigo</td>
              <td><span className="swatch" style={{background: '#4f46e5'}} /></td>
              <td>Trauma</td>
              <td>unchanged</td></tr>
            <tr><td>slate-blue</td>
              <td><span className="swatch" style={{background: '#3e6b99'}} /></td>
              <td>Crise suicidaire</td>
              <td>somber but not red — red is for danger states inside the tool</td></tr>
            <tr><td>green</td>
              <td><span className="swatch" style={{background: '#047857'}} /></td>
              <td>Anxiété</td>
              <td>unchanged</td></tr>
            <tr><td>teal</td>
              <td><span className="swatch" style={{background: '#0d7c72'}} /></td>
              <td>Enfant &amp; Ado</td>
              <td>unchanged · soft, paediatric</td></tr>
            <tr><td>amber</td>
              <td><span className="swatch" style={{background: '#b45309'}} /></td>
              <td>Personnalité</td>
              <td>unchanged</td></tr>
            <tr><td>terracotta</td>
              <td><span className="swatch" style={{background: '#9a3412'}} /></td>
              <td>Cas cliniques</td>
              <td>shift redder/warmer — distinct from Personnalité</td></tr>
            <tr><td>pink</td>
              <td><span className="swatch" style={{background: '#db2777'}} /></td>
              <td>Substance</td>
              <td>unchanged</td></tr>
            <tr><td>rose-soft</td>
              <td><span className="swatch" style={{background: '#9d174d'}} /></td>
              <td>Transculturelle</td>
              <td>shift to a darker rose — distinct from Substance</td></tr>
            <tr><td>slate</td>
              <td><span className="swatch" style={{background: '#64748b'}} /></td>
              <td>Guides</td>
              <td>unchanged · "neutral / utility"</td></tr>
            <tr><td>steel</td>
              <td><span className="swatch" style={{background: '#475569'}} /></td>
              <td>Recherche &amp; Formation</td>
              <td>shift toward steel — distinct from Réhab</td></tr>
          </tbody>
        </table>
      </Sketch>

      <h3 style={{fontFamily: "'Caveat', cursive", fontSize: 22, color: 'var(--accent)', margin: '24px 0 8px'}}>
        Governance rules
      </h3>
      <div className="row-2">
        <Sketch label="When to use a category color">
          <ul style={{margin: 0, paddingLeft: 18, fontSize: 14}}>
            <li>Header badge of category landing page</li>
            <li>Border / icon background of the category card on home</li>
            <li>Selected-answer accent <i>inside</i> a questionnaire of that category</li>
            <li><b>Never</b> on body text, primary CTAs, or destructive actions</li>
          </ul>
        </Sketch>
        <Sketch label="Saturation / lightness lock">
          <p style={{margin: 0, fontSize: 14}}>
            All category colors should land in the band <code>L 35–55%</code>, <code>C 0.13–0.18</code>
            in OKLCh, so they read with similar weight on the dark background.
            Today, <code>#fbbf24</code> (yellow) is <b>much lighter</b> than <code>#3e6b99</code> (slate-blue) —
            harmonize.
          </p>
        </Sketch>
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────
// 04 — TYPOGRAPHY
// ─────────────────────────────────────────────────────────
function TypeSection() {
  const scale = [
    { tok: '4xl', px: 36, label: 'Page H1', use: 'header-glow titles' },
    { tok: '3xl', px: 30, label: 'Section H2', use: 'category page hero' },
    { tok: '2xl', px: 24, label: 'Subsection H3', use: 'card titles, results' },
    { tok: 'xl',  px: 20, label: 'H4 / nav title', use: 'navigation-bar title' },
    { tok: 'lg',  px: 18, label: 'Lead', use: 'intro paragraphs' },
    { tok: 'base',px: 16, label: 'Body', use: 'questions, descriptions' },
    { tok: 'sm',  px: 14, label: 'UI', use: 'buttons, badges, captions' },
    { tok: 'xs',  px: 12, label: 'Micro', use: 'badge text, footnotes' },
  ];
  return (
    <Section id="type" num="04" title="Typography"
      sub="Today: Segoe UI fallback stack. Proposal: keep system fallback but add Inter as the canonical face for clinical clarity.">

      <div className="row-2">
        <Sketch label="Today" tag="AS-IS">
          <code style={{fontFamily: "'JetBrains Mono', monospace", fontSize: 11}}>
            'Segoe UI', Tahoma, Geneva, Verdana, sans-serif
          </code>
          <p style={{margin: '8px 0 0'}} className="annot">
            Renders fine on Windows, less crisp on macOS/Linux. No weight discipline (h1 600, body 400 OK,
            but no display weight).
          </p>
        </Sketch>
        <Sketch label="Proposed" tag="TO-BE">
          <code style={{fontFamily: "'JetBrains Mono', monospace", fontSize: 11, display: 'block'}}>
            font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif;
          </code>
          <p style={{margin: '10px 0 0', fontSize: 13}}>
            Inter is open-license, optimized for screens, has tabular-nums (vital for score tables),
            and pairs cleanly with the existing dark surfaces. Keep system font as fallback.
          </p>
        </Sketch>
      </div>

      <h3 style={{fontFamily: "'Caveat', cursive", fontSize: 22, color: 'var(--accent)', margin: '24px 0 8px'}}>
        Type scale
      </h3>
      <Sketch>
        {scale.map(s => (
          <div className="type-spec" key={s.tok}>
            <div className="label">--font-size-{s.tok}<br/>{s.px}px</div>
            <div>
              <div className="demo" style={{fontSize: s.px, fontWeight: s.px >= 20 ? 600 : 400, lineHeight: 1.3}}>
                {s.label}
              </div>
              <div style={{fontSize: 11, color: 'var(--ink-faint)', fontFamily: "'JetBrains Mono', monospace", marginTop: 2}}>
                {s.use}
              </div>
            </div>
          </div>
        ))}
      </Sketch>

      <div className="dodont">
        <div className="do">
          <ul style={{margin: '6px 0 0', paddingLeft: 18, fontSize: 14}}>
            <li>One H1 per page (page name)</li>
            <li>Headings 600, body 400, UI labels 500</li>
            <li>Use <code>tabular-nums</code> for any number column / score</li>
            <li>Line-height 1.55–1.6 on body</li>
          </ul>
        </div>
        <div className="dont">
          <ul style={{margin: '6px 0 0', paddingLeft: 18, fontSize: 14}}>
            <li>Don't drop body below 14px</li>
            <li>Don't apply <code>.gradient-text</code> to anything besides the page H1</li>
            <li>Don't use ALL CAPS except inside <code>.badge</code></li>
            <li>No italic for emphasis — use weight</li>
          </ul>
        </div>
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────
// 05 — LAYOUT & SPACING
// ─────────────────────────────────────────────────────────
function LayoutSection() {
  const scale = [4, 8, 12, 16, 24, 32, 48, 64];
  return (
    <Section id="layout" num="05" title="Layout &amp; spacing"
      sub="Container max-width 900 (questionnaires), 1200 (home grid). 8-pt baseline grid.">

      <div className="row-2">
        <Sketch label="Containers">
          <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
            <div className="wire" style={{position: 'relative'}}>
              <span style={{position: 'absolute', right: 8, top: 4, fontSize: 11, color: 'var(--ink-faint)'}}>900px</span>
              questionnaire / read view · <code>.container</code>
            </div>
            <div className="wire" style={{padding: '20px 10px', position: 'relative'}}>
              <span style={{position: 'absolute', right: 8, top: 4, fontSize: 11, color: 'var(--ink-faint)'}}>1200px</span>
              home grid &amp; category landing · custom max-width
            </div>
            <div className="wire" style={{padding: '8px 10px', position: 'relative'}}>
              <span style={{position: 'absolute', right: 8, top: 4, fontSize: 11, color: 'var(--ink-faint)'}}>full-bleed</span>
              header, footer, navigation-bar
            </div>
          </div>
        </Sketch>

        <Sketch label="Spacing scale (8-pt)">
          <div style={{display: 'flex', alignItems: 'flex-end', gap: 12, marginTop: 6}}>
            {scale.map(n => (
              <div key={n} style={{textAlign: 'center'}}>
                <div style={{
                  width: n, height: n,
                  background: 'var(--accent)', borderRadius: 2,
                  margin: '0 auto 4px'
                }} />
                <code style={{fontSize: 10, fontFamily: "'JetBrains Mono', monospace"}}>{n}</code>
              </div>
            ))}
          </div>
          <p className="annot" style={{marginTop: 12}}>
            Use multiples of 4 only. Common: 8, 12, 16, 24. Reserve 48+ for section gaps.
          </p>
        </Sketch>
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────
// 06 — RADIUS / SHADOW / MOTION
// ─────────────────────────────────────────────────────────
function RadiusSection() {
  return (
    <Section id="radius" num="06" title="Radius · shadow · motion"
      sub="Three radii. Two shadow languages — pick one per surface.">

      <div className="row-3">
        <Sketch label="Radius">
          {[
            {n: 'sm', v: 6, use: 'inputs'},
            {n: 'md', v: 8, use: 'buttons, badges'},
            {n: 'lg', v: 12, use: 'cards, glass'},
            {n: 'xl', v: 16, use: 'modals'},
            {n: 'full', v: 999, use: 'pills, score circle'},
          ].map(r => (
            <div key={r.n} style={{display: 'flex', alignItems: 'center', gap: 12, padding: '6px 0'}}>
              <div style={{
                width: 40, height: 40,
                borderRadius: r.v === 999 ? 999 : r.v,
                background: 'var(--paper-2)',
                border: '1.5px solid var(--paper-stroke)'
              }} />
              <div>
                <div style={{fontFamily: "'JetBrains Mono', monospace", fontSize: 11}}>--radius-{r.n}</div>
                <div style={{fontSize: 12, color: 'var(--ink-faint)'}}>{r.use}</div>
              </div>
            </div>
          ))}
        </Sketch>

        <Sketch label="Shadow language">
          <div style={{display: 'flex', flexDirection: 'column', gap: 14}}>
            <div>
              <div style={{fontFamily: "'Caveat', cursive", fontSize: 18, color: 'var(--accent)'}}>A · Glass</div>
              <p style={{margin: '2px 0', fontSize: 12}}>flat surface, faint border, soft drop. For: cards, modal, header.</p>
            </div>
            <div>
              <div style={{fontFamily: "'Caveat', cursive", fontSize: 18, color: 'var(--accent)'}}>B · Neo</div>
              <p style={{margin: '2px 0', fontSize: 12}}>dual shadow (dark + light), pressed = inset. For: answer buttons, score circle, primary CTA.</p>
            </div>
            <div className="annot">Don't mix A and B on the same element.</div>
          </div>
        </Sketch>

        <Sketch label="Motion">
          <ul style={{margin: 0, paddingLeft: 18, fontSize: 13}}>
            <li><code>--transition-fast 150ms</code> · color, opacity</li>
            <li><code>--transition-normal 200ms</code> · default UI</li>
            <li><code>--transition-slow 300ms</code> · cards, lift</li>
            <li>Easing: <code>ease</code> for everything (keep it simple)</li>
            <li>Reduce-motion: animations &lt; 10ms</li>
          </ul>
        </Sketch>
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────
// 07 — ICONOGRAPHY
// ─────────────────────────────────────────────────────────
function IconsSection() {
  const cats = [
    {k: 'TND', icon: 'fas fa-brain'},
    {k: 'Humeur', icon: 'fas fa-cloud-rain'},
    {k: 'Anxiété', icon: 'fas fa-wind'},
    {k: 'Personnalité', icon: 'fas fa-user-circle'},
    {k: 'Substance', icon: 'fas fa-wine-glass-alt'},
    {k: 'Trauma', icon: 'fas fa-shield-alt'},
    {k: 'Crise', icon: 'fas fa-exclamation-circle'},
    {k: 'Enfant', icon: 'fas fa-child'},
    {k: 'Réhab', icon: 'fas fa-clipboard-check'},
    {k: 'Guides', icon: 'fas fa-book-open'},
    {k: 'Cas cliniques', icon: 'fas fa-user-md'},
    {k: 'Psychose', icon: 'fas fa-eye'},
    {k: 'Trans-cult.', icon: 'fas fa-globe-americas'},
    {k: 'Recherche', icon: 'fas fa-graduation-cap'},
  ];
  return (
    <Section id="icons" num="07" title="Iconography"
      sub="Font Awesome 6 free · solid weight only. One icon per category, one per content-type, never decorative.">

      <Sketch label="Category icon map">
        <div className="row-fit">
          {cats.map(c => (
            <div key={c.k} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 10px',
              border: '1.5px dashed var(--paper-stroke-faint)', borderRadius: 6
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8,
                background: 'var(--ink)', color: 'var(--paper)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16
              }}>
                {/* placeholder square — FontAwesome not loaded in this doc on purpose */}
                <span style={{fontFamily: "'Caveat', cursive", fontSize: 20}}>
                  {c.k[0]}
                </span>
              </div>
              <div style={{fontSize: 13}}>
                <div style={{fontWeight: 600}}>{c.k}</div>
                <code style={{fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'var(--ink-faint)'}}>{c.icon}</code>
              </div>
            </div>
          ))}
        </div>
      </Sketch>

      <div className="dodont">
        <div className="do">
          <ul style={{margin: '6px 0 0', paddingLeft: 18, fontSize: 14}}>
            <li>FA solid only · 16px in buttons, 32px in category icon, 80px hero</li>
            <li>Always pair with a text label (the icon is never alone for navigation)</li>
            <li>Inherit color from text — no fixed icon colors</li>
          </ul>
        </div>
        <div className="dont">
          <ul style={{margin: '6px 0 0', paddingLeft: 18, fontSize: 14}}>
            <li>No emoji in clinical content — they are unprofessional in this context</li>
            <li>No mixing FA solid + regular + brand</li>
            <li>No icon-only links (a11y)</li>
          </ul>
        </div>
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────
// 08 — BUTTONS
// ─────────────────────────────────────────────────────────
function ButtonsSection() {
  return (
    <Section id="buttons" num="08" title="Buttons &amp; controls"
      sub="Six button variants today. Recommendation: keep four, retire two.">

      <h3 style={{fontFamily: "'Caveat', cursive", fontSize: 22, color: 'var(--accent)', margin: '0 0 8px'}}>
        Wireframe · what each variant is for
      </h3>
      <Sketch label="Button taxonomy">
        <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
          {[
            {n: 'btn-primary', desc: 'main action of the page · ONE per view', shape: 'fill'},
            {n: 'btn-secondary', desc: 'cancel / back / secondary actions', shape: 'outline'},
            {n: 'btn-ghost', desc: 'tertiary, sits inline in text', shape: 'ghost'},
            {n: 'btn-icon', desc: 'icon-only · square 36px · always has aria-label', shape: 'square'},
            {n: '.option-btn / .answer-btn', desc: 'questionnaire answer cell · neomorphic', shape: 'neo'},
            {n: '.filter-btn', desc: 'tag/pill filter · toggle state', shape: 'pill'},
          ].map(b => (
            <div key={b.n} style={{display: 'grid', gridTemplateColumns: '90px 1fr 220px', gap: 10, alignItems: 'center'}}>
              <div className={"wire " + (b.shape === 'fill' ? 'solid' : b.shape === 'ghost' ? 'dashed' : '')}
                   style={{
                     textAlign: 'center', padding: '8px 6px',
                     borderRadius: b.shape === 'pill' ? 20 : 8,
                     width: b.shape === 'square' ? 36 : 'auto',
                     height: b.shape === 'square' ? 36 : 'auto',
                   }}>
                {b.shape === 'square' ? '◇' : b.shape === 'neo' ? '⌬' : 'BTN'}
              </div>
              <code style={{fontFamily: "'JetBrains Mono', monospace", fontSize: 12}}>.{b.n}</code>
              <span style={{fontSize: 13}}>{b.desc}</span>
            </div>
          ))}
        </div>
      </Sketch>

      <h3 style={{fontFamily: "'Caveat', cursive", fontSize: 22, color: 'var(--accent)', margin: '24px 0 8px'}}>
        Final · rendered in dark theme
      </h3>
      <Sketch label="Live preview" tag="SPEC">
        <div className="preview">
          <div style={{display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center'}}>
            <button style={btnPrimary}>Calculer le score</button>
            <button style={btnSecondary}>Annuler</button>
            <button style={btnGhost}>En savoir plus</button>
            <button style={btnIcon} aria-label="Imprimer">⎙</button>
            <button style={filterActive}>TND</button>
            <button style={filterIdle}>Humeur</button>
          </div>
          <div style={{marginTop: 18, display: 'flex', gap: 10, flexWrap: 'wrap'}}>
            <button style={{...neoBtn}}>Pas du tout</button>
            <button style={{...neoBtn}}>Un peu</button>
            <button style={{...neoBtn, ...neoBtnSelected}}>Modérément</button>
            <button style={{...neoBtn}}>Beaucoup</button>
            <button style={{...neoBtn}}>Extrêmement</button>
          </div>
          <div style={{fontSize: 11, color: '#8896a7', marginTop: 10, fontFamily: 'JetBrains Mono, monospace'}}>
            ↑ neomorphic answer-row · selected = pressed inset + primary border
          </div>
        </div>
      </Sketch>

      <div className="dodont">
        <div className="do">
          <p style={{margin: '6px 0 0', fontSize: 14}}>
            Maximum <b>one</b> primary button per view. Use secondary or ghost for everything else.
          </p>
        </div>
        <div className="dont">
          <p style={{margin: '6px 0 0', fontSize: 14}}>
            Retire <code>.btn-back</code> + <code>.btn-print</code> + <code>.btn-export</code> as bespoke variants —
            they're glass-morph copies of <code>.btn-secondary</code>. Consolidate.
          </p>
        </div>
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────
// 09 — FORMS
// ─────────────────────────────────────────────────────────
function FormsSection() {
  return (
    <Section id="forms" num="09" title="Forms &amp; inputs"
      sub="Inputs, selects, and the all-important answer radio group.">
      <div className="row-2">
        <Sketch label="Input · wireframe">
          <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
            <div className="wire" style={{height: 36, display: 'flex', alignItems: 'center', paddingLeft: 32, position: 'relative'}}>
              <span style={{position: 'absolute', left: 10, top: 8, color: 'var(--ink-faint)'}}>🔍</span>
              <span style={{color: 'var(--ink-faint)'}}>Rechercher un questionnaire…</span>
            </div>
            <div className="wire dashed" style={{height: 36, display: 'flex', alignItems: 'center', borderColor: 'var(--accent)'}}>
              focused · glow ring
            </div>
            <div className="wire" style={{height: 80}}>textarea</div>
            <p className="annot" style={{margin: 0}}>min 44px tap target</p>
          </div>
        </Sketch>

        <Sketch label="Input · final" tag="SPEC">
          <div className="preview">
            <div style={inputWrap}>
              <span style={{position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#8896a7'}}>🔍</span>
              <input style={inputStyle} placeholder="Rechercher un questionnaire…" />
            </div>
            <input style={{...inputStyle, marginTop: 10}} placeholder="Champ standard" />
            <textarea style={{...inputStyle, marginTop: 10, minHeight: 70, resize: 'vertical'}} placeholder="Note clinique" />
          </div>
        </Sketch>
      </div>

      <h3 style={{fontFamily: "'Caveat', cursive", fontSize: 22, color: 'var(--accent)', margin: '24px 0 8px'}}>
        Answer group (radio) — the heart of the app
      </h3>
      <div className="row-2">
        <Sketch label="Layout intent">
          <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
            <div className="wire" style={{padding: '12px 10px'}}>
              <span className="pin" style={{marginRight: 8}}>Q1</span>
              Au cours des 2 dernières semaines, vous êtes-vous senti(e) déprimé(e) ?
            </div>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8}}>
              <div className="wire">Jamais</div>
              <div className="wire">Plusieurs jours</div>
              <div className="wire fill">+ de la moitié</div>
              <div className="wire">Presque tous les jours</div>
            </div>
            <p className="annot" style={{margin: 0}}>↑ selected = filled / inset</p>
          </div>
        </Sketch>

        <Sketch label="Final" tag="SPEC">
          <div className="preview">
            <div style={questionCard}>
              <div style={{display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12}}>
                <span style={qNumber}>1</span>
                <div style={{color: '#f8fafc', fontSize: 15, lineHeight: 1.5}}>
                  Au cours des 2 dernières semaines, vous êtes-vous senti(e) déprimé(e), triste, ou désespéré(e)&nbsp;?
                </div>
              </div>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8}}>
                <button style={neoBtn}>Jamais</button>
                <button style={neoBtn}>Plusieurs jours</button>
                <button style={{...neoBtn, ...neoBtnSelected}}>Plus de la moitié des jours</button>
                <button style={neoBtn}>Presque tous les jours</button>
              </div>
            </div>
          </div>
        </Sketch>
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────
// 10 — CARDS
// ─────────────────────────────────────────────────────────
function CardsSection() {
  return (
    <Section id="cards" num="10" title="Cards · 3 variants"
      sub="Glass card (content), category card (home grid), question card (questionnaire).">

      <h3 style={{fontFamily: "'Caveat', cursive", fontSize: 22, color: 'var(--accent)', margin: '0 0 8px'}}>Wireframes</h3>
      <div className="row-3">
        <Sketch label="Glass card">
          <div className="wire" style={{height: 110, padding: 12}}>
            <div style={{fontWeight: 700, marginBottom: 4}}>Title</div>
            <div style={{fontSize: 12, color: 'var(--ink-faint)'}}>Body copy</div>
          </div>
          <p className="annot" style={{marginTop: 6}}>flat surface · 1px border · soft hover lift</p>
        </Sketch>
        <Sketch label="Category card">
          <div className="wire" style={{height: 130, padding: 12, textAlign: 'center'}}>
            <div style={{
              width: 50, height: 50, margin: '4px auto 8px',
              borderRadius: 12, background: 'var(--accent)', opacity: 0.7
            }} />
            <div style={{fontWeight: 700, fontSize: 13}}>Catégorie</div>
            <div style={{fontSize: 11, color: 'var(--ink-faint)'}}>10 questionnaires</div>
          </div>
          <p className="annot" style={{marginTop: 6}}>icon hero · centered · category color</p>
        </Sketch>
        <Sketch label="Question card · neomorphic">
          <div style={{
            background: 'var(--paper-2)',
            borderRadius: 10, padding: 12, height: 110,
            boxShadow: '3px 3px 6px rgba(0,0,0,0.12), -3px -3px 6px rgba(255,255,255,0.7)'
          }}>
            <div style={{fontSize: 12, color: 'var(--ink-soft)'}}>Q3 · question text…</div>
            <div style={{display: 'flex', gap: 6, marginTop: 12}}>
              <span style={{flex: 1, padding: 6, borderRadius: 6, background: 'rgba(0,0,0,0.05)', fontSize: 11, textAlign: 'center'}}>opt</span>
              <span style={{flex: 1, padding: 6, borderRadius: 6, background: 'rgba(0,0,0,0.05)', fontSize: 11, textAlign: 'center'}}>opt</span>
            </div>
          </div>
          <p className="annot" style={{marginTop: 6}}>raised card · pressed when answered</p>
        </Sketch>
      </div>

      <h3 style={{fontFamily: "'Caveat', cursive", fontSize: 22, color: 'var(--accent)', margin: '24px 0 8px'}}>Final</h3>
      <Sketch label="Live preview" tag="SPEC">
        <div className="preview">
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16}}>
            <div style={glassCard}>
              <h4 style={{margin: '0 0 6px', color: '#f8fafc'}}>Glass card</h4>
              <p style={{margin: 0, fontSize: 13, color: '#b0bec9'}}>Content surface for any read view.</p>
            </div>
            <div style={categoryCard}>
              <div style={{...catIcon, background: 'linear-gradient(135deg, #2563eb, #1d4ed8)'}}>♦</div>
              <h4 style={{margin: '8px 0 4px', color: '#f8fafc'}}>Humeur</h4>
              <p style={{margin: 0, fontSize: 12, color: '#94a3b8'}}>9 questionnaires</p>
            </div>
            <div style={questionCardSmall}>
              <div style={{fontSize: 12, color: '#cbd5e1', marginBottom: 8}}>Q3 · une question</div>
              <div style={{display: 'flex', gap: 6}}>
                <span style={{...neoBtnSmall}}>Oui</span>
                <span style={{...neoBtnSmall, ...neoBtnSelected}}>Non</span>
              </div>
            </div>
          </div>
        </div>
      </Sketch>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────
// 11 — BADGES
// ─────────────────────────────────────────────────────────
function BadgesSection() {
  return (
    <Section id="badges" num="11" title="Badges &amp; pills"
      sub="Tiny labels for status, category, count.">
      <Sketch label="Final" tag="SPEC">
        <div className="preview">
          <div style={{display: 'flex', flexWrap: 'wrap', gap: 10}}>
            <span style={{...badge, ...badgePrimary}}>PRIMARY</span>
            <span style={{...badge, ...badgeSuccess}}>VALIDÉ</span>
            <span style={{...badge, ...badgeWarning}}>RÉVISER</span>
            <span style={{...badge, ...badgeDanger}}>RISQUE</span>
          </div>
          <div style={{marginTop: 14, display: 'flex', flexWrap: 'wrap', gap: 8}}>
            {[
              ['TND', '#7c3aed'],
              ['Humeur', '#2563eb'],
              ['Anxiété', '#047857'],
              ['Personnalité', '#b45309'],
              ['Substance', '#db2777'],
              ['Trauma', '#4f46e5'],
              ['Crise', '#3e6b99'],
              ['Enfant', '#0d7c72'],
              ['Réhab', '#0891b2'],
              ['Psychose', '#5b21b6'],
              ['Guides', '#64748b'],
            ].map(([k,c]) => (
              <span key={k} style={{...catBadge, background: c}}>{k}</span>
            ))}
          </div>
        </div>
      </Sketch>
      <div className="dodont">
        <div className="do">
          <p style={{margin: '6px 0 0', fontSize: 14}}>
            Use category badges as <b>navigation breadcrumbs</b> at the top of each questionnaire page,
            to remind the user which domain they're in.
          </p>
        </div>
        <div className="dont">
          <p style={{margin: '6px 0 0', fontSize: 14}}>
            Don't put more than 2 badges next to each other — they compete with the title for attention.
          </p>
        </div>
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────
// 12 — INFO / WARNING / DANGER BOXES
// ─────────────────────────────────────────────────────────
function BoxesSection() {
  return (
    <Section id="boxes" num="12" title="Info · warning · danger boxes"
      sub="Inline callouts for context, caveats, and red-line statements.">
      <Sketch label="Final" tag="SPEC">
        <div className="preview">
          <div style={{...calloutBox, ...infoBox}}>
            <h4 style={{margin: '0 0 4px', color: '#7dd3fc'}}>ℹ Information</h4>
            <p style={{margin: 0, fontSize: 14, color: '#b0bec9'}}>
              Le PHQ-9 est validé en français. Score &gt; 10 = forte probabilité de dépression majeure.
            </p>
          </div>
          <div style={{...calloutBox, ...warnBox}}>
            <h4 style={{margin: '0 0 4px', color: '#fef3c7'}}>⚠ Avertissement</h4>
            <p style={{margin: 0, fontSize: 14, color: '#b0bec9'}}>
              Outil de dépistage uniquement — ne se substitue pas à un examen clinique.
            </p>
          </div>
          <div style={{...calloutBox, ...dangerBox}}>
            <h4 style={{margin: '0 0 4px', color: '#fecaca'}}>⛔ Risque suicidaire</h4>
            <p style={{margin: 0, fontSize: 14, color: '#b0bec9'}}>
              Score critique. Évaluer immédiatement et appliquer le protocole d'urgence.
            </p>
          </div>
        </div>
      </Sketch>
      <p className="annot" style={{marginTop: 10}}>
        Hierarchy: <b>info</b> = neutral context · <b>warning</b> = caution / methodology limit · <b>danger</b> = clinical red flag.
        Use the latter sparingly — only for safety-critical content.
      </p>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────
// 13 — NAVIGATION
// ─────────────────────────────────────────────────────────
function NavSection() {
  return (
    <Section id="nav-comp" num="13" title="Navigation"
      sub="Sticky top bar inside questionnaires; header-glow hero on landing pages.">
      <div className="row-2">
        <Sketch label="Inside-page navigation bar">
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px',
            border: '1.5px solid var(--paper-stroke)', borderRadius: 6,
            background: 'rgba(255,255,255,0.4)'
          }}>
            <div className="wire" style={{width: 36, height: 36, padding: 0, textAlign: 'center', lineHeight: '32px'}}>⌂</div>
            <div className="wire" style={{padding: '4px 10px'}}>← Retour</div>
            <div style={{flex: 1, fontWeight: 600, fontSize: 14}}>PHQ-9 · Dépression</div>
            <div className="wire" style={{padding: '4px 10px'}}>⎙ Imprimer</div>
          </div>
          <p className="annot" style={{marginTop: 8}}>sticky top · glass · backdrop-blur 8px</p>
        </Sketch>

        <Sketch label="Landing-page hero">
          <div style={{
            border: '1.5px solid var(--paper-stroke)', borderRadius: 6,
            padding: '24px 16px', textAlign: 'center',
            background: 'radial-gradient(ellipse at center, rgba(193,74,58,0.08), transparent 70%)'
          }}>
            <div style={{display: 'inline-block', padding: '2px 10px', border: '1.5px solid var(--accent)', color: 'var(--accent)', fontSize: 11, marginBottom: 10}}>
              CENTRE HOSPITALIER LE VINATIER
            </div>
            <div style={{fontFamily: "'Caveat', cursive", fontSize: 32, fontWeight: 700, lineHeight: 1.1}}>
              Page title
            </div>
            <div style={{fontSize: 13, color: 'var(--ink-faint)', marginTop: 4}}>Subtitle / lead</div>
          </div>
        </Sketch>
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────
// 14 — QUESTIONNAIRE PATTERN
// ─────────────────────────────────────────────────────────
function QuestionPattern() {
  return (
    <Section id="question-pattern" num="14" title="Pattern · questionnaire flow"
      sub="The single most-repeated screen in the app. Lock it down.">
      <Sketch label="Anatomy">
        <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
            <span style={{width: 24, fontWeight: 700, color: 'var(--accent)'}}>A</span>
            <div className="wire" style={{flex: 1}}>top nav · home · back · title · print</div>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
            <span style={{width: 24, fontWeight: 700, color: 'var(--accent)'}}>B</span>
            <div className="wire dashed" style={{flex: 1}}>category badge + title (gradient) + intro</div>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
            <span style={{width: 24, fontWeight: 700, color: 'var(--accent)'}}>C</span>
            <div className="wire" style={{flex: 1, background: 'rgba(193,74,58,0.08)'}}>warning-box · "outil de dépistage uniquement"</div>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
            <span style={{width: 24, fontWeight: 700, color: 'var(--accent)'}}>D</span>
            <div className="wire" style={{flex: 1}}>sticky progress bar · 8px tall · gradient fill</div>
          </div>
          <div style={{display: 'flex', alignItems: 'flex-start', gap: 10}}>
            <span style={{width: 24, fontWeight: 700, color: 'var(--accent)', marginTop: 4}}>E</span>
            <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 6}}>
              <div className="wire" style={{padding: '10px'}}>Q1 · question · 4 answer cells</div>
              <div className="wire" style={{padding: '10px', boxShadow: 'inset 2px 2px 4px rgba(0,0,0,0.08)'}}>Q2 · ANSWERED · pressed/inset</div>
              <div className="wire" style={{padding: '10px'}}>Q3 ...</div>
            </div>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
            <span style={{width: 24, fontWeight: 700, color: 'var(--accent)'}}>F</span>
            <div className="wire fill" style={{flex: 1}}>primary CTA · "Calculer le score"</div>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
            <span style={{width: 24, fontWeight: 700, color: 'var(--accent)'}}>G</span>
            <div className="wire" style={{flex: 1}}>results section · score circle · interpretation · export</div>
          </div>
        </div>
      </Sketch>

      <p className="callout" style={{marginTop: 12}}>
        Hard rule: warning-box (C) is non-negotiable on every clinical questionnaire page.
      </p>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────
// 15 — SCORE & RESULTS
// ─────────────────────────────────────────────────────────
function ResultsSection() {
  return (
    <Section id="results-pattern" num="15" title="Score &amp; results"
      sub="Score circle, interpretation tiers, export controls.">
      <div className="row-2">
        <Sketch label="Wireframe">
          <div style={{textAlign: 'center'}}>
            <div style={{
              width: 100, height: 100, borderRadius: '50%',
              border: '3px solid var(--accent)',
              margin: '0 auto 8px',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              background: 'var(--paper-2)',
              boxShadow: 'inset 3px 3px 6px rgba(0,0,0,0.1)'
            }}>
              <div style={{fontSize: 28, fontWeight: 700, lineHeight: 1}}>14</div>
              <div style={{fontSize: 9, color: 'var(--ink-faint)'}}>/27</div>
            </div>
            <div style={{fontSize: 12, color: 'var(--ink-faint)'}}>Score total</div>
          </div>
          <div style={{display: 'flex', flexDirection: 'column', gap: 6, marginTop: 14}}>
            <div className="wire" style={{borderColor: '#2e7d32', background: '#e8f5e9'}}>Faible · 0–4</div>
            <div className="wire" style={{borderColor: '#f57c00', background: '#fff3e0'}}>Modéré · 5–14</div>
            <div className="wire fill" style={{borderColor: '#c62828', background: '#ffebee'}}>Sévère · 15+ ← active</div>
          </div>
        </Sketch>

        <Sketch label="Final" tag="SPEC">
          <div className="preview">
            <div style={{textAlign: 'center', marginBottom: 16}}>
              <div style={scoreCircle}>
                <span style={scoreValue}>14</span>
                <span style={scoreUnit}>/27</span>
              </div>
              <div style={scoreLabel}>Score total · MADRS</div>
            </div>
            <div style={{...interp, ...interpModerate}}>
              <h4 style={{margin: '0 0 4px', color: '#fef3c7'}}>Dépression modérée</h4>
              <p style={{margin: 0, fontSize: 13, color: '#b0bec9'}}>
                Score 14/27 — envisager une prise en charge thérapeutique structurée.
              </p>
            </div>
            <div style={{display: 'flex', gap: 10, marginTop: 12}}>
              <button style={btnPrimary}>Exporter PDF</button>
              <button style={btnSecondary}>Imprimer</button>
              <button style={btnSecondary}>Recommencer</button>
            </div>
          </div>
        </Sketch>
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────
// 16 — A11Y
// ─────────────────────────────────────────────────────────
function A11ySection() {
  return (
    <Section id="a11y" num="16" title="Accessibility"
      sub="Clinical tool used by professionals AND patients. Don't ship anything that fails AA.">
      <div className="row-2">
        <Sketch label="Already in place">
          <ul style={{margin: 0, paddingLeft: 18, fontSize: 14}}>
            <li><code>:focus-visible</code> 2px primary outline · 2px offset</li>
            <li><code>prefers-reduced-motion</code> reduces all animations to 10ms</li>
            <li>Mobile tap targets ≥ 48px</li>
            <li>Print stylesheet (high contrast B&amp;W)</li>
            <li><code>::selection</code> styled</li>
          </ul>
        </Sketch>
        <Sketch label="Add / fix">
          <ul style={{margin: 0, paddingLeft: 18, fontSize: 14}}>
            <li>Bump <code>text-dimmed</code> from <code>#8896a7</code> to <code>#a0aec0</code> (passes AA at 14px)</li>
            <li>All <code>.btn-icon</code> need explicit <code>aria-label</code></li>
            <li>Answer radios: real <code>&lt;input type=radio&gt;</code> with visually-hidden inputs (already done in <code>.binary-options</code> — extend to <code>.answer-btn</code>)</li>
            <li>Score change should announce via <code>role="status"</code></li>
            <li>Skip-link to <code>#main-content</code></li>
            <li>Lang declared per page (<code>lang="fr"</code>) ✓</li>
          </ul>
        </Sketch>
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────
// 17 — PRINT
// ─────────────────────────────────────────────────────────
function PrintSection() {
  return (
    <Section id="print" num="17" title="Print"
      sub="Clinicians print results. Already mostly handled — codify the rules.">
      <Sketch>
        <ul style={{margin: 0, paddingLeft: 18, fontSize: 14}}>
          <li>Body → white background, black text</li>
          <li>Hide: nav, controls, warnings, footer, export buttons</li>
          <li>Show: results, interpretation, all answered questions (collapse if needed)</li>
          <li>Score circle → solid primary fill, white number</li>
          <li>Interpretation tiers → pastel backgrounds with colored borders</li>
          <li>Page-break: <code>.question-card &#123; page-break-inside: avoid; &#125;</code></li>
          <li>Test at A4 portrait; ≤ 12pt body, ≤ 9pt captions</li>
        </ul>
      </Sketch>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────
// EMBEDDED INLINE STYLES (real component CSS, mirrored from styles.css)
// ─────────────────────────────────────────────────────────
const btnPrimary = {
  display: 'inline-flex', alignItems: 'center', gap: 8,
  background: '#1e293b', color: '#38bdf8',
  border: '2px solid #0ea5e9',
  padding: '10px 22px', borderRadius: 12,
  fontWeight: 600, fontSize: 14, cursor: 'pointer',
  fontFamily: 'inherit',
  boxShadow: '5px 5px 10px rgba(0,0,0,0.5), -5px -5px 10px rgba(255,255,255,0.05)',
};
const btnSecondary = {
  display: 'inline-flex', alignItems: 'center', gap: 8,
  background: 'rgba(30,41,59,0.9)', color: '#b0bec9',
  border: '1px solid rgba(255,255,255,0.08)',
  padding: '8px 18px', borderRadius: 8,
  fontWeight: 500, fontSize: 14, cursor: 'pointer',
  fontFamily: 'inherit',
};
const btnGhost = {
  background: 'transparent', color: '#b0bec9',
  border: 'none', padding: '8px 14px', borderRadius: 8,
  fontWeight: 500, fontSize: 14, cursor: 'pointer',
  fontFamily: 'inherit',
};
const btnIcon = {
  width: 36, height: 36, padding: 0,
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  background: 'transparent', color: '#8896a7',
  border: '1px solid transparent',
  borderRadius: 8, cursor: 'pointer',
  fontFamily: 'inherit', fontSize: 16,
};
const filterIdle = {
  background: 'rgba(30,41,59,0.9)',
  border: '1px solid rgba(255,255,255,0.08)',
  color: '#b0bec9',
  padding: '7px 14px', borderRadius: 12,
  fontSize: 13, fontWeight: 500, cursor: 'pointer',
  fontFamily: 'inherit',
};
const filterActive = {
  ...filterIdle,
  background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
  color: 'white',
  borderColor: '#0ea5e9',
  boxShadow: '0 4px 15px rgba(14,165,233,0.4)',
};
const neoBtn = {
  flex: 1, padding: '11px 14px',
  background: '#1e293b',
  border: '2px solid transparent',
  borderRadius: 12,
  color: '#cbd5e1',
  fontSize: 13, fontWeight: 500, cursor: 'pointer',
  fontFamily: 'inherit',
  boxShadow: '5px 5px 10px rgba(0,0,0,0.5), -5px -5px 10px rgba(255,255,255,0.05)',
};
const neoBtnSelected = {
  boxShadow: 'inset 4px 4px 8px rgba(0,0,0,0.5), inset -4px -4px 8px rgba(255,255,255,0.05)',
  borderColor: '#0ea5e9', color: '#38bdf8',
};
const neoBtnSmall = {
  ...neoBtn, padding: '6px 10px', fontSize: 11, flex: 1,
  textAlign: 'center',
};
const inputWrap = { position: 'relative' };
const inputStyle = {
  width: '100%', padding: '10px 14px 10px 36px',
  background: 'rgba(30,41,59,0.9)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 8,
  color: '#e2e8f0', fontSize: 14,
  fontFamily: 'inherit', outline: 'none',
};
const questionCard = {
  background: '#1e293b',
  borderRadius: 14, padding: 18,
  boxShadow: '5px 5px 10px rgba(0,0,0,0.5), -5px -5px 10px rgba(255,255,255,0.05)',
};
const qNumber = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  width: 28, height: 28, borderRadius: '50%',
  background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
  color: 'white', fontWeight: 600, fontSize: 13, flexShrink: 0,
};
const glassCard = {
  background: 'linear-gradient(145deg, rgba(30,41,59,0.9), rgba(15,23,42,0.9))',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 12, padding: 16,
};
const categoryCard = {
  ...glassCard, padding: 16, textAlign: 'center',
  borderRadius: 16,
};
const catIcon = {
  width: 48, height: 48, margin: '0 auto',
  borderRadius: 12, color: 'white',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontSize: 22,
};
const questionCardSmall = {
  background: '#1e293b', borderRadius: 12, padding: 12,
  boxShadow: '4px 4px 8px rgba(0,0,0,0.5), -4px -4px 8px rgba(255,255,255,0.05)',
};

const badge = {
  display: 'inline-flex', alignItems: 'center',
  padding: '3px 10px', borderRadius: 999,
  fontSize: 11, fontWeight: 600, letterSpacing: '0.05em',
  textTransform: 'uppercase',
  border: '1px solid',
};
const badgePrimary = { background: 'rgba(14,165,233,0.15)', color: '#7dd3fc', borderColor: 'rgba(14,165,233,0.3)' };
const badgeSuccess = { background: 'rgba(34,197,94,0.15)', color: '#a7f3d0', borderColor: 'rgba(34,197,94,0.3)' };
const badgeWarning = { background: 'rgba(245,158,11,0.15)', color: '#fef3c7', borderColor: 'rgba(245,158,11,0.3)' };
const badgeDanger  = { background: 'rgba(239,68,68,0.15)', color: '#fecaca', borderColor: 'rgba(239,68,68,0.3)' };
const catBadge = {
  color: 'white', padding: '5px 11px', borderRadius: 999,
  fontSize: 11, fontWeight: 600, letterSpacing: '0.04em',
};

const calloutBox = {
  borderRadius: 12, padding: 14, marginBottom: 10,
  border: '1px solid',
};
const infoBox   = { background: 'linear-gradient(145deg, rgba(14,165,233,0.1), rgba(14,165,233,0.05))', borderColor: 'rgba(14,165,233,0.3)' };
const warnBox   = { background: 'linear-gradient(145deg, rgba(245,158,11,0.1), rgba(245,158,11,0.05))', borderColor: 'rgba(245,158,11,0.3)' };
const dangerBox = { background: 'linear-gradient(145deg, rgba(239,68,68,0.1), rgba(239,68,68,0.05))', borderColor: 'rgba(239,68,68,0.3)' };

const scoreCircle = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 2,
  width: 110, height: 110, borderRadius: '50%',
  background: '#1e293b',
  border: '3px solid #0ea5e9',
  boxShadow: 'inset 4px 4px 8px rgba(0,0,0,0.5), inset -4px -4px 8px rgba(255,255,255,0.05), 0 0 30px rgba(14,165,233,0.2)',
  margin: '0 auto 8px',
};
const scoreValue = { color: '#38bdf8', fontSize: 32, fontWeight: 700, lineHeight: 1 };
const scoreUnit = { color: '#8896a7', fontSize: 12, alignSelf: 'flex-end', marginBottom: 4 };
const scoreLabel = { color: '#b0bec9', fontSize: 13 };
const interp = {
  padding: 14, borderRadius: 10, marginTop: 6,
  border: '1px solid',
};
const interpModerate = {
  ...interp,
  background: 'linear-gradient(145deg, rgba(245,158,11,0.15), rgba(245,158,11,0.05))',
  borderColor: 'rgba(245,158,11,0.3)',
};

// ─────────────────────────────────────────────────────────
// CONTENT ROOT
// ─────────────────────────────────────────────────────────
function DSContent() {
  return (
    <>
      <Intro />
      <Tokens />
      <ColorSection />
      <CategorySection />
      <TypeSection />
      <LayoutSection />
      <RadiusSection />
      <IconsSection />
      <ButtonsSection />
      <FormsSection />
      <CardsSection />
      <BadgesSection />
      <BoxesSection />
      <NavSection />
      <QuestionPattern />
      <ResultsSection />
      <A11ySection />
      <PrintSection />
      <div style={{textAlign: 'center', padding: '60px 0 20px', borderTop: '2px dashed var(--paper-stroke-faint)', marginTop: 60}}>
        <div style={{fontFamily: "'Caveat', cursive", fontSize: 32, color: 'var(--accent)'}}>fin.</div>
        <div style={{fontFamily: "'Architects Daughter', cursive", fontSize: 12, color: 'var(--ink-faint)', marginTop: 4}}>
          Design System v1 audit · à itérer en équipe · Le Vinatier · Mai 2026
        </div>
      </div>
    </>
  );
}

window.DSContent = DSContent;
