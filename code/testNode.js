// setImmediate(() => console.log('timeout1'));
// setImmediate(() => {
//     console.log('timeout1')
//     Promise.resolve().then(() => console.log('promise resolve'))
//     process.nextTick(() => console.log('next tick1'))
// });
// setImmediate(() => {
//     console.log('timeout2')
//     process.nextTick(() => console.log('next tick2'))
// });
// setImmediate(() => console.log('timeout3'));
// setImmediate(() => console.log('timeout4'));

// async function async1(){
//     console.log('async1 start')
//     await async2()
//     console.log('async1 end')
// }
// async function async2(){
//     console.log('async2')
// }
// console.log('script start')
// setTimeout(function(){
//     console.log('setTimeout0')
// },0)
// setTimeout(function(){
//     console.log('setTimeout3')
// },3)
// setImmediate(() => console.log('setImmediate'));
// process.nextTick(() => console.log('nextTick'));
// async1();
// new Promise(function(resolve){
//     console.log('promise1')
//     resolve();
//     console.log('promise2')
// }).then(function(){
//     console.log('promise3')
// })
// console.log('script end')

 //script start=>async1 start=>async2=>promise1=>promise2
//  =>script end=>nextTick=>async1 end=>promise3=>setTimeout0
// =>setImmediate=>setTimeout3

// setInterval(() => {
//     console.log('setInterval')
//   }, 100)
  
//   process.nextTick(function tick () {
//     process.nextTick(tick)
//   })

// const promise = Promise.resolve()
//   .then(() => {
//     return promise
//   })
// promise.catch(console.error)
setImmediate(() => {
  console.log(1)
  setTimeout(() => {
    console.log(2)
  }, 100)
  setImmediate(() => {
    console.log(3)
  })
  process.nextTick(() => {
    console.log(4)
  })
})
process.nextTick(() => {
  console.log(5)
  setTimeout(() => {
    console.log(6)
  }, 100)
  setImmediate(() => {
    console.log(7)
  })
  process.nextTick(() => {
    console.log(8)
  })
})
console.log(9)