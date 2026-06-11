import { useEffect, useMemo, useRef, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";
import * as echarts from "echarts";
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  Checkbox,
  Col,
  Descriptions,
  Drawer,
  Flex,
  Form,
  Input,
  InputNumber,
  Layout,
  Menu,
  Modal,
  Progress,
  Radio,
  Row,
  Select,
  Space,
  Statistic,
  Steps,
  Switch,
  Table,
  Tabs,
  Tag,
  Timeline,
  Typography,
  Upload,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  ApiOutlined,
  AppstoreOutlined,
  AuditOutlined,
  BarChartOutlined,
  BellOutlined,
  BookOutlined,
  CheckCircleOutlined,
  CloudUploadOutlined,
  CodeOutlined,
  ControlOutlined,
  DatabaseOutlined,
  DeploymentUnitOutlined,
  ExperimentOutlined,
  FileSearchOutlined,
  FundProjectionScreenOutlined,
  GoldOutlined,
  HomeOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MessageOutlined,
  MonitorOutlined,
  PartitionOutlined,
  PlayCircleOutlined,
  ReloadOutlined,
  RobotOutlined,
  SafetyCertificateOutlined,
  SearchOutlined,
  SettingOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import {
  agents as seedAgents,
  callLogs as seedCallLogs,
  chunks,
  costTrendData,
  dataAssets as seedDataAssets,
  evaluationReports,
  iterationTasks as seedIterationTasks,
  knowledgeBaseVersions as seedKnowledgeBaseVersions,
  models,
  monitorTrendData,
  projects as seedProjects,
  promptTemplates,
  ragConfigs as seedRagConfigs,
  releasePackages as seedReleasePackages,
  reviewRecords as seedReviewRecords,
  stages,
  trainingDatasets as seedTrainingDatasets,
  trainingJobs as seedTrainingJobs,
  userFeedback as seedUserFeedback,
} from "./mocks";
import type {
  AgentApp,
  CallLog,
  DataAsset,
  IterationTask,
  KnowledgeBaseVersion,
  ProjectStage,
  RagConfig,
  ReleasePackage,
  ReviewRecord,
  TrainingJob,
  TrainingProject,
  UserFeedback,
} from "./types";

const { Header, Sider, Content } = Layout;
const { Title, Text, Paragraph } = Typography;

function statusColor(value?: string) {
  if (!value) return "default";
  if (["已上线", "已发布", "运行中", "正常", "训练成功", "审核通过", "通过", "可入库", "已完成"].includes(value)) return "success";
  if (["待审核", "评测中", "部署中", "训练中", "处理中", "本地发布中", "数据接入中", "知识加工中", "测试中"].includes(value)) return "processing";
  if (["高", "异常", "训练失败", "不通过", "已驳回", "拦截"].includes(value)) return "error";
  if (["中", "告警", "待处理", "排队中", "待评测", "待发布"].includes(value)) return "warning";
  return "default";
}

function StatusTag({ value }: { value?: string }) {
  return <Tag color={statusColor(value)}>{value || "-"}</Tag>;
}

function PageHeader({ title, desc, extra }: { title: string; desc?: string; extra?: React.ReactNode }) {
  return (
    <Flex className="page-header" justify="space-between" align="center">
      <div>
        <Title level={3}>{title}</Title>
        {desc && <Text type="secondary">{desc}</Text>}
      </div>
      <Space>{extra}</Space>
    </Flex>
  );
}

function Chart({ option, height = 260 }: { option: echarts.EChartsOption; height?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const chart = echarts.init(ref.current);
    chart.setOption(option);
    const resize = () => chart.resize();
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      chart.dispose();
    };
  }, [option]);
  return <div ref={ref} style={{ height }} />;
}

function MetricCard({ title, value, icon, trend, color = "#176BFF" }: { title: string; value: string | number; icon: React.ReactNode; trend: string; color?: string }) {
  return (
    <Card className="metric-card">
      <Flex justify="space-between">
        <div>
          <Text type="secondary">{title}</Text>
          <Statistic value={value} valueStyle={{ fontSize: 24, fontWeight: 700 }} />
          <Text type={trend.includes("▼") ? "success" : "danger"}>{trend}</Text>
        </div>
        <div className="metric-icon" style={{ color, background: `${color}12` }}>{icon}</div>
      </Flex>
    </Card>
  );
}

function FilterBar({ children }: { children?: React.ReactNode }) {
  return (
    <Card className="filter-bar" size="small">
      <Space wrap>
        <Input prefix={<SearchOutlined />} placeholder="搜索名称 / 客户 / 负责人" allowClear style={{ width: 260 }} />
        <Select placeholder="项目" style={{ width: 180 }} options={seedProjects.map((p) => ({ label: p.name, value: p.id }))} allowClear />
        <Select placeholder="状态" style={{ width: 140 }} options={["草稿", "待审核", "已发布", "运行中", "异常"].map((s) => ({ label: s, value: s }))} allowClear />
        {children}
        <Button>重置</Button>
      </Space>
    </Card>
  );
}

const menuGroups = [
  { key: "dashboard", icon: <HomeOutlined />, label: "项目驾驶舱", children: [{ key: "/dashboard/overview", label: "项目总览" }, { key: "/dashboard/projects", label: "项目列表" }, { key: "/dashboard/projects/create", label: "创建训练项目" }] },
  { key: "models", icon: <GoldOutlined />, label: "模型中心", children: [{ key: "/models/base", label: "基座模型列表" }, { key: "/models/inference", label: "推理服务管理" }] },
  { key: "knowledge", icon: <DatabaseOutlined />, label: "数据与知识", children: [{ key: "/knowledge/assets", label: "数据资产列表" }, { key: "/knowledge/upload", label: "数据上传/接入" }, { key: "/knowledge/processing", label: "知识加工" }, { key: "/knowledge/versions", label: "知识库版本管理" }] },
  { key: "training", icon: <ExperimentOutlined />, label: "训练实验室", children: [{ key: "/training/datasets", label: "训练数据集管理" }, { key: "/training/jobs/create", label: "创建训练任务" }, { key: "/training/jobs", label: "训练任务列表" }] },
  { key: "rag", icon: <PartitionOutlined />, label: "RAG 配置", children: [{ key: "/rag/configs", label: "RAG 配置列表" }, { key: "/rag/testbench", label: "RAG 测试台" }] },
  { key: "agents", icon: <RobotOutlined />, label: "Agent 中心", children: [{ key: "/agents", label: "Agent 列表" }, { key: "/agents/prompts", label: "Prompt 模板管理" }, { key: "/agents/testbench", label: "Agent 测试台" }] },
  { key: "evaluation", icon: <MonitorOutlined />, label: "评测监控", children: [{ key: "/evaluation/tasks", label: "离线评测任务" }, { key: "/monitoring/online", label: "在线监控" }] },
  { key: "release", icon: <DeploymentUnitOutlined />, label: "发布部署", children: [{ key: "/release/packages", label: "发布包管理" }, { key: "/release/deployments", label: "部署实例" }, { key: "/release/gateway", label: "API 网关配置" }] },
  { key: "reviews", icon: <AuditOutlined />, label: "审核中心", children: [{ key: "/reviews/pending", label: "待审核列表" }] },
  { key: "feedback", icon: <MessageOutlined />, label: "反馈迭代", children: [{ key: "/feedback/list", label: "用户反馈列表" }, { key: "/feedback/tasks", label: "迭代任务" }] },
  { key: "logs", icon: <FileSearchOutlined />, label: "日志审计", children: [{ key: "/logs/calls", label: "调用日志" }, { key: "/logs/training", label: "训练日志" }, { key: "/logs/audit", label: "操作审计" }] },
  { key: "costs", icon: <BarChartOutlined />, label: "成本限额", children: [{ key: "/costs/overview", label: "成本总览" }, { key: "/costs/limits", label: "限额配置" }] },
  { key: "settings", icon: <SettingOutlined />, label: "系统管理", children: [{ key: "/settings/tenants", label: "租户管理" }, { key: "/settings/rbac", label: "用户与角色权限" }, { key: "/settings/risk-rules", label: "风控规则" }] },
];

interface Store {
  projects: TrainingProject[];
  dataAssets: DataAsset[];
  knowledge: KnowledgeBaseVersion[];
  trainingJobs: TrainingJob[];
  ragConfigs: RagConfig[];
  agents: AgentApp[];
  releases: ReleasePackage[];
  reviews: ReviewRecord[];
  feedback: UserFeedback[];
  tasks: IterationTask[];
  callLogs: CallLog[];
}

function Shell({ store, setStore }: { store: Store; setStore: React.Dispatch<React.SetStateAction<Store>> }) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const selectedProject = store.projects[0];
  return (
    <Layout className="app-shell">
      <Sider width={232} collapsedWidth={72} collapsed={collapsed} className="side">
        <div className="brand">
          <div className="logo-mark">A</div>
          {!collapsed && <div><b>AI Model Factory</b><span>行业知识库本地训练平台</span></div>}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultOpenKeys={menuGroups.map((m) => m.key)}
          items={menuGroups}
          onClick={({ key }) => navigate(String(key))}
        />
        <Button className="collapse-btn" type="text" icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />} onClick={() => setCollapsed(!collapsed)}>
          {!collapsed && "收起菜单"}
        </Button>
      </Sider>
      <Layout>
        <Header className="topbar">
          <Space size={20}>
            <Select value={selectedProject.id} style={{ width: 260 }} options={store.projects.map((p) => ({ label: p.name, value: p.id }))} />
            <Select value="华东区域-事业部A" style={{ width: 180 }} options={[{ label: "华东区域-事业部A", value: "华东区域-事业部A" }]} />
            <Tag color="green">环境：生产</Tag>
          </Space>
          <Space>
            <Input prefix={<SearchOutlined />} placeholder="搜索菜单、功能、模型、知识库等" className="global-search" />
            <Badge count={12}><BellOutlined className="top-icon" /></Badge>
            <Avatar style={{ background: "#176BFF" }}>张</Avatar>
            <Text>张倩</Text>
          </Space>
        </Header>
        <Content className="content">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard/overview" replace />} />
            <Route path="/dashboard/overview" element={<Overview store={store} />} />
            <Route path="/dashboard/projects" element={<ProjectList store={store} setStore={setStore} />} />
            <Route path="/dashboard/projects/create" element={<CreateProject store={store} setStore={setStore} />} />
            <Route path="/dashboard/projects/:projectId" element={<ProjectDetail store={store} setStore={setStore} />} />
            <Route path="/models/base" element={<ModelsPage />} />
            <Route path="/models/inference" element={<InferencePage />} />
            <Route path="/models/:modelId" element={<ModelDetail />} />
            <Route path="/knowledge/assets" element={<DataAssetsPage store={store} setStore={setStore} />} />
            <Route path="/knowledge/upload" element={<UploadPage store={store} setStore={setStore} />} />
            <Route path="/knowledge/processing" element={<ProcessingPage />} />
            <Route path="/knowledge/processing/:assetId" element={<ProcessingPage />} />
            <Route path="/knowledge/versions" element={<KnowledgePage store={store} setStore={setStore} />} />
            <Route path="/training/datasets" element={<DatasetsPage />} />
            <Route path="/training/jobs/create" element={<CreateTrainingJob store={store} setStore={setStore} />} />
            <Route path="/training/jobs" element={<TrainingJobsPage store={store} setStore={setStore} />} />
            <Route path="/training/jobs/:jobId" element={<TrainingJobDetail store={store} />} />
            <Route path="/rag/configs" element={<RagConfigsPage store={store} setStore={setStore} />} />
            <Route path="/rag/configs/:configId/edit" element={<RagEditPage store={store} />} />
            <Route path="/rag/testbench" element={<RagTestBench />} />
            <Route path="/agents" element={<AgentsPage store={store} setStore={setStore} />} />
            <Route path="/agents/:agentId/config" element={<AgentConfigPage />} />
            <Route path="/agents/prompts" element={<PromptsPage />} />
            <Route path="/agents/testbench" element={<AgentTestBench store={store} />} />
            <Route path="/evaluation/tasks" element={<EvaluationTasksPage />} />
            <Route path="/evaluation/reports/:reportId" element={<EvaluationReportPage />} />
            <Route path="/monitoring/online" element={<MonitoringPage />} />
            <Route path="/release/packages" element={<ReleasePackagesPage store={store} setStore={setStore} />} />
            <Route path="/release/deployments" element={<DeploymentsPage />} />
            <Route path="/release/gateway" element={<GatewayPage />} />
            <Route path="/reviews/pending" element={<ReviewsPage store={store} setStore={setStore} />} />
            <Route path="/reviews/:reviewId" element={<ReviewDetail store={store} setStore={setStore} />} />
            <Route path="/feedback/list" element={<FeedbackPage store={store} setStore={setStore} />} />
            <Route path="/feedback/:feedbackId" element={<FeedbackDetail store={store} setStore={setStore} />} />
            <Route path="/feedback/tasks" element={<IterationTasksPage store={store} />} />
            <Route path="/logs/calls" element={<CallLogsPage store={store} />} />
            <Route path="/logs/training" element={<TrainingLogsPage store={store} />} />
            <Route path="/logs/audit" element={<AuditLogsPage store={store} />} />
            <Route path="/costs/overview" element={<CostsPage />} />
            <Route path="/costs/limits" element={<LimitsPage />} />
            <Route path="/settings/tenants" element={<TenantsPage />} />
            <Route path="/settings/rbac" element={<RbacPage />} />
            <Route path="/settings/risk-rules" element={<RiskRulesPage />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
}

function Overview({ store }: { store: Store }) {
  const projectStageData = stages.slice(1, 9).map((stage) => ({ name: stage, value: store.projects.filter((p) => p.stage === stage).length || Math.round(Math.random() * 5 + 1) }));
  return (
    <Row gutter={16}>
      <Col flex="auto">
        <PageHeader title="项目总览" desc="数据更新时间：2026-06-11 18:30:00" extra={<><Button icon={<ReloadOutlined />}>刷新</Button><Select value="近 7 天" options={[{ label: "近 7 天", value: "近 7 天" }, { label: "近 30 天", value: "近 30 天" }]} /></>} />
        <Row gutter={[12, 12]}>
          {[
            ["项目数量", 28, <AppstoreOutlined />, "▲ 2 (7.69%)"],
            ["进行中项目", 11, <PlayCircleOutlined />, "▲ 1 (10.00%)"],
            ["待审核项目", 3, <AuditOutlined />, "▼ 1 (25.00%)", "#FA8C16"],
            ["已上线 Agent", 17, <RobotOutlined />, "▲ 3 (21.43%)", "#722ED1"],
            ["训练任务数", 156, <ExperimentOutlined />, "▲ 18 (13.04%)"],
            ["知识库版本数", 89, <BookOutlined />, "▲ 6 (7.23%)", "#13C2C2"],
            ["今日调用量", "128,753", <ThunderboltOutlined />, "▲ 15.42%"],
            ["Token 消耗", "268.7M", <CodeOutlined />, "▲ 18.76%", "#722ED1"],
            ["高风险拦截次数", 236, <SafetyCertificateOutlined />, "▼ 12.03%", "#F5222D"],
            ["用户反馈数", 342, <MessageOutlined />, "▲ 8.37%"],
          ].map(([title, value, icon, trend, color]) => (
            <Col span={24 / 5} key={String(title)}><MetricCard title={String(title)} value={value as string | number} icon={icon} trend={String(trend)} color={color as string} /></Col>
          ))}
        </Row>
        <Card className="flow-card" title="项目全生命周期">
          <div className="lifecycle">
            {["创建项目", "数据接入", "知识加工", "数据集构建", "RAG 调优", "模型训练", "Agent 组装", "评测验收", "发布部署", "反馈迭代"].map((item, index) => (
              <div className="life-node" key={item}><span>{index + 1}</span><Text>{item}</Text></div>
            ))}
          </div>
        </Card>
        <Row gutter={[12, 12]}>
          <Col span={8}><Card title="项目阶段分布"><Chart option={{ tooltip: {}, legend: { right: 0, top: "center", orient: "vertical" }, series: [{ type: "pie", radius: ["45%", "72%"], center: ["34%", "50%"], data: projectStageData }] }} /></Card></Col>
          <Col span={8}><Card title="Agent 调用趋势"><Chart option={lineOption("调用量", monitorTrendData.map((d) => d.date), monitorTrendData.map((d) => d.requests), "#176BFF")} /></Card></Col>
          <Col span={8}><Card title="RAG 命中率趋势"><Chart option={lineOption("命中率", monitorTrendData.map((d) => d.date), monitorTrendData.map((d) => d.ragHit), "#7A5CFF", "%")} /></Card></Col>
          <Col span={8}><Card title="训练任务成功率"><Chart option={barOption(monitorTrendData.slice(0, 7).map((d) => d.date), [66, 68, 77, 76, 75, 80, 81])} /></Card></Col>
          <Col span={16}><Card title="成本消耗趋势（元）"><Chart option={stackAreaOption()} /></Card></Col>
        </Row>
      </Col>
    </Row>
  );
}

function lineOption(name: string, x: string[], y: number[], color: string, suffix = ""): echarts.EChartsOption {
  return { grid: { left: 40, right: 20, top: 30, bottom: 35 }, tooltip: { trigger: "axis" }, xAxis: { type: "category", data: x }, yAxis: { type: "value", axisLabel: { formatter: `{value}${suffix}` } }, series: [{ name, data: y, type: "line", smooth: true, symbol: "circle", areaStyle: { opacity: 0.08 }, lineStyle: { color }, itemStyle: { color } }] };
}

function barOption(x: string[], y: number[]): echarts.EChartsOption {
  return { grid: { left: 40, right: 20, top: 30, bottom: 35 }, tooltip: {}, xAxis: { type: "category", data: x }, yAxis: { type: "value", max: 100, axisLabel: { formatter: "{value}%" } }, series: [{ type: "bar", data: y, itemStyle: { color: "#176BFF", borderRadius: [4, 4, 0, 0] }, barWidth: 18 }] };
}

function stackAreaOption(): echarts.EChartsOption {
  const x = costTrendData.map((d) => d.date);
  return { grid: { left: 48, right: 24, top: 38, bottom: 36 }, tooltip: { trigger: "axis" }, legend: { top: 0 }, xAxis: { type: "category", boundaryGap: false, data: x }, yAxis: { type: "value" }, series: ["inference", "embedding", "reranker", "training", "storage"].map((key, i) => ({ name: ["总成本", "模型推理", "训练成本", "向量存储", "其他"][i], type: "line", stack: "cost", areaStyle: { opacity: 0.18 }, smooth: true, data: costTrendData.map((d: any) => d[key]) })) };
}

function ProjectList({ store, setStore }: { store: Store; setStore: React.Dispatch<React.SetStateAction<Store>> }) {
  const navigate = useNavigate();
  const columns: ColumnsType<TrainingProject> = [
    { title: "项目名称", dataIndex: "name", width: 260, fixed: "left", render: (v, r) => <Button type="link" onClick={() => navigate(`/dashboard/projects/${r.id}`)}>{v}</Button> },
    { title: "客户名称", dataIndex: "customerName" }, { title: "行业", dataIndex: "industry" }, { title: "领域", dataIndex: "domain" }, { title: "场景", dataIndex: "scenario" }, { title: "部署方式", dataIndex: "deploymentMode" },
    { title: "当前阶段", dataIndex: "stage", render: (v) => <StatusTag value={v} /> }, { title: "风险等级", dataIndex: "riskLevel", render: (v) => <StatusTag value={v} /> }, { title: "负责人", dataIndex: "owner" }, { title: "更新时间", dataIndex: "updatedAt" },
    { title: "操作", fixed: "right", render: (_, r) => <Space><Button size="small" onClick={() => navigate(`/dashboard/projects/${r.id}`)}>查看</Button><Button size="small">编辑</Button><Button size="small" onClick={() => archiveProject(r.id, setStore)}>归档</Button></Space> },
  ];
  return <TwoColumn title="项目列表" desc="项目是数据、知识库、训练任务、RAG、Agent、发布版本的唯一容器。" noteTitle="项目交付闭环" rules={["所有资源必须归属项目", "状态流转记录操作人和时间", "已归档项目停止线上服务"]} flow={stages.join(" -> ")}><FilterBar><Button type="primary" onClick={() => navigate("/dashboard/projects/create")}>创建训练项目</Button></FilterBar><Table rowKey="id" columns={columns} dataSource={store.projects} scroll={{ x: 1500 }} /></TwoColumn>;
}

function archiveProject(id: string, setStore: React.Dispatch<React.SetStateAction<Store>>) {
  setStore((s) => ({ ...s, projects: s.projects.map((p) => p.id === id ? { ...p, stage: "停用归档" } : p) }));
  message.success("项目已归档");
}

function TwoColumn({ title, desc, children }: { title: string; desc?: string; noteTitle?: string; rules?: string[]; flow?: string; children: React.ReactNode }) {
  return (
    <>
      <PageHeader title={title} desc={desc} />
      {children}
    </>
  );
}

function CreateProject({ store, setStore }: { store: Store; setStore: React.Dispatch<React.SetStateAction<Store>> }) {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const submit = (values: any) => {
    const id = `P${String(store.projects.length + 1).padStart(3, "0")}`;
    const project: TrainingProject = { id, tenantId: `T${id}`, stage: "草稿", updatedAt: "2026-06-11 19:30", members: values.members || [], targetMetrics: [values.targetMetrics], acceptanceCriteria: [values.acceptanceCriteria], ...values };
    setStore((s) => ({ ...s, projects: [project, ...s.projects] }));
    message.success("训练项目创建成功");
    navigate(`/dashboard/projects/${id}`);
  };
  return <TwoColumn title="创建训练项目" desc="创建成功后进入项目详情，并从草稿阶段开始交付闭环。" noteTitle="创建项目规则" rules={["项目名称、客户、行业、场景为必填", "完全离线部署项目默认高风险", "创建后所有资产归属该项目"]}><Card><Form form={form} layout="vertical" onFinish={submit} initialValues={{ deploymentMode: "私有云", riskLevel: "中", offlineDeployment: false, owner: "张倩" }}><Row gutter={16}>{["项目名称", "客户名称", "行业", "业务领域", "场景", "数据范围", "目标指标", "验收标准", "备注"].map((label) => <Col span={label === "备注" ? 24 : 8} key={label}><Form.Item label={label} name={{ 项目名称: "name", 客户名称: "customerName", 行业: "industry", 业务领域: "domain", 场景: "scenario", 数据范围: "dataScope", 目标指标: "targetMetrics", 验收标准: "acceptanceCriteria", 备注: "remark" }[label]} rules={label === "备注" ? [] : [{ required: true }]}><Input.TextArea rows={label === "备注" ? 3 : 1} /></Form.Item></Col>)}<Col span={8}><Form.Item label="部署方式" name="deploymentMode"><Select options={["本地单机", "私有服务器", "私有云", "混合云"].map((v) => ({ label: v, value: v }))} /></Form.Item></Col><Col span={8}><Form.Item label="风险等级" name="riskLevel"><Radio.Group optionType="button" options={["低", "中", "高"]} /></Form.Item></Col><Col span={8}><Form.Item label="负责人" name="owner"><Input /></Form.Item></Col><Col span={8}><Form.Item label="项目成员" name="members"><Select mode="tags" options={["李牧", "周扬", "许宁", "沈瑜"].map((v) => ({ label: v, value: v }))} /></Form.Item></Col><Col span={8}><Form.Item label="是否完全离线部署" name="offlineDeployment" valuePropName="checked"><Switch /></Form.Item></Col></Row><Button type="primary" htmlType="submit">创建并进入项目详情</Button></Form></Card></TwoColumn>;
}

function ProjectDetail({ store, setStore }: { store: Store; setStore: React.Dispatch<React.SetStateAction<Store>> }) {
  const { projectId } = useParams();
  const project = store.projects.find((p) => p.id === projectId) || store.projects[0];
  const current = stages.indexOf(project.stage);
  const advance = () => {
    const next = stages[Math.min(current + 1, stages.length - 1)] as ProjectStage;
    setStore((s) => ({ ...s, projects: s.projects.map((p) => p.id === project.id ? { ...p, stage: next, updatedAt: "刚刚" } : p) }));
    message.success(`项目已推进至：${next}`);
  };
  const tabItems = [
    { key: "overview", label: "项目概览", children: <Descriptions bordered column={2} items={[{ label: "客户", children: project.customerName }, { label: "行业", children: project.industry }, { label: "领域", children: project.domain }, { label: "场景", children: project.scenario }, { label: "部署方式", children: project.deploymentMode }, { label: "风险等级", children: <StatusTag value={project.riskLevel} /> }, { label: "目标指标", children: project.targetMetrics.join(" / ") }, { label: "验收标准", children: project.acceptanceCriteria.join(" / ") }]} /> },
    { key: "assets", label: "数据资产", children: <MiniTable data={store.dataAssets.filter((d) => d.projectId === project.id)} /> },
    { key: "kb", label: "知识库", children: <MiniTable data={store.knowledge.filter((d) => d.projectId === project.id)} /> },
    { key: "datasets", label: "数据集", children: <MiniTable data={seedTrainingDatasets.filter((d) => d.projectId === project.id)} /> },
    { key: "jobs", label: "训练任务", children: <MiniTable data={store.trainingJobs.filter((d) => d.projectId === project.id)} /> },
    { key: "rag", label: "RAG 配置", children: <MiniTable data={store.ragConfigs.filter((d) => d.projectId === project.id)} /> },
    { key: "agent", label: "Agent", children: <MiniTable data={store.agents.filter((d) => d.projectId === project.id)} /> },
    { key: "reports", label: "评测报告", children: <MiniTable data={evaluationReports.filter((d) => d.projectId === project.id)} /> },
    { key: "release", label: "发布记录", children: <MiniTable data={store.releases.filter((d) => d.projectId === project.id)} /> },
    { key: "logs", label: "日志与反馈", children: <MiniTable data={store.callLogs.filter((d) => d.projectId === project.id).slice(0, 6)} /> },
  ];
  return <TwoColumn title={project.name} desc={`${project.customerName} / ${project.industry} / 当前阶段：${project.stage}`} noteTitle="项目生命周期" rules={["项目阶段推进必须满足前置资产审核", "下一步动作由当前阶段决定", "发布部署后反馈会回流至项目"]} flow={stages.join(" -> ")}><Card className="stage-card"><Steps size="small" current={current} items={stages.slice(0, 10).map((title) => ({ title }))} /><Flex justify="space-between" align="center" className="next-action"><Text>下一步动作：{stages[Math.min(current + 1, stages.length - 1)]}</Text><Button type="primary" onClick={advance}>推进下一阶段</Button></Flex></Card><Card><Tabs items={tabItems} /></Card></TwoColumn>;
}

function MiniTable({ data }: { data: any[] }) {
  const keys = Object.keys(data[0] || {}).slice(0, 6);
  return <Table size="small" rowKey={(r) => r.id} dataSource={data} pagination={false} columns={keys.map((key) => ({ title: key, dataIndex: key, render: (v: any) => Array.isArray(v) ? v.join("、") : typeof v === "object" ? JSON.stringify(v).slice(0, 80) : String(v) }))} />;
}

function ModelsPage() {
  const navigate = useNavigate();
  return <TwoColumn title="基座模型列表" noteTitle="模型中心规则" rules={["模型服务必须健康检查", "不同租户模型策略隔离", "主模型失败后按策略降级"]}><FilterBar /><Table rowKey="id" dataSource={models} columns={[{ title: "模型名称", dataIndex: "name", render: (v, r) => <Button type="link" onClick={() => navigate(`/models/${r.id}`)}>{v}</Button> }, { title: "模型类型", dataIndex: "type" }, { title: "模型来源", dataIndex: "source" }, { title: "参数量", dataIndex: "params" }, { title: "上下文长度", dataIndex: "contextLength" }, { title: "部署方式", dataIndex: "deploymentMode" }, { title: "状态", dataIndex: "status", render: (v) => <StatusTag value={v} /> }, { title: "健康检查", dataIndex: "healthStatus", render: (v) => <StatusTag value={v} /> }, { title: "操作", render: (_, r) => <Space><Button size="small" onClick={() => message.success(`${r.name} 健康检查完成`)}>健康检查</Button><Button size="small">部署</Button><Button size="small">停用</Button></Space> }] as ColumnsType<any>} /></TwoColumn>;
}

function InferencePage() {
  return <TwoColumn title="推理服务管理" noteTitle="推理降级策略" rules={["超时自动重试 1-2 次", "备用模型不可用时进入人工处理", "RAG-only 模式保留引用来源"]}><Row gutter={[12, 12]}>{["QPS", "P95 响应时间", "错误率", "今日 Token", "当前并发", "显存占用"].map((name, i) => <Col span={8} key={name}><MetricCard title={name} value={[252, "2.8s", "0.7%", "268.7M", 84, "76%"][i]} icon={<ApiOutlined />} trend="▲ 5.2%" /></Col>)}</Row><Card title="服务配置" className="mt12"><Descriptions bordered column={2} items={[{ label: "API 地址", children: "https://local-ai-gateway.company/api/v1" }, { label: "鉴权方式", children: "AK/SK + IP 白名单" }, { label: "超时时间", children: "30s" }, { label: "重试次数", children: "2 次" }, { label: "并发限制", children: "租户级 128" }, { label: "降级策略", children: "备用模型 / RAG-only / 人工处理" }]} /></Card></TwoColumn>;
}

function ModelDetail() {
  const { modelId } = useParams();
  const model = models.find((m) => m.id === modelId) || models[0];
  return <TwoColumn title={model.name} noteTitle="模型详情" rules={["资源消耗按模型版本统计", "异常模型禁止发布新 Agent", "版本记录支持回滚"]}><Card><Tabs items={["基础信息", "部署配置", "调用日志", "版本记录", "资源消耗", "健康检查"].map((label) => ({ key: label, label, children: <Descriptions bordered column={2} items={Object.entries(model).slice(0, 10).map(([k, v]) => ({ label: k, children: String(v) }))} /> }))} /></Card></TwoColumn>;
}

function DataAssetsPage({ store, setStore }: { store: Store; setStore: React.Dispatch<React.SetStateAction<Store>> }) {
  const [open, setOpen] = useState(false);
  return <TwoColumn title="数据资产列表" noteTitle="数据接入规则" rules={["入库前必须解析、清洗、脱敏、审核", "权限标签决定 RAG 召回范围", "删除数据资产需保留审计日志"]} flow="上传成功 -> 解析中 -> 清洗中 -> 脱敏中 -> 待审核 -> 可入库"><FilterBar><Button type="primary" onClick={() => setOpen(true)}>上传数据资产</Button></FilterBar><Table rowKey="id" dataSource={store.dataAssets} columns={[{ title: "数据资产名称", dataIndex: "name" }, { title: "所属项目", dataIndex: "projectId" }, { title: "数据类型", dataIndex: "type" }, { title: "来源", dataIndex: "source" }, { title: "文件大小", dataIndex: "fileSize" }, { title: "清洗状态", dataIndex: "cleanStatus" }, { title: "脱敏状态", dataIndex: "desensitizeStatus" }, { title: "权限标签", dataIndex: "permissionTags", render: (v) => v.map((t: string) => <Tag key={t}>{t}</Tag>) }, { title: "处理状态", dataIndex: "processStatus", render: (v) => <StatusTag value={v} /> }, { title: "操作", render: (_, r) => <Space><Button size="small" onClick={() => updateAsset(r.id, "解析中", setStore)}>解析</Button><Button size="small" onClick={() => updateAsset(r.id, "清洗中", setStore)}>清洗</Button><Button size="small" onClick={() => updateAsset(r.id, "脱敏中", setStore)}>脱敏</Button></Space> }]} scroll={{ x: 1400 }} /><UploadModal open={open} onCancel={() => setOpen(false)} store={store} setStore={setStore} /></TwoColumn>;
}

function updateAsset(id: string, processStatus: DataAsset["processStatus"], setStore: React.Dispatch<React.SetStateAction<Store>>) {
  setStore((s) => ({ ...s, dataAssets: s.dataAssets.map((a) => a.id === id ? { ...a, processStatus } : a) }));
  message.success(`已进入${processStatus}`);
}

function UploadModal({ open, onCancel, store, setStore }: { open: boolean; onCancel: () => void; store: Store; setStore: React.Dispatch<React.SetStateAction<Store>> }) {
  const [form] = Form.useForm();
  return <Modal open={open} title="上传数据资产" onCancel={onCancel} onOk={() => form.submit()} okText="上传并进入解析"><Form form={form} layout="vertical" onFinish={(v) => { const asset: DataAsset = { id: `D${Date.now()}`, name: v.name, projectId: v.projectId, type: v.type, source: v.source || "本地上传", fileSize: "24.8 MB", processStatus: "解析中", cleanStatus: "待清洗", desensitizeStatus: "待脱敏", permissionTags: v.permissionTags || ["业务专家"], uploader: "张倩", updatedAt: "刚刚" }; setStore((s) => ({ ...s, dataAssets: [asset, ...s.dataAssets] })); message.success("上传成功，已进入解析中"); onCancel(); }}><Form.Item label="所属项目" name="projectId" initialValue={store.projects[0].id}><Select options={store.projects.map((p) => ({ label: p.name, value: p.id }))} /></Form.Item><Form.Item label="资产名称" name="name" rules={[{ required: true }]}><Input /></Form.Item><Form.Item label="数据类型" name="type" initialValue="PDF"><Select options={["PDF", "Word", "Excel", "FAQ", "对话", "图片", "音视频", "数据库表"].map((v) => ({ label: v, value: v }))} /></Form.Item><Upload.Dragger><p><CloudUploadOutlined /> 点击或拖拽文件上传</p></Upload.Dragger><Form.Item label="权限标签" name="permissionTags"><Select mode="tags" /></Form.Item></Form></Modal>;
}

function UploadPage(props: { store: Store; setStore: React.Dispatch<React.SetStateAction<Store>> }) {
  const [open, setOpen] = useState(false);
  return (
    <TwoColumn title="数据上传/接入" noteTitle="上传入口" rules={["支持本地文件、FAQ、历史对话、数据库、API 接入", "上传后进入处理流程", "入库前必须审核"]} flow="上传成功 -> 解析中 -> 清洗中 -> 脱敏中 -> 待审核 -> 可入库">
      <Row gutter={12}>
        <Col span={8}>
          <Card title="接入方式">
            <Tabs
              tabPosition="left"
              items={["本地文件上传", "FAQ 批量导入", "历史对话导入", "数据库连接配置", "API 数据源接入"].map((label) => ({
                key: label,
                label,
                children: <Paragraph type="secondary">{label} 支持字段映射、权限标签、脱敏规则和项目归属配置。</Paragraph>,
              }))}
            />
          </Card>
        </Col>
        <Col span={16}>
          <Card title="上传配置" extra={<Button type="primary" onClick={() => setOpen(true)}>打开上传弹窗</Button>}>
            <Form layout="vertical" initialValues={{ projectId: props.store.projects[0].id, type: "PDF", source: "本地上传" }}>
              <Row gutter={16}>
                <Col span={8}><Form.Item label="所属项目" name="projectId"><Select options={props.store.projects.map((p) => ({ label: p.name, value: p.id }))} /></Form.Item></Col>
                <Col span={8}><Form.Item label="数据类型" name="type"><Select options={["PDF", "Word", "Excel", "FAQ", "对话", "图片", "音视频", "数据库表"].map((v) => ({ label: v, value: v }))} /></Form.Item></Col>
                <Col span={8}><Form.Item label="来源" name="source"><Select options={["本地上传", "批量导入", "数据库连接", "API 接入"].map((v) => ({ label: v, value: v }))} /></Form.Item></Col>
              </Row>
              <Upload.Dragger>
                <p><CloudUploadOutlined /> 拖拽文件到此处，或点击选择文件</p>
                <p className="ant-upload-hint">支持 PDF、Word、Excel、FAQ、对话、图片、音视频和数据库表元数据。</p>
              </Upload.Dragger>
            </Form>
          </Card>
          <Card title="处理流程" className="mt12">
            <Steps current={1} items={["上传成功", "解析中", "清洗中", "脱敏中", "待审核", "可入库"].map((title) => ({ title }))} />
          </Card>
        </Col>
      </Row>
      <UploadModal open={open} onCancel={() => setOpen(false)} {...props} />
    </TwoColumn>
  );
}

function ProcessingPage() {
  const [strategy, setStrategy] = useState("按语义切片");
  return <TwoColumn title="知识加工" noteTitle="知识库加工流程" rules={["清洗规则、脱敏规则、切片策略均需版本化", "向量化前必须完成权限标签", "切片可预览、编辑、删除"]} flow="解析 -> 清洗 -> 脱敏 -> 切片 -> 向量化 -> 审核"><Row gutter={12}><Col span={8}><Card title="加工配置"><Form layout="vertical"><Form.Item label="清洗规则"><Checkbox.Group options={["去页眉页脚", "去重复", "格式标准化"]} defaultValue={["去重复"]} /></Form.Item><Form.Item label="敏感信息脱敏"><Checkbox.Group options={["手机号", "身份证", "地址", "金额"]} defaultValue={["手机号", "身份证"]} /></Form.Item><Form.Item label="切片策略"><Radio.Group value={strategy} onChange={(e) => setStrategy(e.target.value)} options={["按标题切片", "按段落切片", "按语义切片", "按表格切片", "按问答切片", "按规则块切片"]} /></Form.Item><Form.Item label="向量化模型"><Select defaultValue="BGE-M3 Embedding" options={[{ label: "BGE-M3 Embedding", value: "BGE-M3 Embedding" }]} /></Form.Item><Button type="primary" onClick={() => message.success(`已保存${strategy}配置，Chunk 列表已刷新`)}>保存配置</Button></Form></Card></Col><Col span={16}><Card title="处理进度"><Steps current={3} items={["文档解析", "清洗", "脱敏", "切片", "向量化", "待审核"].map((title) => ({ title }))} /></Card><Card title="切片列表" className="mt12"><Table size="small" rowKey="id" dataSource={chunks} columns={[{ title: "Chunk ID", dataIndex: "id" }, { title: "切片内容摘要", dataIndex: "summary" }, { title: "来源文档", dataIndex: "source" }, { title: "页码/段落", dataIndex: "position" }, { title: "业务标签", dataIndex: "businessTag" }, { title: "权限标签", dataIndex: "permissionTag" }, { title: "向量化状态", dataIndex: "vectorStatus", render: (v) => <StatusTag value={v} /> }, { title: "操作", render: () => <Space><Button size="small">预览</Button><Button size="small">编辑</Button><Button size="small">删除</Button></Space> }]} /></Card></Col></Row></TwoColumn>;
}

function KnowledgePage({ store, setStore }: { store: Store; setStore: React.Dispatch<React.SetStateAction<Store>> }) {
  const [diff, setDiff] = useState<KnowledgeBaseVersion | null>(null);
  const action = (id: string, status: KnowledgeBaseVersion["status"]) => { setStore((s) => ({ ...s, knowledge: s.knowledge.map((k) => k.id === id ? { ...k, status } : k), reviews: [{ id: `RV${Date.now()}`, objectName: `知识库 ${id}`, objectType: "知识库版本", version: "新版本", projectId: s.knowledge.find((k) => k.id === id)?.projectId || "P001", riskLevel: "中", submitter: "张倩", submittedAt: "刚刚", status: status === "待审核" ? "待审核" : "审核通过" }, ...s.reviews] })); message.success(`知识库已更新为${status}`); };
  return <TwoColumn title="知识库版本管理" noteTitle="知识库闭环" rules={["未审核知识库版本不得被线上 Agent 使用", "版本对比必须展示切片和权限变更", "已发布版本支持回滚"]}><FilterBar /><Table rowKey="id" dataSource={store.knowledge} columns={[{ title: "知识库名称", dataIndex: "name" }, { title: "所属项目", dataIndex: "projectId" }, { title: "当前版本", dataIndex: "version" }, { title: "文档数", dataIndex: "documentCount" }, { title: "切片数", dataIndex: "chunkCount" }, { title: "向量数", dataIndex: "vectorCount" }, { title: "Embedding 模型", dataIndex: "embeddingModel" }, { title: "状态", dataIndex: "status", render: (v) => <StatusTag value={v} /> }, { title: "操作", render: (_, r) => <Space><Button size="small" onClick={() => setDiff(r)}>对比</Button><Button size="small" onClick={() => action(r.id, "待审核")}>提交审核</Button><Button size="small" onClick={() => action(r.id, "已发布")}>发布</Button><Button size="small" onClick={() => action(r.id, "已回滚")}>回滚</Button></Space> }]} scroll={{ x: 1200 }} /><Modal open={!!diff} title="版本对比" onCancel={() => setDiff(null)} footer={null}>{diff && <Descriptions bordered column={1} items={[{ label: "新增切片", children: diff.diffSummary.addedChunks }, { label: "删除切片", children: diff.diffSummary.removedChunks }, { label: "修改切片", children: diff.diffSummary.modifiedChunks }, { label: "权限变更", children: diff.diffSummary.permissionChanges }, { label: "风险提示", children: diff.diffSummary.riskTips.join("；") }]} />}</Modal></TwoColumn>;
}

function DatasetsPage() {
  return <TwoColumn title="训练数据集管理" noteTitle="数据集规则" rules={["训练前必须质量检查", "反馈进入训练集前必须脱敏和审核", "已发布数据集版本不可直接修改"]}><FilterBar /><Table rowKey="id" dataSource={seedTrainingDatasets} columns={[{ title: "数据集名称", dataIndex: "name" }, { title: "所属项目", dataIndex: "projectId" }, { title: "类型", dataIndex: "type" }, { title: "样本数", dataIndex: "sampleCount" }, { title: "质量评分", dataIndex: "qualityScore", render: (v) => <Progress percent={v} size="small" /> }, { title: "重复率", dataIndex: "duplicateRate", render: (v) => `${v}%` }, { title: "敏感命中", dataIndex: "sensitiveHitCount" }, { title: "标签一致性", dataIndex: "labelConsistency", render: (v) => `${v}%` }, { title: "状态", dataIndex: "status", render: (v) => <StatusTag value={v} /> }, { title: "操作", render: () => <Space><Button size="small">查看</Button><Button size="small">质量检查</Button><Button size="small">提交审核</Button><Button size="small">发布</Button></Space> }]} /></TwoColumn>;
}

function CreateTrainingJob({ store, setStore }: { store: Store; setStore: React.Dispatch<React.SetStateAction<Store>> }) {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [checked, setChecked] = useState(false);
  return <TwoColumn title="创建训练任务" noteTitle="训练闭环" rules={["提交前必须进行数据质量检查", "未通过评测的模型适配器不得发布", "训练任务必须记录参数与环境"]} flow="数据集构建 -> 质量检查 -> 配置训练参数 -> 提交训练 -> 训练监控 -> 自动评测"><Card><Form form={form} layout="vertical" onFinish={(v) => { if (!checked) return message.warning("请先完成数据质量检查"); const id = `TJ${Date.now()}`; const job: TrainingJob = { id, name: v.name, projectId: v.projectId, baseModelId: v.baseModelId, datasetVersion: v.datasetVersion, method: v.method, status: "排队中", loss: 1.2, evalLoss: 1.34, gpuUsage: 0, duration: "0m", creator: "张倩", artifact: {} }; setStore((s) => ({ ...s, trainingJobs: [job, ...s.trainingJobs] })); message.success("训练任务已提交"); setTimeout(() => setStore((s) => ({ ...s, trainingJobs: s.trainingJobs.map((j) => j.id === id ? { ...j, status: "训练中", gpuUsage: 62 } : j) })), 900); setTimeout(() => setStore((s) => ({ ...s, trainingJobs: s.trainingJobs.map((j) => j.id === id ? { ...j, status: "评测中", loss: 0.82, evalLoss: 0.94 } : j) })), 2200); setTimeout(() => setStore((s) => ({ ...s, trainingJobs: s.trainingJobs.map((j) => j.id === id ? { ...j, status: "训练成功", duration: "2h 12m", artifact: { adapterVersion: "adapter-v2.0", checkpointPath: "/models/checkpoints/new", reportId: "ER001" } } : j) })), 3600); navigate(`/training/jobs/${id}`); }} initialValues={{ projectId: store.projects[0].id, baseModelId: models[0].id, method: "LoRA", batchSize: 8, learningRate: 0.0002, epoch: 3, autoEval: true }}><Row gutter={16}><Col span={8}><Form.Item label="任务名称" name="name" rules={[{ required: true }]}><Input /></Form.Item></Col><Col span={8}><Form.Item label="所属项目" name="projectId"><Select options={store.projects.map((p) => ({ label: p.name, value: p.id }))} /></Form.Item></Col><Col span={8}><Form.Item label="基座模型" name="baseModelId"><Select options={models.filter((m) => m.type === "文本生成").map((m) => ({ label: m.name, value: m.id }))} /></Form.Item></Col><Col span={8}><Form.Item label="数据集版本" name="datasetVersion"><Select options={seedTrainingDatasets.map((d) => ({ label: `${d.name} / v1.0`, value: `${d.id}-v1.0` }))} /></Form.Item></Col><Col span={8}><Form.Item label="训练方法" name="method"><Radio.Group optionType="button" options={["LoRA", "QLoRA", "SFT"]} /></Form.Item></Col><Col span={8}><Form.Item label="GPU 资源" name="gpu"><Select defaultValue="A800 x 2" options={["A800 x 2", "H800 x 4", "L40S x 1"].map((v) => ({ label: v, value: v }))} /></Form.Item></Col>{["Batch Size", "Learning Rate", "Epoch", "最大训练时长", "停止条件", "随机种子", "输出路径"].map((label) => <Col span={8} key={label}><Form.Item label={label} name={label}><Input /></Form.Item></Col>)}<Col span={8}><Form.Item label="自动评测" name="autoEval" valuePropName="checked"><Switch /></Form.Item></Col></Row><Space><Button onClick={() => { setChecked(true); message.success("数据质量检查通过：质量评分 91，敏感命中 0"); }}>数据质量检查</Button><Button type="primary" htmlType="submit">提交训练</Button></Space></Form></Card></TwoColumn>;
}

function TrainingJobsPage({ store, setStore }: { store: Store; setStore: React.Dispatch<React.SetStateAction<Store>> }) {
  const navigate = useNavigate();
  return <TwoColumn title="训练任务列表" noteTitle="训练任务状态" rules={["训练中可暂停或取消", "成功后进入发布审核", "失败任务保留失败原因和日志"]} flow="待配置 -> 排队中 -> 训练中 -> 评测中 -> 训练成功 -> 训练失败"><FilterBar /><Table rowKey="id" dataSource={store.trainingJobs} columns={[{ title: "任务名称", dataIndex: "name", render: (v, r) => <Button type="link" onClick={() => navigate(`/training/jobs/${r.id}`)}>{v}</Button> }, { title: "所属项目", dataIndex: "projectId" }, { title: "基座模型", dataIndex: "baseModelId" }, { title: "数据集版本", dataIndex: "datasetVersion" }, { title: "训练方法", dataIndex: "method" }, { title: "当前状态", dataIndex: "status", render: (v) => <StatusTag value={v} /> }, { title: "Loss", dataIndex: "loss" }, { title: "Eval Loss", dataIndex: "evalLoss" }, { title: "GPU 占用", dataIndex: "gpuUsage", render: (v) => <Progress percent={v} size="small" /> }, { title: "训练耗时", dataIndex: "duration" }, { title: "创建人", dataIndex: "creator" }, { title: "操作", render: (_, r) => <Space><Button size="small" onClick={() => navigate(`/training/jobs/${r.id}`)}>查看</Button><Button size="small" onClick={() => setStore((s) => ({ ...s, trainingJobs: s.trainingJobs.map((j) => j.id === r.id ? { ...j, status: "已取消" } : j) }))}>取消</Button><Button size="small">复制配置</Button><Button size="small">查看日志</Button></Space> }]} scroll={{ x: 1500 }} /></TwoColumn>;
}

function TrainingJobDetail({ store }: { store: Store }) {
  const { jobId } = useParams();
  const job = store.trainingJobs.find((j) => j.id === jobId) || store.trainingJobs[0];
  const progress = job.status === "训练成功" ? 100 : job.status === "评测中" ? 82 : job.status === "训练中" ? 48 : 15;
  return <TwoColumn title={job.name} noteTitle="训练任务详情" rules={["训练过程指标可追踪", "产物发布前必须审核", "失败原因进入日志审计"]}><Row gutter={12}><Col span={16}><Card title="训练进度"><Progress percent={progress} status={job.status === "训练失败" ? "exception" : "active"} /><Chart option={lineOption("Loss", ["0", "1", "2", "3", "4", "5"], [1.2, 1.04, 0.92, 0.86, job.loss, job.evalLoss], "#176BFF")} /></Card><Card title="训练日志" className="mt12"><Timeline items={["加载数据集版本", "启动 LoRA 训练", "保存 checkpoint", "执行自动评测", "等待人工审核"].map((children) => ({ children }))} /></Card></Col><Col span={8}><Card title="资源与产物"><Descriptions column={1} items={[{ label: "GPU / 显存", children: <Progress percent={job.gpuUsage} /> }, { label: "训练方法", children: job.method }, { label: "Adapter", children: job.artifact.adapterVersion || "-" }, { label: "Checkpoint", children: job.artifact.checkpointPath || "-" }, { label: "失败原因", children: job.status === "训练失败" ? "显存溢出，建议降低 batch size" : "-" }]} /><Button type="primary" block className="mt12">提交发布审核</Button></Card></Col></Row></TwoColumn>;
}

function RagConfigsPage({ store, setStore }: { store: Store; setStore: React.Dispatch<React.SetStateAction<Store>> }) {
  const navigate = useNavigate();
  const update = (id: string, status: RagConfig["status"]) => { setStore((s) => ({ ...s, ragConfigs: s.ragConfigs.map((r) => r.id === id ? { ...r, status } : r) })); message.success(`RAG 配置已${status}`); };
  return <TwoColumn title="RAG 配置列表" noteTitle="RAG 闭环" rules={["RAG 配置修改后必须回归评测", "回答必须展示引用来源", "无权限知识不得进入上下文"]}><FilterBar /><Table rowKey="id" dataSource={store.ragConfigs} columns={[{ title: "配置名称", dataIndex: "name" }, { title: "所属项目", dataIndex: "projectId" }, { title: "绑定知识库版本", dataIndex: "knowledgeBaseVersion" }, { title: "Embedding 模型", dataIndex: "embeddingModel" }, { title: "Reranker 模型", dataIndex: "rerankerModel" }, { title: "TopK", dataIndex: "topK" }, { title: "相似度阈值", dataIndex: "similarityThreshold" }, { title: "状态", dataIndex: "status", render: (v) => <StatusTag value={v} /> }, { title: "操作", render: (_, r) => <Space><Button size="small" onClick={() => navigate(`/rag/configs/${r.id}/edit`)}>编辑</Button><Button size="small" onClick={() => navigate("/rag/testbench")}>测试</Button><Button size="small">回归评测</Button><Button size="small" onClick={() => update(r.id, "待审核")}>提交审核</Button><Button size="small" onClick={() => update(r.id, "已发布")}>发布</Button><Button size="small" onClick={() => update(r.id, "已回滚")}>回滚</Button></Space> }]} scroll={{ x: 1400 }} /></TwoColumn>;
}

function RagEditPage({ store }: { store: Store }) {
  const { configId } = useParams();
  const cfg = store.ragConfigs.find((r) => r.id === configId) || store.ragConfigs[0];
  return <TwoColumn title="RAG 配置编辑" noteTitle="配置分区" rules={["权限过滤优先于召回", "冲突处理默认高优先级规则优先", "低置信度默认拒答或转人工"]}><Card><Tabs tabPosition="left" items={["知识库绑定", "权限过滤", "召回策略", "TopK 初筛", "Reranker 重排", "上下文拼接", "引用溯源", "无答案处理", "冲突处理", "回归评测配置"].map((label) => ({ key: label, label, children: <Form layout="vertical" initialValues={cfg}><Form.Item label="配置名称" name="name"><Input /></Form.Item><Form.Item label={label + "参数"}><Input.TextArea rows={5} defaultValue={`${label}：当前使用 ${cfg.retrievalStrategy}，TopK=${cfg.topK}，阈值=${cfg.similarityThreshold}`} /></Form.Item><Button type="primary" onClick={() => message.success(`${label}已保存，建议执行回归评测`)}>保存配置</Button></Form> }))} /></Card></TwoColumn>;
}

function RagTestBench() {
  const [tested, setTested] = useState(false);
  return <TwoColumn title="RAG 测试台" noteTitle="RAG 主流程" rules={["测试必须选择用户角色和权限标签", "召回结果展示相似度与重排分数", "低置信度不得编造答案"]} flow="用户提问 -> 查询改写 -> 权限过滤 -> 混合召回 -> TopK -> Reranker -> 上下文拼接 -> 模型生成 -> 引用校验 -> 风控校验 -> 返回答案"><Row gutter={12}><Col span={6}><Card title="测试输入"><Input.TextArea rows={6} placeholder="请输入测试问题" defaultValue="退货超过 7 天还能申请运费赔付吗？" /><Select className="full mt12" defaultValue="业务员工" options={["业务员工", "业务专家", "企业管理员"].map((v) => ({ label: v, value: v }))} /><Select className="full mt12" mode="tags" defaultValue={["售后", "只读"]} /><Button type="primary" block className="mt12" onClick={() => setTested(true)}>开始测试</Button></Card></Col><Col span={10}><Card title="召回结果列表"><Table size="small" rowKey="id" dataSource={tested ? chunks : []} pagination={false} columns={[{ title: "来源文档", dataIndex: "source" }, { title: "段落", dataIndex: "position" }, { title: "版本", render: () => "v1.2.0" }, { title: "相似度", render: (_, __, i) => (0.86 - i * 0.03).toFixed(2) }, { title: "重排分", render: (_, __, i) => (0.92 - i * 0.04).toFixed(2) }, { title: "进入上下文", render: (_, __, i) => <Checkbox checked={i < 4} /> }]} /></Card></Col><Col span={8}><Card title="答案预览">{tested ? <><Alert type="success" showIcon message="基于 4 条授权知识生成，未命中高风险拦截" /><Paragraph className="mt12">根据《售后退款规则》v1.2.0，超过 7 天的退货申请通常不适用无理由退货运费赔付，但若商品存在质量问题，需要进入人工审核流程。</Paragraph><Tag color="blue">置信度：高</Tag><Tag>引用：售后退款规则.pdf 第 3 页</Tag></> : <Text type="secondary">输入问题后展示生成答案、引用来源和风险提示。</Text>}</Card></Col></Row></TwoColumn>;
}

function AgentsPage({ store, setStore }: { store: Store; setStore: React.Dispatch<React.SetStateAction<Store>> }) {
  const navigate = useNavigate();
  const update = (id: string, status: AgentApp["status"]) => { setStore((s) => ({ ...s, agents: s.agents.map((a) => a.id === id ? { ...a, status } : a) })); message.success(`Agent 已${status}`); };
  return <TwoColumn title="Agent 列表" noteTitle="Agent 发布闭环" rules={["Agent 必须绑定模型、知识库、Prompt、RAG", "高风险工具调用必须二次确认", "发布后进入监控与反馈闭环"]}><FilterBar /><Table rowKey="id" dataSource={store.agents} columns={[{ title: "Agent 名称", dataIndex: "name" }, { title: "所属项目", dataIndex: "projectId" }, { title: "适用场景", dataIndex: "scenario" }, { title: "目标用户", dataIndex: "targetUsers", render: (v) => v.join("、") }, { title: "绑定模型", dataIndex: "modelVersion" }, { title: "知识库版本", dataIndex: "knowledgeBaseVersion" }, { title: "RAG 配置", dataIndex: "ragConfigVersion" }, { title: "Prompt", dataIndex: "promptVersion" }, { title: "状态", dataIndex: "status", render: (v) => <StatusTag value={v} /> }, { title: "今日调用量", dataIndex: "todayCalls" }, { title: "满意率", dataIndex: "satisfactionRate", render: (v) => `${v}%` }, { title: "操作", render: (_, r) => <Space><Button size="small" onClick={() => navigate(`/agents/${r.id}/config`)}>配置</Button><Button size="small" onClick={() => navigate("/agents/testbench")}>测试</Button><Button size="small" onClick={() => update(r.id, "待审核")}>审核</Button><Button size="small" onClick={() => update(r.id, "已发布")}>发布</Button><Button size="small" onClick={() => update(r.id, "已下线")}>下线</Button></Space> }]} scroll={{ x: 1800 }} /></TwoColumn>;
}

function AgentConfigPage() {
  return <TwoColumn title="Agent 配置" noteTitle="Agent 配置规则" rules={["模型、知识库、RAG、Prompt 四类版本必须绑定", "工具能力需授权", "高风险工具调用必须启用二次确认"]}><Card><Tabs tabPosition="left" items={["基础信息", "模型绑定", "知识库绑定", "RAG 配置绑定", "Prompt 模板", "工具能力", "流程编排", "安全边界", "发布审核"].map((label) => ({ key: label, label, children: <Form layout="vertical"><Form.Item label={label}><Input.TextArea rows={6} defaultValue={`${label}配置内容：绑定版本、权限、启用状态和审核策略。`} /></Form.Item><Switch checkedChildren="启用二次确认" unCheckedChildren="关闭" defaultChecked={label === "工具能力" || label === "安全边界"} /><Button type="primary" className="mt12" onClick={() => message.success(`${label}已保存`)}>保存</Button></Form> }))} /></Card></TwoColumn>;
}

function PromptsPage() {
  const [active, setActive] = useState(promptTemplates[0]);
  return <TwoColumn title="Prompt 模板管理" noteTitle="Prompt 规则" rules={["Prompt 修改不立即影响线上版本", "发布需评测和审核", "支持版本对比和回滚"]}><Row gutter={12}><Col span={12}><Table rowKey="id" dataSource={promptTemplates} columns={[{ title: "模板名称", dataIndex: "name" }, { title: "适用功能", dataIndex: "functionType" }, { title: "版本", dataIndex: "version" }, { title: "状态", dataIndex: "status", render: (v) => <StatusTag value={v} /> }, { title: "操作", render: (_, r) => <Button size="small" onClick={() => setActive(r)}>编辑</Button> }]} /></Col><Col span={12}><Card title="Prompt 编辑器"><Tabs items={Object.entries(active.sections).map(([key, value]) => ({ key, label: key, children: <Input.TextArea rows={9} value={Array.isArray(value) ? value.join(", ") : value} /> }))} /><Space><Button>保存草稿</Button><Button>测试</Button><Button type="primary">发布</Button><Button>回滚</Button></Space></Card></Col></Row></TwoColumn>;
}

function AgentTestBench({ store }: { store: Store }) {
  const [sent, setSent] = useState(false);
  const agent = store.agents[0];
  return <TwoColumn title="Agent 测试台" noteTitle="可追溯回答" rules={["答案必须展示引用来源或无可靠来源提示", "线上回答可追溯到模型/Prompt/知识库/RAG", "满意/不满意反馈进入迭代闭环"]}><Row gutter={12}><Col span={6}><Card title="Agent 配置摘要"><Descriptions column={1} size="small" items={[{ label: "Agent", children: agent.name }, { label: "模型", children: agent.modelVersion }, { label: "知识库", children: agent.knowledgeBaseVersion }, { label: "RAG", children: agent.ragConfigVersion }, { label: "Prompt", children: agent.promptVersion }, { label: "高风险确认", children: <Switch checked={agent.highRiskConfirmEnabled} /> }]} /><Checkbox.Group options={agent.tools} defaultValue={agent.tools} /></Card></Col><Col span={10}><Card title="对话测试窗口"><div className="chat"><div className="bubble user">退货超过 7 天还能申请运费赔付吗？</div>{sent && <div className="bubble ai">根据售后规则，超过 7 天通常不适用无理由运费赔付；若存在质量问题，请创建人工审核工单。<div><Tag color="blue">置信度 高</Tag><Tag>引用 售后退款规则.pdf</Tag><Tag color="orange">涉及赔付，需人工确认</Tag></div><Space className="mt8"><Button size="small">转人工</Button><Button size="small">创建工单</Button><Button size="small">复制答案</Button><Button size="small">满意</Button><Button size="small">不满意</Button></Space></div>}</div><Input.Search enterButton="发送测试" placeholder="输入测试问题" onSearch={() => setSent(true)} /></Card></Col><Col span={8}><Card title="调试信息"><Tabs items={[{ key: "召回知识", label: "召回知识", children: <Table size="small" rowKey="id" dataSource={sent ? chunks.slice(0, 4) : []} pagination={false} columns={[{ title: "来源", dataIndex: "source" }, { title: "相似度", render: (_, __, i) => (0.91 - i * 0.04).toFixed(2) }, { title: "权限", dataIndex: "permissionTag" }]} /> }, { key: "Prompt", label: "Prompt", children: <Paragraph>prompt-v2.1 / 系统提示词 + 业务规则 + 召回知识 + 输出格式</Paragraph> }, { key: "风控", label: "风控", children: <Alert type="warning" showIcon message="命中赔付建议，推荐人工确认" /> }, { key: "Token", label: "Token", children: <Descriptions column={1} items={[{ label: "输入", children: 1260 }, { label: "输出", children: 420 }, { label: "耗时", children: "2.1s" }]} /> }]} /></Card></Col></Row></TwoColumn>;
}

function EvaluationTasksPage() {
  const navigate = useNavigate();
  return <TwoColumn title="离线评测任务" noteTitle="评测规则" rules={["任一版本变更后必须回归评测", "不通过报告禁止发布", "报告可导出供客户验收"]}><FilterBar /><Table rowKey="id" dataSource={evaluationReports} columns={[{ title: "评测任务名称", dataIndex: "name" }, { title: "评测对象", dataIndex: "targetType" }, { title: "所属项目", dataIndex: "projectId" }, { title: "测试集", dataIndex: "testSet" }, { title: "状态", dataIndex: "status", render: (v) => <StatusTag value={v} /> }, { title: "通过率", dataIndex: "passRate", render: (v) => <Progress percent={v} size="small" /> }, { title: "操作", render: (_, r) => <Space><Button size="small" onClick={() => navigate(`/evaluation/reports/${r.id}`)}>查看</Button><Button size="small">重新评测</Button><Button size="small">导出报告</Button></Space> }]} /></TwoColumn>;
}

function EvaluationReportPage() {
  const { reportId } = useParams();
  const report = evaluationReports.find((r) => r.id === reportId) || evaluationReports[0];
  return <TwoColumn title={report.name} noteTitle="评测报告" rules={["通过才允许发布", "问题清单必须可定位", "优化建议进入迭代任务"]}><Row gutter={12}><Col span={16}><Card title="评测指标"><Row gutter={[12, 12]}>{Object.entries(report.metrics).map(([k, v]) => <Col span={8} key={k}><Statistic title={k} value={v} suffix={typeof v === "number" && v > 10 ? "" : ""} /></Col>)}</Row></Card></Col><Col span={8}><Card title="报告结论"><StatusTag value={report.status} /><Paragraph className="mt12">{report.conclusion}</Paragraph><Text strong>问题清单</Text><ul>{report.issues.map((i) => <li key={i}>{i}</li>)}</ul><Text strong>优化建议</Text><ul>{report.suggestions.map((i) => <li key={i}>{i}</li>)}</ul><Button type="primary" disabled={!report.allowRelease}>允许发布</Button></Card></Col></Row></TwoColumn>;
}

function MonitoringPage() {
  return <TwoColumn title="在线监控" noteTitle="监控口径" rules={["按项目、Agent、模型、租户、风险等级筛选", "低置信度和高风险拦截进入告警", "成本趋势用于套餐和限额调整"]}><FilterBar><Select placeholder="时间范围" style={{ width: 140 }} options={[{ label: "近 24 小时", value: "24h" }, { label: "近 7 天", value: "7d" }]} /></FilterBar><Row gutter={[12, 12]}>{["请求量趋势", "Token 消耗趋势", "P95 响应时间", "错误率", "低置信度率", "用户满意率", "RAG 命中率", "风控拦截次数"].map((name, i) => <Col span={12} key={name}><Card title={name}><Chart option={lineOption(name, monitorTrendData.map((d) => d.date), monitorTrendData.map((d: any) => [d.requests, d.tokens, d.p95, d.errorRate, 8 + i, 88 - i, d.ragHit, d.riskBlocks][i]), i % 2 ? "#7A5CFF" : "#176BFF")} height={220} /></Card></Col>)}</Row></TwoColumn>;
}

function ReleasePackagesPage({ store, setStore }: { store: Store; setStore: React.Dispatch<React.SetStateAction<Store>> }) {
  const update = (id: string, releaseStatus: ReleasePackage["releaseStatus"]) => { setStore((s) => ({ ...s, releases: s.releases.map((r) => r.id === id ? { ...r, releaseStatus } : r) })); message.success(`发布包已${releaseStatus}`); };
  return <TwoColumn title="发布包管理" noteTitle="发布规则" rules={["发布包必须绑定全部版本", "评测不通过禁止发布", "发布版本必须支持回滚"]}><FilterBar /><Table rowKey="id" dataSource={store.releases} columns={[{ title: "发布包名称", dataIndex: "name" }, { title: "所属项目", dataIndex: "projectId" }, { title: "模型版本", dataIndex: "modelVersion" }, { title: "Adapter", dataIndex: "adapterVersion" }, { title: "知识库", dataIndex: "knowledgeBaseVersion" }, { title: "RAG", dataIndex: "ragConfigVersion" }, { title: "Prompt", dataIndex: "promptVersion" }, { title: "评测结论", dataIndex: "evaluationConclusion", render: (v) => <StatusTag value={v} /> }, { title: "审核状态", dataIndex: "reviewStatus", render: (v) => <StatusTag value={v} /> }, { title: "发布状态", dataIndex: "releaseStatus", render: (v) => <StatusTag value={v} /> }, { title: "操作", render: (_, r) => <Space><Button size="small">提交审核</Button><Button size="small" disabled={r.evaluationConclusion !== "通过"} onClick={() => update(r.id, "已发布")}>发布</Button><Button size="small" onClick={() => update(r.id, "已回滚")}>回滚</Button><Button size="small">下载部署包</Button></Space> }]} scroll={{ x: 1700 }} /></TwoColumn>;
}

function DeploymentsPage() {
  const data = seedProjects.map((p, i) => ({ id: p.id, customerName: p.customerName, deploymentMode: p.deploymentMode, env: ["测试", "预生产", "生产"][i % 3], api: `https://api-${p.id}.local/v1`, version: `v1.${i + 1}`, status: ["运行中", "部署中", "异常", "已停用", "运行中"][i], calls: 2300 + i * 640, errorRate: `${(0.4 + i * 0.3).toFixed(1)}%` }));
  return <TwoColumn title="部署实例" noteTitle="部署运维" rules={["生产环境操作需审核", "异常实例可重启或回滚", "API 地址和审计开关必须可见"]}><Table rowKey="id" dataSource={data} columns={[{ title: "客户名称", dataIndex: "customerName" }, { title: "部署方式", dataIndex: "deploymentMode" }, { title: "环境", dataIndex: "env" }, { title: "API 地址", dataIndex: "api" }, { title: "当前版本", dataIndex: "version" }, { title: "状态", dataIndex: "status", render: (v) => <StatusTag value={v} /> }, { title: "调用量", dataIndex: "calls" }, { title: "错误率", dataIndex: "errorRate" }, { title: "操作", render: () => <Space><Button size="small">查看</Button><Button size="small">重启</Button><Button size="small">回滚</Button><Button size="small">停用</Button></Space> }]} /></TwoColumn>;
}

function GatewayPage() {
  return <TwoColumn title="API 网关配置" noteTitle="网关规则" rules={["鉴权、限流、熔断、审计必须按租户配置", "灰度比例调整需记录审计", "日志保留周期遵循客户策略"]}><Card><Form layout="vertical" initialValues={{ auth: "AK/SK", rate: 500, gray: 20, audit: true, logDays: 180 }}><Row gutter={16}>{["鉴权方式", "限流策略", "路由策略", "灰度比例", "熔断规则", "日志保留周期"].map((label) => <Col span={8} key={label}><Form.Item label={label}><Input /></Form.Item></Col>)}<Col span={8}><Form.Item label="审计开关"><Switch defaultChecked /></Form.Item></Col></Row><Button type="primary">保存网关配置</Button></Form></Card></TwoColumn>;
}

function ReviewsPage({ store, setStore }: { store: Store; setStore: React.Dispatch<React.SetStateAction<Store>> }) {
  const navigate = useNavigate();
  const update = (id: string, status: ReviewRecord["status"]) => { setStore((s) => ({ ...s, reviews: s.reviews.map((r) => r.id === id ? { ...r, status, result: status } : r) })); message.success(status); };
  return <TwoColumn title="待审核列表" noteTitle="审核中心" rules={["知识库、数据集、模型、Prompt、Agent、发布包均需审核", "审核意见必须记录", "高风险对象优先处理"]}><FilterBar /><Table rowKey="id" dataSource={store.reviews} columns={[{ title: "审核对象", dataIndex: "objectName" }, { title: "对象类型", dataIndex: "objectType" }, { title: "对象版本", dataIndex: "version" }, { title: "所属项目", dataIndex: "projectId" }, { title: "风险等级", dataIndex: "riskLevel", render: (v) => <StatusTag value={v} /> }, { title: "提交人", dataIndex: "submitter" }, { title: "提交时间", dataIndex: "submittedAt" }, { title: "审核状态", dataIndex: "status", render: (v) => <StatusTag value={v} /> }, { title: "操作", render: (_, r) => <Space><Button size="small" onClick={() => navigate(`/reviews/${r.id}`)}>查看</Button><Button size="small" onClick={() => update(r.id, "审核通过")}>通过</Button><Button size="small" onClick={() => update(r.id, "已驳回")}>驳回</Button></Space> }]} /></TwoColumn>;
}

function ReviewDetail({ store, setStore }: { store: Store; setStore: React.Dispatch<React.SetStateAction<Store>> }) {
  const { reviewId } = useParams();
  const review = store.reviews.find((r) => r.id === reviewId) || store.reviews[0];
  return <TwoColumn title="审核详情" noteTitle="审核记录" rules={["审核通过/驳回必须填写意见", "高风险变更展示风险提示", "关联评测结果决定是否允许发布"]}><Card><Descriptions bordered column={2} items={Object.entries(review).map(([k, v]) => ({ label: k, children: String(v) }))} /><Alert className="mt12" type="warning" showIcon message="风险提示：该对象包含高风险工具调用或权限变更，请确认评测结果。" /><Input.TextArea className="mt12" rows={4} placeholder="请输入审核意见" /><Space className="mt12"><Button type="primary" onClick={() => setStore((s) => ({ ...s, reviews: s.reviews.map((r) => r.id === review.id ? { ...r, status: "审核通过" } : r) }))}>审核通过</Button><Button danger onClick={() => setStore((s) => ({ ...s, reviews: s.reviews.map((r) => r.id === review.id ? { ...r, status: "已驳回" } : r) }))}>驳回</Button></Space></Card></TwoColumn>;
}

function FeedbackPage({ store, setStore }: { store: Store; setStore: React.Dispatch<React.SetStateAction<Store>> }) {
  const navigate = useNavigate();
  const generateTask = (r: UserFeedback) => { const task: IterationTask = { id: `IT${Date.now()}`, type: r.attribution === "Prompt 问题" ? "Prompt 调整任务" : r.attribution === "召回错误" ? "RAG 调参任务" : "知识更新任务", projectId: r.projectId, sourceFeedbackId: r.id, owner: "张倩", status: "待处理", dueAt: "2026-06-20" }; setStore((s) => ({ ...s, tasks: [task, ...s.tasks], feedback: s.feedback.map((f) => f.id === r.id ? { ...f, status: "处理中" } : f) })); message.success("已生成迭代任务"); };
  return <TwoColumn title="用户反馈列表" noteTitle="反馈闭环" rules={["反馈必须可追溯调用记录", "归因后生成迭代任务", "进入训练集前需脱敏和审核"]}><FilterBar /><Table rowKey="id" dataSource={store.feedback} columns={[{ title: "反馈时间", dataIndex: "time" }, { title: "用户", dataIndex: "user" }, { title: "租户", dataIndex: "tenant" }, { title: "项目", dataIndex: "projectId" }, { title: "Agent", dataIndex: "agentId" }, { title: "问题摘要", dataIndex: "questionSummary" }, { title: "用户反馈", dataIndex: "feedbackType", render: (v) => <StatusTag value={v} /> }, { title: "不满意原因", dataIndex: "dissatisfiedReason" }, { title: "是否采纳", dataIndex: "adopted", render: (v) => v ? "是" : "否" }, { title: "归因结果", dataIndex: "attribution" }, { title: "处理状态", dataIndex: "status", render: (v) => <StatusTag value={v} /> }, { title: "操作", render: (_, r) => <Space><Button size="small" onClick={() => navigate(`/feedback/${r.id}`)}>查看</Button><Button size="small">归因</Button><Button size="small" onClick={() => generateTask(r)}>生成迭代任务</Button></Space> }]} scroll={{ x: 1600 }} /></TwoColumn>;
}

function FeedbackDetail({ store, setStore }: { store: Store; setStore: React.Dispatch<React.SetStateAction<Store>> }) {
  const { feedbackId } = useParams();
  const fb = store.feedback.find((f) => f.id === feedbackId) || store.feedback[0];
  return <TwoColumn title="反馈详情" noteTitle="反馈归因" rules={["归因类型用于生成不同迭代任务", "召回片段和引用来源必须保留", "用户修改后内容可沉淀为样本"]}><Card><Descriptions bordered column={2} items={[{ label: "原始问题", children: fb.questionSummary }, { label: "AI 输出结果", children: "基于知识库返回售后规则说明" }, { label: "用户修改后内容", children: "补充质量问题时需要人工审核" }, { label: "Prompt 版本", children: "prompt-v2.1" }, { label: "模型版本", children: "Qwen2.5-72B" }, { label: "知识库版本", children: "v1.2.0" }, { label: "RAG 配置版本", children: "rag-v1.2" }, { label: "Token 消耗", children: 1680 }, { label: "生成耗时", children: "2.1s" }, { label: "风控结果", children: "通过" }]} /><Form layout="inline" className="mt12"><Form.Item label="归因类型"><Select defaultValue={fb.attribution} style={{ width: 180 }} options={["知识缺失", "召回错误", "Prompt 问题", "模型能力不足", "工具失败", "权限问题", "用户输入不清晰"].map((v) => ({ label: v, value: v }))} /></Form.Item><Button type="primary" onClick={() => setStore((s) => ({ ...s, feedback: s.feedback.map((f) => f.id === fb.id ? { ...f, status: "处理中" } : f) }))}>保存归因</Button></Form></Card></TwoColumn>;
}

function IterationTasksPage({ store }: { store: Store }) {
  return <TwoColumn title="迭代任务" noteTitle="持续迭代" rules={["任务来源必须关联反馈", "待评测任务不能直接发布", "完成后进入版本对比"]}><Table rowKey="id" dataSource={store.tasks} columns={[{ title: "任务类型", dataIndex: "type" }, { title: "项目", dataIndex: "projectId" }, { title: "来源反馈", dataIndex: "sourceFeedbackId" }, { title: "负责人", dataIndex: "owner" }, { title: "状态", dataIndex: "status", render: (v) => <StatusTag value={v} /> }, { title: "截止时间", dataIndex: "dueAt" }]} /></TwoColumn>;
}

function CallLogsPage({ store }: { store: Store }) {
  const [detail, setDetail] = useState<CallLog | null>(null);
  return <TwoColumn title="调用日志" noteTitle="日志追踪" rules={["线上回答必须追溯到模型、Prompt、知识库和召回片段", "风控结果必须留痕", "采纳情况用于效果评估"]}><FilterBar /><Table rowKey="id" dataSource={store.callLogs} columns={[{ title: "生成任务 ID", dataIndex: "taskId" }, { title: "用户", dataIndex: "user" }, { title: "租户", dataIndex: "tenant" }, { title: "项目", dataIndex: "projectId" }, { title: "Agent", dataIndex: "agentId" }, { title: "模型版本", dataIndex: "modelVersion" }, { title: "Prompt", dataIndex: "promptVersion" }, { title: "知识库", dataIndex: "knowledgeBaseVersion" }, { title: "Token", dataIndex: "tokenCost" }, { title: "耗时", dataIndex: "latencyMs", render: (v) => `${v}ms` }, { title: "风控", dataIndex: "riskResult", render: (v) => <StatusTag value={v} /> }, { title: "操作", render: (_, r) => <Button size="small" onClick={() => setDetail(r)}>查看详情</Button> }]} scroll={{ x: 1800 }} /><Drawer open={!!detail} onClose={() => setDetail(null)} title="调用详情" width={560}>{detail && <Descriptions bordered column={1} items={Object.entries(detail).map(([k, v]) => ({ label: k, children: Array.isArray(v) ? v.join("、") : String(v) }))} />}</Drawer></TwoColumn>;
}

function TrainingLogsPage({ store }: { store: Store }) {
  return <TwoColumn title="训练日志" noteTitle="训练审计" rules={["记录参数摘要和运行环境", "失败原因必须可定位", "GPU 时长进入成本中心"]}><Table rowKey="id" dataSource={store.trainingJobs} columns={[{ title: "训练任务 ID", dataIndex: "id" }, { title: "项目", dataIndex: "projectId" }, { title: "基座模型", dataIndex: "baseModelId" }, { title: "数据集版本", dataIndex: "datasetVersion" }, { title: "训练方法", dataIndex: "method" }, { title: "参数摘要", render: () => "batch=8, lr=2e-4, epoch=3" }, { title: "运行环境", render: () => "A800 x 2 / CUDA 12" }, { title: "状态", dataIndex: "status", render: (v) => <StatusTag value={v} /> }, { title: "耗时", dataIndex: "duration" }, { title: "GPU 时长", render: (_, r) => r.duration }, { title: "失败原因", render: (_, r) => r.status === "训练失败" ? "显存溢出" : "-" }]} /></TwoColumn>;
}

function AuditLogsPage({ store }: { store: Store }) {
  const data = store.reviews.map((r, i) => ({ ...r, actor: r.submitter, op: ["提交审核", "审核通过", "发布版本", "回滚版本"][i % 4], before: `v1.${i}`, after: r.version, ip: `10.0.8.${i + 12}` }));
  return <TwoColumn title="操作审计" noteTitle="审计要求" rules={["关键版本变更必须记录操作前后版本", "高风险操作需要 IP 和风险等级", "审计日志只读不可删除"]}><Table rowKey="id" dataSource={data} columns={[{ title: "操作人", dataIndex: "actor" }, { title: "操作对象", dataIndex: "objectName" }, { title: "操作类型", dataIndex: "op" }, { title: "操作前版本", dataIndex: "before" }, { title: "操作后版本", dataIndex: "after" }, { title: "IP", dataIndex: "ip" }, { title: "时间", dataIndex: "submittedAt" }, { title: "风险等级", dataIndex: "riskLevel", render: (v) => <StatusTag value={v} /> }]} /></TwoColumn>;
}

function CostsPage() {
  const costNames = ["推理 Token 成本", "Embedding 成本", "Reranker 成本", "GPU 训练成本", "存储成本", "部署节点成本", "人工审核成本"];
  const pieOption: echarts.EChartsOption = {
    tooltip: {},
    series: [{
      type: "pie",
      radius: ["45%", "72%"],
      data: [{ name: "推理", value: 48 }, { name: "训练", value: 32 }, { name: "向量化", value: 12 }, { name: "存储", value: 8 }],
    }],
  };
  return (
    <TwoColumn title="成本总览" noteTitle="成本统计" rules={["按 Token、训练时长、向量化、部署节点统计", "支持项目/Agent/模型筛选", "超额进入限额策略"]}>
      <FilterBar />
      <Row gutter={[12, 12]}>
        {costNames.map((name, i) => (
          <Col span={6} key={name}>
            <MetricCard title={name} value={`¥${(12000 + i * 3400).toLocaleString()}`} icon={<FundProjectionScreenOutlined />} trend="▲ 8.2%" />
          </Col>
        ))}
      </Row>
      <Row gutter={[12, 12]} className="mt12">
        <Col span={16}><Card title="成本趋势"><Chart option={stackAreaOption()} /></Card></Col>
        <Col span={8}><Card title="模型成本占比"><Chart option={pieOption} /></Card></Col>
      </Row>
    </TwoColumn>
  );
}

function LimitsPage() {
  const limitFields = ["每用户每日调用次数", "每租户每月 Token", "并发限制", "训练任务限制", "知识库容量限制", "免费额度"];
  return (
    <TwoColumn title="限额配置" noteTitle="限额策略" rules={["限额按用户、租户、模型、训练资源配置", "超额可禁止使用、提醒升级或额外计费", "失败重试计费需可配置"]}>
      <Card>
        <Form layout="vertical" initialValues={{ calls: 200, token: 1000000, concurrency: 64, jobs: 3, kb: 50000, strategy: "提醒升级" }}>
          <Row gutter={16}>
            {limitFields.map((label) => (
              <Col span={8} key={label}><Form.Item label={label}><InputNumber className="full" /></Form.Item></Col>
            ))}
            <Col span={8}><Form.Item label="超额处理策略"><Select defaultValue="提醒升级" options={["禁止使用", "提醒升级", "额外计费"].map((v) => ({ label: v, value: v }))} /></Form.Item></Col>
          </Row>
          <Button type="primary">保存限额配置</Button>
        </Form>
      </Card>
    </TwoColumn>
  );
}

function TenantsPage() {
  const data = seedProjects.map((p, i) => ({ id: p.tenantId, name: p.customerName, industry: p.industry, plan: ["POC 版", "专业版", "企业版", "定制版"][i % 4], deploymentMode: p.deploymentMode, users: 40 + i * 18, status: i === 3 ? "停用" : "运行中", expire: `2026-12-${10 + i}` }));
  return <TwoColumn title="租户管理" noteTitle="租户规则" rules={["租户数据隔离", "套餐决定限额和功能", "到期前触发续费提醒"]}><Table rowKey="id" dataSource={data} columns={[{ title: "租户名称", dataIndex: "name" }, { title: "行业", dataIndex: "industry" }, { title: "套餐", dataIndex: "plan" }, { title: "部署方式", dataIndex: "deploymentMode" }, { title: "用户数", dataIndex: "users" }, { title: "状态", dataIndex: "status", render: (v) => <StatusTag value={v} /> }, { title: "到期时间", dataIndex: "expire" }, { title: "操作", render: () => <Space><Button size="small">查看</Button><Button size="small">编辑</Button></Space> }]} /></TwoColumn>;
}

function RbacPage() {
  const roles = ["平台管理员", "AI 训练专家", "知识工程师", "交付顾问", "企业管理员", "业务专家", "业务员工", "审计员"];
  return <TwoColumn title="用户与角色权限" noteTitle="RBAC 权限控制" rules={["角色决定页面和数据权限", "高风险操作需二次确认", "审计员只读"]}><Card><Table rowKey="role" dataSource={roles.map((role, i) => ({ role, userCount: 3 + i, permissions: ["查看", "编辑", "审核", "发布"].slice(0, 1 + (i % 4)) }))} columns={[{ title: "角色", dataIndex: "role" }, { title: "用户数", dataIndex: "userCount" }, { title: "权限", dataIndex: "permissions", render: (v) => v.map((p: string) => <Tag key={p}>{p}</Tag>) }, { title: "操作", render: () => <Button size="small">配置权限</Button> }]} /></Card></TwoColumn>;
}

function RiskRulesPage() {
  return <TwoColumn title="风控规则" noteTitle="安全边界" rules={["敏感词库支持版本管理", "高风险场景必须人工确认", "拦截策略进入日志留痕"]}><Card><Tabs items={["敏感词库", "禁止生成内容", "高风险场景", "人工确认规则", "拦截策略", "风控规则版本"].map((label) => ({ key: label, label, children: <Form layout="vertical"><Form.Item label={label}><Input.TextArea rows={6} defaultValue={`${label}：医疗、法律、金融、资金、合同、权益、生产安全等内容需提示或转人工。`} /></Form.Item><Button type="primary">保存规则</Button></Form> }))} /></Card></TwoColumn>;
}

function App() {
  const [store, setStore] = useState<Store>({
    projects: seedProjects,
    dataAssets: seedDataAssets,
    knowledge: seedKnowledgeBaseVersions,
    trainingJobs: seedTrainingJobs,
    ragConfigs: seedRagConfigs,
    agents: seedAgents,
    releases: seedReleasePackages,
    reviews: seedReviewRecords,
    feedback: seedUserFeedback,
    tasks: seedIterationTasks,
    callLogs: seedCallLogs,
  });
  return (
    <BrowserRouter>
      <Shell store={store} setStore={setStore} />
    </BrowserRouter>
  );
}

export default App;
