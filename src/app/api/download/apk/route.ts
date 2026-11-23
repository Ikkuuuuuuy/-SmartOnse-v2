import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const APK_SEARCH_PATHS = [
  path.join(process.cwd(), 'public', 'downloads', 'SmartOnse-v2.apk'),
  path.join(process.cwd(), 'android', 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk'),
  path.join(process.cwd(), 'android', 'app', 'build', 'outputs', 'apk', 'release', 'app-release.apk'),
];

function findBuiltApk(): { filePath: string; sizeBytes: number; updatedAt: string } | null {
  for (const candidate of APK_SEARCH_PATHS) {
    try {
      if (fs.existsSync(candidate)) {
        const stats = fs.statSync(candidate);
        if (stats.isFile() && stats.size > 0) {
          return {
            filePath: candidate,
            sizeBytes: stats.size,
            updatedAt: stats.mtime.toISOString(),
          };
        }
      }
    } catch {
      // ignore read errors on candidate path
    }
  }
  return null;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('mode');
  const apk = findBuiltApk();

  if (mode === 'info') {
    return NextResponse.json({
      available: Boolean(apk),
      fileName: 'SmartOnse-BarangayOnse-v2.0.apk',
      version: '2.0.0',
      sizeMB: apk ? (apk.sizeBytes / (1024 * 1024)).toFixed(2) : null,
      updatedAt: apk?.updatedAt || null,
    });
  }

  if (!apk) {
    return NextResponse.json(
      {
        error: 'APK build is currently being prepared. Please run `npm run android:build-apk` or build from Android Studio.',
      },
      { status: 404 }
    );
  }

  const fileBuffer = fs.readFileSync(apk.filePath);

  return new NextResponse(fileBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.android.package-archive',
      'Content-Disposition': 'attachment; filename="SmartOnse-BarangayOnse-v2.0.apk"',
      'Content-Length': String(apk.sizeBytes),
      'Cache-Control': 'no-store, must-revalidate',
    },
  });
}
