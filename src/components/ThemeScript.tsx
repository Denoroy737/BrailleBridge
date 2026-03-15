/** Inline script executed before paint to avoid theme flash */
export function ThemeScript() {
  const script = `(function(){try{var s=localStorage.getItem('bb-theme');var d=window.matchMedia('(prefers-color-scheme:dark)').matches;if(s==='dark'||(s===null&&d)){document.documentElement.classList.add('dark');}else{document.documentElement.classList.remove('dark');}}catch(e){}})();`;
  // biome-ignore lint/security/noDangerouslySetInnerHtml: intentional theme init
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
