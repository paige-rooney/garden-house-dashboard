import fs from "node:fs";
import path from "node:path";

const source = path.join(process.cwd(), "supabase", "seed.sql");
const target = path.join(process.cwd(), "vercel-env-seed-note.txt");

const sql = fs.readFileSync(source, "utf8");
fs.writeFileSync(target, `Run this SQL in Supabase SQL editor:\n\n${sql}`);
console.log("Seed helper file created:", target);
