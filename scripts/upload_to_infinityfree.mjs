import * as ftp from 'basic-ftp';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.resolve(__dirname, '..', 'dist');

async function upload() {
  const host = process.env.INFINITYFREE_FTP_SERVER || 'ftpupload.net';
  const user = process.env.INFINITYFREE_FTP_USERNAME || 'if0_43203343';
  const password = process.env.INFINITYFREE_FTP_PASSWORD || process.argv[2];

  if (!password) {
    console.error('[FTP ERROR] Please provide the FTP password via INFINITYFREE_FTP_PASSWORD env variable or as a command line argument.');
    process.exit(1);
  }

  const client = new ftp.Client();
  client.ftp.verbose = true;

  try {
    console.log(`[FTP] Connecting to ${host} as ${user}...`);
    await client.access({
      host,
      user,
      password,
      secure: false
    });

    console.log('[FTP] Connected! Navigating to htdocs and deploying dist files...');
    await client.cd('htdocs');

    // Upload dist directory into htdocs
    await client.uploadFromDir(DIST_DIR);

    console.log('🎉 Upload complete! The website is deployed to InfinityFree.');
  } catch (err) {
    console.error('[FTP ERROR]', err);
    process.exit(1);
  } finally {
    client.close();
  }
}

upload();
