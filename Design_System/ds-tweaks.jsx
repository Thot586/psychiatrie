// Tweaks panel — sketchy ↔ clean toggle, primary hue, density
const { useState, useEffect } = React;

function DSTweaks() {
  const [open, setOpen] = useState(false);
  const [available, setAvailable] = useState(false);
  const [mode, setMode] = useState('sketchy'); // sketchy | clean
  const [hue, setHue] = useState(193); // sky
  const [density, setDensity] = useState('comfy');

  useEffect(() => {
    const onMsg = (e) => {
      if (!e.data || typeof e.data !== 'object') return;
      if (e.data.type === '__activate_edit_mode') setOpen(true);
      if (e.data.type === '__deactivate_edit_mode') setOpen(false);
    };
    window.addEventListener('message', onMsg);
    setAvailable(true);
    window.parent.postMessage({type: '__edit_mode_available'}, '*');
    return () => window.removeEventListener('message', onMsg);
  }, []);

  // Apply mode
  useEffect(() => {
    document.documentElement.classList.toggle('clean', mode === 'clean');
  }, [mode]);

  // Apply hue
  useEffect(() => {
    document.documentElement.style.setProperty('--accent', `oklch(58% 0.15 ${hue})`);
  }, [hue]);

  // Apply density
  useEffect(() => {
    const main = document.querySelector('main');
    if (main) main.style.padding = density === 'compact' ? '24px 32px 60px' : '40px 56px 120px 56px';
  }, [density]);

  if (!open) return null;

  return (
    <div style={panel}>
      <div style={panelHead}>
        <span style={{fontFamily: "'Caveat', cursive", fontSize: 22, fontWeight: 700, color: '#c14a3a'}}>Tweaks</span>
        <button style={closeBtn} onClick={() => {
          setOpen(false);
          window.parent.postMessage({type: '__edit_mode_dismissed'}, '*');
        }}>×</button>
      </div>

      <div style={group}>
        <div style={label}>Rendering mode</div>
        <div style={segWrap}>
          {['sketchy', 'clean'].map(m => (
            <button key={m} style={{...segBtn, ...(mode === m ? segActive : {})}} onClick={() => setMode(m)}>
              {m}
            </button>
          ))}
        </div>
      </div>

      <div style={group}>
        <div style={label}>Density</div>
        <div style={segWrap}>
          {['comfy', 'compact'].map(d => (
            <button key={d} style={{...segBtn, ...(density === d ? segActive : {})}} onClick={() => setDensity(d)}>
              {d}
            </button>
          ))}
        </div>
      </div>

      <div style={group}>
        <div style={label}>Annotation hue · {hue}°</div>
        <input type="range" min="0" max="360" step="1" value={hue}
               onChange={e => setHue(parseInt(e.target.value))}
               style={{width: '100%'}} />
        <div style={{display: 'flex', gap: 6, marginTop: 6}}>
          {[0, 25, 193, 280, 130].map(h => (
            <button key={h} onClick={() => setHue(h)} style={{
              width: 24, height: 24, borderRadius: '50%',
              background: `oklch(58% 0.15 ${h})`,
              border: hue === h ? '2px solid #1a1a1a' : '1.5px solid rgba(0,0,0,0.2)',
              cursor: 'pointer',
            }} />
          ))}
        </div>
      </div>

      <div style={{...group, fontSize: 11, color: '#7a7a7a', borderTop: '1px dashed rgba(0,0,0,0.15)', paddingTop: 10, marginTop: 4}}>
        Tip: switch to <b>clean</b> to share with stakeholders. Sketchy is for the audit phase.
      </div>
    </div>
  );
}

const panel = {
  position: 'fixed', bottom: 16, right: 16,
  width: 280,
  background: '#f5f0e6',
  border: '2px solid #1a1a1a',
  borderRadius: 8,
  padding: 14,
  fontFamily: "'Architects Daughter', cursive",
  boxShadow: '4px 4px 0 rgba(0,0,0,0.15)',
  zIndex: 9999,
};
const panelHead = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  borderBottom: '1.5px dashed rgba(0,0,0,0.2)',
  paddingBottom: 6, marginBottom: 12,
};
const closeBtn = {
  width: 24, height: 24,
  background: 'transparent', border: '1.5px solid #1a1a1a',
  borderRadius: 4,
  fontSize: 18, lineHeight: 0.8, cursor: 'pointer',
  fontFamily: 'inherit',
};
const group = { marginBottom: 14 };
const label = { fontSize: 12, color: '#4a4a4a', marginBottom: 5, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' };
const segWrap = {
  display: 'flex',
  border: '1.5px solid #1a1a1a', borderRadius: 6, overflow: 'hidden',
};
const segBtn = {
  flex: 1, padding: '6px 10px',
  background: '#f5f0e6', border: 'none',
  borderRight: '1px solid rgba(0,0,0,0.2)',
  fontFamily: 'inherit', fontSize: 13, cursor: 'pointer',
  textTransform: 'capitalize',
};
const segActive = { background: '#1a1a1a', color: '#f5f0e6' };

window.DSTweaks = DSTweaks;
