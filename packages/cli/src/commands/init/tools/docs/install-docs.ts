import { join } from 'node:path';

import { copyDirWithVersionCheck } from '@commands/init/tools/shared/copy-helpers';
import { DOCS_SKILLS } from '@commands/init/tools/shared/skill-manifest';

export { DOCS_SKILLS };

export interface InstallDocsOptions {
  assetsRoot: string;
  targetRoot: string;
  skills: string[];
  force?: boolean;
}

export interface InstallDocsResult {
  copiedSkills: string[];
  updatedSkills: string[];
  skippedSkills: string[];
  outdatedSkills: Array<{
    name: string;
    installed: string | null;
    bundled: string | null;
  }>;
}

export async function installDocs(
  options: InstallDocsOptions,
): Promise<InstallDocsResult> {
  const force = options.force ?? false;
  const result: InstallDocsResult = {
    copiedSkills: [],
    updatedSkills: [],
    skippedSkills: [],
    outdatedSkills: [],
  };

  for (const skill of options.skills) {
    const source = join(options.assetsRoot, 'skills', skill);
    const destination = join(options.targetRoot, '.agents', 'skills', skill);
    const resultWithVersion = await copyDirWithVersionCheck(
      source,
      destination,
      force,
    );

    if (resultWithVersion.status === 'copied') {
      result.copiedSkills.push(skill);
    } else if (resultWithVersion.status === 'updated') {
      result.updatedSkills.push(skill);
    } else if (resultWithVersion.status === 'outdated') {
      result.outdatedSkills.push({
        name: skill,
        installed: resultWithVersion.installedVersion ?? null,
        bundled: resultWithVersion.bundledVersion ?? null,
      });
    } else {
      result.skippedSkills.push(skill);
    }
  }

  return result;
}
