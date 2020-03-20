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