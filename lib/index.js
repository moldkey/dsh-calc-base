/**
 * 进制转换
 *
 * 2/8/10/16 进制互转，支持任意进制（2-36）。看内存、调协议、解编码时用。纯本地计算，不联网。
 */

export const name = "dsh-calc-base";

export const inject = ["tools"];

const TEXT_OUTPUT = {
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      text: { type: "string" },
    },
    required: ["text"],
  },
  render: (_args, value) => [
    { type: "text", text: (value && value.text) || "" },
  ],
};

// ══════════════════════════════════════════════════════════
//  通用工具函数
// ══════════════════════════════════════════════════════════

const TITLE = "__CALC_TITLE__";

function fmt(n, digits) {
  if (!Number.isFinite(n)) return String(n);
  const d = digits == null ? 2 : digits;
  if (Math.abs(n) >= 1e12) return n.toExponential(6);
  let s = n.toFixed(d);
  if (d > 0) s = s.replace(/0+$/, "").replace(/\.$/, "");
  return s;
}

function money(n) {
  if (!Number.isFinite(n)) return String(n);
  return n.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function num(v, def) {
  const n = Number(v);
  return Number.isFinite(n) ? n : (def == null ? 0 : def);
}

function line(label, value, unit) {
  const pad = "  ";
  return pad + label + "：" + value + (unit ? " " + unit : "");
}

function head(title) {
  return [title, "=".repeat(52)];
}

// ══════════════════════════════════════════════════════════
//  工具
// ══════════════════════════════════════════════════════════

export function apply(ctx, config) {
  void config;

  ctx.tools.register({
    name: "calc_base",
    description:
      "进制转换。支持 2 到 36 任意进制互转。例：255 的十六进制是 FF。",
    parameters: {
      value: { type: "string", required: true, description: "要转换的值" },
      from_base: { type: "number", description: "源进制，默认 10" },
      to_base: { type: "number", description: "目标进制，默认 16" },
    },
    output: TEXT_OUTPUT,
    async execute(args) {
      try {
        const a = args || {};
        const raw = String(a.value || "").trim().replace(/^0x/i, "").replace(/^0b/i, "");
        if (!raw) return { text: "value 必填" };
        const fb = Math.max(2, Math.min(36, Number(a.from_base) || 10));
        const tb = Math.max(2, Math.min(36, Number(a.to_base) || 16));
        const n = parseInt(raw, fb);
        if (!Number.isFinite(n)) return { text: "在 " + fb + " 进制下解析不了: " + raw };
        const out = n.toString(tb).toUpperCase();
        const L = head("进制转换");
        L.push(line("输入", raw + " (" + fb + " 进制)"));
        L.push(line("输出", out + " (" + tb + " 进制)"));
        L.push("");
        L.push("  各进制对照：");
        L.push("    2  →  " + n.toString(2));
        L.push("    8  →  " + n.toString(8));
        L.push("    10 →  " + n.toString(10));
        L.push("    16 →  " + n.toString(16).toUpperCase());
        return { text: L.join("\n") };
      } catch (e) {
        return { text: "计算失败: " + String((e && e.message) || e) };
      }
    },
  });
}
