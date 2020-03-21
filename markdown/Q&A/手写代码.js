// 函数防抖
function throttle(fn, duration=200,context){
    let timer =null ;
    let startTime=0 ;

    return function(...args){
        clearTimeout(timer);
        let now = Date.now();
        if(now - startTime > duration){
            fn.apply(context, args);
            startTime = now;
        }else{
            timer = setTimeout(fn,duration);
        }
    }
}