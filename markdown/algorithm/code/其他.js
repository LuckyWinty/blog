// 
// 给定一个数组代表股票每天的价格，请问只能买卖一次的情况下，最大化利润是多少？
// 日期不重叠的情况下，可以买卖多次呢？
// 输入: [100, 80, 120, 130, 70, 60, 100, 125]
// 只能买一次：65（60 买进，125 卖出）
// 可以买卖多次: 115（80买进，130卖出；60 买进，126卖出）

//单次
var maxProfit = function(prices) {
    if(prices.length <= 1) return 0
    let minPrice = prices[0];
    let maxResult = 0;

    for(let i=1; i<prices.length; i++) {
        if(prices[i] < minPrice){
            minPrice = prices[i]
        }else if(maxResult < (prices[i]-minPrice)){
            maxResult = prices[i]-minPrice
        }
    }
    return maxResult
};
//多次
var maxProfit = function(prices) {
    if(prices.length <= 1) return 0
    let maxResult = 0;

    for(let i=1; i<prices.length; i++) {
        if(prices[i] < prices[i-1] > 0){
            maxResult = prices[i] < prices[i-1]
        }
    }
    return maxResult
};
 // 无重复的最大字串

 function countSting(s){
     let str = '';
     let len = 0;

     for(let i = 0; i < s.length; i++){
         if(str.indexOf(s[i])>-1){
            len = str.length > len ? str.length:len
            str = str.substring(str.indexOf(s[i])+1,str.length)
         }
            str += s[i]
     }
     return str.length > len?str.length:len
 }
//  最长公共前缀
var longestCommonPrefix = function(strs) {
    if(!strs.length) return ''
    if(strs.length === 1) return strs[0]

    let index = 0;
    let flag = true;
    while (flag){
       for(let i = 1;i<strs.length;i++){
           if(strs[i].length <= index){
               flag = false;
               break;
           }
           if(strs[i][index]!==strs[0][index]){
                flag = false;
                break;
           }
       }
        index++; 
    }
    return strs[0].substring(0, index-1)
};
//字符串的排列
var checkInclusion = function(s1, s2) {
    const len1 = s1.length
    const len2 = s2.length
    if(len1 > len2) return false;
    const obj = {}
    const obj2 = {}
    for(let i = 0; i < len1;i++){
        if(obj[s1[i]]){
            obj[s1[i]]++ 
        }else{
            obj[s1[i]] = 1
        }
        if(obj2[s2[i]]){
            obj2[s2[i]]++ 
        }else{
            obj2[s2[i]] = 1
        }
    }

    if(checkSame(obj,obj2)) return true

    for(let j = len1; j < len2;j++){
        if(obj2[s2[j]]){
            obj2[s2[j]]++
        }else{
            obj2[s2[j]]=1
        }
        obj2[s2[j-len1]]=obj2[s2[j-len1]]-1
        if(obj2[s2[j-len1]]===0) {
            delete obj2[s2[j-len1]]
        }
        if(checkSame(obj,obj2)) return true
    }

    return false

    function checkSame(obj1, obj2){
        if(Object.keys(obj1).length !== Object.keys(obj2).length) return false
        for(let o in obj1){
            if(!obj2[o]) return false
            if(obj1[o] !== obj2[o]) return false
        }
        return true
    }
};
//三数之和
// 给你一个包含 n 个整数的数组 nums，判断 nums 中是否存在三个元素 a，b，c ，
// 使得 a + b + c = 0 ？请你找出所有满足条件且不重复的三元组。
// 注意：答案中不可以包含重复的三元组。
// 1.排序 2.遍历，双指针 3.num[i]>0 结束。num[i]===num[i-1] 跳过
var threeSum = function(nums) {
    let len = nums.length
    if(!nums || len < 3) return []
    const result = []
    nums=nums.sort((a,b)=>{
        return a - b
    })
    for(let i=0;i<len;i++){
        if(nums[i]>0) break;
        if(nums[i] === nums[i-1])continue;
        let target = -nums[i]
        let k = i+1;
        let j = len -1;
        while(k < j){
            if(nums[k]+nums[j] === target){
                result.push([nums[i],nums[k],nums[j]])
                k++
                j--
                while(nums[k] === nums[k-1]){
                    k++
                }
                while(nums[j] === nums[j+1]){
                    j--
                }
            }
            if(nums[k]+nums[j] > target){
                j--;
            }
            if(nums[k]+nums[j] < target){
                k++;
            }
        }
    }
    return result;
}

//字符串相乘
//给定两个以字符串形式表示的非负整数 num1 和 num2，返回 num1 和 num2 的乘积，它们的乘积也表示为字符串形式
//思路，从后往前开始，num[i]*num[j]的结果在，res[i+j],res[i+j+1]上面
var multiply = function(num1, num2) {
    if(num1 === '0'||num2 === '0')return '0'
    let len1 = num1.length
    let len2 = num2.length
    let result = new Array(len1+len2).fill(0)

    for(let i = len1-1; i >= 0;i--){
        for(let j = len2-1; j >= 0;j--){
            let sum = result[i+j+1]+Number(num1[i])*Number(num2[j])
            result[i+j+1] = sum%10
            result[i+j] += Math.floor(sum/10)
        }
    }
    
    let str = '';
    let flag = false;
    for(let i=0;i<result.length;i++){
        if(result[i] !== '0' && !flag){
            flag = true;
        }
        if(flag){
            str += result[i]
        }
    }
    return str
};
//翻转字符串里的单词

var reverseWords = function(s) {
    return s.trim().replace(/\s/g,' ').split('').reverse().join('')
};
//  简化路径
var simplifyPath = function(path) {
    const arr = path.split('/')
    const stack = []

    for(let i = 0; i < arr.length;i++){
        if(arr[i] === '' || arr[i] === '.') continue;
        if(arr[i] === '..'){
            stack.pop()
        }else{
            stack.push(arr[i])
        }
    }
    return `/${stack.join('/')}`
};
// 最长连续递增序列
var findLengthOfLCIS = function(nums) {
    if(!nums.length)return;
    let target = 1;
    let temp = [nums[0]]
    for (let i = 1; i < nums.length; i++) {
        if(nums[i] > temp[temp.length -1]){
            temp.push(nums[i]);
        }else{
            if(temp.length > target){
                target = temp.length
            }
            temp = [nums[i]]
        }
    }
    if(temp.length > target){
        target = temp.length
    }
    return target
};
// 股票买卖
var maxProfit = function(prices) {
    if(prices.length < 2)return 0;
    let result = 0;

    for(let i = 1; i < prices.length;i++){
        if(prices[i] > prices[i-1]){
            result += (prices[i]-prices[i-1]);
        }
    }
    return result;
};
// 搜索旋转排序数组
var search = function(nums, target) {
    let left = 0;
    let right = nums.length - 1;
    let mid = (left + right)/2
    let targetIndex = -1;
    
    while (left <= right){
        if(nums[mid] === target){
            targetIndex = mid;
            break
        }
        if(nums[left] <= nums[mid]){
            if(nums[left] <=  target && target <= nums[mid]){
                right = mid -1
            }else{
                left = mid + 1
            }
        }else{
            if(nums[mid] <= target  && target <= nums[right]){
                left = mid + 1
            }else{
                right = mid - 1
            }
        }
        mid = left + (right-left)/2;
    }
    return targetIndex
};
// 最长连续序列
var longestConsecutive = function(nums) {
    if(nums.length < 2)return nums.length
    let max = 0;
    let set = new Set();
    for(let i = 0; i < nums.length; i++){
        set.add(nums[i])
    }
    for(let i = 0; i < nums.length; i++){
        let times = 1;
        if(set.has(nums[i]-1)){
            continue;
        }
        while(set.has(nums[i]+times)){
            times++;
        }
        max = Math.max(max,times)
    }
    return max;
};
//找出数组中乘积最大的连续子数组,[2,3,-2,4],[-2,0,-1]
// 负数
var maxProduct = function(nums) {
    if(nums.length < 2) return nums[nums.length -1]
    let max = num[i];
    let min = num[i];
    let imax = num[i];

    for(let i = 1;i < nums.length;i++) {
        if(nums[i] <= nums[i-1]){
            min = nums[i];
            imax = nums[i];
            continue;
        }
        if(nums[i] < 0){
            let temp = min;
            min = imax;
            imax = temp;
        }
        min = Math.min(min * nums[i],nums[i]);
        imax = Math.max(imax * nums[i],nums[i]);
        max = Math.max(max,imax)
    }
    return max;
};
//二叉树的最近公共祖先
var lowestCommonAncestor = function(root, p, q) {
    let target = null
    traversal(root,p,q)
    return target
    function traversal(node,p,q){
        if(!node)return false
        let min = node.val === p.val || node.val === q.val?1:0;
        let left = traversal(node.left,p,q)?1:0;
        let right = traversal(node.right,p,q)?1:0;

        if(min + left + right >=2 ){
            target = node
        }
        return (min + left + right)>0?true:false;
    }
};
//使用父指针迭代
var lowestCommonAncestor = function(root, p, q) {
    if(!root)return null;
    const map = new Map();
    const stack = [];

    map.set(root,null)
    stack.push(root)

    while(!map.has(p) || !map.has(q)){
        let cur = stack.pop();
        if(cur.left){
            map.set(cur.left,cur)
            stack.push(cur.left)
        }
        if(cur.right){
            map.set(cur.right,cur)
            stack.push(cur.right)
        }
    }

    const ancestor = new Set();
    while(p){
        ancestor.add(p)
        p = map.get(p)
    }
    while(!ancestor.has(q)){
        q = map.get(q)
    }
    return q;
};
//Excel表列序号
var titleToNumber = function(s) {
    let res = 0;

    for(let i = 0; i < s.length; i++){
        let curNum = s.charCodeAt(s.length - 1 - i) - 64;
        res = res + Math.pow(26,i)*curNum
    }
    return res
}
//根据输入数字求Excel表列序号
// A 1
// B 2
// String.fromCharCode(65, 66, 67);  // returns "ABC"
var convertToTitle = function(num) {
    let res = '';
    while(num > 0){
        num--;
        let curChar = String.fromCharCode(num % 26 + 65)
        res = curChar + res
        num = Math.floor(num/26)
    }
    return res
}
//分割数组为连续子序列
var isPossible = function(nums) {
    const countMap = {}
    const chainMap = {}

    nums.forEach((item)=>{
        chainMap[item] = 0;
        if(countMap[item]){
            countMap[item]++
        }else{
            countMap[item] = 1
        }
    })

    for(let i = 0;i < nums.length -1 ;i++){
        if(countMap[nums[i]] === 0)continue;
        if(countMap[nums[i]] > 0 && chainMap[nums[i]-1] > 0){
            countMap[nums[i]]--;
            chainMap[nums[i]]++;
            chainMap[nums[i]-1]--;
        }else if(countMap[nums[i]] > 0 && countMap[nums[i]+1] > 0 && countMap[nums[i]+2] > 0){
            countMap[nums[i]]--;
            countMap[nums[i]+1]--;
            countMap[nums[i]+2]--;
            chainMap[nums[i]+2]++;
        }else{
            return false
        }
    }
    return true
};
//有效三角形的个数
var triangleNumber = function(nums) {
    nums = quickSort(nums)
    let res = 0;
    const cache = {}

    for(let i = 0; i < nums.length; i++){
        let left = i + 1;
        let right = nums.length - 1;

        while(left < right){
            if(nums[left] + nums[right] > nums[i]){
                res += right - left
                right--;
            }else{
                left++;
            }
        }
    }
    return res
};
//快排
function quickSort(arr){
    recursive(arr,0,arr.length-1)
    return arr
    function recursive(arr,left,right){
        if(left>=right)return;
        let pos = getPos(arr,left,right)
        recursive(arr,left,pos)
        recursive(arr,pos+1,right)
    }
    function getPos(arr,left,right){
        const target = arr[left];
 
        while(left < right){
            while(left < right && arr[right] >= target){
                right--;
            }
            arr[left] = arr[right]
            while(left < right && arr[left] <= target){
                left++;
            }
            arr[right] = arr[left]
        }
        arr[left] = target
        return left
    }
}
//最小路径和
var minPathSum = function(grid) {
    if(!grid.length || !grid[0].length)return;
    const row = grid.length
    const column = grid[0].length
    for(let i = 0;i < row;i++){
        for(let j = 0;j < column;j++){
            if(i === 0 && j === 0){
                grid[i][j]=grid[i][j]
            }else if(i === 0){
                grid[i][j]=grid[i][j-1]+grid[i][j]
            }else if(j === 0){
                grid[i][j]=grid[i-1][j]+grid[i][j]
            }else{
                grid[i][j]=Math.min(grid[i-1][j],grid[i][j-1])+grid[i][j]
            }
        }
    }
    return grid[row-1][column-1]
};
//62. 不同路径
var uniquePaths = function(m, n) {
    if(m === 1||n === 1)return 1

    const grid = new Array(m)
    for(let i =0;i < m;i++){
        grid[i]=new Array(n)
        for(let j =0;j < n;j++){
            grid[i][j] = 0
        }
    }

    for(let i =0;i < m;i++){
        for(let j =0;j < n;j++){
            if(i === 0 || j === 0){
                grid[i][j]=1
            }else{
                grid[i][j]=grid[i-1][j]+grid[i][j-1]
            }
        }
    }
    return grid[m-1][n-1]
};
//不同路径 II
var uniquePathsWithObstacles = function(obstacleGrid) {
    if(!obstacleGrid.length || !obstacleGrid[0].length)return 0;
    if(obstacleGrid[0][0]===1)return 0;
    const row = obstacleGrid.length
    const column = obstacleGrid[0].length
    if(obstacleGrid[row-1][column-1]===1)return 0;
    const resultGrid = new Array(row)
    for(let i =0;i < row;i++){
        resultGrid[i]=new Array(column)
        for(let j =0;j < column;j++){
            resultGrid[i][j] = 0
        }
    }

    for(let i = 0;i < row;i++){
        for(let j = 0;j < column;j++){
            if(i === 0 && j === 0){
                resultGrid[i][j]=1
            }else if(i === 0){
                if(obstacleGrid[i][j-1] === 0){
                    resultGrid[i][j] = 1
                }else{
                    obstacleGrid[i][j] = 1
                    resultGrid[i][j] = 0
                }
            }else if(j === 0){
                if(obstacleGrid[i-1][j] === 0){
                    resultGrid[i][j] = 1
                }else{
                    obstacleGrid[i][j] = 1
                    resultGrid[i][j] = 0
                }
            }else{
                if(obstacleGrid[i-1][j] === 1 && obstacleGrid[i][j-1]===1){
                    resultGrid[i][j] = 0
                }else if(obstacleGrid[i-1][j] !== 1 && obstacleGrid[i][j-1] !== 1){
                    resultGrid[i][j] = resultGrid[i-1][j]+resultGrid[i][j-1]
                }else if(obstacleGrid[i-1][j] !== 1 ){
                    resultGrid[i][j] = resultGrid[i-1][j]
                }else{
                    resultGrid[i][j] = resultGrid[i][j-1]
                }
            }
        }
    }
    return resultGrid[row-1][column-1]
};
// 1055. 形成字符串的最短路径
// source = "abc", target = "abcbc"
var shortestWay = function(source, target) {
    let count = 0;

    for(let i = 0;i < target.length;){
        let charIndex = source.indexOf(target[i]);
        if(charIndex === -1){
            return -1
        }
        i++;
        let subStr = source.substr(charIndex)
        charIndex = subStr.indexOf(target[i])
        while(i < target.length && charIndex<source.length && charIndex > -1){
            i++;
            subStr = source.substr(charIndex)
            charIndex = subStr.indexOf(target[i])
        }
        count++
    }
    return count
};