# 🏫 ChargingSystem — 家教课时管理系统

> 一套用于管理学生课时充值、消费、教师工资统计的家教收费系统。后端 .NET 10 单服务 + 前端 React SPA，SQLite 存储，JWT 认证，开箱即用。

## ✨ 功能特性

- **学生管理** — 学生档案维护、课时余额查询、充值记录查询
- **教师管理** — 教师与所授科目维护
- **课时充值** — 学生按固定单价购买课时（金额 + 课时数），支持查询充值历史
- **课时消费** — 记录每次授课的课时消耗，自动关联充值记录并保留当时单价
- **仪表盘** — 按月统计总课时、总消费金额、教师数、学生数
- **工资统计** — 按月统计每位教师工资，前端以饼图展示
- **贡献日历** — GitHub 风格的教学贡献日历，直观展示全年教学分布（教师账户仅可见自己）
- **课时历史 PDF** — 一键导出单个学生的完整课时历史 PDF 报表（QuestPDF 生成）
- **认证与权限** — JWT 登录 / 无感刷新 / 修改密码；管理员（`AuthLevel = 0`）与教师两级角色，教师仅能查看自己相关的统计

## 🛠 技术栈

| 层 | 技术 |
|----|------|
| 后端 | ASP.NET Core 10 (.NET 10) Web API |
| ORM | Entity Framework Core 10 (SQLite) |
| 认证 | JWT Bearer (`Microsoft.AspNetCore.Authentication.JwtBearer`) |
| PDF | QuestPDF |
| 前端 | React 19 + TypeScript + Vite 8 |
| 样式 | Tailwind CSS 4 |
| 图标 | lucide-react |
| 路由 | react-router-dom 7 |
| 部署 | PowerShell + plink/pscp (PuTTY) → systemd |

## 📁 目录结构

```
ChargingSystem/
├── ChargingSystem.sln
├── ChargingSystem.Server/          # 后端 API
│   ├── Controllers/                # API 控制器（DTO 定义在控制器文件中）
│   │   ├── AuthController.cs       # 登录 / 改密 / Token 刷新
│   │   ├── StudentController.cs    # 学生 CRUD + 课时历史 PDF
│   │   ├── TeacherController.cs    # 教师管理
│   │   ├── RechargeController.cs   # 充值管理
│   │   ├── ConsumeController.cs    # 消费 / 余额 / 贡献 / 工资
│   │   └── UtilController.cs       # 仪表盘统计
│   ├── Service/                    # 业务服务（Scoped 注册）
│   ├── Model/                      # 实体 + DTO（POCO，[Key] 标注主键）
│   ├── AppDbContext.cs
│   ├── Database/app.db             # SQLite 数据库文件（已提交，无迁移）
│   └── Deploy.ps1                  # 一键部署脚本
└── chargingsystem.client/          # 前端 SPA
    └── src/
        ├── Login.tsx               # 登录页
        ├── Home.tsx                # 主框架（侧边栏 + 各功能页切换）
        ├── components/             # 仪表盘 / 学生 / 教师 / 消费管理、贡献日历、工资饼图等
        └── utils/                  # Token 管理、日期工具
```

## 🚀 快速开始

### 环境要求

- .NET 10 SDK
- Node.js 20+ 与 npm

### 安装与运行

```bash
# 1. 安装前端依赖
cd chargingsystem.client
npm install

# 2. 回到根目录，启动应用（SPA Proxy 自动拉起 Vite 开发服务器）
cd ..
dotnet run --project ChargingSystem.Server
```

启动后访问：

| 服务 | 地址 |
|------|------|
| 应用（SPA Proxy） | `https://localhost:51137` |
| API | `http://0.0.0.0:5126` |
| Vite 独立开发服务器 | `https://localhost:51137`（自动代理 `/api` → `localhost:5126`） |

默认管理员账号（首次启动自动创建）：

- 用户名：`admin`
- 密码：`admin123`

### 前端独立开发

```bash
cd chargingsystem.client
npm run dev        # 开发服务器（端口 51137，可通过 DEV_SERVER_PORT 覆盖）
npm run build      # 构建
npm run lint       # ESLint 检查
```

### 发布后端

```bash
dotnet publish ChargingSystem.Server -c Release
```

## 🔌 API 概览

所有接口位于 `/api/[controller]` 下，除登录外均需 `Authorization: Bearer <token>` 请求头。

| 方法 | 路由 | 说明 |
|------|------|------|
| `POST` | `/api/auth/login` | 登录，返回 JWT、authLevel、过期时间 |
| `POST` | `/api/auth/change-password` | 修改密码（需登录） |
| `POST` | `/api/auth/refresh` | 刷新 Token（需登录） |
| `GET` | `/api/student/list` | 学生列表 |
| `POST` | `/api/student/add` | 新增学生 |
| `GET` | `/api/student/history?studentId=` | 导出学生课时历史 PDF |
| `GET` | `/api/teacher/list` | 教师列表 |
| `POST` | `/api/teacher/add` | 新增教师 |
| `POST` | `/api/teacher/remove?teacherId=` | 删除教师 |
| `POST` | `/api/recharge/add` | 学生课时充值 |
| `GET` | `/api/recharge/query?studentId=` | 查询学生充值记录 |
| `POST` | `/api/consume/add` | 记录课时消费 |
| `GET` | `/api/consume/balance` | 各学生课时余额 |
| `GET` | `/api/consume/query?rechargeId=&queryDate=` | 按充值记录 + 月份查询消费明细 |
| `GET` | `/api/consume/query_contribution?queryYear=` | 年度教学贡献（日历数据） |
| `GET` | `/api/consume/query_salary?queryYear=&queryMonth=` | 月度教师工资统计 |
| `GET` | `/api/util/dashboard?queryYear=&queryMonth=` | 月度仪表盘统计 |

开发环境下还可通过 `/openapi` 查看 OpenAPI 文档。

## ⚙️ 配置

`ChargingSystem.Server/appsettings.json`：

```jsonc
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=./Database/app.db"   // 相对 Server 项目目录
  },
  "JwtSettings": {
    "Key": "...",                // 对称密钥
    "Issuer": "ChargingSystem",
    "Audience": "ChargingSystem",
    "ExpirationMinutes": 30
  }
}
```

## 💾 数据库说明

- SQLite 数据库文件 `ChargingSystem.Server/Database/app.db` **直接提交在仓库中**，随构建复制到输出目录，**不使用 EF Core 迁移**。
- 需要改表结构时请直接更新该文件，或用全新的空库启动（启动时会自动建表并播种默认管理员）。

## ☁️ 部署

`ChargingSystem.Server/Deploy.ps1` 基于 PuTTY 的 plink/pscp 一键部署到远程 Linux 主机：

1. `dotnet publish -c Release` 发布
2. 清空远程目录 `192.168.2.50:/home/ein/Documents/ChargingSystem/`
3. `pscp` 上传发布产物
4. 重启 `chargingsystem` systemd 服务

> ⚠️ 部署脚本中包含硬编码的远程主机凭据，请勿将其提交到公开仓库或随意修改后提交。

## 📄 License

本项目暂未附带 License 文件，保留所有权利。如需开源请在根目录添加 `LICENSE`。