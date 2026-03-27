<div align="center">

<img src="./assets/Dreamix-Logo.jpeg" alt="Dreamix Logo" width="65%"/> 

# Dreamix

### AI原生互动视频Agent 🎬
### 从创意到互动故事 🎮

<p align="center">
  <a href="https://opensource.org/licenses/MIT">
    <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License">
  </a>
  <a href="https://www.python.org/">
    <img src="https://img.shields.io/badge/Python-3.8+-blue.svg" alt="Python Version">
  </a>
  <a href="https://github.com/Yuan-ManX/Dreamix">
    <img src="https://img.shields.io/github/stars/Yuan-ManX/Dreamix?style=social" alt="Stars">
  </a>
</p>

#### [English](./README.md) | [中文文档](./README_CN.md)

</div>

## 🌟 Dreamix是什么？

Dreamix是一个AI原生的互动视频Agent平台，通过自然语言对话将创意转化为引人入胜的视频故事。通过将强大的AI Agent基础设施与先进的视频创作能力相结合，Dreamix实现了高质量视频制作的民主化，让从初学者到专业人士的每个人都能轻松使用。

无论您是内容创作者、营销人员、教育工作者还是故事讲述者，Dreamix都能让您以前所未有的轻松和创意将愿景变为现实。

## ✨ 核心功能

### 🤖 智能Agent平台
- **多LLM支持**：与主要LLM提供商（Anthropic、OpenAI等）无缝协作
- **可扩展工具系统**：为专业工作流构建和集成自定义工具
- **安全执行**：用于安全Agent操作的隔离环境
- **对话记忆**：记住您偏好的上下文感知交互

### 🎬 智能视频创作
- **智能脚本生成**：根据您的主题自动生成故事情节、旁白和视觉建议
- **媒体搜索与组织**：自动查找、下载和组织相关的图像和视频片段
- **风格迁移**：通过参考示例定义您喜欢的语气（休闲、专业、幽默等）
- **智能推荐**：推荐与您内容的情绪和风格相匹配的音乐、旁白和字体

### 💬 对话式编辑
- **自然语言控制**：完全通过对话编辑您的视频 - 无需掌握复杂的时间线
- **实时预览**：在您完善创作时即时查看更改
- **精确优化**：通过简单的提示调整颜色、字体、时间等
- **迭代改进**：通过多轮对话完善和打磨您的视频

### 🛠️ 基于技能的工作流
- **自定义技能创建**：将您完整的编辑工作流保存为可重用的技能
- **批量处理**：将相同的风格和工作流立即应用于多个媒体资产
- **内置技能库**：访问用于常见视频创作模式的预构建技能
- **分享与协作**：导出并与社区分享您的技能

## 🏗️ 架构

Dreamix构建在一个为可扩展性和可扩展性设计的内聚模块化架构之上：

### 核心组件
- **后端API**：为Agent编排和视频处理提供动力的Python/FastAPI服务
- **前端仪表板**：提供直观用户界面的Next.js/React应用程序
- **Agent运行时**：用于安全Agent操作的隔离执行环境
- **数据层**：用于持久存储和实时更新的PostgreSQL + Supabase

### 技术栈
- **后端**：Python 3.11+、FastAPI、LangChain
- **前端**：Next.js 14、React、TypeScript
- **视频处理**：FFmpeg、MoviePy
- **容器化**：Docker、Docker Compose
- **数据库**：PostgreSQL、Supabase

## 🚀 快速开始

### 前置要求
- Python 3.11或更高版本
- Node.js 18或更高版本
- Docker和Docker Compose
- 您首选LLM提供商的API密钥

### 安装

1. **克隆仓库**
```bash
git clone https://github.com/your-org/dreamix.git
cd dreamix
```

2. **运行设置向导**
```bash
python setup.py
```
向导将指导您配置所有必需的服务。

3. **启动Dreamix**
```bash
python start.py
```

4. **访问仪表板**
打开浏览器并导航到 `http://localhost:3000`

## 📖 使用指南

### 创建您的第一个视频

1. **开始对话**：告诉Dreamix您想要创建什么样的视频
2. **提供输入**：上传您的媒体或让Dreamix为您找到相关内容
3. **查看脚本**：Dreamix将生成包含场景描述的完整脚本
4. **通过聊天完善**：使用自然语言进行调整
5. **渲染和导出**：当您满意时，渲染您的最终视频

### 示例提示

```
"创建一个60秒的无线耳机产品评测视频，重点关注音质和电池续航。"
```

```
"让这个视频更欢快，将背景音乐换成充满活力的内容，并在结尾添加号召性用语。"
```

```
"将此工作流保存为'产品评测'技能，以便我可以将其应用于其他产品。"
```

## 🎯 用例

- **内容创作者**：大规模制作引人入胜的社交媒体内容
- **营销人员**：创建引人注目的产品演示和促销视频
- **教育工作者**：将课程转化为互动教育内容
- **故事讲述者**：通过AI驱动的旁白和视觉效果让您的故事栩栩如生
- **企业**：自动化用于培训、入职和沟通的视频制作

## 🤝 贡献

我们欢迎社区的贡献！无论您是修复错误、添加功能还是改进文档，我们都感谢您的帮助。

有关更多详细信息，请参阅我们的[贡献指南](CONTRIBUTING.md)。

## 📄 许可证

Dreamix根据 MIT 许可。有关详细信息，请参阅[LICENSE](LICENSE)文件。

## 🙏 致谢

Dreamix站在令人难以置信的开源项目和更广泛的AI社区的肩膀上。我们感谢所有使这成为可能的创新。

---

<div align="center">

**Dreamix团队用心打造 ❤️**

[网站](https://dreamix.ai) | [文档](https://docs.dreamix.ai) | [Discord](https://discord.gg/dreamix) | [Twitter](https://twitter.com/dreamix_ai)

</div>
