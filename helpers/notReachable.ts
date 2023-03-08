export const notReachable = (_: never) => {
  throw new Error('This condition should never happened ...');
};
