// @ts-ignore
Promise.prototype.finally = function (callback) {
  let P = this.constructor;
  return this.then(
    value => P.resolve(callback && callback()).then(() => value),
    reason => P.resolve(callback && callback()).then(() => { throw reason })
  );
}