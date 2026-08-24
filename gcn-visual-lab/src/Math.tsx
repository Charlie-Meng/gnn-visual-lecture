import katex from "katex";

export function Math({ tex, display = false, className = "" }: { tex: string; display?: boolean; className?: string }) {
  const html = katex.renderToString(tex, { displayMode: display, output: "htmlAndMathml", strict: "warn", throwOnError: false });
  return <span className={`tex-math ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
}
