import type {
  AgentApp,
  BaseModel,
  CallLog,
  DataAsset,
  EvaluationReport,
  IterationTask,
  KnowledgeBaseVersion,
  ReleasePackage,
  ReviewRecord,
  TrainingDataset,
  TrainingJob,
  TrainingProject,
  UserFeedback,
  RagConfig,
  PromptTemplate,
} from "./types";

export const stages = ["草稿", "数据接入中", "知识加工中", "数据集构建中", "模型/RAG 调优中", "Agent 组装中", "评测验收中", "本地发布中", "已上线", "迭代优化中", "停用归档"] as const;

export const projects: TrainingProject[] = [
  { id: "P001", name: "电商售后知识库本地训练项目", customerName: "华东零售集团", tenantId: "T001", industry: "电商", domain: "售后服务", scenario: "退换货与赔付", deploymentMode: "私有云", dataScope: "售后制度、订单案例、客服对话", targetMetrics: ["引用正确率 >= 95%", "无答案拒答 >= 90%"], acceptanceCriteria: ["完成本地部署", "Agent 通过评测"], stage: "模型/RAG 调优中", riskLevel: "中", owner: "张倩", members: ["李牧", "周扬", "许宁"], offlineDeployment: false, updatedAt: "2026-06-11 18:20" },
  { id: "P002", name: "医疗导诊知识库训练项目", customerName: "明德互联网医院", tenantId: "T002", industry: "医疗", domain: "导诊咨询", scenario: "症状分诊与科室推荐", deploymentMode: "私有服务器", dataScope: "科室说明、导诊 SOP、问诊 FAQ", targetMetrics: ["高风险误答 = 0", "转人工准确率 >= 92%"], acceptanceCriteria: ["医学专家审核", "风控规则上线"], stage: "评测验收中", riskLevel: "高", owner: "罗晨", members: ["沈瑜", "韩立"], offlineDeployment: true, updatedAt: "2026-06-11 17:45" },
  { id: "P003", name: "保险理赔规则库训练项目", customerName: "南方财险", tenantId: "T003", industry: "保险", domain: "理赔", scenario: "材料审核与赔付建议", deploymentMode: "混合云", dataScope: "理赔条款、拒赔案例、工单记录", targetMetrics: ["规则遵循率 >= 96%", "引用正确率 >= 95%"], acceptanceCriteria: ["不得自动赔付", "审核链路完整"], stage: "Agent 组装中", riskLevel: "高", owner: "王璟", members: ["胡珂", "陈也"], offlineDeployment: false, updatedAt: "2026-06-10 21:10" },
  { id: "P004", name: "制造质检 SOP 本地训练项目", customerName: "华南智造工厂", tenantId: "T004", industry: "制造", domain: "质量管理", scenario: "质检 SOP 与异常定位", deploymentMode: "本地单机", dataScope: "SOP、检测标准、异常图片说明", targetMetrics: ["任务完成率 >= 88%", "越权回答 = 0"], acceptanceCriteria: ["产线内网部署", "质检主管审核"], stage: "知识加工中", riskLevel: "中", owner: "赵岩", members: ["杜若", "马骁"], offlineDeployment: true, updatedAt: "2026-06-10 16:02" },
  { id: "P005", name: "企业内部制度问答助手", customerName: "北辰科技", tenantId: "T005", industry: "企业服务", domain: "内部知识", scenario: "HR/财务/行政制度问答", deploymentMode: "私有云", dataScope: "员工手册、报销制度、IT 指南", targetMetrics: ["满意率 >= 90%", "P95 < 5s"], acceptanceCriteria: ["权限隔离", "上线员工工作台"], stage: "已上线", riskLevel: "低", owner: "张倩", members: ["黄森", "宋佳"], offlineDeployment: false, updatedAt: "2026-06-09 10:15" },
];

export const models: BaseModel[] = [
  { id: "M001", name: "Qwen2.5-72B", type: "文本生成", source: "开源模型", params: "72B", contextLength: 128000, deploymentMode: "vLLM / 私有云", status: "运行中", healthStatus: "正常", qps: 42, p95Latency: 2800, errorRate: 0.7, tokenToday: 8360000, concurrency: 28, vramUsage: 76 },
  { id: "M002", name: "DeepSeek-R1", type: "文本生成", source: "开源模型", params: "671B MoE", contextLength: 64000, deploymentMode: "推理集群", status: "部署中", healthStatus: "告警", qps: 18, p95Latency: 5200, errorRate: 1.8, tokenToday: 2360000, concurrency: 10, vramUsage: 88 },
  { id: "M003", name: "Llama3.1", type: "文本生成", source: "开源模型", params: "70B", contextLength: 128000, deploymentMode: "本地服务器", status: "运行中", healthStatus: "正常", qps: 24, p95Latency: 3100, errorRate: 0.9, tokenToday: 4120000, concurrency: 14, vramUsage: 68 },
  { id: "M004", name: "Gemma", type: "文本生成", source: "开源模型", params: "27B", contextLength: 32000, deploymentMode: "Ollama", status: "停用", healthStatus: "告警", qps: 0, p95Latency: 0, errorRate: 0, tokenToday: 0, concurrency: 0, vramUsage: 0 },
  { id: "M005", name: "BGE-M3 Embedding", type: "Embedding", source: "开源模型", params: "568M", contextLength: 8192, deploymentMode: "向量化服务", status: "运行中", healthStatus: "正常", qps: 96, p95Latency: 380, errorRate: 0.2, tokenToday: 12800000, concurrency: 36, vramUsage: 34 },
  { id: "M006", name: "BGE-Reranker", type: "Reranker", source: "开源模型", params: "560M", contextLength: 8192, deploymentMode: "重排服务", status: "运行中", healthStatus: "正常", qps: 72, p95Latency: 460, errorRate: 0.3, tokenToday: 7160000, concurrency: 30, vramUsage: 31 },
  { id: "M007", name: "MedGuide-Lora-13B", type: "文本生成", source: "私有模型", params: "13B", contextLength: 32000, deploymentMode: "医院内网", status: "异常", healthStatus: "异常", qps: 4, p95Latency: 9200, errorRate: 6.4, tokenToday: 192000, concurrency: 2, vramUsage: 92 },
  { id: "M008", name: "FactoryVision-VL", type: "多模态理解", source: "客户指定模型", params: "34B", contextLength: 16000, deploymentMode: "工厂本地", status: "未部署", healthStatus: "告警", qps: 0, p95Latency: 0, errorRate: 0, tokenToday: 0, concurrency: 0, vramUsage: 0 },
];

const assetNames = ["售后退款规则.pdf", "7日无理由退货 FAQ.xlsx", "医疗导诊 SOP.docx", "理赔条款总则.pdf", "拒赔案例库.xlsx", "质检工位 SOP.pdf", "异常检测图片说明.zip", "员工手册.docx", "报销制度 FAQ.xlsx", "客服历史对话 2026Q2.csv"];
export const dataAssets: DataAsset[] = assetNames.map((name, index) => ({
  id: `D${String(index + 1).padStart(3, "0")}`,
  name,
  projectId: projects[index % projects.length].id,
  type: ["PDF", "Excel", "Word", "PDF", "Excel", "PDF", "图片", "Word", "FAQ", "对话"][index] as DataAsset["type"],
  source: index % 3 === 0 ? "本地上传" : index % 3 === 1 ? "批量导入" : "API 接入",
  fileSize: `${(18 + index * 7).toFixed(1)} MB`,
  processStatus: ["可入库", "待审核", "脱敏中", "清洗中", "解析中"][index % 5] as DataAsset["processStatus"],
  cleanStatus: index % 2 ? "已清洗" : "待清洗",
  desensitizeStatus: index % 3 ? "已脱敏" : "命中 12 条",
  permissionTags: index % 2 ? ["业务专家", "交付团队"] : ["企业管理员", "只读"],
  uploader: ["李牧", "沈瑜", "胡珂", "杜若", "宋佳"][index % 5],
  updatedAt: `2026-06-${String(2 + index).padStart(2, "0")} 14:${String(10 + index).padStart(2, "0")}`,
}));

export const knowledgeBaseVersions: KnowledgeBaseVersion[] = projects.map((project, index) => ({
  id: `KB${String(index + 1).padStart(3, "0")}`,
  name: project.scenario + "知识库",
  projectId: project.id,
  version: `v1.${index + 1}.0`,
  documentCount: 24 + index * 9,
  chunkCount: 2860 + index * 640,
  vectorCount: 2860 + index * 640,
  embeddingModel: "BGE-M3 Embedding",
  status: ["已发布", "待审核", "草稿", "已回滚", "已发布"][index] as KnowledgeBaseVersion["status"],
  diffSummary: {
    addedChunks: 120 + index * 16,
    removedChunks: 12 + index,
    modifiedChunks: 48 + index * 8,
    permissionChanges: index + 2,
    riskTips: ["发现跨部门权限变更", "新增高风险规则片段", "建议业务专家复核"].slice(0, 1 + (index % 3)),
  },
}));

export const trainingDatasets: TrainingDataset[] = Array.from({ length: 6 }, (_, index) => ({
  id: `DS${String(index + 1).padStart(3, "0")}`,
  name: ["售后问答 SFT 集", "医疗拒答评测集", "理赔工具调用样本", "质检分类样本", "制度问答样本", "通用边界问题集"][index],
  projectId: projects[index % projects.length].id,
  type: ["问答样本", "拒答样本", "工具调用样本", "分类样本", "指令样本", "评测集"][index] as TrainingDataset["type"],
  sampleCount: 1200 + index * 430,
  qualityScore: 82 + index * 2,
  duplicateRate: Number((2.4 + index * 0.5).toFixed(1)),
  sensitiveHitCount: index * 3,
  labelConsistency: 88 + index,
  status: ["已发布", "待审核", "检查中", "草稿", "已发布", "已停用"][index] as TrainingDataset["status"],
}));

export const trainingJobs: TrainingJob[] = Array.from({ length: 8 }, (_, index) => ({
  id: `TJ${String(index + 1).padStart(3, "0")}`,
  name: ["售后 LoRA 首轮训练", "医疗导诊 QLoRA", "理赔 SFT 工具调用", "质检 SOP 分类训练", "制度助手 LoRA", "售后拒答增强", "医疗安全回归", "制造异常样本重训"][index],
  projectId: projects[index % projects.length].id,
  baseModelId: models[index % 4].id,
  datasetVersion: `DS-v1.${index + 1}`,
  method: ["LoRA", "QLoRA", "SFT"][index % 3] as TrainingJob["method"],
  status: ["训练中", "评测中", "训练成功", "训练失败", "排队中", "待配置", "已取消", "已归档"][index] as TrainingJob["status"],
  loss: Number((1.12 - index * 0.06).toFixed(2)),
  evalLoss: Number((1.28 - index * 0.05).toFixed(2)),
  gpuUsage: 38 + index * 7,
  duration: `${1 + index}h ${20 + index * 4}m`,
  creator: ["李牧", "沈瑜", "胡珂", "杜若"][index % 4],
  artifact: { adapterVersion: `adapter-v1.${index}`, checkpointPath: `/models/checkpoints/TJ${index + 1}`, reportId: `ER${String(index + 1).padStart(3, "0")}` },
}));

export const ragConfigs: RagConfig[] = projects.map((project, index) => ({
  id: `RAG${String(index + 1).padStart(3, "0")}`,
  name: project.scenario + " RAG 配置",
  projectId: project.id,
  knowledgeBaseVersion: knowledgeBaseVersions[index].version,
  embeddingModel: "BGE-M3 Embedding",
  rerankerModel: "BGE-Reranker",
  topK: 8 + index,
  similarityThreshold: Number((0.72 + index * 0.03).toFixed(2)),
  retrievalStrategy: ["混合召回", "向量召回", "关键词召回", "混合召回", "混合召回"][index] as RagConfig["retrievalStrategy"],
  conflictStrategy: ["高优先级规则优先", "转人工", "最新版本优先", "高优先级规则优先", "最新版本优先"][index] as RagConfig["conflictStrategy"],
  noAnswerStrategy: ["低置信度拒答", "转人工", "引导用户补充问题", "低置信度拒答", "转人工"][index] as RagConfig["noAnswerStrategy"],
  status: ["已发布", "待审核", "测试中", "草稿", "已回滚"][index] as RagConfig["status"],
}));

export const agents: AgentApp[] = [
  "售后 Agent", "医疗导诊 Agent", "理赔 Agent", "质检 Agent", "内部知识助手", "客服质检 Agent",
].map((name, index) => ({
  id: `A${String(index + 1).padStart(3, "0")}`,
  name,
  projectId: projects[index % projects.length].id,
  scenario: projects[index % projects.length].scenario,
  targetUsers: index % 2 ? ["业务专家", "企业管理员"] : ["业务员工", "客服"],
  modelVersion: `${models[index % models.length].name} / v1.${index}`,
  knowledgeBaseVersion: knowledgeBaseVersions[index % knowledgeBaseVersions.length].version,
  ragConfigVersion: `rag-v1.${index + 1}`,
  promptVersion: `prompt-v2.${index + 1}`,
  status: ["已发布", "待审核", "测试中", "配置中", "迭代中", "已下线"][index] as AgentApp["status"],
  todayCalls: 1200 + index * 460,
  satisfactionRate: 86 + index * 2,
  tools: ["知识检索", "订单查询", "工单创建", "CRM 查询"].slice(0, 2 + (index % 3)),
  highRiskConfirmEnabled: index !== 4,
}));

export const promptTemplates: PromptTemplate[] = agents.map((agent, index) => ({
  id: `PT${String(index + 1).padStart(3, "0")}`,
  name: `${agent.name} 系统提示词`,
  functionType: index % 2 ? "工具调用" : "RAG 问答",
  scenario: agent.scenario,
  modelScope: agent.modelVersion,
  version: agent.promptVersion,
  status: ["已发布", "待审核", "测试中", "草稿", "已回滚", "已停用"][index] as PromptTemplate["status"],
  editor: ["李牧", "沈瑜", "许宁"][index % 3],
  updatedAt: `2026-06-${String(5 + index).padStart(2, "0")} 11:20`,
  sections: {
    system: "你是企业本地知识库 Agent，必须基于授权知识回答。",
    businessRules: "涉及资金、权益、医疗、法律等高风险内容必须转人工。",
    knowledgeUse: "优先使用召回片段，无法确认时拒答。",
    toolUse: "仅在用户明确授权且工具可用时调用业务系统。",
    riskControl: "不得输出越权、泄密、绝对化承诺内容。",
    outputFormat: "主答案、引用来源、风险提示、推荐操作。",
    fewShot: "用户：退货是否需要运费？回答：根据售后规则...",
    variables: ["user_question", "retrieved_chunks", "tenant", "role"],
  },
}));

export const evaluationReports: EvaluationReport[] = Array.from({ length: 10 }, (_, index) => ({
  id: `ER${String(index + 1).padStart(3, "0")}`,
  name: ["售后 Agent 发布评测", "医疗 RAG 安全评测", "理赔工具调用评测", "质检分类模型评测", "制度问答回归评测"][index % 5],
  targetType: ["Agent", "RAG", "模型", "Prompt", "知识库"][index % 5] as EvaluationReport["targetType"],
  projectId: projects[index % projects.length].id,
  testSet: `测试集 v1.${index + 1}`,
  status: index % 4 === 1 ? "不通过" : index % 4 === 2 ? "评测中" : "通过",
  passRate: 78 + index * 2,
  metrics: {
    ragRecall: 84 + index, hitRate: 82 + index, citationAccuracy: 90 + index, noAnswerAccuracy: 86 + index,
    modelAccuracy: 83 + index, completeness: 85 + index, ruleCompliance: 88 + index, taskCompletion: 80 + index,
    toolCallAccuracy: 82 + index, hallucinationCount: index % 3, unauthorizedAnswerCount: index % 2, sensitiveLeakCount: index === 1 ? 1 : 0,
  },
  conclusion: index % 4 === 1 ? "不允许发布，需修复高风险样本" : "满足当前灰度发布要求",
  issues: ["低置信度问题需转人工", "部分规则引用版本较旧"].slice(0, 1 + (index % 2)),
  suggestions: ["补充拒答样本", "提高 Reranker 阈值", "优化 Prompt 风控段"].slice(0, 2),
  allowRelease: index % 4 !== 1,
}));

export const releasePackages: ReleasePackage[] = Array.from({ length: 10 }, (_, index) => ({
  id: `RP${String(index + 1).padStart(3, "0")}`,
  name: `${projects[index % projects.length].scenario} 发布包 v1.${index + 1}`,
  projectId: projects[index % projects.length].id,
  modelVersion: models[index % models.length].name,
  adapterVersion: `adapter-v1.${index + 1}`,
  knowledgeBaseVersion: knowledgeBaseVersions[index % 5].version,
  ragConfigVersion: `rag-v1.${index + 1}`,
  promptVersion: `prompt-v2.${index + 1}`,
  agentVersion: `agent-v1.${index + 1}`,
  evaluationConclusion: index % 4 === 1 ? "不通过" : "通过",
  reviewStatus: ["待审核", "审核通过", "已驳回"][index % 3] as ReleasePackage["reviewStatus"],
  releaseStatus: ["未发布", "发布中", "已发布", "已回滚"][index % 4] as ReleasePackage["releaseStatus"],
}));

const feedbackTypes = ["满意", "不满意", "纠错", "转人工"] as const;
export const userFeedback: UserFeedback[] = Array.from({ length: 20 }, (_, index) => ({
  id: `FB${String(index + 1).padStart(3, "0")}`,
  time: `2026-06-${String(1 + (index % 10)).padStart(2, "0")} ${String(9 + (index % 8)).padStart(2, "0")}:30`,
  user: ["赵敏", "陈晨", "李娜", "王强"][index % 4],
  tenant: projects[index % projects.length].customerName,
  projectId: projects[index % projects.length].id,
  agentId: agents[index % agents.length].id,
  questionSummary: ["退货超过 7 天还能处理吗", "是否可以直接推荐科室", "这类事故是否赔付", "质检异常如何分级"][index % 4],
  feedbackType: feedbackTypes[index % 4],
  dissatisfiedReason: index % 4 === 1 ? ["不准确", "不完整", "不合规", "不好用"][index % 4] as UserFeedback["dissatisfiedReason"] : undefined,
  adopted: index % 3 !== 1,
  attribution: ["知识缺失", "召回错误", "Prompt 问题", "模型能力不足", "工具失败", "权限问题", "用户输入不清晰"][index % 7] as UserFeedback["attribution"],
  status: ["待处理", "处理中", "待评测", "待发布", "已完成", "已关闭"][index % 6] as UserFeedback["status"],
}));

export const callLogs: CallLog[] = Array.from({ length: 30 }, (_, index) => ({
  id: `CL${String(index + 1).padStart(3, "0")}`,
  taskId: `TASK-${20260600 + index}`,
  user: ["赵敏", "陈晨", "李娜", "王强", "刘洋"][index % 5],
  tenant: projects[index % projects.length].customerName,
  projectId: projects[index % projects.length].id,
  agentId: agents[index % agents.length].id,
  modelVersion: agents[index % agents.length].modelVersion,
  promptVersion: agents[index % agents.length].promptVersion,
  knowledgeBaseVersion: agents[index % agents.length].knowledgeBaseVersion,
  ragConfigVersion: agents[index % agents.length].ragConfigVersion,
  inputSummary: ["售后退款规则咨询", "导诊科室推荐", "理赔材料清单", "质检 SOP 查询"][index % 4],
  outputSummary: ["已基于规则返回答案并附引用", "触发高风险转人工", "生成材料核对清单", "返回质检分级建议"][index % 4],
  tokenCost: 1260 + index * 84,
  latencyMs: 1800 + index * 120,
  riskResult: ["通过", "拦截", "转人工"][index % 3] as CallLog["riskResult"],
  adopted: index % 2 === 0,
  recalledChunks: [`CH-${index + 1}`, `CH-${index + 12}`],
}));

export const reviewRecords: ReviewRecord[] = Array.from({ length: 10 }, (_, index) => ({
  id: `RV${String(index + 1).padStart(3, "0")}`,
  objectName: ["知识库版本", "训练数据集", "模型适配器", "Prompt", "Agent", "发布包"][index % 6] + ` v1.${index + 1}`,
  objectType: ["知识库版本", "训练数据集", "模型适配器", "Prompt", "Agent", "发布包", "高风险工具调用"][index % 7],
  version: `v1.${index + 1}.0`,
  projectId: projects[index % projects.length].id,
  riskLevel: ["低", "中", "高"][index % 3] as ReviewRecord["riskLevel"],
  submitter: ["李牧", "沈瑜", "胡珂"][index % 3],
  submittedAt: `2026-06-${String(1 + index).padStart(2, "0")} 15:00`,
  status: ["待审核", "审核通过", "已驳回"][index % 3] as ReviewRecord["status"],
  result: index % 3 === 1 ? "通过" : index % 3 === 2 ? "需补充安全样本" : undefined,
  comment: index % 3 === 2 ? "高风险规则未覆盖完全" : undefined,
}));

export const iterationTasks: IterationTask[] = userFeedback.slice(0, 8).map((feedback, index) => ({
  id: `IT${String(index + 1).padStart(3, "0")}`,
  type: ["知识更新任务", "Prompt 调整任务", "再训练任务", "RAG 调参任务", "风控规则调整任务"][index % 5] as IterationTask["type"],
  projectId: feedback.projectId,
  sourceFeedbackId: feedback.id,
  owner: ["李牧", "沈瑜", "胡珂"][index % 3],
  status: ["待处理", "处理中", "待评测", "待发布", "已完成", "已关闭"][index % 6] as IterationTask["status"],
  dueAt: `2026-06-${String(14 + index).padStart(2, "0")}`,
}));

export const costTrendData = Array.from({ length: 30 }, (_, index) => ({
  date: `05-${String(index + 1).padStart(2, "0")}`,
  inference: 2600 + Math.round(Math.sin(index / 3) * 420) + index * 40,
  embedding: 900 + Math.round(Math.cos(index / 4) * 180) + index * 12,
  reranker: 680 + index * 10,
  training: 1700 + Math.round(Math.sin(index / 2) * 520) + index * 28,
  storage: 420 + index * 9,
}));

export const monitorTrendData = Array.from({ length: 14 }, (_, index) => ({
  date: `06-${String(index + 1).padStart(2, "0")}`,
  requests: 9200 + index * 680 + Math.round(Math.sin(index) * 1200),
  tokens: 48 + index * 3,
  p95: 2800 + Math.round(Math.sin(index / 2) * 300),
  errorRate: Number((1.1 + Math.sin(index) * 0.4).toFixed(2)),
  ragHit: Number((72 + Math.sin(index / 2) * 7 + index * 0.6).toFixed(1)),
  riskBlocks: 18 + index * 3,
}));

export const chunks = Array.from({ length: 8 }, (_, index) => ({
  id: `CH-${index + 1}`,
  summary: ["退货运费承担规则", "7 日无理由适用边界", "高价值商品人工审核", "导诊安全提示"][index % 4],
  source: dataAssets[index % dataAssets.length].name,
  position: `第 ${index + 2} 页 / 第 ${index + 3} 段`,
  businessTag: ["售后", "导诊", "理赔", "质检"][index % 4],
  permissionTag: index % 2 ? "业务专家" : "企业管理员",
  vectorStatus: index % 3 ? "已向量化" : "待处理",
}));
