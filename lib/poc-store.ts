import { promises as fs } from "fs"
import path from "path"

const DATA_DIR = path.join(process.cwd(), "data", "poc")

async function ensureDir() {
  await fs.mkdir(DATA_DIR, { recursive: true })
}

async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(filePath, "utf8")
    return JSON.parse(raw) as T
  } catch (err: any) {
    if (err?.code === "ENOENT") return fallback
    throw err
  }
}

async function writeJsonFile<T>(filePath: string, value: T): Promise<void> {
  await ensureDir()
  const uniqueSuffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`
  const tmp = `${filePath}.${uniqueSuffix}.tmp`
  await fs.writeFile(tmp, JSON.stringify(value, null, 2), "utf8")
  await fs.rename(tmp, filePath)
}

export async function readStore<T>(name: string, fallback: T): Promise<T> {
  await ensureDir()
  const filePath = path.join(DATA_DIR, `${name}.json`)
  return readJsonFile(filePath, fallback)
}

export async function writeStore<T>(name: string, value: T): Promise<void> {
  const filePath = path.join(DATA_DIR, `${name}.json`)
  await writeJsonFile(filePath, value)
}

