/**
 * Created by Lenovo on 2016/9/2.
 */
 

/**
 * 功能：给定元素查找他的第一个元素子节点，并返回
 * @param ele
 * @returns {Element|*|Node}
 */
function getFirstNode(ele){
    var node = ele.firstElementChild || ( ele.firstChild.nodeType==1 ? ele.firstChild : getPrevNode(ele.firstChild) );
    return node;
}

/**
 * 功能：给定元素查找他的最后一个元素子节点，并返回
 * @param ele
 * @returns {Element|*|Node}
 */
function getLastNode(ele){
    return ele.lastElementChild || (ele.lastChild.nodeType==1 ? ele.lastChild : getNextNode(ele.lastChild) );
}

/**
 * 功能：给定元素查找他的下一个元素兄弟节点，并返回
 * @param ele
 * @returns {Element|*|Node}
 */
function getNextNode(ele){
    return ele.nextElementSibling || (ele.nextSibling.nodeType==1 ? ele.nextSibling : getNextNode(ele.nextSibling));
}

/**
 * 功能：给定元素查找他的上一个兄弟元素节点，并返回
 * @param ele
 * @returns {Element|*|Node}
 */
function getPrevNode(ele){
    return ele.previousElementSibling || (ele.previousSibling.nodeType==1 ? ele.previousSibling : getPrevNode(ele.previousSibling));
}

/**
 * 功能：给定元素和索引值查找指定索引值的兄弟元素节点，并返回
 * @param ele 元素节点
 * @param index 索引值
 * @returns {*|HTMLElement}
 */
function getEleOfIndex(ele,index){
    return getAllChildren(ele.parentNode)[index];
}

/**
 * 功能：给定元素查找他的所有兄弟元素，并返回数组
 * @param ele
 * @returns {Array}
 */
function getAllSiblings(ele){
    //定义一个新数组，装所有的兄弟元素，将来返回
    var newArr = [];

    newArr = getAllChildren(ele.parentNode);
    // 查找元素本身，在新数组中删除。
    var index = newArr.indexOf(ele);
    if(index != -1){
        newArr.splice(index,1);
    }
    /*var arr = ele.parentNode.children;
    for(var i=0;i<arr.length;i++){
        //判断，如果不是传递过来的元素本身，那么添加到新数组中。
        if(arr[i]!==ele){
            newArr.push(arr[i]);
        }
    }*/
    return newArr;
}

/**
 * 功能：给定元素查找他的所有子元素，并返回数组
 * @param ele
 * @returns {Array}
 */
function getAllChildren(ele){
    var childArr=ele.children || ele.childNodes;
    var childArrTem=new Array();  //  临时数组，用来存储符合条件的节点
    for(var i=0;i<childArr.length;i++){
        if(childArr[i].nodeType==1){
            childArrTem.push(childArr[i]);
        }
    }
    return childArrTem;
}

