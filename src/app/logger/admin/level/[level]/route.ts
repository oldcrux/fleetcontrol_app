import { logger, setLogLevel, setLogLevel2 } from "@/app/lib/logger";
import { connection } from "@/app/lib/redis-connection";

const validLogLevels = ['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'];

export async function GET(
  request: Request,
  { params }: { params: Promise<{ level: string }> }
) {
  const level = (await params).level;

  return setLogLevel(level);
}

