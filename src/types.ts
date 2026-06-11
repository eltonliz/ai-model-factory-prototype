export type ProjectStage =
  | "草稿" | "数据接入中" | "知识加工中" | "数据集构建中"
  | "模型/RAG 调优中" | "Agent 组装中" | "评测验收中"
  | "本地发布中" | "已上线" | "迭代优化中" | "停用归档";

export type RiskLevel = "低" | "中" | "高";
export type ReviewStatus = "待审核" | "审核通过" | "已驳回";
export type PublishStatus = "草稿" | "测试中" | "待审核" | "已发布" | "已回滚" | "已停用";

export interface TrainingProject {
  id: string;
  name: string;
  customerName: string;
  tenantId: string;
  industry: string;
  domain: string;
  scenario: string;
  deploymentMode: "本地单机" | "私有服务器" | "私有云" | "混合云";
  dataScope: string;
  targetMetrics: string[];
  acceptanceCriteria: string[];
  stage: ProjectStage;
  riskLevel: RiskLevel;
  owner: string;
  members: string[];
  offlineDeployment: boolean;
  updatedAt: string;
}

export interface BaseModel {
  id: string;
  name: string;
  type: "文本生成" | "多模态理解" | "Embedding" | "Reranker";
  source: "开源模型" | "私有模型" | "客户指定模型";
  params: string;
  contextLength: number;
  deploymentMode: string;
  status: "未部署" | "部署中" | "运行中" | "异常" | "停用";
  healthStatus: "正常" | "告警" | "异常";
  qps: number;
  p95Latency: number;
  errorRate: number;
  tokenToday: number;
  concurrency: number;
  vramUsage: number;
}

export interface DataAsset {
  id: string;
  name: string;
  projectId: string;
  type: "PDF" | "Word" | "Excel" | "FAQ" | "对话" | "图片" | "音视频" | "数据库表";
  source: string;
  fileSize: string;
  processStatus: "上传成功" | "解析中" | "清洗中" | "脱敏中" | "待审核" | "可入库";
  cleanStatus: string;
  desensitizeStatus: string;
  permissionTags: string[];
  uploader: string;
  updatedAt: string;
}

export interface KnowledgeBaseVersion {
  id: string;
  name: string;
  projectId: string;
  version: string;
  documentCount: number;
  chunkCount: number;
  vectorCount: number;
  embeddingModel: string;
  status: PublishStatus;
  diffSummary: {
    addedChunks: number;
    removedChunks: number;
    modifiedChunks: number;
    permissionChanges: number;
    riskTips: string[];
  };
}

export interface TrainingDataset {
  id: string;
  name: string;
  projectId: string;
  type: "指令样本" | "问答样本" | "分类样本" | "工具调用样本" | "拒答样本" | "评测集";
  sampleCount: number;
  qualityScore: number;
  duplicateRate: number;
  sensitiveHitCount: number;
  labelConsistency: number;
  status: "草稿" | "检查中" | "待审核" | "已发布" | "已停用";
}

export interface TrainingJob {
  id: string;
  name: string;
  projectId: string;
  baseModelId: string;
  datasetVersion: string;
  method: "LoRA" | "QLoRA" | "SFT";
  status: "待配置" | "排队中" | "训练中" | "评测中" | "训练成功" | "训练失败" | "已取消" | "已归档";
  loss: number;
  evalLoss: number;
  gpuUsage: number;
  duration: string;
  creator: string;
  artifact: {
    adapterVersion?: string;
    checkpointPath?: string;
    reportId?: string;
  };
}

export interface RagConfig {
  id: string;
  name: string;
  projectId: string;
  knowledgeBaseVersion: string;
  embeddingModel: string;
  rerankerModel: string;
  topK: number;
  similarityThreshold: number;
  retrievalStrategy: "向量召回" | "关键词召回" | "混合召回";
  conflictStrategy: "最新版本优先" | "高优先级规则优先" | "转人工";
  noAnswerStrategy: "低置信度拒答" | "转人工" | "引导用户补充问题";
  status: PublishStatus;
}

export interface AgentApp {
  id: string;
  name: string;
  projectId: string;
  scenario: string;
  targetUsers: string[];
  modelVersion: string;
  knowledgeBaseVersion: string;
  ragConfigVersion: string;
  promptVersion: string;
  status: "未配置" | "配置中" | "测试中" | "待审核" | "审核通过" | "已发布" | "迭代中" | "已下线";
  todayCalls: number;
  satisfactionRate: number;
  tools: string[];
  highRiskConfirmEnabled: boolean;
}

export interface PromptTemplate {
  id: string;
  name: string;
  functionType: string;
  scenario: string;
  modelScope: string;
  version: string;
  status: PublishStatus;
  editor: string;
  updatedAt: string;
  sections: {
    system: string;
    businessRules: string;
    knowledgeUse: string;
    toolUse: string;
    riskControl: string;
    outputFormat: string;
    fewShot: string;
    variables: string[];
  };
}

export interface EvaluationReport {
  id: string;
  name: string;
  targetType: "模型" | "RAG" | "Prompt" | "Agent" | "知识库";
  projectId: string;
  testSet: string;
  status: "评测中" | "通过" | "不通过";
  passRate: number;
  metrics: {
    ragRecall: number;
    hitRate: number;
    citationAccuracy: number;
    noAnswerAccuracy: number;
    modelAccuracy: number;
    completeness: number;
    ruleCompliance: number;
    taskCompletion: number;
    toolCallAccuracy: number;
    hallucinationCount: number;
    unauthorizedAnswerCount: number;
    sensitiveLeakCount: number;
  };
  conclusion: string;
  issues: string[];
  suggestions: string[];
  allowRelease: boolean;
}

export interface ReleasePackage {
  id: string;
  name: string;
  projectId: string;
  modelVersion: string;
  adapterVersion: string;
  knowledgeBaseVersion: string;
  ragConfigVersion: string;
  promptVersion: string;
  agentVersion: string;
  evaluationConclusion: "通过" | "不通过";
  reviewStatus: ReviewStatus;
  releaseStatus: "未发布" | "发布中" | "已发布" | "已回滚";
}

export interface UserFeedback {
  id: string;
  time: string;
  user: string;
  tenant: string;
  projectId: string;
  agentId: string;
  questionSummary: string;
  feedbackType: "满意" | "不满意" | "纠错" | "转人工";
  dissatisfiedReason?: "不准确" | "不完整" | "不合规" | "不好用" | "其他";
  adopted: boolean;
  attribution?: "知识缺失" | "召回错误" | "Prompt 问题" | "模型能力不足" | "工具失败" | "权限问题" | "用户输入不清晰";
  status: "待处理" | "处理中" | "待评测" | "待发布" | "已完成" | "已关闭";
}

export interface CallLog {
  id: string;
  taskId: string;
  user: string;
  tenant: string;
  projectId: string;
  agentId: string;
  modelVersion: string;
  promptVersion: string;
  knowledgeBaseVersion: string;
  ragConfigVersion: string;
  inputSummary: string;
  outputSummary: string;
  tokenCost: number;
  latencyMs: number;
  riskResult: "通过" | "拦截" | "转人工";
  adopted: boolean;
  recalledChunks: string[];
}

export interface ReviewRecord {
  id: string;
  objectName: string;
  objectType: string;
  version: string;
  projectId: string;
  riskLevel: RiskLevel;
  submitter: string;
  submittedAt: string;
  status: ReviewStatus;
  result?: string;
  comment?: string;
}

export interface IterationTask {
  id: string;
  type: "知识更新任务" | "Prompt 调整任务" | "再训练任务" | "RAG 调参任务" | "风控规则调整任务";
  projectId: string;
  sourceFeedbackId: string;
  owner: string;
  status: "待处理" | "处理中" | "待评测" | "待发布" | "已完成" | "已关闭";
  dueAt: string;
}
