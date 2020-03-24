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