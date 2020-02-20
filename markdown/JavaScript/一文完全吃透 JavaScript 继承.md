# 一文完全吃透 JavaScript 继承(面试必备良药)
### 原型继承
原型链是实现原型继承的主要方法，基本思想就是利用原型让一个引用类型继承另一个引用类型的属性和方法。
 
#### 实现原型链的基本模式
```js
function SuperType(){
 this.property=true;
}
 
SuperType.prototype.getSuperValue=function(){
  return this.property;
}
 
function SubType(){
  this.subproperty=false;
}
 
SubType.prototype=new SuperType();

SubType.prototype.getSubValue=function(){
     return this.property;
};

var instance=new SubType();
console.log(instance.getSuperValue()); //true;
```
例子中的实例及构造函数和原型之间的关系图：
<!-- //图 -->

在例子代码中，定义了两个对象，subType和superType。

`两个对象之间实现了继承，而这种继承方式是通过创建SuperType的实例并将该实例赋给subType.prototype实现的。实现的本质就是重写了原型对象。`

这样subType.prototype中就会存在一个指针指向superType的原型对象。也就是说，存在superType的实例中的属性和方法现在都存在于subType.prototype中了。这样继承了之后，又可以为subType添加新的方法和属性。

要注意，这个指针（[[prototype]]）默认情况下是不可以再被外部访问的,估计是会被一些内部方法使用的，例如用for...in来遍历原型链上可以被枚举的属性的时候，就需要通过这个指针找到当前对象所继承的对象。不过，Firefox、Safari和Chrome在每个对象上都支持一个属性__proto__。

#### 原型继承需要注意的一些问题

**1. 别忘记默认的类型**

我们知道，所有的引用类型都继承了Object，而这个继承也是通过原型链实现的。所以所有的对象都拥有Object具有的一些默认的方法。如：`hasOwnProperty()、propertyIsEnumerable()、toLocaleString()、toString()和valueOf()`

**2. 确定原型和实例的关系**
可以通过两种方式来确定原型和实例之间的关系。

① 使用instanceof 操作符，只要用这个操作符来测试实例与原型链中出现过的构造函数，结果就会返回true。

② 第二种方式是使用isPrototypeOf()方法。同样，只要是原型链中出现过的原型，都可以说是该原型链所派生的实例的原型，因此isPrototypeOf()方法也会返回true。

例子：

```js
alert(instance instanceof Object); //true
alert(instance instanceof SuperType); //true
alert(instance instanceof SubType); //true

alert(Object.prototype.isPrototypeOf(instance)); //true
alert(SuperType.prototype.isPrototypeOf(instance)); //true
alert(SubType.prototype.isPrototypeOf(instance)); //true
```

③ 子类要在继承后定义新方法

因为，原型继承是实质上是重写原型对象。所以，如果在继承前就在子类的prototype上定义一些方法和属性。那么继承的时候，子类的这些属性和方法将会被覆盖。

如图：
<!-- 图 -->

④ 不能使用对象字面量创建原型方法

这个的原理跟第三点的实际上是一样的。当你使用对象字面量创建原型方法重写原型的时候，实质上相当于重写了原型链，所以原来的原型链就被切断了。

 <!-- 图 -->

⑤ 注意父类包含引用类型的情况

如图：
<!-- 图 -->


这个例子中的SuperType 构造函数定义了一个colors 属性，该属性包含一个数组（引用类型值）。SuperType 的每个实例都会有各自包含自己数组的colors 属性。当SubType 通过原型链继承了SuperType 之后，SubType.prototype 就变成了SuperType 的一个实例，因此它也拥有了一个它自己的colors 属性——就跟专门创建了一个SubType.prototype.colors 属性一样。但结果是什么呢？结果是SubType 的所有实例都会共享这一个colors 属性。而我们对instance1.colors 的修改能够通过instance2.colors 反映出来。也就是说，这样的修改会影响各个实例。

#### 原型继承的缺点(问题)

1. 最明显的就是上述第⑤点，有引用类型的时候，各个实例对该引用的操作会影响其他实例。
2. 没有办法在不影响所有对象实例的情况下，给超类型的构造函数传递参数。

有鉴于此，实践中很少会单独使用原型继承。

#### 借用构造函数继承
在解决原型中包含引用类型值所带来问题的过程中，开发人员开始使用一种叫做借用构造函数
(constructor stealing）的技术（有时候也叫做伪造对象或经典继承）。这种技术的基本思想相当简单，即
在子类型构造函数的内部调用超类型构造函数。

#### 基本模式
```js
function SuperType(){
  this.colors = ["red", "blue", "green"];
}
function SubType(){
   //继承了SuperType
  SuperType.call(this);
}
var instance1 = new SubType();
instance1.colors.push("black");
alert(instance1.colors); //"red,blue,green,black"
var instance2 = new SubType();
alert(instance2.colors); //"red,blue,green"
```
#### 基本思想

借用构造函数的基本思想就是利用call或者apply把父类中通过this指定的属性和方法复制（借用）到子类创建的实例中。因为this对象是在运行时基于函数的执行环境绑定的。也就是说，在全局中，this等于window，而当函数被作为某个对象的方法调用时，this等于那个对象。call 、apply方法可以用来代替另一个对象调用一个方法。call、apply 方法可将一个函数的对象上下文从初始的上下文改变为由 thisObj 指定的新对象。 　　

所以，这个借用构造函数就是，new对象的时候(注意，new操作符与直接调用是不同的，以函数的方式直接调用的时候，this指向window，new创建的时候，this指向创建的这个实例)，创建了一个新的实例对象，并且执行SubType里面的代码，而SubType里面用call调用了SuperTyep，也就是说把this指向改成了指向新的实例，所以就会把SuperType里面的this相关属性和方法赋值到新的实例上，而不是赋值到SupType上面。所有实例中就拥有了父类定义的这些this的属性和方法。

#### 优势

相对于原型链而言，借用构造函数有一个很大的优势，即可以在子类型构造函数中向超类型构造函数传递参数。因为属性是绑定到this上面的，所以调用的时候才赋到相应的实例中，各个实例的值就不会互相影响了。

例如：

```js
function SuperType(name){
    this.name = name;
}
function SubType(){
    //继承了SuperType，同时还传递了参数
    SuperType.call(this, "Nicholas");
    //实例属性
    this.age = 29;
}
var instance = new SubType();
alert(instance.name); //"Nicholas";
alert(instance.age); //29
```
#### 劣势

如果仅仅是借用构造函数，那么也将无法避免构造函数模式存在的问题——方法都在构造函数中定义，因此函数复用就无从谈起了。而且，在超类型的原型中定义的方法，对子类型而言也是不可见的，结果所有类型都只能使用构造函数模式。考虑到这些问题，借用构造函数的技术也是很少单独使用的。
### 组合继承
组合继承（combination inheritance），有时候也叫做伪经典继承。是将原型链和借用构造函数的技术组合到一块，从而发挥二者之长的一种继承模式。

#### 基本思想

思路是使用原型链实现对原型属性和方法的继承，而通过借用构造函数来实现对实例属性的继承。这样，既通过在原型上定义方法实现了函数复用，又能够保证每个实例都有它自己的属性。

#### 基本模型
```js
function SuperType(name){
  this.name = name;
  this.colors = ["red", "blue", "green"];
}
SuperType.prototype.sayName = function(){
   alert(this.name);
};
function SubType(name, age){
//继承属性
  SuperType.call(this, name);
  this.age = age;
}
//继承方法
SubType.prototype = new SuperType();
SubType.prototype.constructor = SubType;
SubType.prototype.sayAge = function(){
    alert(this.age);
};

var instance1 = new SubType("Nicholas", 29);
instance1.colors.push("black");
alert(instance1.colors); //"red,blue,green,black"
instance1.sayName(); //"Nicholas";
instance1.sayAge(); //29

var instance2 = new SubType("Greg", 27);
alert(instance2.colors); //"red,blue,green"
instance2.sayName(); //"Greg";
instance2.sayAge(); //27
```
#### 优势

组合继承避免了原型链和借用构造函数的缺陷，融合了它们的优点，成为JavaScript 中最常用的继承模式。

#### 劣势

组合继承最大的问题就是无论什么情况下，都会调用两次超类型构造函数：一次是在创建子类型原型的时候，另一次是在子类型构造函数内部。虽然子类型最终会包含超类型对象的全部实例属性，但我们不得不在调用子类型构造函数时重写这些属性。

### 寄生类继承
#### 原型式继承

其原理就是借助原型，可以基于已有的对象创建新对象。节省了创建自定义类型这一步（虽然觉得这样没什么意义）。

**模型**
```js
function object(o){
  function W(){
  }
  W.prototype = o;
 return new W();
}
```
ES5新增了Object.create()方法规范化了原型式继承。即调用方法为：Object.create(o);

**适用场景**

只想让一个对象跟另一个对象建立继承这种关系的时候，可以用Object.create();这个方法，不兼容的时候，则手动添加该方法来兼容。

#### 寄生式继承

寄生式继承是原型式继承的加强版。

**模型**
```js
function createAnother(origin){
  var clone=object(origin);
  clone.say=function(){
    alert('hi')
  }
  return clone;
}
```
即在产生了这个继承了父类的对象之后，为这个对象添加一些增强方法。

#### 寄生组合式继承

实质上，寄生组合继承是寄生式继承的加强版。这也是为了避免组合继承中无可避免地要调用两次父类构造函数的最佳方案。`所以，开发人员普遍认为寄生组合式继承是引用类型最理想的继承范式。`

**基本模式**
```js
function inheritPrototype(SubType,SuperType){
  var prototype=object(SuperType.prototype);
  prototype.constructor=subType;
  subType.prototype=prototype;
}
```
这个object是自定义的一个相当于ES5中Object.create()方法的函数。在兼容性方面可以两个都写。

**兼容写法**
```js
function object(o){
    function W(){
    }
    W.prototype=o;
    return new W;
}
function inheritPrototype(SubType,SuperType){
    var prototype;
   if(typeof Object.create==='function'){
    prototype=Object.create(SuperType.prototype);
   }else{
    prototype=object.create(SuperType.prototype);
   }<br>           prototype.constructor=SubType;
   SubType.prototype=prototype;
}
```
### Class继承
Class 可以通过extends关键字实现继承。子类必须在constructor方法中调用super方法，否则新建实例时会报错。这是因为子类自己的this对象，必须先通过父类的构造函数完成塑造，得到与父类同样的实例属性和方法，然后再对其进行加工，加上子类自己的实例属性和方法。如果不调用super方法，子类就得不到this对象。

注意 ：ES5 的继承，实质是先创造子类的实例对象this，然后再将父类的方法添加到this上面（Parent.apply(this)）。ES6 的继承机制完全不同，实质是先将父类实例对象的属性和方法，加到this上面（所以必须先调用super方法），然后再用子类的构造函数修改this。

```js
class ColorPoint extends Point {
  constructor(x, y, color) {
    super(x, y); // 调用父类的constructor(x, y)
    this.color = color;
  }

  toString() {
    return this.color + ' ' + super.toString(); // 调用父类的toString()
  }
}
```
#### Class的继承链
大多数浏览器的 ES5 实现之中，每一个对象都有__proto__属性，指向对应的构造函数的prototype属性。Class 作为构造函数的语法糖，同时有prototype属性和__proto__属性，因此同时存在两条继承链。

（1）子类的__proto__属性，表示构造函数的继承，总是指向父类。

（2）子类prototype属性的__proto__属性，表示方法的继承，总是指向父类的prototype属性。
```js
class A {
}

class B extends A {
}

B.__proto__ === A // true
B.prototype.__proto__ === A.prototype // true
```
上面代码中，子类B的__proto__属性指向父类A，子类B的prototype属性的__proto__属性指向父类A的prototype属性。