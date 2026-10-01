import {
  addDependencies, cosDependencies, create, divideDependencies, eDependencies,
  evaluateDependencies, factorialDependencies, formatDependencies, log10Dependencies,
  logDependencies, modDependencies, multiplyDependencies, parseDependencies, piDependencies,
  powDependencies, sinDependencies, sqrtDependencies, subtractDependencies, tanDependencies,
  type MathNode,
} from "mathjs/number";
import type { AngleMode } from "@/data/calculator";

const math = create({
  addDependencies,
  cosDependencies,
  divideDependencies,
  eDependencies,
  evaluateDependencies,
  factorialDependencies,
  formatDependencies,
  log10Dependencies,
  logDependencies,
  modDependencies,
  multiplyDependencies,
  parseDependencies,
  piDependencies,
  powDependencies,
  sinDependencies,
  sqrtDependencies,
  subtractDependencies,
  tanDependencies,
});
const allowedFunctions = new Set(["sin", "cos", "tan", "log", "log10", "sqrt", "factorial"]);
const allowedSymbols = new Set(["pi", "e", ...allowedFunctions]);
const allowedOperators = new Set(["+", "-", "*", "/", "%", "^", "!"]);
const allowedNodeTypes = new Set([
  "ConstantNode", "FunctionNode", "OperatorNode", "ParenthesisNode", "SymbolNode",
]);

function validateExpression(expression: string): MathNode {
  if (!expression.trim()) throw new Error("Hisoblash uchun ifoda kiriting.");
  if (expression.length > 180) throw new Error("Ifoda juda uzun. Uni qisqartirib ko'ring.");

  const parsed = math.parse(expression);
  let nodeCount = 0;
  parsed.traverse((node) => {
    nodeCount += 1;
    if (nodeCount > 80) throw new Error("Ifoda juda murakkab. Uni soddalashtirib ko'ring.");
    if (!allowedNodeTypes.has(node.type)) {
      throw new Error("Bu ifoda turi kalkulyatorda ruxsat etilmagan.");
    }
    if (math.isSymbolNode(node) && !allowedSymbols.has(node.name)) {
      throw new Error(`"${node.name}" nomidan foydalanib bo'lmaydi.`);
    }
    if (math.isOperatorNode(node) && !allowedOperators.has(node.op)) {
      throw new Error(`"${node.op}" amali qo'llab-quvvatlanmaydi.`);
    }
    if (math.isFunctionNode(node) && (!math.isSymbolNode(node.fn) || !allowedFunctions.has(node.fn.name))) {
      throw new Error("Bu funksiya kalkulyatorda ruxsat etilmagan.");
    }
  });
  return parsed;
}

// Math.js AST tekshiruvi faqat ruxsat etilgan arifmetik ifodalarni hisoblaydi.
export function evaluateCalculatorExpression(expression: string, angleMode: AngleMode): string {
  const normalized = expression
    .replaceAll("×", "*")
    .replaceAll("÷", "/")
    .replaceAll("π", "pi");
  const parsed = validateExpression(normalized);
  const scaleAngle = angleMode === "degree" ? Math.PI / 180 : 1;
  const scope = {
    sin: (value: number) => math.sin(value * scaleAngle),
    cos: (value: number) => math.cos(value * scaleAngle),
    tan: (value: number) => math.tan(value * scaleAngle),
    log: (value: number) => math.log(value),
    log10: (value: number) => math.log10(value),
    sqrt: (value: number) => math.sqrt(value),
    factorial: (value: number) => math.factorial(value),
  };
  const result: unknown = parsed.evaluate(scope);

  if (typeof result !== "number" || !Number.isFinite(result)) {
    throw new Error("Natija haqiqiy va chekli son bo'lishi kerak.");
  }
  return math.format(result, { precision: 14 });
}
