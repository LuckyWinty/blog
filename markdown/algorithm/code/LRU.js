// 实现一个LRU过期算法的KV cache, 所有KV过期间隔相同, 满足如下性质: 
// 1. 最多存储n对KV; 
// 2. 如果大于n个, 则随意剔除一个已经过期的KV; 
// 3. 如果没有过期的KV, 则按照LRU的规则剔除一个KV; 
// 4. 查询时如果已经过期, 则返回空;

/**
 * @param {number} capacity
 */
class LRUCache {
    constructor(capacity,intervalTime){
        this.cache = new Map();
        this.capacity = capacity;
        this.intervalTime = intervalTime;
    }
    get(key){
        if(!this.cache.has(key)){
            return null
        }
        const tempValue = this.cache.get(key)
        this.cache.delete(key);
        this.cache.set(key,tempValue)
        if(Date.now() - tempValue.time > this.intervalTime){
            return null
        }
        return tempValue.value
    }
    put(key, value){
        if(this.cache.has(key)){
            this.cache.delete(key)
        }
        if(this.cache.size >= capacity){ //满了
            const keys = this.cache.keys()
            this.cache.delete(keys.next().value)
        }
        this.cache.set(key, {value,time:Date.now()})
    }
}