/*
  MakeTrappingStroke.jsx for Adobe Illustrator
  描述： 在启用叠印描边属性的情况下，根据对象的填充物设置描边颜色，用于印前。
  基于 StrokeColorFromFill.jsx
  Date: December, 2022
  Author: Sergey Osokin, email: hi@sergosokin.ru

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
  0.1 Initial version

  Donate (optional):
  If you find this script helpful, you can buy me a coffee
  - via Buymeacoffee: https://www.buymeacoffee.com/osokin
  - via FanTalks https://fantalks.io/r/sergey
  - via DonatePay https://new.donatepay.ru/en/@osokin
  - via YooMoney https://yoomoney.ru/to/410011149615582

  NOTICE:
  Tested with Adobe Illustrator CC 2019-2023 (Mac/Win).
  This script is provided "as is" without warranty of any kind.
  Free to use, not for sale

  Released under the MIT license
  http://opensource.org/licenses/mit-license.php

  Check my other scripts: https://github.com/creold
*/

//@target illustrator
app.preferences.setBooleanPreference('ShowExternalJSXWarning', false); // Fix drag and drop a .jsx file

function main() {
  // 检测脚本运行是否符合要求
  if (!isCorrectEnv('selection')) return;

  var SCRIPT = {
        name: 'Make Trapping Stroke制作陷印描边',
        version: 'v.0.1'
      },
      CFG = {
        width: 1, // 默认笔画宽度
        isAddStroke: false, // 强制添加描边
        isRndCap: true, // 强制描边圆头端点
        isRndCorner: true, // 强制描边圆角连接
        aiVers: parseFloat(app.version),// parseFloat() 函数解析字符串并返回浮点数
        isMac: /mac/i.test($.os),
        isTabRemap: false, // 如果在 PC 上工作并且 Tab 键重新映射，则设置为 true
        isRgb: (activeDocument.documentColorSpace === DocumentColorSpace.RGB) ? true : false,
        uiOpacity: .98, // UI 窗口不透明度,范围 0-1
        preview: false, // 预览
      };

  // 设置初始数据
  var doc = activeDocument,
      paths = [], //  选定的路径项
      isUndo = false,
      tmpPath; // 修复预览错误

      // badFills 不好的路径项个数,是数字
  var badFills = getPaths(selection, paths),
      // hasStroke 是否有描边
      hasStroke = checkStroke(paths);


  // 在较新版本上禁用Windows屏幕闪烁错误修复
  var winFlickerFix = !CFG.isMac && CFG.aiVers < 26.4;

  // DIALOG
  var win = new Window('dialog', SCRIPT.name + ' ' + SCRIPT.version);
      win.orientation = 'column';
      win.opacity = CFG.uiOpacity;

  var wrapper = win.add('group');
      wrapper.orientation = 'row';
      wrapper.alignChildren = 'fill';
      wrapper.spacing = 15;

  // Options选项
  var opts = wrapper.add('group');
      opts.orientation = 'column';
      opts.alignChildren = ['fill', 'top'];
      opts.spacing = 16;

  var widthGrp = opts.add('group');
      widthGrp.alignChildren = ['fill', 'center'];
  widthGrp.add('statictext', undefined, '粗细:');
  var widthInp = widthGrp.add('edittext', [0, 0, 70, 25], CFG.width);
  if (winFlickerFix) {
    if (!CFG.isTabRemap) simulateKeyPress('TAB', 1); // 模拟按键
  } else {
    widthInp.active = true;
  }

  var unitsGrp = opts.add('group');
      unitsGrp.alignChildren = 'center';
  unitsGrp.add('statictext', undefined, 'Units:');
  var isPx = unitsGrp.add('radiobutton', undefined, 'pt');
      isPx.bounds = [0, 0, 35, 16];
  var isMm = unitsGrp.add('radiobutton', undefined, 'mm');
      isMm.bounds = [0, 0, 45, 16];
      isMm.value = true;

  var isAddStroke = opts.add('checkbox', undefined, '强制添加描边');
      isAddStroke.value = CFG.isAddStroke;

  // Separator分隔符
  var separator = wrapper.add('panel');
  separator.minimumSize.width = separator.maximumSize.width = 2;

  // Buttons按钮
  var btns = wrapper.add('group');
      btns.orientation = 'column';
      btns.alignChildren = ['fill', 'top'];
  var cancel = btns.add('button', undefined, 'Cancel', {name: 'cancel'});
  var ok = btns.add('button', undefined, 'Ok', {name: 'ok'});
  var isPreview = btns.add('checkbox', undefined, '预览');
      isPreview.value = CFG.preview;

  // Adobe Illustrator Mac OS在添加笔划方面存在错误
  if (CFG.isMac) win.add('statictext', [0, 0, 240, 30], "Mac OS上的“强制添加笔划”选项 \n可能无法正常工作", {multiline: true});
  var copyright = win.add('statictext', undefined, '\u00A9 Sergey Osokin. Visit Github');
      copyright.justify = 'center';

  copyright.addEventListener('mousedown', function () {
    openURL('https://github.com/creold/');
  });

  // Run preview运行预览
  if (isPreview.value) preview();
  widthInp.onChanging = isPx.onClick = isMm.onClick = preview;
  isPreview.onClick = preview;
  isAddStroke.onClick = preview;

  // Use Up / Down arrow keys (+ Shift)使用向上/向下箭头键（+移位）
  shiftInputNumValue(widthInp, 0.001, 1000);

  ok.onClick = okClick;

  function preview() {
    try {
      if (isPreview.value && (hasStroke || isAddStroke.value)) {
        if (isUndo) app.undo();
        else isUndo = true;
        start();
        redraw();
      } else if (isUndo) {
        undo();
        redraw();
        isUndo = false;
      }
    } catch (e) {}
  }

  function okClick() {
    if (isPreview.value && isUndo) app.undo();
    start();
    isUndo = false;
    win.close();
  }

  // Start conversion
  function start() {
    tmpPath = doc.activeLayer.pathItems.add();
    tmpPath.name = '__TempPath';
    var widthVal = strToNum(widthInp.text, 1);
    if (isMm.value) widthVal = convertUnits(widthVal, 'mm', 'pt');
    for (var i = 0, len = paths.length; i < len; i++) {
      var item = paths[i];
      if (isAddStroke.value && !item.stroked) {
        item.stroked = true;
      }
      if (item.stroked) {
        item.strokeWidth = widthVal;
        if (CFG.isRndCap) item.strokeCap = StrokeCap.ROUNDENDCAP;
        if (CFG.isRndCorner) item.strokeJoin = StrokeJoin.ROUNDENDJOIN;
        item.strokeOverprint = true;
        setColor(item, CFG.isRgb);
      }
    }
  }

  cancel.onClick = win.close;

  win.onClose = function () {
    try {
      if (isUndo) {
        undo();
        isUndo = false;
      }
    } catch (e) {}
    tmpPath.remove();
    redraw();
    var msg = '注意\n脚本跳过路径和复合路径 ';
    msg += '带有图案或空填充。这样的对象: ';
    if (badFills) alert(msg + badFills, SCRIPT.name);
  }

  function shiftInputNumValue(item, min, max) {
    item.addEventListener('keydown', function (kd) {
      var sign = this.text.substr(0, 1) == '+' ? '+' : '',
          step = ScriptUI.environment.keyboardState['shiftKey'] ? 10 : 1;
      if (kd.keyName == 'Down') {
        this.text = strToNum(this.text, min) - step;
        if (this.text * 1 < min) this.text = min;
        if (this.text * 1 > 0) this.text = sign + this.text;
        kd.preventDefault();
      }
      if (kd.keyName == 'Up') {
        this.text = strToNum(this.text, min) + step;
        if (this.text * 1 <= max) {
          kd.preventDefault();
        } else {
          this.text = max;
        }
        this.text = sign + this.text;
      }
      preview();
    });
  }

  win.center();
  win.show();
}

// 检查脚本环境
function isCorrectEnv() {
  var args = ['app', 'document'];
  args.push.apply(args, arguments);

  for (var i = 0; i < args.length; i++) {
    var arg = args[i].toString().toLowerCase();//toLowerCase() 方法将字符串转换为小写字母
    switch (true) {
      case /app/g.test(arg):
        if (!/illustrator/i.test(app.name)) {
          alert('错误的应用程序\n从Adobe Illustrator运行脚本', '脚本错误');
          return false;
        }
        break;
      case /version/g.test(arg):
        var rqdVers = parseFloat(arg.split(':')[1]);
        if (parseFloat(app.version) < rqdVers) {
          alert('错误的应用程序版本\n对不起,脚本只在Illustrator v.' + rqdVers + ' 以及后来的版本中运行', '脚本错误');
          return false;
        }
        break;
      case /document/g.test(arg):
        if (!documents.length) {
          alert('没有文档\n打开一个文件，再试一次', '脚本错误');
          return false;
        }
        break;
      case /selection/g.test(arg):
        if (!selection.length || selection.typename === 'TextRange') {
          alert('没有对象被选中\n请至少选择一个路径', '脚本错误');
          return false;
        }
        break;
    }
  }

  return true;
}

// 从集合中获取路径
function getPaths(coll, out) {
  var item = null, noColor = 0;
  for (var i = 0, len = coll.length; i < len; i++) {
    item = coll[i];
    if (isType(item, 'group') && item.pageItems.length) {
      noColor += getPaths(item.pageItems, out);
    } else if (isType(item, 'compound')) {
      // compound复合路径
      if (item.pathItems.length && hasColorFill(item.pathItems[0])) {
        noColor += getPaths(item.pathItems, out);
      } else { 
        noColor++;
      }
    } else if (isType(item, 'path')) {
      if (hasColorFill(item)) {
        out.push(item);
      } else {
        noColor++;
      }
    }
  }
  return noColor;
}

// 有填充物而不是图案
function hasColorFill(obj) {
  if (obj.filled && isType(obj.fillColor, 'rgb|cmyk|gray|spot|gradient')) {
    return true;
  } else {
    return false;
  }
}

// 检查对象是否有描边
function checkStroke(arr) {
  for (var i = 0, len = arr.length; i < len; i++) {
    if (arr[i].stroked) return true;
  }
  return false;
}

// 通过VBScript在Windows操作系统上模拟键盘键
// 
// 此函数是为了响应 Windows 上已知的 ScriptUI 错误。
// 基本上，在某些 Windows Ai 版本上，当显示 ScriptUI 对话框并在字段上将活动属性设置为 true 时，Windows 将快速刷新 Windows 资源管理器应用程序，然后通过对话框的正面和中心使 Ai 重新成为焦点。
function simulateKeyPress(k, n) {
  if (!/win/i.test($.os)) return false;
  if (!n) n = 1;
  try {
    var f = new File(Folder.temp + '/' + 'SimulateKeyPress.vbs');
    var s = 'Set WshShell = WScript.CreateObject("WScript.Shell")\n';
    while (n--) {
      s += 'WshShell.SendKeys "{' + k.toUpperCase() + '}"\n';
    }
    f.open('w');
    f.write(s);// 写入
    f.close();// 关闭
    f.execute();// 执行
  } catch(e) {}
}

// 将颜色应用于描边
function setColor(obj, isRgb) {
  var fColor = obj.fillColor;
  var sColor = fColor;
  if (isType(fColor, 'gradient')) {
    sColor = interpolateColor(fColor.gradient, isRgb);
  }
  obj.strokeColor = sColor;
}

// 彩色插值Color interpolation by moody allen (moodyallen7@gmail.com)
function interpolateColor(grad, isRgb) {
  var amt = grad.gradientStops.length,
      cSum = {}; // Sum of color channels
  for (var i = 0; i < amt; i++) {
    var c = grad.gradientStops[i].color;
    if (isType(c, 'spot')) c = c.spot.color;
    if (isType(c, 'gray')) c.red = c.green = c.blue = c.black = c.gray;
    for (var key in c) {
      if (typeof c[key] === 'number') {
        if (cSum[key]) cSum[key] += c[key];
        else cSum[key] = c[key];
      }
    }
  }
  var mix = isRgb ? new RGBColor() : new CMYKColor();
  for (var key in cSum) mix[key] = cSum[key] / amt;
  return mix;
}

// 按短名称检查项目类型名称
function isType(item, type) {
  var regexp = new RegExp(type, 'i');
  return regexp.test(item.typename);
}

// Convert string to number将字符串转换为数字
function strToNum(str, def) {
  if (arguments.length == 1 || def == undefined) def = 1;
  str = str.replace(/,/g, '.').replace(/[^\d.-]/g, '');
  str = str.split('.');
  str = str[0] ? str[0] + '.' + str.slice(1).join('') : '';
  str = str.substr(0, 1) + str.substr(1).replace(/-/g, '');
  if (isNaN(str) || !str.length) return parseFloat(def);
  else return parseFloat(str);
}

// 转换度量单位
function convertUnits(val, curUnits, newUnits) {
  return UnitValue(val, curUnits).as(newUnits);
}

// 在浏览器中打开链接
function openURL(url) {
  var html = new File(Folder.temp.absoluteURI + '/aisLink.html');
  html.open('w');
  var htmlBody = '<html><head><META HTTP-EQUIV=Refresh CONTENT="0; URL=' + url + '"></head><body> <p></body></html>';
  html.write(htmlBody);
  html.close();
  html.execute();
}

// Run script
try {
  main();
} catch (e) {}