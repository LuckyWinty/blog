// 任何大于 1 等于 1 的自然数阶乘公式为：n! = 1 * 2 * 3 * (n -1)n

// function f(n){
//     if(n === 1){
//         return 1;
//     }
//     return n*f(n-1)
// }

// function f(n,total = 1){
//     if(n === 1){
//         return total;
//     }
//     // debugger;
//     return f(n-1,total*n)
// }
// const t = Date.now()
// console.log(f(50));
// console.log('--cost--',Date.now() - t)

function tailCallOptimize(f) {
    let value;
    let active = false;
    const accumulated = [];
    return function accumulator() {
        // debugger;
        accumulated.push(arguments);
        if (!active) {
            active = true;
            while (accumulated.length) {
                value = f.apply(this, accumulated.shift());
                console.log('---value', value);
            }
            active = false;
            return value;
        }
    };
}

const fn = tailCallOptimize(function (n,total = 1){
    if(n === 1){
        return total;
    }
    return fn(n-1,total*n)
});
console.log(fn(10));