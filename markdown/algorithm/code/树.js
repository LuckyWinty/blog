// 递归前序遍历
var inorderTraversal = function (root, array = []) {
    if(root){
        array.push(root)
        inorderTraversal(root.left)
        inorderTraversal(root.right)
    }
    return array
}
// 非递归前序遍历
var inorderTraversal = function (root, array = []) {
    let stack = []
    let current = root

    while(current || stack.length){
        if(current){
            
        }
    }
}