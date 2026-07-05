import { SupportedLanguage, CCELayerResult } from "../types";

export function c2Minify(code: string, language: SupportedLanguage): CCELayerResult {
  const original = code;
  let result = code;

  switch (language) {
    case "typescript":
    case "javascript":
      result = minifyJsTs(result);
      break;
    case "python":
      result = minifyPython(result);
      break;
    case "java":
    case "csharp":
      result = minifyJavaStyle(result);
      break;
    case "go":
    case "rust":
      result = minifyGoRust(result);
      break;
    case "sql":
      result = minifySql(result);
      break;
    case "bash":
      result = minifyBash(result);
      break;
    default:
      result = minifyGeneric(result);
  }

  const saved = Math.max(0, original.length - result.length);

  return {
    code: result,
    tokensSaved: Math.round(saved / 4),
    layerName: "C2-Minifier",
  };
}

function minifyJsTs(code: string): string {
  code = code.replace(/\/\/[^\n]*/g, "");
  code = code.replace(/\/\*[\s\S]*?\*\//g, "");
  code = code.replace(/^\s*[\r\n]/gm, "");
  code = code.replace(/([^'"`])\s{2,}/g, "$1 ");
  code = code.replace(/\s*([=+\-*/<>!&|,;:{}()])\s*/g, "$1");
  code = code.replace(/(return|const|let|var|if|else|for|while|function|class|import|export|async|await|new|typeof|instanceof)([({[a-zA-Z_$])/g, "$1 $2");
  return code.trim();
}

function minifyPython(code: string): string {
  code = code.replace(/^\s*#[^\n]*/gm, "");
  code = code.replace(/\s+#[^'"\n][^\n]*/g, "");
  code = code.replace(/"""[\s\S]*?"""/g, "");
  code = code.replace(/'''[\s\S]*?'''/g, "");
  code = code.replace(/^\s*[\r\n]/gm, "");
  code = code
    .split("\n")
    .map((line) => {
      const indent = line.match(/^(\s+)/)?.[1] ?? "";
      const level = Math.round(indent.length / 4);
      return " ".repeat(level * 2) + line.trim();
    })
    .join("\n");
  return code.trim();
}

function minifyJavaStyle(code: string): string {
  code = code.replace(/\/\/[^\n]*/g, "");
  code = code.replace(/\/\*[\s\S]*?\*\//g, "");
  code = code.replace(/^\s*[\r\n]/gm, "");
  code = code.replace(/\s*([=+\-*/<>!&|,;:{}()])\s*/g, "$1");
  code = code.replace(/(return|if|else|for|while|class|public|private|protected|static|void|new)([({[a-zA-Z_])/g, "$1 $2");
  return code.trim();
}

function minifyGoRust(code: string): string {
  code = code.replace(/\/\/[^\n]*/g, "");
  code = code.replace(/\/\*[\s\S]*?\*\//g, "");
  code = code.replace(/^\s*[\r\n]/gm, "");
  code = code.replace(/\s*([=+\-*/<>!&|,;:{}()])\s*/g, "$1");
  code = code.replace(/(fn|let|mut|pub|use|struct|impl|return|if|else|for|while)([({[a-zA-Z_])/g, "$1 $2");
  return code.trim();
}

function minifySql(code: string): string {
  code = code.replace(/--[^\n]*/g, "");
  code = code.replace(/\/\*[\s\S]*?\*\//g, "");
  code = code.replace(/^\s*[\r\n]/gm, "");
  code = code.replace(/ {2,}/g, " ");
  code = code.replace(/\b(select|from|where|join|on|group by|order by|having|insert|update|delete|create|drop|alter|table|index)\b/gi,
    (m) => m.toUpperCase());
  return code.trim();
}

function minifyBash(code: string): string {
  code = code.replace(/^\s*#[^\n]*/gm, "");
  code = code.replace(/^\s*[\r\n]/gm, "");
  code = code.replace(/ {2,}/g, " ");
  return code.trim();
}

function minifyGeneric(code: string): string {
  code = code.replace(/^\s*[\r\n]/gm, "");
  code = code.replace(/ {2,}/g, " ");
  return code.trim();
}