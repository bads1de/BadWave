#!/usr/bin/env node
/**
 * 2 リポジトリ間の「同一パス・ソースファイル」を機械比較する
 *
 * - 対象: *.ts / *.tsx（既定では __tests__ を除外。--include-tests で含める）
 * - 比較: 同一パス（大文字小文字は区別しない / Windows 前提）同士を内容比較（SHA-1）
 *   - 既定: 改行コード（CRLF/LF）を正規化して比較（統合候補の抽出向け）
 *   - --raw: バイト単位で厳密比較
 * - 除外: node_modules / .next / dist / coverage / python-dist 等と next-env.d.ts（自動生成物）
 * - 出力: 一致 / 差分 / 片方のみ、の件数と一致ファイルの一覧
 *
 * 使い方:
 *   node scripts/compare-shared-code.mjs                    # badwave ↔ ../badwave-desktop
 *   node scripts/compare-shared-code.mjs . ../badwave-mobile
 *   node scripts/compare-shared-code.mjs --verbose          # 差分・片方のみの一覧も表示
 *   node scripts/compare-shared-code.mjs --raw              # バイト単位で厳密比較
 *   node scripts/compare-shared-code.mjs --include-tests
 *
 * 背景: docs/shared-code-memo.md の Phase 0（3環境共通コードの棚卸し）用。
 * 数値の「正」は本スクリプトの出力とし、手作業の数え上げはしない。
 */
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(SCRIPT_DIR, "..");

// 比較対象から除くディレクトリ（__tests__ は --include-tests で含められるため別扱い）
const EXCLUDED_DIRS = new Set([
  ".git",
  "node_modules",
  ".next",
  "dist",
  "coverage",
  ".cache",
  "python-dist",
  ".expo",
  "out",
  "build",
]);
// 自動生成物・gitignore 対象のため比較から除くファイル
const EXCLUDED_FILES = new Set(["next-env.d.ts"]);
const SOURCE_EXT = /\.(ts|tsx)$/;

/** 引数を { verbose, includeTests, raw, positional } に解釈する */
function parseArgs(argv) {
  const flags = new Set(argv.filter((a) => a.startsWith("--")));
  const known = new Set(["--verbose", "--include-tests", "--raw"]);
  const unknown = [...flags].filter((f) => !known.has(f));
  if (unknown.length > 0) {
    console.error(`不明なオプション: ${unknown.join(", ")}`);
    process.exit(1);
  }
  return {
    verbose: flags.has("--verbose"),
    includeTests: flags.has("--include-tests"),
    raw: flags.has("--raw"),
    positional: argv.filter((a) => !a.startsWith("--")),
  };
}

/** root 配下の対象ソースを { 小文字相対パス => { rel, abs } } で収集する */
function collect(root, includeTests) {
  if (!statSync(root, { throwIfNoEntry: false })?.isDirectory()) {
    console.error(`対象ディレクトリが見つかりません: ${root}`);
    process.exit(1);
  }
  const out = new Map();
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const abs = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (EXCLUDED_DIRS.has(entry.name)) continue;
        if (entry.name === "__tests__" && !includeTests) continue;
        walk(abs);
      } else if (
        entry.isFile() &&
        SOURCE_EXT.test(entry.name) &&
        !EXCLUDED_FILES.has(entry.name)
      ) {
        const rel = path.relative(root, abs).split(path.sep).join("/");
        const key = rel.toLowerCase();
        const prev = out.get(key);
        if (prev && prev.rel !== rel) {
          console.warn(`警告: 大文字小文字違いの重複パス: ${prev.rel} / ${rel}`);
        }
        out.set(key, { rel, abs });
      }
    }
  };
  walk(root);
  return out;
}

/** CR（0x0D）を除去したバッファを返す（CRLF → LF。統合候補抽出のための正規化） */
function normalizeEol(buf) {
  const out = Buffer.allocUnsafe(buf.length);
  let n = 0;
  for (let i = 0; i < buf.length; i++) {
    const b = buf[i];
    if (b !== 0x0d) out[n++] = b;
  }
  return out.subarray(0, n);
}

/** ファイルの内容キー（SHA-1）を返す。raw=false なら改行コードを正規化する */
function contentKey(file, raw) {
  const buf = readFileSync(file);
  const data = raw ? buf : normalizeEol(buf);
  return createHash("sha1").update(data).digest("hex");
}

function main() {
  const { verbose, includeTests, raw, positional } = parseArgs(process.argv.slice(2));
  const aDir = path.resolve(positional[0] ?? REPO_ROOT);
  const bDir = path.resolve(positional[1] ?? path.join(aDir, "..", "badwave-desktop"));

  const a = collect(aDir, includeTests);
  const b = collect(bDir, includeTests);

  const identical = [];
  const differing = [];
  const onlyA = [];
  const onlyB = [];

  for (const [key, fa] of a) {
    const fb = b.get(key);
    if (!fb) {
      onlyA.push(fa.rel);
      continue;
    }
    (contentKey(fa.abs, raw) === contentKey(fb.abs, raw) ? identical : differing).push(fa.rel);
  }
  for (const [key, fb] of b) {
    if (!a.has(key)) onlyB.push(fb.rel);
  }

  const sortJa = (arr) => arr.sort((x, y) => x.localeCompare(y));
  sortJa(identical);
  sortJa(differing);
  sortJa(onlyA);
  sortJa(onlyB);

  const matchLabel = raw ? "バイト完全一致" : "内容一致（改行コード正規化後）";
  const samePath = identical.length + differing.length;
  console.log(`=== 共有コード比較: ${path.basename(aDir)} ↔ ${path.basename(bDir)} ===`);
  console.log(`A: ${aDir}`);
  console.log(`B: ${bDir}`);
  console.log(
    `条件: *.ts / *.tsx、テスト${includeTests ? "込み" : "除く"}、パスの大文字小文字は区別しない、${
      raw ? "バイト単位で比較" : "改行コードは正規化"
    }`
  );
  console.log("");
  console.log(`同一パス: ${samePath} ファイル`);
  console.log(`  ${matchLabel}: ${identical.length}`);
  console.log(`  内容差分あり  : ${differing.length}`);
  console.log(`A のみ: ${onlyA.length} / B のみ: ${onlyB.length}`);
  console.log("");
  console.log(`${matchLabel}（統合候補） ${identical.length} 件:`);
  for (const f of identical) console.log(`  - ${f}`);

  if (verbose) {
    console.log("");
    console.log(`内容差分あり ${differing.length} 件:`);
    for (const f of differing) console.log(`  - ${f}`);
    console.log("");
    console.log(`A のみ ${onlyA.length} 件:`);
    for (const f of onlyA) console.log(`  - ${f}`);
    console.log("");
    console.log(`B のみ ${onlyB.length} 件:`);
    for (const f of onlyB) console.log(`  - ${f}`);
  }
}

main();
