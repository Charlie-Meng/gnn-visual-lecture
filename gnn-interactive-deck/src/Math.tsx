import katex from "katex";

export function Math({ tex, display = false, className = "" }: { tex: string; display?: boolean; className?: string }) {
  const html = katex.renderToString(tex, {
    displayMode: display,
    output: "htmlAndMathml",
    strict: "warn",
    throwOnError: false,
    trust: false,
  });

  return <span className={`tex-math${display ? " is-display" : ""} ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
}

export function DisplayMath({ tex, className = "" }: { tex: string; className?: string }) {
  return <Math tex={tex} display className={className} />;
}
