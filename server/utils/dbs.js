/* eslint-disable no-unused-vars */

const func = (interests1, interests2) => {
  let dis = 0;
  for (let i = 0; i < interests1.length; i++) {
    if (interests1[i] != interests2[i]) {
      dis++;
    }
  }
  return dis;
};
const euclideanDist = (u1, u2) => {
  const p = u1.interests;
  const q = u2.interests;

  var sum = 0;
  var i = Math.min(p.length, q.length);

  while (i--) {
    sum += Math.abs(p[i] - q[i]);
  }

  return sum;
};

const funcG = (contact, lastGroups) => {
  let times = 0;
  for (let i = 0; i < lastGroups.length; i++) {
    if (lastGroups[i].participants.includes(contact)) times++;
  }

  return times / lastGroups.length;
};

module.exports = { func, euclideanDist, funcG };
