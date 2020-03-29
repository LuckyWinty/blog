function tailCallOptimize(f) {
    let value;
    let active = false;
    const accumulated = [];
    return function accumulator() {
        accumulated.push(arguments);
        if (!active) {
            active = true;
            while (accumulated.length) {
                value = f.apply(this, accumulated.shift());
            }
            active = false;
            return value;
        }
    };
}
const fib = tailCallOptimize(function (n, x = 1, y = 1) {
    if (n <= 2) {
        return y;
    } else {
        return fib(n - 1, y, x + y);
    }
});
console.log(fib(10000));
