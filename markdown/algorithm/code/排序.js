// 冒泡
function bubbleSort(arr){
    const len = arr.length;

    for(let i = 0; i < len;i++){
        let flag = false;
        for(let j = 0; j < len-i-1; j++){
            if(arr[j]>arr[j+1]){
                let temp = arr[j];
                arr[j] = arr[j+1];
                arr[j+1] = temp;
                flag = true;
            }
        }
        if(!flag){
            break;
        }
    }
    return arr
}
// 插入排序
function insertionSort(arr){

    for(let i=1; i<arr.length; i++){
        let tmp = arr[i];
        for(var j = i-1;j>=0;j--){
            if(arr[j]>arr[i]){
                arr[j+1] = arr[j]
            }else{
                break;
            }
        }
        arr[j+1]=tmp
    }
    return arr
}
// 快排

function quicksort(arr){
    if(arr.length < 2)return arr
    recursive(arr,0,arr.length-1)
    return arr
    function recursive(arr,left,right){
        if(left >= right) return;
        let position = getPosition(arr,left,right)
        recursive(arr,left,position)
        recursive(arr,position + 1,right)
    }
    function getPosition(arr,left,right){
        let pivot = arr[left]
        while(left < right){
            while(left < right && arr[right] >= pivot){
                right--;
            }
            arr[left] = arr[right]
            while(left < right && arr[left] <= pivot){
                left++;
            }
            arr[right] = arr[left];
        }
        arr[left] = pivot
        return left
    }
}
// top k 问题
var findKthLargest = function(nums, k) {

    return recursive(nums,0,nums.length-1)
    
    function recursive(nums,left,right){
        const position = getPosition(nums,left,right)
        if(position === k - 1){
            return nums[position]
        }
        if(position > k-1){
            recursive(nums,left,position)
        }else{
            recursive(nums,position+1,right)
        }
    }
    function getPosition(arr,left,right){
        let pivot = arr[left]

        while(left < right){
            while(left < right && arr[right] >= pivot) right--;
            arr[left] = arr[right]
            while(left < right && arr[left] <= pivot) left++;
            arr[right] = arr[left]
        }
        arr[left] = pivot
        return left
    }
};
// 堆排序
/** 
 * 构造初始堆
 * 调整
 * 找到第一个非叶子节点，由下而上开始调整
*/ 
function headSort(arr){
    creatHead(arr) // 构造初始堆

    for(let i = arr.length - 1 ;i > 0 ;i--){
        [arr[0],arr[i]] = [arr[i],arr[0]] // 元素交换
        adjustHead(arr,0,i)
    }
    return arr

    function adjustHead(arr,index,len){
        for(let i = 2 * index + 1;i < len;i = 2 * i + 1){//下一个要判断的节点为当前节点的左孩子
            if(i + 1 < len && arr[i+1]>arr[i]){ //判断左右节点中最大的节点
                i++;
            }

            if(arr[i] > arr[index]){
                [arr[i],arr[index]]=[arr[index],arr[i]]
                index = i; // 谁交换则谁成为下一个要调整的节点
            }else{
                break; //没发生交换，则调整完成
            }
        }
    }
    function creatHead(arr){
        let curIndex = parseInt(arr.length/2) - 1
        for(let i = curIndex;i >= 0;i--){
            adjustHead(arr,i,arr.length)
        }
    }
}
// 堆排序 top k
var findKthLargest = function(arr, k) {
    creatHead(arr)
    for(let i = arr.length - 1;i >= 0;i--){
        [arr[0],arr[i]] = [arr[i],arr[0]]
        if(i <= arr.length - k){ // top 即 第 length - k 个
            return arr[arr.length - k]
        }else{
            adjustHead(arr,0,i)
        }
    }

    function adjustHead(arr,index,len){
        for(let i = 2 * index + 1;i < len;i = 2 * index +1){
            if(i + 1 < len && arr[i+1]>arr[i]){
                i++
            }
            if(arr[i] > arr[index]){
                [arr[i],arr[index]] = [arr[index],arr[i]]
                index = i;                
            }else{
                break;
            }
        }
    }

    function creatHead(arr){
        const targetIndex = parseInt(arr.length/2) - 1;
        for(let i = targetIndex; i >= 0;i--){
            adjustHead(arr,i,arr.length)
        }
    }
};