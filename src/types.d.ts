/* N46: the shapes the code uses, written down once. The check (tools/build/node_modules/typescript, npm run in CI: npx tsc -p jsconfig.json) reads only files that start with // @ts-check.
   The types follow the saved data, they do not change it. Fields not listed here stay open (index signature) until a file that uses them is switched on. */
interface Window { [key: string]: any }
declare const __store: Storage
declare const require: (id: string) => any
declare const module: any
/* The code reads event targets and queried elements as the element they were bound to (e.target.closest, el.dataset, el.value). Typing every DOM read would add casts without catching data mistakes,
   so these two are open. The data shapes below (C, S, D, B) are where the check earns its keep. */
interface EventTarget { [k: string]: any }
interface Element { [k: string]: any }

/* ---- the four objects every screen reads. Fields are the ones that are always there; the rest stays open until a file that needs it is checked. ---- */
/** C: the character sheet data (saved as yudhi-kelapa-build-v3 and inside the roster). */
interface CharacterData {
  v: number; name: string; species?: string; cls?: string; sub?: string; bg?: string; size?: string; level: number; hitDie?: number
  rs?: "2014" | "2024"   // rules edition, absent means 2024
  abilities: Record<string, { base: number; bonus?: { s: string; v: number }[] }>
  [k: string]: any
}
/** S: the play state (saved as yudhi-kelapa-sheet-v1): what changes at the table. */
interface PlayState {
  hp: number; tmp: number; cond?: Record<string, any>; used?: Record<string, number>; exh?: number
  ds?: { s: number; f: number }   // death saves, successes and failures
  slots?: Record<string, number>
  [k: string]: any
}
/** D: the numbers derive() computes from C and S. Every value has a source list for the breakdown screen. */
interface DerivedData { level?: number; prof?: number; ac?: number; maxHp?: number; speed?: number; [k: string]: any }
/** B: the builder state (saved as phb24-builder-v1). */
interface BuilderState { name?: string; rs?: "2014" | "2024"; species?: string; bg?: string; cls?: string; sub?: string; level?: number; src?: Record<string, boolean>; rsKeep?: Record<string, any>; [k: string]: any }
/** One entry of the roster (cs-roster-v1 chars[id]). */
interface RosterEntry { name: string; sub?: string; created?: number; t?: number; B?: string | null; C?: string; S?: string; ph?: any; practice?: any; [k: string]: any }
