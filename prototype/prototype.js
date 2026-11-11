(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const OPERATOR = '运营管理员';
  const STATUS_LABELS = { executing: '执行中', enabled: '启用中', disabled: '已停用' };
  const ACTIVE_RULE_STATUSES = new Set(['enabled', 'executing']);
  const IMPORT_HEADERS = ['规则名称', '活动ID集合', '门店日总数量', '门店周总数量', '门店月总数量', '柜机日次数', '柜机周次数', '柜机月次数', 'App日次数', 'App周次数', 'App月次数', '状态'];
  const FIELD_DEFS = [
    { key: 'activities', label: '活动 ID 集合' },
    { key: 'dailyTotal', label: '门店日总数量' },
    { key: 'weeklyTotal', label: '门店周总数量' },
    { key: 'monthlyTotal', label: '门店月总数量' },
    { key: 'dailyCabinet', label: '柜机日次数' },
    { key: 'weeklyCabinet', label: '柜机周次数' },
    { key: 'monthlyCabinet', label: '柜机月次数' },
    { key: 'dailyApp', label: 'App 日次数' },
    { key: 'weeklyApp', label: 'App 周次数' },
    { key: 'monthlyApp', label: 'App 月次数' },
    { key: 'status', label: '状态' },
    { key: 'name', label: '规则名称' }
  ];

  const activities = [
    { id: 'ACT-20261101', name: '双十一手机换新季', period: '11.01 - 11.15' },
    { id: 'ACT-20261103', name: '旗舰机加码补贴', period: '11.01 - 11.20' },
    { id: 'ACT-20261105', name: '以旧换新满减', period: '11.05 - 11.30' },
    { id: 'ACT-20261108', name: '旧机高价回收周', period: '11.08 - 11.18' },
    { id: 'ACT-20261112', name: '门店焕新专场', period: '11.12 - 11.25' },
    { id: 'ACT-20261115', name: '家电换新联动', period: '11.15 - 12.05' },
    { id: 'ACT-20261120', name: '年末换新冲刺', period: '11.20 - 12.31' },
    { id: 'ACT-20260901', name: '九月开学换新', period: '已结束' }
  ];

  const participationOrders = [
    { ruleId: 'R-001', storeId: 'ST-3101', storeName: '杭州西湖旗舰店', orderId: 'SO202611110102', entry: 'app', status: 'frozen', day: true, week: true },
    { ruleId: 'R-001', storeId: 'ST-3101', storeName: '杭州西湖旗舰店', orderId: 'SO202611110103', entry: 'cabinet', status: 'participated', day: true, week: true },
    { ruleId: 'R-001', storeId: 'ST-3101', storeName: '杭州西湖旗舰店', orderId: 'SO202611110104', entry: 'cabinet', status: 'participated', day: true, week: true },
    { ruleId: 'R-001', storeId: 'ST-3101', storeName: '杭州西湖旗舰店', orderId: 'SO202611110105', entry: 'cabinet', status: 'frozen', day: true, week: true },
    { ruleId: 'R-001', storeId: 'ST-3101', storeName: '杭州西湖旗舰店', orderId: 'SO202611090201', entry: 'app', status: 'participated', day: false, week: true },
    { ruleId: 'R-001', storeId: 'ST-3101', storeName: '杭州西湖旗舰店', orderId: 'SO202611060118', entry: 'cabinet', status: 'participated', day: false, week: false },
    { ruleId: 'R-001', storeId: 'ST-3101', storeName: '杭州西湖旗舰店', orderId: 'SO202611030076', entry: 'app', status: 'participated', day: false, week: false },
    { ruleId: 'R-001', storeId: 'ST-3102', storeName: '上海静安体验店', orderId: 'SO202611110211', entry: 'app', status: 'frozen', day: true, week: true },
    { ruleId: 'R-001', storeId: 'ST-3102', storeName: '上海静安体验店', orderId: 'SO202611110212', entry: 'app', status: 'participated', day: true, week: true },
    { ruleId: 'R-001', storeId: 'ST-3102', storeName: '上海静安体验店', orderId: 'SO202611050188', entry: 'cabinet', status: 'participated', day: false, week: false },
    { ruleId: 'R-001', storeId: 'ST-3103', storeName: '广州天河门店', orderId: 'SO202611090301', entry: 'cabinet', status: 'frozen', day: false, week: true },
    { ruleId: 'R-001', storeId: 'ST-3103', storeName: '广州天河门店', orderId: 'SO202611020119', entry: 'app', status: 'participated', day: false, week: false },
    { ruleId: 'R-002', storeId: 'ST-3201', storeName: '北京朝阳大悦城店', orderId: 'SO202611110401', entry: 'cabinet', status: 'frozen', day: true, week: true },
    { ruleId: 'R-002', storeId: 'ST-3201', storeName: '北京朝阳大悦城店', orderId: 'SO202611090402', entry: 'app', status: 'participated', day: false, week: true },
    { ruleId: 'R-002', storeId: 'ST-3201', storeName: '北京朝阳大悦城店', orderId: 'SO202611080403', entry: 'cabinet', status: 'participated', day: false, week: false },
    { ruleId: 'R-002', storeId: 'ST-3202', storeName: '成都春熙路店', orderId: 'SO202611110501', entry: 'app', status: 'participated', day: true, week: true },
    { ruleId: 'R-002', storeId: 'ST-3202', storeName: '成都春熙路店', orderId: 'SO202611070502', entry: 'app', status: 'frozen', day: false, week: false }
  ];

  const seedLogs = {
    'R-001': [
      {
        id: 'LOG-R001-002', action: '编辑规则', operator: '王运营', time: '2026-11-10 14:32', note: '双十一活动首日结束后上调门店总次数',
        changes: [
          { field: '门店日总数量', before: '40 次', after: '50 次' },
          { field: '门店周总数量', before: '200 次', after: '250 次' },
          { field: '柜机日次数', before: '15 次', after: '20 次' }
        ]
      },
      {
        id: 'LOG-R001-001', action: '创建规则', operator: '王运营', time: '2026-11-08 10:20', note: '',
        changes: [
          { field: '活动 ID 集合', before: '—', after: 'ACT-20261101、ACT-20261103' },
          { field: '门店日总数量', before: '—', after: '40 次' },
          { field: '门店周总数量', before: '—', after: '200 次' },
          { field: '门店月总数量', before: '—', after: '800 次' },
          { field: '状态', before: '—', after: '启用中' }
        ]
      }
    ],
    'R-002': [
      {
        id: 'LOG-R002-002', action: '编辑规则', operator: '陈运营', time: '2026-11-09 18:05', note: '调整 App 周次数；门店日/周/月总数量继续不执行。',
        changes: [{ field: 'App 周次数', before: '20 次', after: '30 次' }]
      },
      {
        id: 'LOG-R002-001', action: '创建规则', operator: '陈运营', time: '2026-11-05 09:40', note: '',
        changes: [
          { field: '活动 ID 集合', before: '—', after: 'ACT-20261105、ACT-20261108' },
          { field: '柜机日次数', before: '—', after: '12 次' },
          { field: '柜机周次数', before: '—', after: '50 次' },
          { field: 'App 日次数', before: '—', after: '25 次' },
          { field: 'App 周次数', before: '—', after: '20 次' },
          { field: 'App 月次数', before: '—', after: '400 次' },
          { field: '状态', before: '—', after: '启用中' }
        ]
      }
    ],
    'R-003': [
      {
        id: 'LOG-R003-002', action: '停用规则', operator: '王运营', time: '2026-09-30 17:40', note: '活动结束后停止新订单限制',
        changes: [{ field: '状态', before: '启用中', after: '已停用' }]
      },
      {
        id: 'LOG-R003-001', action: '创建规则', operator: '王运营', time: '2026-09-01 08:50', note: '',
        changes: [
          { field: '活动 ID 集合', before: '—', after: 'ACT-20260901' },
          { field: '门店日总数量', before: '—', after: '20 次' },
          { field: '门店月总数量', before: '—', after: '260 次' },
          { field: '状态', before: '—', after: '启用中' }
        ]
      }
    ],
    'R-004': [
      {
        id: 'LOG-R004-002', action: '开始执行', operator: '系统任务', time: '2026-11-10 15:10', note: '启用后开始回溯当前日/周/月历史数据，回放期间规则内活动阻断新参与。',
        changes: [
          { field: '状态', before: '已停用', after: '执行中' },
          { field: '执行批次', before: '—', after: 'ACT-20261110-001' },
          { field: '活动范围', before: '—', after: 'ACT-20261112' },
          { field: '处理结果', before: '—', after: '历史数据回放进行中' }
        ]
      },
      {
        id: 'LOG-R004-001', action: '创建规则', operator: '李运营', time: '2026-11-10 15:08', note: '',
        changes: [
          { field: '活动 ID 集合', before: '—', after: 'ACT-20261112' },
          { field: '门店日总数量', before: '—', after: '36 次' },
          { field: '门店周总数量', before: '—', after: '180 次' },
          { field: '门店月总数量', before: '—', after: '480 次' },
          { field: '状态', before: '—', after: '执行中' }
        ]
      }
    ]
  };

  let rules = [
    { id: 'R-001', name: '双十一换新·门店次数', status: 'enabled', activities: ['ACT-20261101', 'ACT-20261103'], dailyTotal: 50, weeklyTotal: 250, monthlyTotal: 800, dailyCabinet: 20, weeklyCabinet: 90, monthlyCabinet: 300, dailyApp: 40, weeklyApp: 180, monthlyApp: 600, updated: '2026-11-10 14:32', updater: '王运营', logs: seedLogs['R-001'] },
    { id: 'R-002', name: '月中换新·入口独立次数', status: 'enabled', activities: ['ACT-20261105', 'ACT-20261108'], dailyTotal: null, weeklyTotal: null, monthlyTotal: null, dailyCabinet: 12, weeklyCabinet: 50, monthlyCabinet: null, dailyApp: 25, weeklyApp: 30, monthlyApp: 400, updated: '2026-11-09 18:05', updater: '陈运营', logs: seedLogs['R-002'] },
    { id: 'R-003', name: '九月开学换新（已停用）', status: 'disabled', activities: ['ACT-20260901'], dailyTotal: 20, weeklyTotal: 120, monthlyTotal: 260, dailyCabinet: null, weeklyCabinet: null, monthlyCabinet: null, dailyApp: 16, weeklyApp: null, monthlyApp: 180, updated: '2026-09-30 17:40', updater: '王运营', logs: seedLogs['R-003'] },
    { id: 'R-004', name: '门店焕新·历史回放中', status: 'executing', activities: ['ACT-20261112'], dailyTotal: 36, weeklyTotal: 180, monthlyTotal: 480, dailyCabinet: 18, weeklyCabinet: 72, monthlyCabinet: 240, dailyApp: 24, weeklyApp: 120, monthlyApp: 300, updated: '2026-11-10 15:10', updater: '系统任务', logs: seedLogs['R-004'], initialization: { mode: 'activation', batchId: 'ACT-20261110-001', trigger: '新建后启用', activities: ['ACT-20261112'], demo: true } }
  ];

  let activeRuleId = null;
  let formActivities = [];
  let pendingImport = null;
  let logSequence = 100;
  let importSequence = 1;
  let activationSequence = 1;
  let participationReturnFocus = null;
  let orderReturnFocus = null;
  let errorReturnFocus = null;
  let currentParticipationRuleId = null;

  const form = $('#rule-form');
  const drawer = $('#rule-drawer');
  const backdrop = $('#drawer-backdrop');
  const searchInput = $('#rule-search');
  const statusFilter = $('#status-filter');
  const activitySearch = $('#activity-search');
  const importDrawer = $('#import-drawer');
  const importBackdrop = $('#import-backdrop');
  const importText = $('#import-text');
  const importFile = $('#import-file');
  const importPreviewSection = $('#import-preview-section');
  const importSummary = $('#import-summary');
  const importErrors = $('#import-errors');
  const importTableWrap = $('#import-table-wrap');
  const importPreviewBody = $('#import-preview-body');
  const importMore = $('#import-more');
  const confirmImportButton = $('#confirm-import');
  const logDrawer = $('#log-drawer');
  const logBackdrop = $('#log-backdrop');
  const participationModal = $('#participation-modal');
  const participationBackdrop = $('#participation-backdrop');
  const participationTableWrap = $('#participation-table-wrap');
  const participationEmpty = $('#participation-empty');
  const orderModal = $('#order-modal');
  const orderBackdrop = $('#order-backdrop');
  const orderTableWrap = $('#order-table-wrap');
  const orderEmpty = $('#order-empty');
  const errorModal = $('#error-modal');
  const errorBackdrop = $('#error-backdrop');

  const activityById = (id) => activities.find((activity) => activity.id === id);
  const displayName = (rule) => rule.name?.trim() || `未命名次数规则 ${rule.id}`;
  const statusLabel = (status) => STATUS_LABELS[status] || STATUS_LABELS.enabled;
  const isActiveRule = (rule) => ACTIVE_RULE_STATUSES.has(rule.status);
  const currentFormStatus = () => $('input[name="rule-status"]:checked')?.value || 'enabled';
  const ownerOfActivity = (activityId, excludeRuleId = null) => rules.find((rule) => rule.id !== excludeRuleId && isActiveRule(rule) && rule.activities.includes(activityId));

  const formatActivity = (id) => {
    const activity = activityById(id);
    return activity ? activity.name : id;
  };

  const escapeHtml = (value) => String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  const toast = (message) => {
    const region = $('#toast-region');
    const node = document.createElement('div');
    node.className = 'toast';
    node.textContent = message;
    region.appendChild(node);
    window.setTimeout(() => node.remove(), 3600);
  };

  const showErrorDialog = (title, message, hint = '') => {
    if (errorModal.hidden) {
      errorReturnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    }
    $('#error-modal-title').textContent = title;
    $('#error-modal-message').textContent = message;
    const hintNode = $('#error-modal-hint');
    hintNode.textContent = hint;
    hintNode.hidden = !hint;
    errorModal.setAttribute('aria-describedby', hint ? 'error-modal-message error-modal-hint' : 'error-modal-message');
    errorBackdrop.hidden = false;
    errorModal.hidden = false;
    syncBodyOverflow();
    window.requestAnimationFrame(() => $('#error-modal-confirm').focus());
  };

  const closeErrorDialog = () => {
    errorModal.hidden = true;
    errorBackdrop.hidden = true;
    syncBodyOverflow();
    const returnFocus = errorReturnFocus;
    errorReturnFocus = null;
    if (returnFocus?.isConnected) window.requestAnimationFrame(() => returnFocus.focus());
  };

  const nowText = () => {
    const date = new Date();
    const pad = (value) => String(value).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const formatConfigValue = (key, value) => {
    if (key === 'status') return statusLabel(value);
    if (key === 'activities') return value?.length ? value.join('、') : '未配置';
    if (key === 'name') return value?.trim() || '未命名';
    return value === null || value === undefined || value === '' ? '不执行' : `${value} 次`;
  };

  const createChanges = (rule) => FIELD_DEFS.map(({ key, label }) => ({
    field: label,
    before: '—',
    after: formatConfigValue(key, rule[key])
  }));

  const diffRule = (before, after) => FIELD_DEFS.flatMap(({ key, label }) => {
    const normalize = (value) => Array.isArray(value) ? value.join('|') : value ?? '';
    if (normalize(before[key]) === normalize(after[key])) return [];
    return [{ field: label, before: formatConfigValue(key, before[key]), after: formatConfigValue(key, after[key]) }];
  });

  const makeLog = (action, changes, note = '', operator = OPERATOR) => ({
    id: `LOG-${String(++logSequence).padStart(4, '0')}`,
    action,
    operator,
    time: nowText(),
    note,
    changes
  });

  const activationPeriods = () => {
    const date = new Date();
    const pad = (value) => String(value).padStart(2, '0');
    const formatDate = (value) => `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
    const day = formatDate(date);
    const month = `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
    const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
    const sunday = new Date(monday);
    sunday.setDate(sunday.getDate() + 6);
    const week = `${formatDate(monday)} ~ ${formatDate(sunday)}`;
    return { day, week, month };
  };

  const makeActivationStartLog = (rule, trigger, activityIds = rule.activities, batchId = '', mode = 'activation') => {
    const { day, week, month } = activationPeriods();
    return makeLog('开始执行', [
      { field: '状态', before: mode === 'incremental' ? '启用中' : '已停用', after: mode === 'incremental' ? '启用中（新增活动初始化中）' : '执行中' },
      { field: '执行批次', before: '—', after: batchId || '—' },
      { field: '初始化周期', before: '—', after: `${day}（日）、${week}（周）、${month}（月）` },
      { field: '活动范围', before: '—', after: activityIds.join('、') },
      { field: '处理结果', before: '—', after: mode === 'incremental' ? '新增活动初始化中，原活动继续执行' : '历史数据回放进行中，规则内活动阻断新参与' }
    ], `${trigger}：回溯当前日/周/月历史成交并补建冻结订单；回放完成前不会切换为启用中。`, '系统任务');
  };

  const makeActivationCompleteLog = (rule, trigger, activityIds = rule.activities, batchId = '', mode = 'activation') => {
    const { day, week, month } = activationPeriods();
    return makeLog('初始化完成', [
      { field: '状态', before: mode === 'incremental' ? '启用中（新增活动初始化中）' : '执行中', after: '启用中' },
      { field: '执行批次', before: batchId || '—', after: batchId || '—' },
      { field: '初始化周期', before: `${day}（日）、${week}（周）、${month}（月）`, after: `${day}（日）、${week}（周）、${month}（月）` },
      { field: '活动范围', before: activityIds.join('、'), after: activityIds.join('、') },
      { field: '处理结果', before: '历史数据回放中', after: '成功，期初用量与冻结订单已纳入当前参与数量' }
    ], `${trigger}：历史数据回放完成，规则开始执行次数校验和冻结。`, '系统任务');
  };

  const scheduleActivationCompletion = (ruleId, batchId, delay = 2600) => {
    window.setTimeout(() => {
      const rule = rules.find((item) => item.id === ruleId);
      const initialization = rule?.initialization;
      if (!rule || !initialization || initialization.batchId !== batchId) return;
      const { mode, trigger, activities: initializedActivities } = initialization;
      rule.status = 'enabled';
      const completeLog = makeActivationCompleteLog(rule, trigger, initializedActivities, batchId, mode);
      rule.logs = [completeLog, ...(rule.logs || [])];
      rule.updated = completeLog.time;
      rule.updater = '系统任务';
      delete rule.initialization;
      renderRules();
      if (!logDrawer.hidden && $('#log-drawer-subtitle').textContent.includes(rule.id)) renderRuleLogs(rule);
      if (!participationModal.hidden && currentParticipationRuleId === rule.id) renderParticipation(rule);
      toast(mode === 'incremental'
        ? `“${displayName(rule)}”新增活动初始化完成，已开始执行次数规则。`
        : `“${displayName(rule)}”历史数据回放完成，已由执行中变为启用中。`);
    }, delay);
  };

  const summarizeLog = (log) => {
    if (!log?.changes?.length) return '无字段变化';
    const items = log.changes.slice(0, 2).map((change) => `${change.field} ${change.before} → ${change.after}`);
    return `${items.join('；')}${log.changes.length > 2 ? `；等 ${log.changes.length} 项` : ''}`;
  };

  const updateMetrics = () => {
    const activitiesUsed = new Set(rules.flatMap((rule) => rule.activities));
    $('#metric-rules').textContent = rules.length;
    $('#metric-enabled').textContent = rules.filter((rule) => rule.status === 'enabled').length;
    $('#metric-executing').textContent = rules.filter((rule) => rule.status === 'executing').length;
    $('#metric-activities').textContent = activitiesUsed.size;
    $('#menu-rule-count').textContent = rules.length;
  };

  const dailyText = (value) => value ? `${value} / 日` : '不执行';
  const weeklyText = (value) => value ? `${value} / 周` : '不执行';
  const monthlyText = (value) => value ? `${value} / 月` : '不执行';

  const ordersForRule = (ruleId) => participationOrders.filter((order) => order.ruleId === ruleId);
  const ORDER_DESTINATIONS = {
    cabinet: { label: '柜机下单', enumValue: 'CABINET_ORDER' },
    app: { label: '软件下单', enumValue: 'SOFTWARE_ORDER' }
  };
  const orderDestinationLabel = (order) => ORDER_DESTINATIONS[order.destination || order.entry]?.label || '未知归宿';

  const participationCount = (orders, period, entry = 'total') => {
    const inPeriod = orders.filter((order) => period === 'month' || order[period]);
    const entryOrders = entry === 'total' ? inPeriod : inPeriod.filter((order) => (order.destination || order.entry) === entry);
    const frozen = entryOrders.filter((order) => order.status === 'frozen').length;
    const participated = entryOrders.filter((order) => order.status === 'participated').length;
    return { total: frozen + participated, frozen, participated };
  };

  const participationStores = (ruleId) => {
    const storeMap = new Map();
    ordersForRule(ruleId).forEach((order) => {
      if (!storeMap.has(order.storeId)) {
        storeMap.set(order.storeId, { storeId: order.storeId, storeName: order.storeName, orders: [] });
      }
      storeMap.get(order.storeId).orders.push(order);
    });
    return [...storeMap.values()];
  };

  const renderRules = () => {
    const query = searchInput.value.trim().toLowerCase();
    const status = statusFilter.value;
    const visibleRules = rules.filter((rule) => {
      const matchesStatus = status === 'all' || rule.status === status;
      const searchable = [displayName(rule), rule.id, ...rule.activities, ...rule.activities.map(formatActivity)].join(' ').toLowerCase();
      return matchesStatus && (!query || searchable.includes(query));
    });

    const body = $('#rules-body');
    body.innerHTML = visibleRules.map((rule) => {
      const tags = rule.activities.slice(0, 2).map((id) => `<span class="activity-tag" title="${escapeHtml(formatActivity(id))}">${escapeHtml(id)}</span>`).join('');
      const more = rule.activities.length > 2 ? `<span class="activity-tag more">+${rule.activities.length - 2}</span>` : '';
      const nextStatus = rule.status === 'enabled' ? 'disabled' : 'enabled';
      const incrementalInitializing = rule.status === 'enabled' && rule.initialization?.mode === 'incremental';
      const actionsLocked = rule.status === 'executing' || incrementalInitializing;
      const statusNote = rule.status === 'executing'
        ? '<span class="status-note">历史数据处理中</span>'
        : incrementalInitializing ? '<span class="status-note">新增活动初始化中</span>' : '';
      const storeCount = participationStores(rule.id).length;
      const latestLog = rule.logs?.[0];
      const logCount = rule.logs?.length || 0;
      const logCell = latestLog ? `
        <button class="log-summary" type="button" data-log="${rule.id}">
          <span class="log-summary-head"><strong>${escapeHtml(latestLog.action)}</strong><time>${escapeHtml(latestLog.time)}</time></span>
          <span class="log-summary-change">${escapeHtml(summarizeLog(latestLog))}</span>
          <span class="log-summary-link">查看全部 ${logCount} 条</span>
        </button>` : '<span class="update-cell">暂无日志</span>';
      return `
        <tr data-rule-id="${rule.id}">
          <td><span class="rule-name">${escapeHtml(displayName(rule))}</span><span class="rule-code">${rule.id}</span></td>
          <td><div class="activity-tags">${tags}${more}</div></td>
          <td class="limit-cell"><strong>${dailyText(rule.dailyTotal)}</strong><small>${weeklyText(rule.weeklyTotal)}</small><small>${monthlyText(rule.monthlyTotal)}</small></td>
          <td class="limit-cell"><strong>${dailyText(rule.dailyCabinet)}</strong><small>${weeklyText(rule.weeklyCabinet)}</small><small>${monthlyText(rule.monthlyCabinet)}</small></td>
          <td class="limit-cell"><strong>${dailyText(rule.dailyApp)}</strong><small>${weeklyText(rule.weeklyApp)}</small><small>${monthlyText(rule.monthlyApp)}</small></td>
          <td><div class="status-stack"><span class="status-text ${rule.status}">${statusLabel(rule.status)}</span>${statusNote}</div></td>
          <td><button class="participation-link" type="button" data-participation="${rule.id}"><span>参与详情</span><small>${storeCount ? `${storeCount} 家门店` : '暂无数据'}</small></button></td>
          <td>${logCell}</td>
          <td class="actions-col">${actionsLocked ? `<span class="action-note">${rule.status === 'executing' ? '历史数据处理中' : '新增活动初始化中'}</span>` : `<div class="row-actions"><button class="link-button" type="button" data-edit="${rule.id}">编辑</button><button class="link-button ${nextStatus === 'disabled' ? 'danger' : ''}" type="button" data-toggle="${rule.id}">${nextStatus === 'disabled' ? '停用' : '启用'}</button></div>`}</td>
        </tr>`;
    }).join('');

    $('#empty-state').hidden = visibleRules.length > 0;
    $('#result-count').textContent = `共 ${visibleRules.length} 条`;
    $('#table-foot-count').textContent = `共 ${rules.length} 条配置`;
    updateMetrics();
  };

  const setError = (selector, message = '') => {
    const node = $(selector);
    if (node) node.textContent = message;
  };

  const syncBodyOverflow = () => {
    const hasOpenDialog = [drawer, importDrawer, logDrawer, participationModal, orderModal, errorModal].some((node) => node && !node.hidden);
    document.body.style.overflow = hasOpenDialog ? 'hidden' : '';
  };

  const renderSelectedActivities = () => {
    const box = $('#selected-activities');
    if (!formActivities.length) {
      box.innerHTML = '<span class="selected-empty">尚未添加活动，至少需要配置 1 个活动 ID</span>';
      return;
    }
    box.innerHTML = formActivities.map((id) => `
      <span class="selected-chip"><code>${escapeHtml(id)}</code><span>${escapeHtml(formatActivity(id))}</span><button type="button" data-remove-activity="${escapeHtml(id)}" aria-label="移除活动 ${escapeHtml(id)}">×</button></span>
    `).join('');
  };

  const renderActivityOptions = () => {
    const query = activitySearch.value.trim().toLowerCase();
    const options = activities.filter((activity) => `${activity.id} ${activity.name}`.toLowerCase().includes(query));
    const box = $('#activity-options');
    if (!options.length) {
      box.innerHTML = '<div class="option-empty">没有匹配的活动</div>';
      return;
    }
    box.innerHTML = options.map((activity) => {
      const selected = formActivities.includes(activity.id);
      const owner = ownerOfActivity(activity.id, activeRuleId);
      const occupied = Boolean(owner) && currentFormStatus() === 'enabled';
      const disabled = selected || occupied;
      const state = selected ? '已添加' : occupied ? `已被“${displayName(owner)}”占用` : owner ? '停用配置可添加' : '可添加';
      return `<button class="activity-option" type="button" role="option" data-activity-option="${activity.id}" ${disabled ? 'disabled' : ''}><code>${activity.id}</code><span class="option-name">${escapeHtml(activity.name)} · ${activity.period}</span><span class="option-state ${owner ? 'occupied' : ''}">${escapeHtml(state)}</span></button>`;
    }).join('');
  };

  const resetForm = () => {
    form.reset();
    formActivities = [];
    setError('#activity-error');
    setError('#limit-error');
    $('.activity-picker')?.classList.remove('invalid');
    activitySearch.value = '';
    $$('.quota-field input[type="number"]').forEach((input) => {
      input.value = '';
      input.closest('.number-wrap').classList.remove('invalid');
    });
    $('#save-hint').textContent = '活动 ID 必填；9 项次数均选填，但至少填写 1 项';
    renderSelectedActivities();
    renderActivityOptions();
  };

  const fillForm = (rule) => {
    resetForm();
    formActivities = [...rule.activities];
    $('#rule-name').value = rule.name;
    const status = $(`input[name="rule-status"][value="${rule.status}"]`);
    if (status) status.checked = true;
    form.elements.dailyTotal.value = rule.dailyTotal ?? '';
    form.elements.weeklyTotal.value = rule.weeklyTotal ?? '';
    form.elements.monthlyTotal.value = rule.monthlyTotal ?? '';
    form.elements.dailyCabinet.value = rule.dailyCabinet ?? '';
    form.elements.weeklyCabinet.value = rule.weeklyCabinet ?? '';
    form.elements.monthlyCabinet.value = rule.monthlyCabinet ?? '';
    form.elements.dailyApp.value = rule.dailyApp ?? '';
    form.elements.weeklyApp.value = rule.weeklyApp ?? '';
    form.elements.monthlyApp.value = rule.monthlyApp ?? '';
    renderSelectedActivities();
    renderActivityOptions();
  };

  const closeDrawer = () => {
    drawer.hidden = true;
    backdrop.hidden = true;
    activeRuleId = null;
    syncBodyOverflow();
  };

  const openDrawer = (rule = null) => {
    if (rule?.status === 'executing') {
      showErrorDialog('规则正在执行中', '历史数据回放完成前，不能编辑规则或重复启停。', '请等待状态变为“启用中”后再操作。');
      return;
    }
    if (rule?.initialization?.mode === 'incremental') {
      showErrorDialog('新增活动初始化中', '新增活动的初始化尚未完成，当前不能修改规则。', '请等待初始化完成后再编辑。');
      return;
    }
    closeParticipation(false);
    closeOrderDetails(false);
    closeLogDrawer();
    closeImportDrawer(true);
    activeRuleId = rule?.id || null;
    resetForm();
    if (rule) {
      fillForm(rule);
      $('#drawer-title').textContent = '编辑限制规则';
      $('#drawer-subtitle').textContent = `正在编辑 ${rule.id}，活动占用仅校验其他启用中/执行中规则。`;
    } else {
      $('#drawer-title').textContent = '新建限制规则';
      $('#drawer-subtitle').textContent = '配置活动集合与门店次数。';
    }
    backdrop.hidden = false;
    drawer.hidden = false;
    syncBodyOverflow();
    window.requestAnimationFrame(() => $('#activity-search').focus());
  };

  const addActivity = (id) => {
    const normalized = id.trim().toUpperCase();
    setError('#activity-error');
    $('.activity-picker')?.classList.remove('invalid');
    if (!normalized) {
      setError('#activity-error', '请输入活动 ID 或从列表选择活动。');
      return;
    }
    const activity = activityById(normalized);
    if (!activity) {
      setError('#activity-error', `活动 ID “${normalized}”不存在或不是换新活动，请重新确认。`);
      $('.activity-picker')?.classList.add('invalid');
      return;
    }
    if (formActivities.includes(normalized)) {
      setError('#activity-error', `活动 ${normalized} 已添加到当前规则，请勿重复添加。`);
      return;
    }
    const owner = currentFormStatus() === 'enabled' ? ownerOfActivity(normalized, activeRuleId) : null;
    if (owner) {
      setError('#activity-error', `活动 ${normalized} 已被启用中/执行中规则“${displayName(owner)}”占用。`);
      $('.activity-picker')?.classList.add('invalid');
      return;
    }
    formActivities.push(normalized);
    activitySearch.value = '';
    renderSelectedActivities();
    renderActivityOptions();
    setError('#activity-error');
    $('.activity-picker')?.classList.remove('invalid');
    $('#save-hint').textContent = '活动已添加，请至少填写 1 项门店总量或柜机/App 次数';
  };

  const collectQuotas = () => {
    const quotas = {};
    let filled = 0;
    let invalid = false;
    $$('.quota-field').forEach((field) => {
      const key = field.dataset.quota;
      const number = $('input[type="number"]', field);
      const wrap = number.closest('.number-wrap');
      wrap.classList.remove('invalid');
      const rawValue = number.value.trim();
      if (!rawValue) {
        quotas[key] = null;
        return;
      }
      filled += 1;
      const value = Number(rawValue);
      if (!Number.isSafeInteger(value) || value <= 0) {
        invalid = true;
        wrap.classList.add('invalid');
      }
      quotas[key] = value;
    });
    return { quotas, filled, invalid };
  };

  const validateForm = () => {
    let valid = true;
    const errors = [];
    setError('#activity-error');
    $('.activity-picker')?.classList.remove('invalid');
    if (!formActivities.length) {
      setError('#activity-error', '至少配置 1 个活动 ID。');
      $('.activity-picker')?.classList.add('invalid');
      errors.push('活动 ID 集合不能为空，至少添加 1 个活动。');
      valid = false;
    }
    const requestedStatus = currentFormStatus();
    const duplicate = requestedStatus === 'enabled' ? formActivities.find((id) => ownerOfActivity(id, activeRuleId)) : null;
    if (duplicate) {
      const owner = ownerOfActivity(duplicate, activeRuleId);
      setError('#activity-error', `活动 ${duplicate} 已被启用中/执行中规则“${displayName(owner)}”占用，停用配置不受此限制。`);
      $('.activity-picker')?.classList.add('invalid');
      errors.push(`活动 ${duplicate} 已被“${displayName(owner)}”占用，当前配置不能以启用状态保存。`);
      valid = false;
    }
    const quotaResult = collectQuotas();
    setError('#limit-error');
    if (!quotaResult.invalid && quotaResult.filled === 0) {
      setError('#limit-error', '门店总次数及柜机/App次数共 9 项均为选填，但至少填写 1 项。');
      $$('.quota-field .number-wrap').forEach((wrap) => wrap.classList.add('invalid'));
      errors.push('门店总量与柜机/App 次数共 9 项至少填写 1 项，不能全部留空。');
      valid = false;
    } else if (quotaResult.invalid) {
      setError('#limit-error', '已填写的次数必须为大于 0 的整数；留空的次数不执行对应周期限制。');
      errors.push('已填写的次数必须为大于 0 的整数，请修正标红输入框。');
      valid = false;
    }
    if (!valid) {
      $('#save-hint').textContent = '请修正标红项后再保存';
      showErrorDialog('配置未保存', errors.join('\n'), '修改内容已保留，请按表单标红提示调整后重新保存。');
    }
    return valid;
  };

  const saveRule = (event) => {
    event.preventDefault();
    if (!validateForm()) return;
    const quotas = collectQuotas().quotas;
    const requestedStatus = $('input[name="rule-status"]:checked')?.value || 'enabled';
    const id = activeRuleId || nextRuleId();
    const name = $('#rule-name').value.trim() || `未命名次数规则 ${id}`;
    const previousRule = rules.find((rule) => rule.id === activeRuleId);
    const addedActivities = previousRule ? formActivities.filter((activityId) => !previousRule.activities.includes(activityId)) : [...formActivities];
    const needsInitialExecution = requestedStatus === 'enabled' && (!previousRule || previousRule.status !== 'enabled');
    const needsIncrementalInitialization = requestedStatus === 'enabled' && previousRule?.status === 'enabled' && addedActivities.length > 0;
    const needsActivationInit = needsInitialExecution || needsIncrementalInitialization;
    const initializationMode = needsIncrementalInitialization ? 'incremental' : 'activation';
    const activationTrigger = !previousRule ? '首次启用' : previousRule.status !== 'enabled' ? '停用后重新启用' : '已启用规则新增活动';
    const activationBatchId = needsActivationInit ? nextActivationId() : null;
    const payload = {
      id,
      name,
      status: needsInitialExecution ? 'executing' : requestedStatus,
      activities: [...formActivities],
      ...quotas,
      updated: '',
      updater: OPERATOR
    };
    const changes = previousRule ? diffRule(previousRule, payload) : createChanges(payload);
    if (previousRule && !changes.length) {
      toast('配置未发生变化，未生成新的操作日志。');
      return;
    }
    const log = makeLog(previousRule ? '编辑规则' : '创建规则', changes);
    const startLog = needsActivationInit
      ? makeActivationStartLog(payload, activationTrigger, addedActivities, activationBatchId, initializationMode)
      : null;
    if (needsActivationInit) {
      payload.initialization = {
        mode: initializationMode,
        batchId: activationBatchId,
        trigger: activationTrigger,
        activities: [...addedActivities]
      };
    }
    payload.logs = [startLog, log, ...(previousRule?.logs || [])].filter(Boolean);
    payload.updated = payload.logs[0].time;
    if (previousRule) {
      rules = rules.map((rule) => rule.id === activeRuleId ? payload : rule);
      toast(needsInitialExecution
        ? `已更新“${payload.name}”，规则进入执行中；历史数据回放完成后自动启用。`
        : needsIncrementalInitialization
          ? `已更新“${payload.name}”，新增活动初始化中；原有活动继续执行。`
          : `已更新“${payload.name}”，变更已写入操作日志。`);
    } else {
      rules = [payload, ...rules];
      toast(needsInitialExecution
        ? `已创建“${payload.name}”，规则进入执行中；历史数据回放完成后自动启用。`
        : `已创建“${payload.name}”，并记录初始配置日志。`);
    }
    if (needsActivationInit) scheduleActivationCompletion(payload.id, activationBatchId);
    renderRules();
    closeDrawer();
  };

  const toggleRule = (id) => {
    const rule = rules.find((item) => item.id === id);
    if (!rule) return;
    if (rule.status === 'executing' || rule.initialization) {
      showErrorDialog('规则正在初始化', '当前规则正在处理初始化任务，完成前不可重复启停。', '请稍后重试。');
      return;
    }
    const before = rule.status;
    if (before === 'enabled') {
      rule.status = 'disabled';
      const log = makeLog('停用规则', [{
        field: '状态', before: statusLabel(before), after: statusLabel(rule.status)
      }], '停用后立即释放活动占用，其他规则可重新配置这些活动；历史参与数量保留。');
      rule.logs = [log, ...(rule.logs || [])];
      rule.updated = log.time;
      rule.updater = OPERATOR;
      renderRules();
      toast(`“${displayName(rule)}”已停用，变更已写入操作日志。`);
      return;
    }

    const conflict = rule.activities
      .map((activityId) => ({ activityId, owner: ownerOfActivity(activityId, rule.id) }))
      .find(({ owner }) => Boolean(owner));
    if (conflict) {
      showErrorDialog('活动已被占用', `活动 ${conflict.activityId} 已被启用中/执行中规则“${displayName(conflict.owner)}”占用，暂不能启用。`, '请先停用占用规则，或移除冲突活动后再试。');
      return;
    }

    const batchId = nextActivationId();
    rule.status = 'executing';
    rule.initialization = { mode: 'activation', batchId, trigger: '停用后重新启用', activities: [...rule.activities] };
    const enableLog = makeLog('启用规则', [{
      field: '状态', before: statusLabel(before), after: '执行中'
    }], '启用后先执行当前日/周/月历史数据回放，完成前不开始执行次数规则。');
    const startLog = makeActivationStartLog(rule, '停用后重新启用', rule.activities, batchId, 'activation');
    rule.logs = [startLog, enableLog, ...(rule.logs || [])];
    rule.updated = startLog.time;
    rule.updater = OPERATOR;
    renderRules();
    scheduleActivationCompletion(rule.id, batchId);
    toast(`“${displayName(rule)}”已进入执行中，历史数据回放完成后自动启用。`);
  };

  const closeLogDrawer = () => {
    logDrawer.hidden = true;
    logBackdrop.hidden = true;
    syncBodyOverflow();
  };

  const renderRuleLogs = (rule) => {
    const logs = rule.logs || [];
    $('#log-drawer-subtitle').textContent = `${displayName(rule)} · ${rule.id} · 共 ${logs.length} 条变更记录`;
    $('#log-count').textContent = `共 ${logs.length} 条记录`;
    const body = $('#log-drawer-body');
    if (!logs.length) {
      body.innerHTML = '<p class="log-empty">该规则暂无操作日志。</p>';
      return;
    }
    body.innerHTML = `<div class="log-timeline">${logs.map((log) => `
      <article class="log-entry">
        <div class="log-entry-card">
          <div class="log-entry-head"><strong>${escapeHtml(log.action)}</strong><span>${escapeHtml(log.operator)}</span><time>${escapeHtml(log.time)}</time></div>
          ${log.note ? `<p class="log-entry-note">${escapeHtml(log.note)}</p>` : ''}
          <dl class="log-change-list">
            ${(log.changes || []).map((change) => `<div class="log-change-row"><dt>${escapeHtml(change.field)}</dt><dd><span class="log-before">${escapeHtml(change.before)}</span><span class="log-arrow" aria-hidden="true">→</span><span class="log-after">${escapeHtml(change.after)}</span></dd></div>`).join('')}
          </dl>
        </div>
      </article>`).join('')}</div>`;
  };

  const openLogDrawer = (id) => {
    const rule = rules.find((item) => item.id === id);
    if (!rule) return;
    closeOrderDetails(false);
    closeParticipation(false);
    closeDrawer();
    closeImportDrawer(true);
    renderRuleLogs(rule);
    logBackdrop.hidden = false;
    logDrawer.hidden = false;
    syncBodyOverflow();
    window.requestAnimationFrame(() => $('#close-log-drawer').focus());
  };

  const countCell = ({ total, frozen, participated }) => `
    <span class="count-total">${total} 次</span>
    <span class="count-split">冻结 ${frozen} · 已参与 ${participated}</span>`;

  const renderParticipation = (rule) => {
    const stores = participationStores(rule.id);
    const { day, week, month } = activationPeriods();
    $('#participation-modal-subtitle').textContent = `${displayName(rule)} · ${rule.id} · 数量包含冻结中与已参与（成交）订单`;
    $('#participation-rule-name').textContent = `${displayName(rule)}（${rule.id}）`;
    $('#participation-rule-status').textContent = statusLabel(rule.status);
    $('#participation-period').textContent = `${day}（日） / ${week}（周） / ${month}（月）`;
    $('#participation-foot-count').textContent = `共 ${stores.length} 家门店`;

    const hasData = stores.length > 0;
    participationTableWrap.hidden = !hasData;
    participationEmpty.hidden = hasData;
    $('#participation-body').innerHTML = stores.map((store) => {
      const orders = store.orders;
      return `<tr>
        <td><span class="detail-store-name">${escapeHtml(store.storeName)}</span><span class="detail-store-id">${escapeHtml(store.storeId)}</span></td>
        <td>${countCell(participationCount(orders, 'day', 'cabinet'))}</td>
        <td>${countCell(participationCount(orders, 'day', 'app'))}</td>
        <td>${countCell(participationCount(orders, 'day', 'total'))}</td>
        <td>${countCell(participationCount(orders, 'week', 'total'))}</td>
        <td>${countCell(participationCount(orders, 'week', 'cabinet'))}</td>
        <td>${countCell(participationCount(orders, 'week', 'app'))}</td>
        <td>${countCell(participationCount(orders, 'month', 'total'))}</td>
        <td>${countCell(participationCount(orders, 'month', 'cabinet'))}</td>
        <td>${countCell(participationCount(orders, 'month', 'app'))}</td>
        <td><button class="detail-order-button" type="button" data-orders="${rule.id}" data-store-id="${escapeHtml(store.storeId)}">查看明细</button></td>
      </tr>`;
    }).join('');

    if (!hasData) {
      $('#participation-empty-copy').textContent = rule.status === 'executing'
        ? '规则仍在执行历史数据回放，尚未开始执行次数规则，因此暂无参与数据。'
        : '当前日、周、月周期内还没有冻结中或已参与订单。';
    }
  };

  const openParticipation = (ruleId, trigger) => {
    const rule = rules.find((item) => item.id === ruleId);
    if (!rule) return;
    closeDrawer();
    closeImportDrawer(true);
    closeLogDrawer();
    closeOrderDetails(false);
    participationReturnFocus = trigger || document.activeElement;
    currentParticipationRuleId = rule.id;
    renderParticipation(rule);
    participationBackdrop.hidden = false;
    participationModal.hidden = false;
    syncBodyOverflow();
    window.requestAnimationFrame(() => $('#close-participation').focus());
  };

  const closeParticipation = (restoreFocus = true) => {
    closeOrderDetails(false);
    participationModal.hidden = true;
    participationBackdrop.hidden = true;
    syncBodyOverflow();
    if (restoreFocus && participationReturnFocus) participationReturnFocus.focus();
    participationReturnFocus = null;
    currentParticipationRuleId = null;
  };

  const renderOrderDetails = (rule, storeId) => {
    const storeOrders = ordersForRule(rule.id).filter((order) => order.storeId === storeId);
    const storeName = storeOrders[0]?.storeName || '未知门店';
    const uniqueOrders = [...new Map(storeOrders.map((order) => [order.orderId, order])).values()]
      .filter((order) => ORDER_DESTINATIONS[order.destination || order.entry]);
    $('#order-modal-subtitle').textContent = `${storeName} · 仅展示冻结中与已参与订单`;
    $('#order-store-name').textContent = storeName;
    $('#order-rule-name').textContent = `${displayName(rule)}（${rule.id}）`;
    $('#order-total-count').textContent = `${uniqueOrders.length} 笔`;
    $('#order-foot-count').textContent = `共 ${uniqueOrders.length} 笔订单`;
    orderTableWrap.hidden = uniqueOrders.length === 0;
    orderEmpty.hidden = uniqueOrders.length > 0;
    $('#order-body').innerHTML = uniqueOrders.map((order) => `
      <tr>
        <td><span class="detail-store-name">${escapeHtml(storeName)}</span></td>
        <td><span class="order-number">${escapeHtml(order.orderId)}</span></td>
        <td><span class="order-destination ${order.destination || order.entry}" data-destination="${ORDER_DESTINATIONS[order.destination || order.entry].enumValue}">${orderDestinationLabel(order)}</span></td>
        <td><span class="participation-badge ${order.status}">${order.status === 'frozen' ? '冻结中' : '已参与'}</span></td>
      </tr>`).join('');
  };

  const openOrderDetails = (ruleId, storeId, trigger) => {
    const rule = rules.find((item) => item.id === ruleId);
    if (!rule) return;
    orderReturnFocus = trigger || document.activeElement;
    renderOrderDetails(rule, storeId);
    orderBackdrop.hidden = false;
    orderModal.hidden = false;
    syncBodyOverflow();
    window.requestAnimationFrame(() => $('#close-order').focus());
  };

  const closeOrderDetails = (restoreFocus = true) => {
    orderModal.hidden = true;
    orderBackdrop.hidden = true;
    syncBodyOverflow();
    if (restoreFocus && orderReturnFocus) orderReturnFocus.focus();
    orderReturnFocus = null;
  };

  const nextRuleId = (usedIds = new Set(rules.map((rule) => rule.id))) => {
    let sequence = 1;
    while (usedIds.has(`R-${String(sequence).padStart(3, '0')}`)) sequence += 1;
    const id = `R-${String(sequence).padStart(3, '0')}`;
    usedIds.add(id);
    return id;
  };

  const nextBatchId = () => {
    const date = new Date();
    const day = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    return `IMP-${day}-${String(importSequence++).padStart(3, '0')}`;
  };

  const nextActivationId = () => {
    const date = new Date();
    const day = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    return `ACT-${day}-${String(activationSequence++).padStart(3, '0')}`;
  };

  const parseDelimitedLine = (line, delimiter = ',') => {
    const cells = [];
    let cell = '';
    let quoted = false;
    for (let index = 0; index < line.length; index += 1) {
      const char = line[index];
      if (char === '"') {
        if (quoted && line[index + 1] === '"') {
          cell += '"';
          index += 1;
        } else {
          quoted = !quoted;
        }
      } else if (char === delimiter && !quoted) {
        cells.push(cell.trim());
        cell = '';
      } else {
        cell += char;
      }
    }
    cells.push(cell.trim());
    return cells;
  };

  const parseImportRows = (source) => {
    const errors = new Set();
    const rows = [];
    const batchOwners = new Map();
    const records = [];
    const layouts = new Set();
    let header = null;
    source.replace(/\r\n?/g, '\n').split('\n').forEach((rawLine, index) => {
      const line = rawLine.replace(/^\uFEFF/, '').trim();
      if (!line || line.startsWith('#')) return;
      const delimiter = line.includes('\t') ? '\t' : ',';
      const cells = parseDelimitedLine(line, delimiter);
      if (!records.length && (cells[0]?.includes('规则名称') || cells[1]?.includes('活动ID'))) {
        header = cells;
        return;
      }
      records.push({ line: index + 1, cells });
    });
    const legacyHeader = Boolean(header && header.length === 9 && !header.some((cell) => cell.includes('周')));

    if (!records.length) {
      return { rows, errors: ['未识别到有效数据行，请粘贴 CSV 或上传文件。'] };
    }

    records.forEach(({ line, cells: originalCells }) => {
      const cells = [...originalCells];
      while (cells.length > 12 && !cells[cells.length - 1]) cells.pop();
      if (cells.length > 12) {
        errors.add(`第 ${line} 行：字段数超过 12 列，请检查是否漏加引号。`);
        return;
      }
      if (header && !legacyHeader && cells.length < 11) {
        errors.add(`第 ${line} 行：字段数与新版表头不一致，请保留周次数空列后重试。`);
        return;
      }
      if (legacyHeader && cells.length > 9) {
        errors.add(`第 ${line} 行：旧版 9 列模板字段数不一致，请检查是否修改了表头。`);
        return;
      }
      const layout = (legacyHeader || !header) && (cells.length === 8 || cells.length === 9) ? 'legacy' : 'current';
      layouts.add(layout);
      let normalizedCells;
      if (layout === 'legacy') {
        const legacy = [...cells];
        while (legacy.length < 9) legacy.push('');
        normalizedCells = [legacy[0], legacy[1], legacy[2], '', legacy[3], legacy[4], '', legacy[5], legacy[6], '', legacy[7], legacy[8]];
      } else {
        while (cells.length < 12) cells.push('');
        normalizedCells = cells;
      }

      const [rawName, rawActivities, rawDailyTotal, rawWeeklyTotal, rawMonthlyTotal, rawDailyCabinet, rawWeeklyCabinet, rawMonthlyCabinet, rawDailyApp, rawWeeklyApp, rawMonthlyApp, rawStatus] = normalizedCells;
      const name = rawName.trim();
      if (name.length > 40) errors.add(`第 ${line} 行：规则名称不能超过 40 个字符。`);

      let status = 'enabled';
      const normalizedStatus = rawStatus.trim().toLowerCase();
      if (normalizedStatus && ['停用', '已停用', 'disabled', '否'].includes(normalizedStatus)) {
        status = 'disabled';
      } else if (normalizedStatus && !['启用', '启用中', 'enabled', '是'].includes(normalizedStatus)) {
        errors.add(`第 ${line} 行：状态“${rawStatus.trim()}”无法识别，可填写启用或停用。`);
      }

      const activityIds = rawActivities.split(/[|｜、;；]/).map((id) => id.trim().toUpperCase()).filter(Boolean);
      if (!activityIds.length) errors.add(`第 ${line} 行：活动 ID 集合不能为空。`);
      const seenInRow = new Set();
      activityIds.forEach((activityId) => {
        if (seenInRow.has(activityId)) {
          errors.add(`第 ${line} 行：活动 ID ${activityId} 在当前行重复。`);
          return;
        }
        seenInRow.add(activityId);
        if (!activityById(activityId)) {
          errors.add(`第 ${line} 行：活动 ID ${activityId} 不存在或不是换新活动。`);
          return;
        }
        const owner = status === 'enabled' ? ownerOfActivity(activityId) : null;
        if (owner) {
          errors.add(`第 ${line} 行：活动 ID ${activityId} 已被启用中/执行中规则 ${owner.id}“${displayName(owner)}”占用。`);
          return;
        }
        if (status === 'enabled') {
          const batchOwner = batchOwners.get(activityId);
          if (batchOwner) {
            errors.add(`第 ${line} 行：活动 ID ${activityId} 已在第 ${batchOwner} 行的启用配置中使用，活跃规则不能重复占用。`);
            return;
          }
          batchOwners.set(activityId, line);
        }
      });

      const readCount = (rawValue, label) => {
        const value = rawValue.trim();
        if (!value) return null;
        const number = Number(value);
        if (!Number.isSafeInteger(number) || number <= 0) {
          errors.add(`第 ${line} 行：${label}必须为大于 0 的整数。`);
          return null;
        }
        return number;
      };

      const dailyTotal = readCount(rawDailyTotal, '门店日总数量');
      const weeklyTotal = readCount(rawWeeklyTotal, '门店周总数量');
      const monthlyTotal = readCount(rawMonthlyTotal, '门店月总数量');
      const dailyCabinet = readCount(rawDailyCabinet, '柜机日次数');
      const weeklyCabinet = readCount(rawWeeklyCabinet, '柜机周次数');
      const monthlyCabinet = readCount(rawMonthlyCabinet, '柜机月次数');
      const dailyApp = readCount(rawDailyApp, 'App 日次数');
      const weeklyApp = readCount(rawWeeklyApp, 'App 周次数');
      const monthlyApp = readCount(rawMonthlyApp, 'App 月次数');

      const countFields = [dailyTotal, weeklyTotal, monthlyTotal, dailyCabinet, weeklyCabinet, monthlyCabinet, dailyApp, weeklyApp, monthlyApp];
      if (countFields.every((value) => value === null) && [rawDailyTotal, rawWeeklyTotal, rawMonthlyTotal, rawDailyCabinet, rawWeeklyCabinet, rawMonthlyCabinet, rawDailyApp, rawWeeklyApp, rawMonthlyApp].every((value) => !value.trim())) {
        errors.add(`第 ${line} 行：门店总次数及柜机/App次数共 9 项至少填写 1 项。`);
      }

      rows.push({ line, name, activities: activityIds, dailyTotal, weeklyTotal, monthlyTotal, dailyCabinet, weeklyCabinet, monthlyCabinet, dailyApp, weeklyApp, monthlyApp, status });
    });

    if (layouts.size > 1) errors.add('同一批次不能混用旧版 9 列模板和新版 12 列模板，请统一列结构后重新校验。');

    return { rows, errors: [...errors] };
  };

  const invalidateImportPreview = () => {
    pendingImport = null;
    confirmImportButton.disabled = true;
    importPreviewSection.hidden = true;
    importSummary.textContent = '';
    importSummary.className = 'import-summary';
    importErrors.hidden = true;
    importErrors.innerHTML = '';
    importTableWrap.hidden = true;
    importMore.hidden = true;
    importText.classList.remove('invalid');
    setError('#import-error');
    $('#import-hint').textContent = '支持粘贴 CSV 或上传文件；每行至少 1 项次数，校验通过后整批导入';
  };

  const renderImportPreview = (result) => {
    pendingImport = result;
    importPreviewSection.hidden = false;
    const hasErrors = result.errors.length > 0;
    const canImport = !hasErrors && result.rows.length > 0;
    confirmImportButton.disabled = !canImport;
    importText.classList.toggle('invalid', hasErrors);
    setError('#import-error', hasErrors ? `发现 ${result.errors.length} 个校验问题，请修正后重新校验。` : '');
    importSummary.className = `import-summary ${hasErrors ? 'error' : 'success'}`;
    importSummary.textContent = hasErrors
      ? `已解析 ${result.rows.length} 行，发现 ${result.errors.length} 个错误。为保证配置一致性，本次不会导入任何规则。`
      : `${result.rows.length} 条规则校验通过，可整批导入。`;

    importErrors.hidden = !hasErrors;
    importErrors.innerHTML = hasErrors
      ? `<ul>${result.errors.slice(0, 8).map((error) => `<li>${escapeHtml(error)}</li>`).join('')}</ul>${result.errors.length > 8 ? `<p>另有 ${result.errors.length - 8} 个问题未展开。</p>` : ''}`
      : '';

    const previewRows = result.rows.slice(0, 20);
    importTableWrap.hidden = !previewRows.length;
    importPreviewBody.innerHTML = previewRows.map((row) => `
      <tr>
        <td class="import-row-id">${row.line}</td>
        <td>${escapeHtml(row.name || '未命名（导入时生成）')}</td>
        <td>${escapeHtml(row.activities.join(' | ') || '—')}</td>
        <td>${row.dailyTotal ?? '不执行'} / ${row.weeklyTotal ?? '不执行'} / ${row.monthlyTotal ?? '不执行'}</td>
        <td>${row.dailyCabinet ?? '不执行'} / ${row.weeklyCabinet ?? '不执行'} / ${row.monthlyCabinet ?? '不执行'}</td>
        <td>${row.dailyApp ?? '不执行'} / ${row.weeklyApp ?? '不执行'} / ${row.monthlyApp ?? '不执行'}</td>
        <td>${row.status === 'enabled' ? '启用（执行中）' : '停用'}</td>
      </tr>`).join('');
    importMore.hidden = result.rows.length <= 20;
    importMore.textContent = result.rows.length > 20 ? `仅展示前 20 行，另有 ${result.rows.length - 20} 行待导入。` : '';
    $('#import-hint').textContent = hasErrors ? '修正错误后重新校验，整批通过才会导入' : `${result.rows.length} 条规则待导入，确认后整批写入`;
  };

  const previewImport = () => {
    const result = parseImportRows(importText.value);
    renderImportPreview(result);
    if (result.errors.length) {
      showErrorDialog('导入校验未通过', `发现 ${result.errors.length} 个校验问题，本批次不会写入任何规则。`, '详细行号和原因已列在导入抽屉，修正后请重新校验。');
    } else if (!result.rows.length) {
      showErrorDialog('导入校验未通过', '未解析到可导入的数据。', '请粘贴 CSV 内容或选择文件后重新校验。');
    }
  };

  const resetImportForm = () => {
    importText.value = '';
    importFile.value = '';
    invalidateImportPreview();
  };

  const closeImportDrawer = (reset = false) => {
    importDrawer.hidden = true;
    importBackdrop.hidden = true;
    if (reset) resetImportForm();
    syncBodyOverflow();
  };

  const openImportDrawer = () => {
    closeParticipation(false);
    closeOrderDetails(false);
    closeDrawer();
    closeLogDrawer();
    resetImportForm();
    importBackdrop.hidden = false;
    importDrawer.hidden = false;
    syncBodyOverflow();
    window.requestAnimationFrame(() => importText.focus());
  };

  const confirmImport = () => {
    const result = parseImportRows(importText.value);
    if (result.errors.length || !result.rows.length) {
      renderImportPreview(result);
      showErrorDialog(
        '导入未执行',
        result.errors.length ? `发现 ${result.errors.length} 个校验问题，本批次不会写入任何规则。` : '未解析到可导入的数据。',
        '详细行号和原因已列在导入抽屉，修正后请重新校验。'
      );
      return;
    }
    const batchId = nextBatchId();
    const usedIds = new Set(rules.map((rule) => rule.id));
    const pendingActivations = [];
    const importedRules = result.rows.map((row) => {
      const id = nextRuleId(usedIds);
      const shouldActivate = row.status === 'enabled';
      const activationBatchId = shouldActivate ? nextActivationId() : null;
      const rule = {
        id,
        name: row.name || `未命名次数规则 ${id}`,
        status: shouldActivate ? 'executing' : 'disabled',
        activities: [...row.activities],
        dailyTotal: row.dailyTotal,
        weeklyTotal: row.weeklyTotal,
        monthlyTotal: row.monthlyTotal,
        dailyCabinet: row.dailyCabinet,
        weeklyCabinet: row.weeklyCabinet,
        monthlyCabinet: row.monthlyCabinet,
        dailyApp: row.dailyApp,
        weeklyApp: row.weeklyApp,
        monthlyApp: row.monthlyApp,
        updated: '',
        updater: OPERATOR,
        logs: []
      };
      const log = makeLog('批量导入创建', createChanges(rule), `导入批次 ${batchId}`);
      const startLog = shouldActivate
        ? makeActivationStartLog(rule, `批量导入启用（${batchId}）`, rule.activities, activationBatchId, 'activation')
        : null;
      if (shouldActivate) {
        rule.initialization = {
          mode: 'activation',
          batchId: activationBatchId,
          trigger: `批量导入启用（${batchId}）`,
          activities: [...rule.activities]
        };
        pendingActivations.push({ ruleId: id, batchId: activationBatchId });
      }
      rule.logs = [startLog, log].filter(Boolean);
      rule.updated = rule.logs[0].time;
      return rule;
    });
    rules = [...importedRules, ...rules];
    pendingActivations.forEach(({ ruleId, batchId: activationBatchId }) => scheduleActivationCompletion(ruleId, activationBatchId));
    renderRules();
    closeImportDrawer(true);
    toast(`已通过 ${batchId} 导入 ${importedRules.length} 条规则；启用项已进入执行中，回放完成后自动启用。`);
  };

  const downloadTemplate = () => {
    const available = activities.filter((activity) => !ownerOfActivity(activity.id)).slice(0, 2);
    const rows = [IMPORT_HEADERS.join(',')];
    if (available[0]) rows.push(['导入示例规则 A', available[0].id, '', '', '', 8, 20, '', 12, 40, '', '启用'].join(','));
    if (available[1]) rows.push(['导入示例规则 B', available[1].id, '', 60, 200, '', '', '', '', '', '', '停用'].join(','));
    const blob = new Blob([`\uFEFF${rows.join('\n')}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = '换新活动次数限制-批量导入模板.csv';
    link.click();
    URL.revokeObjectURL(url);
    toast('批量导入模板已下载。');
  };

  const fillImportSample = () => {
    const available = activities.filter((activity) => !ownerOfActivity(activity.id)).slice(0, 2);
    if (!available.length) {
      showErrorDialog('无法填入示例', '当前已无未占用活动，无法生成可用的导入示例。', '请先停用或调整已占用活动，或手动填写 CSV 内容。');
      return;
    }
    const rows = [IMPORT_HEADERS.join(',')];
    rows.push(['导入示例规则 A', available[0].id, '', '', '', 8, 20, '', 12, 40, '', '启用'].join(','));
    if (available[1]) rows.push(['导入示例规则 B', available[1].id, '', 60, 200, '', '', '', '', '', '', '停用'].join(','));
    importText.value = rows.join('\n');
    invalidateImportPreview();
    previewImport();
  };

  $('#create-rule')?.addEventListener('click', () => openDrawer());
  $('#close-drawer')?.addEventListener('click', closeDrawer);
  $('#cancel-drawer')?.addEventListener('click', closeDrawer);
  backdrop?.addEventListener('click', closeDrawer);
  $('#open-import')?.addEventListener('click', openImportDrawer);
  $('#close-import-drawer')?.addEventListener('click', () => closeImportDrawer(true));
  $('#cancel-import')?.addEventListener('click', () => closeImportDrawer(true));
  importBackdrop?.addEventListener('click', () => closeImportDrawer(true));
  $('#close-log-drawer')?.addEventListener('click', closeLogDrawer);
  $('#close-log-footer')?.addEventListener('click', closeLogDrawer);
  logBackdrop?.addEventListener('click', closeLogDrawer);
  $('#close-participation')?.addEventListener('click', () => closeParticipation());
  $('#close-participation-footer')?.addEventListener('click', () => closeParticipation());
  participationBackdrop?.addEventListener('click', () => closeParticipation());
  $('#close-order')?.addEventListener('click', () => closeOrderDetails());
  $('#close-order-footer')?.addEventListener('click', () => closeOrderDetails());
  $('#back-to-participation')?.addEventListener('click', () => closeOrderDetails());
  orderBackdrop?.addEventListener('click', () => closeOrderDetails());
  $('#error-modal-confirm')?.addEventListener('click', closeErrorDialog);
  errorModal?.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab') return;
    event.preventDefault();
    $('#error-modal-confirm').focus();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (!errorModal.hidden) closeErrorDialog();
    else if (!orderModal.hidden) closeOrderDetails();
    else if (!participationModal.hidden) closeParticipation();
    else if (!logDrawer.hidden) closeLogDrawer();
    else if (!importDrawer.hidden) closeImportDrawer(true);
    else if (!drawer.hidden) closeDrawer();
  });
  form?.addEventListener('submit', saveRule);

  $('#rules-body')?.addEventListener('click', (event) => {
    const participationButton = event.target.closest('[data-participation]');
    if (participationButton) {
      openParticipation(participationButton.dataset.participation, participationButton);
      return;
    }
    const logButton = event.target.closest('[data-log]');
    if (logButton) {
      openLogDrawer(logButton.dataset.log);
      return;
    }
    const editButton = event.target.closest('[data-edit]');
    if (editButton) {
      const rule = rules.find((item) => item.id === editButton.dataset.edit);
      if (rule) openDrawer(rule);
      return;
    }
    const toggleButton = event.target.closest('[data-toggle]');
    if (toggleButton) toggleRule(toggleButton.dataset.toggle);
  });

  $('#participation-body')?.addEventListener('click', (event) => {
    const orderButton = event.target.closest('[data-orders]');
    if (orderButton) openOrderDetails(orderButton.dataset.orders, orderButton.dataset.storeId, orderButton);
  });

  searchInput?.addEventListener('input', renderRules);
  statusFilter?.addEventListener('change', renderRules);
  activitySearch?.addEventListener('input', renderActivityOptions);
  activitySearch?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      addActivity(activitySearch.value);
    }
  });
  $('#add-activity')?.addEventListener('click', () => addActivity(activitySearch.value));
  $('#activity-options')?.addEventListener('click', (event) => {
    const option = event.target.closest('[data-activity-option]');
    if (option && !option.disabled) addActivity(option.dataset.activityOption);
  });
  $('#selected-activities')?.addEventListener('click', (event) => {
    const remove = event.target.closest('[data-remove-activity]');
    if (!remove) return;
    formActivities = formActivities.filter((id) => id !== remove.dataset.removeActivity);
    renderSelectedActivities();
    renderActivityOptions();
    setError('#activity-error');
  });
  $$('input[name="rule-status"]').forEach((input) => {
    input.addEventListener('change', () => {
      setError('#activity-error');
      $('.activity-picker')?.classList.remove('invalid');
      renderActivityOptions();
    });
  });
  $$('.quota-field input[type="number"]').forEach((input) => {
    input.addEventListener('input', () => {
      input.closest('.number-wrap').classList.remove('invalid');
      setError('#limit-error');
    });
  });

  importText?.addEventListener('input', invalidateImportPreview);
  $('#preview-import')?.addEventListener('click', previewImport);
  confirmImportButton?.addEventListener('click', confirmImport);
  $('#download-template')?.addEventListener('click', downloadTemplate);
  $('#fill-import-sample')?.addEventListener('click', fillImportSample);
  importFile?.addEventListener('change', () => {
    const file = importFile.files?.[0];
    if (!file) return;
    file.text().then((text) => {
      importText.value = text;
      invalidateImportPreview();
      previewImport();
    }).catch(() => {
      showErrorDialog('文件读取失败', '无法读取所选 CSV 文件。', '请检查文件后重新选择，或直接粘贴 CSV 内容。');
    });
  });

  renderRules();
})();
