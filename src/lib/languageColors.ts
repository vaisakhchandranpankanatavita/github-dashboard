// GitHub language colors (subset covering common languages).
// Source-of-truth values mirror github/linguist. Fallback for anything
// unknown is the muted secondary-text grey.
const LANGUAGE_COLORS: Record<string, string> = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  Java: '#b07219',
  C: '#555555',
  'C++': '#f34b7d',
  'C#': '#178600',
  Go: '#00ADD8',
  Rust: '#dea584',
  Ruby: '#701516',
  PHP: '#4F5D95',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Dart: '#00B4AB',
  HTML: '#e34c26',
  CSS: '#563d7c',
  SCSS: '#c6538c',
  Less: '#1d365d',
  Shell: '#89e051',
  Vue: '#41b883',
  Svelte: '#ff3e00',
  Astro: '#ff5a03',
  'Objective-C': '#438eff',
  Scala: '#c22d40',
  Haskell: '#5e5086',
  Lua: '#000080',
  Perl: '#0298c3',
  R: '#198CE7',
  Elixir: '#6e4a7e',
  Clojure: '#db5855',
  Erlang: '#B83998',
  'Jupyter Notebook': '#DA5B0B',
  MATLAB: '#e16737',
  Dockerfile: '#384d54',
  Makefile: '#427819',
  PowerShell: '#012456',
  TeX: '#3D6117',
  Assembly: '#6E4C13',
  Nix: '#7e7eff',
  Zig: '#ec915c',
  OCaml: '#3be133',
  'F#': '#b845fc',
  Groovy: '#4298b8',
  CoffeeScript: '#244776',
  Crystal: '#000100',
  Julia: '#a270ba',
  Solidity: '#AA6746',
  GDScript: '#355570',
  Vim_Script: '#199f4b',
}

export const UNKNOWN_LANGUAGE_COLOR = '#8b949e'

export function getLanguageColor(language: string | null | undefined): string {
  if (!language) return UNKNOWN_LANGUAGE_COLOR
  return LANGUAGE_COLORS[language] ?? UNKNOWN_LANGUAGE_COLOR
}
