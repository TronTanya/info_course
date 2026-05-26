"use client";

import { useMemo, useState } from "react";
import { Check, Copy } from "lucide-react";
import hljs from "highlight.js/lib/core";
import bash from "highlight.js/lib/languages/bash";
import javascript from "highlight.js/lib/languages/javascript";
import json from "highlight.js/lib/languages/json";
import python from "highlight.js/lib/languages/python";
import sql from "highlight.js/lib/languages/sql";
import xml from "highlight.js/lib/languages/xml";
let registered = false;
function ensureLanguages() {
  if (registered) return;
  hljs.registerLanguage("bash", bash);
  hljs.registerLanguage("shell", bash);
  hljs.registerLanguage("sh", bash);
  hljs.registerLanguage("javascript", javascript);
  hljs.registerLanguage("js", javascript);
  hljs.registerLanguage("typescript", javascript);
  hljs.registerLanguage("ts", javascript);
  hljs.registerLanguage("json", json);
  hljs.registerLanguage("python", python);
  hljs.registerLanguage("py", python);
  hljs.registerLanguage("sql", sql);
  hljs.registerLanguage("xml", xml);
  hljs.registerLanguage("html", xml);
  registered = true;
}

export function CodeBlock({ code, language }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);
  const lang = (language ?? "text").toLowerCase().trim() || "text";

  const html = useMemo(() => {
    ensureLanguages();
    try {
      if (lang !== "text" && hljs.getLanguage(lang)) {
        return hljs.highlight(code, { language: lang }).value;
      }
      return hljs.highlightAuto(code).value;
    } catch {
      return code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }
  }, [code, lang]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="ce-mentor-code group relative my-3 overflow-hidden rounded-lg border">
      <div className="flex items-center justify-between border-b border-cyan/15 bg-cyan/5 px-3 py-1.5">
        <span className="font-mono text-2.5 font-medium uppercase tracking-wider text-cyan/90">{lang}</span>
        <button
          type="button"
          onClick={() => void copy()}
          className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-2.5 text-muted-foreground transition hover:bg-muted/30 hover:text-foreground"
          aria-label="Копировать код"
        >
          {copied ? <Check className="size-3 text-success" /> : <Copy className="size-3" />}
          {copied ? "Скопировано" : "Копировать"}
        </button>
      </div>
      <pre className="ce-mentor-code-pre max-h-64 overflow-x-auto p-3 text-3.25 leading-relaxed">
        <code className="hljs" dangerouslySetInnerHTML={{ __html: html }} />
      </pre>
    </div>
  );
}
