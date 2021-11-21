import { execSync } from 'child_process';
import path from 'path';

const getZipPath = path.join(process.cwd(), './tmp/build.zip');

async function zipBuild() {
  await execSync(`mkdir -p ${path.join(process.cwd(), './tmp/')}`);
  const cmd = `zip -r ${getZipPath} ${path.join(process.cwd(), './build/*')}`;
  await execSync(cmd);
}

export {
  zipBuild,
  getZipPath,
}
