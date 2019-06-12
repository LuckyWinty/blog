function rawMethod(a){
    console.log(0)
    return a+1;
}
function middleWare1(next){
    console.log(1)
    return function(a){
        return next(a)+1
    }
}
function middleWare2(next){
    console.log(2)
    return function(a){
        return next(a)+1
    }
}
function middleWare3(next){
    console.log(3)
    return function(a){
        return next(a)+1
    }
}
const applyMiddleWare=(...args)=>{
    //补充代码
    const fn = [...args]
    return fn.reduce((prev,cur,curIndex,array)=>{
        return cur(prev)
    })   
}
//test
const newFunc = applyMiddleWare(rawMethod,middleWare2,middleWare1)
console.log(newFunc(1))
//执行顺序，middleWare2->middleWare1->rawMethod
const newFunc2 = applyMiddleWare(newFunc,middleWare3)
console.log(newFunc2(1))
//执行顺序，middleWare3->middleWare2->middleWare1->rawMethod