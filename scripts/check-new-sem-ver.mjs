/**
 * Takes two versions and returns whether the new version is increased either major, minor or patch
 * @param semVer current sem ver
 * @param newSemVer new sem ver to check
 * @returns {boolean}
 */
const checkNewSemVerIsGreater = (semVer, newSemVer) => {
  const [major, minor, patch] = semVer.split('.').map((i) => parseInt(i, 10));
  const [newMajor, newMinor, newPatch] = newSemVer.split('.').map(i => parseInt(i, 10));

  return !!((newMajor > major) | (newMinor > minor) | (newPatch > patch));
};

export {
  checkNewSemVerIsGreater
}
