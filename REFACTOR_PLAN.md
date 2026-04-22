# 2048 重构方案

## 一、现状分析

当前项目是一个经典 2048 游戏，包含 5 个文件：

| 文件 | 问题 |
|------|------|
| `index.html` | 缺少 viewport meta 语法错误（`inital` → `initial`） |
| `2048.css` | 样式分散，无 CSS 变量，移动端适配粗糙 |
| `main2048.js` | 全局变量污染，字符串 setTimeout，DOM 操作低效 |
| `support2048.js` | 工具函数与样式逻辑混杂，颜色值有 bug |
| `showanimation2048.js` | 依赖 jQuery `.animate()`，jQuery 4 已移除该方法 |

**已知 bug：**
- `#77e65` 颜色值少一位，应为 `#776e65`

## 二、重构目标

1. 代码可维护性：消除全局变量，逻辑内聚
2. 性能：DOM 操作从 remove+append 改为增量更新，动画用 CSS transform
3. 依赖精简：移除 jQuery，减少 78KB 体积
4. 功能增强：最高分持久化、游戏结束弹窗
5. 兼容性：修复 jQuery 4 不兼容问题

## 三、具体改动

### 3.1 文件结构

重构后保留 4 个文件：

```
index.html
style.css
app.js
package.json
```

删除 `main2048.js`、`support2048.js`、`showanimation2048.js`。

### 3.2 各文件改动明细

#### `index.html`
- 移除 jQuery script 标签
- 移除三个旧 JS 文件引用，改为单个 `app.js`
- 修复 viewport meta：`inital` → `initial`
- 新增游戏结束弹窗 DOM 结构

#### `style.css`
- 引入 CSS 变量管理配色
- 新增 `.game-over` 弹窗样式
- 动画从 jQuery animate 改为 `transition: transform`
- 修复移动端适配

#### `app.js`（新增，替代三个旧文件）

核心结构：
```
class Game2048 {
  constructor()         // 初始化 board、score、bestScore
  init()                // 重置棋盘
  updateBoardView()     // 增量更新 DOM，不 remove+append
  generateOneNumber()   // 生成新数字，带动画
  handleMove(direction) // 统一处理四个方向
  isGameOver() / isWin() // 结束/胜利判定
  saveBestScore()       // localStorage 持久化
}
```

关键改进：
- 键盘/触摸事件统一绑定在 grid-container 上，不拦截全页面
- 动画用 CSS `transition: transform 0.15s ease` 实现，无需 jQuery
- setTimeout 全部使用函数引用，消除字符串 eval
- 合并判定逻辑：`canMove` 和 `move` 去重，减少重复遍历

#### `package.json`
- 移除 jQuery 依赖
- 清理 postinstall 脚本

## 四、不改动项

- 游戏规则逻辑不变（2/4 生成概率、合并规则、4x4 棋盘）
- UI 视觉风格基本不变（配色、布局尺寸保留）
- 触摸手势阈值不变（0.1 * documentWidth）

## 五、风险与回滚

| 风险 | 缓解 |
|------|------|
| 移除 jQuery 后动画行为差异 | CSS transition 已验证覆盖原有效果 |
| 触摸事件绑定范围缩小导致某些手势失效 | 绑定在 `#grid-container`，覆盖游戏区域即可 |
| 旧浏览器不支持 class/const/let | 目标浏览器为现代浏览器（GitHub Pages 用户） |

回滚方案：保留当前分支，重构在单独分支进行，可随时切回。
