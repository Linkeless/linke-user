# Linke User Portal - Project Documentation

## 项目概述 (Project Overview)

Linke User Portal 是一个基于 React + TypeScript 的用户管理系统，主要功能包括用户认证、订阅管理、套餐选择等。该项目已完成全面的国际化支持，支持中英文双语切换。

Linke User Portal is a React + TypeScript-based user management system with features including user authentication, subscription management, and plan selection. The project has been fully internationalized with Chinese and English language support.

## 技术栈 (Tech Stack)

- **前端框架**: React 18 + TypeScript
- **路由**: React Router 6
- **状态管理**: Zustand
- **数据获取**: TanStack Query (React Query)
- **HTTP客户端**: Axios
- **UI组件**: 自定义组件 + Shadcn/UI
- **样式**: Tailwind CSS
- **国际化**: react-i18next
- **构建工具**: Vite
- **代码检查**: ESLint + Prettier

## 国际化工作完成情况 (Internationalization Completion)

### ✅ 已完成的国际化工作

1. **翻译文件结构**

   ```
   src/locales/
   ├── en/
   │   ├── common.json       # 通用翻译
   │   ├── navigation.json   # 导航翻译
   │   └── subscription.json # 订阅模块翻译
   └── zh/
       ├── common.json
       ├── navigation.json
       └── subscription.json
   ```

2. **组件国际化**
   - ✅ Header 组件 - 所有用户界面文本
   - ✅ SubscriptionCard 组件 - 订阅卡片显示
   - ✅ PlanCard 组件 - 套餐卡片显示
   - ✅ TrafficUsageCard 组件 - 流量使用统计
   - ✅ LanguageSwitcher 组件 - 语言切换器

3. **页面国际化**
   - ✅ SubscriptionListPage - 订阅列表页面
   - ✅ PlanSelectionPage - 套餐选择页面
   - ✅ SubscriptionDetailPage - 订阅详情页面

4. **功能模块国际化**
   - ✅ 导航菜单标签
   - ✅ 状态显示（活跃、过期、试用等）
   - ✅ 操作按钮文本
   - ✅ 错误信息和提示
   - ✅ 日期和时间格式化
   - ✅ 货币格式化

### 翻译键值对统计 (Translation Keys Statistics)

**订阅模块** (`subscription.json`):

- 动作类: 27个键 (actions.\*)
- 标签类: 68个键 (labels.\*)
- 计费类: 10个键 (billing.\*)
- 使用类: 9个键 (usage.\*)
- 配置类: 6个键 (config.\*)
- 错误类: 5个键 (errors.\*)
- 筛选类: 4个键 (filters.\*)
- 分页类: 3个键 (pagination.\*)
- 消息类: 14个键 (messages.\*)
- 警告类: 3个键 (warnings.\*)

**总计**: 约150个翻译键值对，完全覆盖订阅模块的所有用户界面文本

## 技术改进 (Technical Improvements)

### 1. 认证系统修复

**问题**: HTTP 401 错误，token 未正确附加到请求
**解决方案**:

- 修复 `src/lib/utils/token.ts` 中的同步token获取方法
- 更新 `src/lib/api/interceptors.ts` 使用同步方式获取token
- 避免了异步token获取导致的竞态条件

### 2. 导航系统优化

**改进**: Header 组件导航从 `window.location.href` 改为 React Router
**文件**: `src/components/common/Header.tsx`
**好处**:

- 更好的单页应用体验
- 保持应用状态
- 更快的页面切换

### 3. 代码结构优化

- 统一的错误处理模式
- 一致的加载状态管理
- 标准化的数据获取钩子
- 可重用的UI组件

## 文件结构 (File Structure)

```
src/
├── components/
│   ├── common/
│   │   ├── Header.tsx                 # 页面头部组件
│   │   ├── LanguageSwitcher.tsx       # 语言切换组件
│   │   └── Layout.tsx                 # 布局组件
│   └── ui/                            # 基础UI组件
├── features/
│   ├── auth/                          # 认证功能模块
│   └── subscription/                  # 订阅功能模块
│       ├── components/                # 订阅相关组件
│       │   ├── SubscriptionCard.tsx   # 订阅卡片
│       │   ├── PlanCard.tsx          # 套餐卡片
│       │   └── TrafficUsageCard.tsx  # 流量使用卡片
│       ├── pages/                     # 订阅相关页面
│       │   ├── SubscriptionListPage.tsx      # 订阅列表
│       │   ├── PlanSelectionPage.tsx         # 套餐选择
│       │   └── SubscriptionDetailPage.tsx    # 订阅详情
│       ├── services/                  # API服务
│       ├── hooks/                     # 自定义钩子
│       └── types/                     # 类型定义
├── lib/
│   ├── api/                           # API配置
│   └── utils/                         # 工具函数
└── locales/                           # 国际化文件
    ├── en/                            # 英文翻译
    └── zh/                            # 中文翻译
```

## API 集成 (API Integration)

### 订阅相关 API

- `GET /api/v1/user/subscriptions` - 获取用户订阅列表
- `GET /api/v1/user/subscriptions/{id}` - 获取订阅详情
- `GET /api/v1/subscription-plans` - 获取可用套餐
- `GET /api/v1/user/subscriptions/{id}/clash-config` - 下载配置文件

### 认证 API

- JWT token 自动附加到请求头
- 自动token刷新机制
- 统一的错误处理

## 组件使用指南 (Component Usage Guide)

### 语言切换

```tsx
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';

<LanguageSwitcher />;
```

### 翻译文本使用

```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation('subscription');

  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('labels.price')}</p>
      <button>{t('actions.buyNow')}</button>
    </div>
  );
}
```

### 日期格式化

```tsx
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const locale = i18n.language === 'zh' ? 'zh-CN' : 'en-US';
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};
```

## 测试建议 (Testing Recommendations)

### 国际化测试

1. **语言切换测试**: 验证所有页面在中英文切换时正常显示
2. **文本覆盖测试**: 确保所有用户界面文本都已国际化
3. **格式化测试**: 验证日期、时间、货币格式在不同语言下正确显示
4. **长文本测试**: 测试较长翻译文本的UI适配

### 功能测试

1. **认证流程**: 登录、登出、token刷新
2. **订阅管理**: 查看、续费、下载配置
3. **导航测试**: 页面间跳转流畅性
4. **响应式测试**: 移动端和桌面端适配

## 部署注意事项 (Deployment Notes)

### 环境变量

确保以下环境变量正确配置：

- `VITE_API_BASE_URL` - API基础URL
- `VITE_APP_TITLE` - 应用标题

### 构建命令

```bash
npm run build        # 生产构建
npm run preview      # 预览构建结果
npm run type-check   # 类型检查
npm run lint         # 代码检查
```

## 维护指南 (Maintenance Guide)

### 添加新的翻译

1. 在 `src/locales/en/` 和 `src/locales/zh/` 中添加翻译键
2. 在组件中使用 `useTranslation` 钩子
3. 确保键名语义化且结构清晰

### 添加新页面

1. 创建页面组件
2. 添加路由配置
3. 更新导航菜单
4. 添加相应的翻译文件

### 性能优化

- 使用 React.memo 包装纯组件
- 合理使用 useCallback 和 useMemo
- 代码分割和懒加载
- 图片优化和压缩

## 已知问题 (Known Issues)

目前没有已知的重大问题。所有国际化工作已完成，认证问题已修复，导航系统已优化。

## 更新日志 (Changelog)

### 2025-08-16

- ✅ 完成订阅模块全面国际化
- ✅ 修复HTTP 401认证错误
- ✅ 优化Header组件导航为React Router
- ✅ 更新所有翻译文件
- ✅ 修复所有硬编码文本
- ✅ 创建项目文档

---

**文档维护**: 本文档应随项目更新而更新，确保信息的准确性和完整性。
**Document Maintenance**: This document should be updated with project changes to ensure accuracy and completeness.
