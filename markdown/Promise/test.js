let p1 = new Promise((res,rej)=>{
    setTimeout(()=>{
        console.log(1)
        rej(1)
    },100)
}).then((res)=>{
    console.log('--test',res)
})
let p2 = new Promise((res,rej)=>{
    setTimeout(()=>{
        console.log(2)
        res(2)
    },200)
})
Promise.all([p1,p2]).then((data)=>{
    console.log(data)
})