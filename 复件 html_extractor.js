/**

The MIT License

Copyright (c) 2008 Pickere Yee(pickerel@gmail.com)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
**/
__HTML_EXTRACTOR_DEBUG__ = true;
var html_extractor = function(html)
{
	this.parser = new SimpleHtmlParser;
	this.html  = html;
	this.reset();	
}
String.prototype.he = function(){return new html_extractor(this);}
/*
 * "<div><div>abc</div></div>".he_im("div", "div");
 * "<div><div id='abc'>abc</div></div>".he_im("div", "div", "@id=123");
 */ 
//匹配指定标记内的内容，tag是个变长参数，返回结果为匹配内容，不包括最后一个匹配标签
String.prototype.he_im = function(tag){return new html_extractor(this).tag(tag).im();}
//匹配指定标记内的内容，tag是个变长参数，返回结果为匹配内容，包括最后一个匹配标签
String.prototype.he_om = function(tag){return new html_extractor(this).tag(tag).om();}
//匹配指定标记内的指定属性，tag是个变长参数，attr为要获取的属性的名称
String.prototype.he_ma = function(attr, tag){return new html_extractor(this).tag(tag).ma();}
//匹配指定标记内的指定内容，tag是个变长参数，返回结果为匹配内容，不包括任何html标签，只是文本。
String.prototype.he_mt = function(attr, tag){return new html_extractor(this).tag(tag).ma();}

//argus could be ["div", "div", "@id=123", "p"]
function html_extractor_query(html, argus)
{
	var extractor = new html_extractor(html);
	for(var i = 0; i < argus.lenght; i++)
	{
		var argu = argus[i];
		//if (argu)
	}
}
//预设一个tag查询条件，指定的html文档的起始tag必须与该tag匹配
html_extractor.prototype.first_tag = function(tag, callback)
{
	this.tags.push({tag: tag.toLowerCase(), first: true});
	if (callback != undefined && callback != null)
	this.callbacks.push(callback);
	return this;
}

//预设一个连续的tag查询条件，即该tag必须是上一个tag的子元素
html_extractor.prototype.next_tag = function(tag, callback)
{
	this.tags.push({tag: tag.toLowerCase(), child: true});
	if (callback != undefined && callback != null)
	this.callbacks.push(callback);
	return this;
}
//预设一个tag查询条件，即预设tag将会是上一个预设tag的子、孙...元素，当tag=*时表示匹配任意元素
html_extractor.prototype.tag = function(tag, callback)
{
	if (tag != "*")this.tags.push({tag: tag.toLowerCase()});
	if (callback != undefined && callback != null)
	this.callbacks.push(callback);
	return this;
}
html_extractor.prototype.reset = function(){	this.tags = [];	this.attrs = [];this.callbacks = [];}
//预设一个属性查询条件，该条件是针对上一个预设的tag的属性的
html_extractor.prototype.attr = function(name, value)
{
	if (this.tags.length == 0)this.tags.push("*");
	var len = this.tags.length - 1;
	if (this.attrs[len] == undefined)this.attrs[len] = [];

	this.attrs[len].push({name:name.toLowerCase(), value: value});
	return this;
}
//按预设条件匹配，只返回匹配结果的标签内的文本
html_extractor.prototype.match_text = function()
{
	if (this.tags.length == 0)this.tags.push("*");	
	return this._match(false, true);
}
//按预设条件匹配，只返回匹配结果的标签内的指定属性
html_extractor.prototype.match_attr = function(name)
{
	var ret = [];
	if (this.tags.length == 0)this.tags.push("*");
	this.match(false, function(idx, attrs, inner_html, inner_text){ret.push(attrs[name])});
	return ret;
}
html_extractor.prototype.im = function(callback){return this.match(true, callback);}
html_extractor.prototype.ma = function(name){return this.match_attr(name);}
html_extractor.prototype.om = function(callback){return this.match(false, callback);}
html_extractor.prototype.mt = function(callback){return this.match_text();}
html_extractor.prototype.match = function(inner, callback){return this._match(true, inner, callback)};


/**
 * 执行匹配操作
 * @param {boolean} inner 匹配的结果是否要包含最后一个预设tag的标签内容。true:不要包含，只返回标签内内容即可。
 */
html_extractor.prototype._match = function(_html_type_result, inner, callback)
{
	if (this.tags.length == 0)this.tags.push("*");	
	var self = this;
	var handler = function(){
		this._tag_index = 0;
		this._matched_tags = [];
		this._matched_tags_attrs = [];
		//标记预设的tag是否已经匹配
		this._matched = [];
		this._result = "";

		this._html_type_result = _html_type_result;
		//是否已经全匹配 
		this._all_matched = false;
		this._all_matched_index = -1;
		this._stop_parse = false;
		//记录上次匹配的位置
		this._prev_matched_index = -1;
		//tag匹配标记预设为否
		for( var i = 0; i < self.tags.length; i++)this._matched[i] = false;
		this.result = [];
		this.inner = true;
		if (inner != undefined && inner != null)
		{
			this.inner = inner;
		}

	};

	handler.prototype = {
		startElement:   function (tag, attrs) {
			tag = tag.toLowerCase();			
			if (this._tag_index == 0 && self.tags[0].first != undefined && self.tags[0].first && self.tags[0].tag != tag)						
			{//检查首匹配
				this._stop_parse = true;
			}
			if (this._stop_parse)return;
			//处理索引
			this._tag_index++;

			
			if (this._all_matched )
			{//已经全匹配，拼合匹配下的html内容
				if (this._html_type_result)this._result += get_start_tag(tag, attrs);
				return;
			}
			//按预设的tag atrr条件循环匹配
			for( var i = 0; i < this._matched.length; i++)
			{
				if (!this._matched[i] )
				{//指定的预设标签尚未匹配到，做匹配检查
					var pt = self.tags[i];
					if ( ( pt == "*" || (pt.tag == tag && (pt.child == undefined || pt.child == false)) ||
						 (pt.tag == tag && pt.child && this._prev_matched_index == this._tag_index - 1) ) 
					)
					{//tag条件符合
						this._matched[i] = true;
						if (self.attrs[i] != undefined)
						{//检查attr条件
							for(var n = 0; n < self.attrs[i].length; n++)
							{
								var attr = self.attrs[i][n];
								if (attr == undefined)
								{//找不到符合条件的属性定义
									this._matched[i] = false;
									break;									
								}
								if (attr != undefined)
								{	
									if ( ( (typeof attr.value) == "string"  && attrs[attr.name] != attr.value) || 
										((typeof attr.value) == "object"  && ! (attr.value).test(attrs[attr.name]) )
									) {//属性值不匹配
										this._matched[i] = false;
										break;
									}
								};
							}
						}
						if (this._matched[i] )
						{//指定的预设标记匹配成功
							 //todo callback
					  		 //air.trace(i + ":" + this._matched[i] + " first");
							 //记录当前标记的处理索引
 							 this._matched_tags[this._tag_index] = i;
							 this._matched_tags_attrs[this._tag_index] = attrs;
							 this._prev_matched_index = this._tag_index;
							 if (i == self.tags.length -1)
							 {//如果已经匹配到预设条件的最后一个，说明全匹配了。
								 this._all_matched = true;
								 this._all_matched_index++;
								 if (!this.inner)if (this._html_type_result) this._result += get_start_tag(tag, attrs);
							 }
							 return;
						}
					}
					//不匹配，中止往下检查
					if (!this._matched[i] ){
						var tpt  = pt;
						var idx = this._tag_index;
						var midx = i;
						while ( tpt.child != undefined && pt.child )
						{//如果预制的是连续匹配，回退预制到连续的根
							idx--;
							midx--;
							this._matched_tags.remove(idx);	
							tpt = this._matched[midx];
							this._matched[midx] = false;
						}
						this._prev_matched_index = -1;						
						break;
					}
				}
			}		
		},
		endElement:     function (tag) {
						if (this._stop_parse)return;
			tag = tag.toLowerCase();

			if (this._matched_tags[this._tag_index] != undefined)
			{//当前处理的标签是已匹配的标签，该标签已经处理结束，将匹配标记为否

				if (this._all_matched)
				{//如果是全匹配，说明现在是一个全匹配的结束
					if (!this.inner)if (this._html_type_result)this._result += "</" + tag +">";
										
					//全匹配结果置入匹配结果数组中
					if ( callback != undefined && callback != null)
					{
						ret = callback(this._all_matched_index, this._matched_tags_attrs[this._tag_index], this._result);
						this.result.push(ret);
					}
					else
						this.result.push(this._result);
		
					this._result = "";
					this._prev_matched_index = -1;
					//全匹配置为否
					this._all_matched = false;
				}
				this._matched[this._matched_tags[this._tag_index]] = false;
				this._matched_tags.remove(this._tag_index); 	
				this._matched_tags_attrs.remove(this._tag_index); 															
			}
			else if (this._all_matched)
			{//全匹配后的处理
				if (this._html_type_result)this._result += "</" + tag +">";
			}

			this._tag_index--;

		},
		characters:		function (s) {
						if (this._stop_parse)return; 
			//已经全匹配，拼合匹配下的html内容
			if (this._all_matched) {
				this._result += s;
			}
		},
		comment:		function (s) {}
	};
	this.parser.contentHandler = new handler;

	this.parser.parse(this.html);	
	//reset
	self.reset();
	return this.parser.contentHandler.result;
}
function get_start_tag(tag, attrs)
{
	var ret = "<" + tag;
	for (var key in attrs)
	{
		value = attrs[key];
		ret += " " + key + "=\"" + value + "\"";

	}
	ret += ">";
	return ret;
}

function html_extractor_log(message) {
	if (!__HTML_EXTRACTOR_DEBUG__)return;
    if (!html_extractor_log.window_ || html_extractor_log.window_.closed) {
        var win = window.open("", null, "width=400,height=200," +
                              "scrollbars=yes,resizable=yes,status=no," +
                              "location=no,menubar=no,toolbar=no");
        if (!win) return;
        var doc = win.document;
        doc.write("<html><head><title>Debug Log</title></head>" +
                  "<body></body></html>");
        doc.close();
        html_extractor_log.window_ = win;
    }
    var logLine = html_extractor_log.window_.document.createElement("div");
    logLine.appendChild(html_extractor_log.window_.document.createTextNode(message));
    html_extractor_log.window_.document.body.appendChild(logLine);
}
// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};
/** SimpleHtmlParser
 * Original code by Erik Arvidsson, Mozilla Public License
 * http://erik.eae.net/simplehtmlparser/simplehtmlparser.js
 */

/*
var handler ={
	startElement:   function (sTagName, oAttrs) {},
	endElement:     function (sTagName) {},
    characters:		function (s) {},
    comment:		function (s) {}
};
*/

function SimpleHtmlParser()
{
}

SimpleHtmlParser.prototype = {

	handler:	null,

	// regexps

	startTagRe:	/^<([^>\s\/]+)((\s+[^=>\s]+(\s*=\s*((\"[^"]*\")|(\'[^']*\')|[^>\s]+))?)*)\s*\/?\s*>/m,
	endTagRe:	/^<\/([^>\s]+)[^>]*>/m,
	attrRe:		/([^=\s]+)(\s*=\s*((\"([^"]*)\")|(\'([^']*)\')|[^>\s]+))?/gm,

	parse:	function (s, oHandler)
	{
		if (oHandler)
			this.contentHandler = oHandler;

		var i = 0;
		var res, lc, lm, rc, index;
		var treatAsChars = false;
		var oThis = this;
		while (s.length > 0)
		{
			// Comment
			if (s.substring(0, 4) == "<!--")
			{
				index = s.indexOf("-->");
				if (index != -1)
				{
					this.contentHandler.comment(s.substring(4, index));
					s = s.substring(index + 3);
					treatAsChars = false;
				}
				else
				{
					treatAsChars = true;
				}
			}

			// end tag
			else if (s.substring(0, 2) == "</")
			{
				if (this.endTagRe.test(s))
				{
					lc = RegExp.leftContext;
					lm = RegExp.lastMatch;
					rc = RegExp.rightContext;

					lm.replace(this.endTagRe, function ()
					{
						return oThis.parseEndTag.apply(oThis, arguments);
					});

					s = rc;
					treatAsChars = false;
				}
				else
				{
					treatAsChars = true;
				}
			}
			// start tag
			else if (s.charAt(0) == "<")
			{
				if (this.startTagRe.test(s))
				{
					lc = RegExp.leftContext;
					lm = RegExp.lastMatch;
					rc = RegExp.rightContext;

					lm.replace(this.startTagRe, function ()
					{
						return oThis.parseStartTag.apply(oThis, arguments);
					});

					s = rc;
					treatAsChars = false;
				}
				else
				{
					treatAsChars = true;
				}
			}

			if (treatAsChars)
			{
				index = s.indexOf("<");
				if (index == -1)
				{
					 this.contentHandler.characters(s);
					s = "";
				}
				else
				{
					this.contentHandler.characters(s.substring(0, index));
					s = s.substring(index);
				}
			}

			treatAsChars = true;
		}
	},

	parseStartTag:	function (sTag, sTagName, sRest)
	{
		var attrs = this.parseAttributes(sTagName, sRest);
		this.contentHandler.startElement(sTagName, attrs);
	},

	parseEndTag:	function (sTag, sTagName)
	{
		this.contentHandler.endElement(sTagName);
	},

	parseAttributes:	function (sTagName, s)
	{
		var oThis = this;
		var attrs = {};
		s.replace(this.attrRe, function (a0, a1, a2, a3, a4, a5, a6)
		{
			//attrs.push(oThis.parseAttribute(sTagName, a0, a1, a2, a3, a4, a5, a6));
			attr = oThis.parseAttribute(sTagName, a0, a1, a2, a3, a4, a5, a6);
			attrs[attr.name] = attr.value;
		});
		return attrs;
	},

	parseAttribute: function (sTagName, sAttribute, sName)
	{
		var value = "";
		if (arguments[7])
			value = arguments[8];
		else if (arguments[5])
			value = arguments[6];
		else if (arguments[3])
			value = arguments[4];

		var empty = !value && !arguments[3];
		return {name: sName.toLowerCase(), value: empty ? null : value};
	}
};
