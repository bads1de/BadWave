#!/usr/bin/env node
/**
 * Supabase Free プランのアイドル pause（約7日）を防ぐための keep-alive。
 * 週1ではなく毎日、認証付きで最小リクエストを1発飛ばす想定。
 *
 * 必要な環境変数（未設定なら .env.local から読む）:
 *   SUPABASE_URL / NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_ANON_KEY / NEXT_PUBLIC_SUPABASE_ANON_KEY
 *
 * 鍵はログに出さない。失敗時は非ゼロ終了で CI に検知させる。
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnvLocal() {
  try {
    const raw = readFileSync(join(projectRoot, ".env.local"), "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (!m) continue;
      const key = m[1];
      let value = m[2].trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (process.env[key] == null || process.env[key] === "") {
        process.env[key] = value;
      }
    }
  } catch {
    // .env.local が無い場合は CI の環境変数だけで動く
  }
}

function requireEnv(names) {
  for (const name of names) {
    const value = process.env[name];
    if (value) return value;
  }
  throw new Error(`Missing env: ${names.join(" or ")}`);
}

async function hit(url, apikey) {
  const res = await fetch(url, {
    method: "GET",
    headers: {
      apikey,
      Authorization: `Bearer ${apikey}`,
    },
    signal: AbortSignal.timeout(20_000),
  });
  // 401/404 でも「プロジェクトの API に到達した」ことはアクティビティになる。
  // ネットワーク/DNS 失敗（fetch 自体の throw）だけを異常とみなす。
  return res.status;
}

async function main() {
  loadEnvLocal();

  const url = requireEnv(["SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL"]).replace(/\/$/, "");
  const apikey = requireEnv(["SUPABASE_ANON_KEY", "NEXT_PUBLIC_SUPABASE_ANON_KEY"]);

  const targets = [
    ["PostgREST", `${url}/rest/v1/`],
    ["Auth health", `${url}/auth/v1/health`],
  ];

  let failed = 0;
  for (const [label, target] of targets) {
    try {
      const status = await hit(target, apikey);
      console.log(`[ok] ${label}: HTTP ${status}`);
    } catch (error) {
      failed += 1;
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[fail] ${label}: ${message}`);
    }
  }

  if (failed > 0) {
    console.error(`keep-alive failed (${failed}/${targets.length})`);
    process.exit(1);
  }
  console.log("keep-alive done");
}

main();
