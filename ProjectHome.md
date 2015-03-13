A html extractor in javascript.

usage:

---

  1. jhe\_im(extract\_conditions...)
> > return inner html match the extract conditions.
  1. jhe\_om(extract\_conditions...)
> > return outter html match the extract conditions.
  1. jhe\_ma(extract\_conditions..., attributeName)
> > return the attribute value in the special tag that match the extract conditions.
  1. jhe\_mt(extract\_conditions...)
> > return the text in the special tag that match the extract conditions.
  1. about the extract\_conditions, extract conditions are uncertain length arguments. They are used to match the position you want, the extract conditions could be:
> > htmlTagName, such as 'div', 'a'..., It's means the tag you want to locate.


> @attributeName=attributeValue, such as '@class=red', '@id=container'
> @@attributeName=attributeRegexValue, such as '@@class=\w+', '@id=[1-9]**'**

> ^htmlTagName, the first tag must be htmlTagName.

> >htmlTagName, the next tag must be htmlTagName.

example:
```
"<div><p>div1</p></div>".jhe_im("div")   
return: ["<p>div1</p>"]
"<div id='attr_div1'>div1</div>".jhe_ma("div", "id")   
return: ["attr_div1"]
"<div><p>div1</p></div>".jhe_mt("div")   
return: ["div1"]
"<div>div1</div><div>div2</div>".jhe_om("div")  
 return: ["<div>div2</div>", "<div>div2</div>"]
"<div>div1</div><div id='div2'>div2 content</div>".jhe_im("div", "@id=div2") 
return  'div2 content'
"<div><p>div1<p></div><div><div><p>div2</div></div>".jhe_im("div", "p")  
return ["div1", "div2"]
"<div><p>div1<p></div><div><div><p>div2</div></div>".jhe_im("div", ">p")  
return ["div1"]
"<p>11</p><div>div2</div>".jhe_im("^div")
return []
"<div>div2</div><p>11</p>".jhe_im("^div")
return ["div2"]
```


there are more examples in the unittest.



方法说明：

  1. jhe\_im(匹配参数..)

> 该方法返回符合匹配参数的标签内的所有内容，返回值类型是数组。

> 2. jhe\_om(匹配参数..)

> 该方法返回符合匹配参数标签及其标签内的所有内容，返回值类型是数组。

> 3. jhe\_ma(匹配参数.., 属性名)

> 该方法返回符合匹配参数标签的指定属性的属性值，返回值类型是数组。

> 4. jhe\_mt(匹配参数..)

> 该方法返回符合匹配参数的标签下的所有文本内容， 返回值类型是数组。

> 5. 关于匹配参数，匹配参数是个不定长的参数，他可以为以下内容

> html标签: 如 'div', 'a'...，表示为需要匹配的标签名称

> 属性表达式： @attributeName=attributeValue, 如 '@class=red', '@id=container'，表示需要匹配的标签的属性必须符合指定条件

> 属性表达式： @@attributeName=attributeValue, 如 '@@class=\\w', '@id=[1-9]**'，表示需要匹配的标签的属性必须符合指定的正则式条件**

> ^+html标签：，表示当前html字符串的第一个标签

> >+html标签 ： ，表示紧接前一标签的下一标签