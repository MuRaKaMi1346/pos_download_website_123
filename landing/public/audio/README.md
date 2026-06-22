# Ambient audio

The hero ambient track (landing brief §1.5.7) is a **user-provided, royalty-free**
asset — do not generate music. Drop two files here:

- `ambient.opus` — preferred (Ogg/Opus), under 600 KB
- `ambient.mp3` — fallback, under 600 KB

Target a slow drone + faint barista room tone around −24 LUFS. `SoundToggle.tsx`
references these paths; if they are absent the toggle still works visually but
plays nothing. Default state is muted; the toggle never autoplays under
`prefers-reduced-motion`.
