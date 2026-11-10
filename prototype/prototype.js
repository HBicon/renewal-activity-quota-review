(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const OPERATOR = '运营管理员';
  const STATUS_LABELS = { enabled: '启用中', disabled: '已停用' };
  const IMPORT_HEADERS = ['规则名称', '活动ID集合', '门店日总数量', '门店月总数量', '柜机日次数', '柜机月次数', 'App日次数', 'App月次数', '状态'];
  const FIELD_DEFS = [
    { key: 'activities', label: '活动 ID 集合' },
    { key: 'dailyTotal', label: '门店日总数量' },
    { key: 'monthlyTotal', label: '门店月总数量' },
    { key: 'dailyCabinet', label: '柜机日次数' },
    { key: 'monthlyCabinet', label: '柜机月次数' },
    { key: 'dailyApp', label: 'App 日次数' },
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

  const seedLogs = {
    'R-001': [
      {
        id: 'LOG-R001-002', action: '编辑规则', operator: '王运营', time: '2026-11-10 14:32', note: '双十一活动首日结束后上调门店总次数',
        changes: [
          { field: '门店日总数量', before: '40 次', after: '50 次' },
          { field: '柜机日次数', before: '15 次', after: '20 次' }
        ]
      },
      {
        id: 'LOG-R001-001', action: '创建规则', operator: '王运营', time: '2026-11-08 10:20', note: '',
        changes: [
          { field: '活动 ID 集合', before: '—', after: 'ACT-20261101、ACT-20261103' },
          { field: '门店日总数量', before: '—', after: '40 次' },
          { field: '门店月总数量', before: '—', after: '800 次' },
          { field: '状态', before: '—', after: '启用中' }
        ]
      }
    ],
    'R-002': [
      {
        id: 'LOG-R002-002', action: '编辑规则', operator: '陈运营', time: '2026-11-09 18:05', note: '取消柜机月次数限制，保留柜机日次数限制',
        changes: [{ field: '柜机月次数', before: '200 次', after: '不执行' }]
      },
      {
        id: 'LOG-R002-001', action: '创建规则', operator: '陈运营', time: '2026-11-05 09:40', note: '',
        changes: [
          { field: '活动 ID 集合', before: '—', after: 'ACT-20261105、ACT-20261108' },
          { field: '门店日总数量', before: '—', after: '30 次' },
          { field: '门店月总数量', before: '—', after: '500 次' },
          { field: '柜机月次数', before: '—', after: '200 次' },
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
    ]
  };

  let rules = [
    { id: 'R-001', name: '双十一换新·门店次数', status: 'enabled', activities: ['ACT-20261101', 'ACT-20261103'], dailyTotal: 50, monthlyTotal: 800, dailyCabinet: 20, monthlyCabinet: 300, dailyApp: 40, monthlyApp: 600, updated: '2026-11-10 14:32', updater: '王运营', logs: seedLogs['R-001'] },
    { id: 'R-002', name: '月中换新·次数兜底', status: 'enabled', activities: ['ACT-20261105', 'ACT-20261108'], dailyTotal: 30, monthlyTotal: 500, dailyCabinet: 12, monthlyCabinet: null, dailyApp: 25, monthlyApp: 400, updated: '2026-11-09 18:05', updater: '陈运营', logs: seedLogs['R-002'] },
    { id: 'R-003', name: '九月开学换新（已停用）', status: 'disabled', activities: ['ACT-20260901'], dailyTotal: 20, monthlyTotal: 260, dailyCabinet: null, monthlyCabinet: null, dailyApp: 16, monthlyApp: 180, updated: '2026-09-30 17:40', updater: '王运营', logs: seedLogs['R-003'] }
  ];

  let activeRuleId = null;
  let formActivities = [];
  let pendingImport = null;
  let logSequence = 100;
  let importSequence = 1;

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

  const activityById = (id) => activities.find((activity) => activity.id === id);
  const displayName = (rule) => rule.name?.trim() || `未命名次数规则 ${rule.id}`;
  const statusLabel = (status) => STATUS_LABELS[status] || STATUS_LABELS.enabled;
  const ownerOfActivity = (activityId, excludeRuleId = null) => rules.find((rule) => rule.id !== excludeRuleId && rule.activities.includes(activityId));

  const formatActivity = (id) => {
    const activity = activityById(id);
    return activity ? activity.name : '活动已失效';
  };

  const escapeHtml = (value) => String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  const toast = (message, type = 'success') => {
    const region = $('#toast-region');
    const node = document.createElement('div');
    node.className = `toast ${type}`;
    node.textContent = message;
    region.appendChild(node);
    window.setTimeout(() => node.remove(), 3600);
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

  const makeLog = (action, changes, note = '') => ({
    id: `LOG-${String(++logSequence).padStart(4, '0')}`,
    action,
    operator: OPERATOR,
    time: nowText(),
    note,
    changes
  });

  const summarizeLog = (log) => {
    if (!log?.changes?.length) return '无字段变化';
    const items = log.changes.slice(0, 2).map((change) => `${change.field} ${change.before} → ${change.after}`);
    return `${items.join('；')}${log.changes.length > 2 ? `；等 ${log.changes.length} 项` : ''}`;
  };

  const updateMetrics = () => {
    const activitiesUsed = new Set(rules.flatMap((rule) => rule.activities));
    const overlap = rules.flatMap((rule) => rule.activities).filter((activityId) => rules.filter((rule) => rule.activities.includes(activityId)).length > 1);
    $('#metric-rules').textContent = rules.length;
    $('#metric-enabled').textContent = rules.filter((rule) => rule.status === 'enabled').length;
    $('#metric-activities').textContent = activitiesUsed.size;
    $('#metric-conflicts').textContent = new Set(overlap).size;
    $('#menu-rule-count').textContent = rules.length;
  };

  const dailyText = (value) => value ? `${value} / 日` : '不执行';
  const monthlyText = (value) => value ? `${value} / 月` : '不执行';

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
      const latestLog = rule.logs?.[0];
      const logCount = rule.logs?.length || 0;
      const logCell = latestLog ? `
        <button class="log-summary" type="button" data-log="${rule.id}" aria-label="查看“${escapeHtml(displayName(rule))}”的操作日志">
          <span class="log-summary-head"><strong>${escapeHtml(latestLog.action)}</strong><time>${escapeHtml(latestLog.time)}</time></span>
          <span class="log-summary-change">${escapeHtml(summarizeLog(latestLog))}</span>
          <span class="log-summary-link">查看全部 ${logCount} 条</span>
        </button>` : '<span class="update-cell">暂无日志</span>';
      return `
        <tr data-rule-id="${rule.id}">
          <td><span class="rule-name">${escapeHtml(displayName(rule))}</span><span class="rule-code">${rule.id}</span></td>
          <td><div class="activity-tags">${tags}${more}</div></td>
          <td class="limit-cell"><strong>${dailyText(rule.dailyTotal)}</strong><small>${monthlyText(rule.monthlyTotal)}</small></td>
          <td class="limit-cell"><strong>${dailyText(rule.dailyCabinet)}</strong><small>${monthlyText(rule.monthlyCabinet)}</small></td>
          <td class="limit-cell"><strong>${dailyText(rule.dailyApp)}</strong><small>${monthlyText(rule.monthlyApp)}</small></td>
          <td><span class="status-text ${rule.status}">${statusLabel(rule.status)}</span></td>
          <td>${logCell}</td>
          <td class="actions-col"><div class="row-actions"><button class="link-button" type="button" data-edit="${rule.id}">编辑</button><button class="link-button ${nextStatus === 'disabled' ? 'danger' : ''}" type="button" data-toggle="${rule.id}">${nextStatus === 'disabled' ? '停用' : '启用'}</button></div></td>
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
    const hasOpenDialog = [drawer, importDrawer, logDrawer].some((node) => node && !node.hidden);
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
      const disabled = selected || Boolean(owner);
      const state = selected ? '已添加' : owner ? `已被“${displayName(owner)}”占用` : '可添加';
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
    $('#save-hint').textContent = '活动 ID 集合、门店日总数量、门店月总数量为必填项';
    renderSelectedActivities();
    renderActivityOptions();
  };

  const fillForm = (rule) => {
    resetForm();
    formActivities = [...rule.activities];
    $('#rule-name').value = rule.name;
    const status = $(`input[name="rule-status"][value="${rule.status}"]`);
    if (status) status.checked = true;
    form.elements.dailyTotal.value = rule.dailyTotal;
    form.elements.monthlyTotal.value = rule.monthlyTotal;
    form.elements.dailyCabinet.value = rule.dailyCabinet ?? '';
    form.elements.monthlyCabinet.value = rule.monthlyCabinet ?? '';
    form.elements.dailyApp.value = rule.dailyApp ?? '';
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
    closeLogDrawer();
    closeImportDrawer(true);
    activeRuleId = rule?.id || null;
    resetForm();
    if (rule) {
      fillForm(rule);
      $('#drawer-title').textContent = '编辑限制规则';
      $('#drawer-subtitle').textContent = `正在编辑 ${rule.id}，活动占用校验会排除当前规则。`;
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
    const owner = ownerOfActivity(normalized, activeRuleId);
    if (owner) {
      setError('#activity-error', `活动 ${normalized} 已配置在“${displayName(owner)}”中，同一活动不能重复配置。`);
      $('.activity-picker')?.classList.add('invalid');
      return;
    }
    formActivities.push(normalized);
    activitySearch.value = '';
    renderSelectedActivities();
    renderActivityOptions();
    setError('#activity-error');
    $('.activity-picker')?.classList.remove('invalid');
    $('#save-hint').textContent = '活动已添加，请继续填写门店日/月总数量';
  };

  const collectQuotas = () => {
    const quotas = {};
    let missingRequired = false;
    let invalid = false;
    $$('.quota-field').forEach((field) => {
      const key = field.dataset.quota;
      const number = $('input[type="number"]', field);
      const wrap = number.closest('.number-wrap');
      wrap.classList.remove('invalid');
      const rawValue = number.value.trim();
      if (!rawValue) {
        if (field.dataset.required === 'true') {
          missingRequired = true;
          wrap.classList.add('invalid');
        }
        quotas[key] = null;
        return;
      }
      const value = Number(rawValue);
      if (!Number.isInteger(value) || value <= 0) {
        invalid = true;
        wrap.classList.add('invalid');
      }
      quotas[key] = value;
    });
    return { quotas, missingRequired, invalid };
  };

  const validateForm = () => {
    let valid = true;
    setError('#activity-error');
    $('.activity-picker')?.classList.remove('invalid');
    if (!formActivities.length) {
      setError('#activity-error', '至少配置 1 个活动 ID。');
      $('.activity-picker')?.classList.add('invalid');
      valid = false;
    }
    const duplicate = formActivities.find((id) => ownerOfActivity(id, activeRuleId));
    if (duplicate) {
      const owner = ownerOfActivity(duplicate, activeRuleId);
      setError('#activity-error', `活动 ${duplicate} 已配置在“${displayName(owner)}”中，同一活动不能重复配置。`);
      $('.activity-picker')?.classList.add('invalid');
      valid = false;
    }
    const quotaResult = collectQuotas();
    setError('#limit-error');
    if (quotaResult.missingRequired) {
      setError('#limit-error', '活动 ID 集合、门店日总数量、门店月总数量为必填项。');
      valid = false;
    } else if (quotaResult.invalid) {
      setError('#limit-error', '已填写的次数必须为大于 0 的整数；未填写的入口次数不执行。');
      valid = false;
    }
    if (!valid) {
      $('#save-hint').textContent = '请修正标红项后再保存';
      toast('配置未保存，请检查必填项与活动占用冲突。', 'error');
    }
    return valid;
  };

  const saveRule = (event) => {
    event.preventDefault();
    if (!validateForm()) return;
    const quotas = collectQuotas().quotas;
    const status = $('input[name="rule-status"]:checked')?.value || 'enabled';
    const id = activeRuleId || nextRuleId();
    const name = $('#rule-name').value.trim() || `未命名次数规则 ${id}`;
    const previousRule = rules.find((rule) => rule.id === activeRuleId);
    const payload = {
      id,
      name,
      status,
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
    payload.updated = log.time;
    payload.logs = [log, ...(previousRule?.logs || [])];
    if (previousRule) {
      rules = rules.map((rule) => rule.id === activeRuleId ? payload : rule);
      toast(`已更新“${payload.name}”，变更已写入操作日志。`);
    } else {
      rules = [payload, ...rules];
      toast(`已创建“${payload.name}”，并记录初始配置日志。`);
    }
    renderRules();
    closeDrawer();
  };

  const toggleRule = (id) => {
    const rule = rules.find((item) => item.id === id);
    if (!rule) return;
    const before = rule.status;
    rule.status = rule.status === 'enabled' ? 'disabled' : 'enabled';
    const log = makeLog(rule.status === 'enabled' ? '启用规则' : '停用规则', [{
      field: '状态',
      before: statusLabel(before),
      after: statusLabel(rule.status)
    }], '启停只影响后续新订单，历史计数和活动占用关系保持不变。');
    rule.logs = [log, ...(rule.logs || [])];
    rule.updated = log.time;
    rule.updater = OPERATOR;
    renderRules();
    toast(`“${displayName(rule)}”已${rule.status === 'enabled' ? '启用' : '停用'}，变更已写入操作日志。`);
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
    closeDrawer();
    closeImportDrawer(true);
    renderRuleLogs(rule);
    logBackdrop.hidden = false;
    logDrawer.hidden = false;
    syncBodyOverflow();
    window.requestAnimationFrame(() => $('#close-log-drawer').focus());
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
    source.replace(/\r\n?/g, '\n').split('\n').forEach((rawLine, index) => {
      const line = rawLine.replace(/^\uFEFF/, '').trim();
      if (!line || line.startsWith('#')) return;
      const delimiter = line.includes('\t') ? '\t' : ',';
      const cells = parseDelimitedLine(line, delimiter);
      if (!records.length && (cells[0]?.includes('规则名称') || cells[1]?.includes('活动ID'))) return;
      records.push({ line: index + 1, cells });
    });

    if (!records.length) {
      return { rows, errors: ['未识别到有效数据行，请粘贴 CSV 或上传文件。'] };
    }

    records.forEach(({ line, cells: originalCells }) => {
      const cells = [...originalCells];
      while (cells.length > 9 && !cells[cells.length - 1]) cells.pop();
      if (cells.length > 9) {
        errors.add(`第 ${line} 行：字段数超过 9 列，请检查是否漏加引号。`);
        return;
      }
      while (cells.length < 9) cells.push('');

      const [rawName, rawActivities, rawDailyTotal, rawMonthlyTotal, rawDailyCabinet, rawMonthlyCabinet, rawDailyApp, rawMonthlyApp, rawStatus] = cells;
      const name = rawName.trim();
      if (name.length > 40) errors.add(`第 ${line} 行：规则名称不能超过 40 个字符。`);

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
        const owner = ownerOfActivity(activityId);
        if (owner) {
          errors.add(`第 ${line} 行：活动 ID ${activityId} 已归属 ${owner.id}“${displayName(owner)}”，不能重复配置。`);
          return;
        }
        const batchOwner = batchOwners.get(activityId);
        if (batchOwner) {
          errors.add(`第 ${line} 行：活动 ID ${activityId} 已在第 ${batchOwner} 行使用，同一活动不能重复配置。`);
          return;
        }
        batchOwners.set(activityId, line);
      });

      const readCount = (rawValue, label, required) => {
        const value = rawValue.trim();
        if (!value) {
          if (required) errors.add(`第 ${line} 行：${label}不能为空。`);
          return null;
        }
        const number = Number(value);
        if (!Number.isInteger(number) || number <= 0) {
          errors.add(`第 ${line} 行：${label}必须为大于 0 的整数。`);
          return null;
        }
        return number;
      };

      const dailyTotal = readCount(rawDailyTotal, '门店日总数量', true);
      const monthlyTotal = readCount(rawMonthlyTotal, '门店月总数量', true);
      const dailyCabinet = readCount(rawDailyCabinet, '柜机日次数', false);
      const monthlyCabinet = readCount(rawMonthlyCabinet, '柜机月次数', false);
      const dailyApp = readCount(rawDailyApp, 'App 日次数', false);
      const monthlyApp = readCount(rawMonthlyApp, 'App 月次数', false);

      let status = 'enabled';
      const normalizedStatus = rawStatus.trim().toLowerCase();
      if (normalizedStatus && ['停用', '已停用', 'disabled', '否'].includes(normalizedStatus)) {
        status = 'disabled';
      } else if (normalizedStatus && !['启用', '启用中', 'enabled', '是'].includes(normalizedStatus)) {
        errors.add(`第 ${line} 行：状态“${rawStatus.trim()}”无法识别，可填写启用或停用。`);
      }

      rows.push({ line, name, activities: activityIds, dailyTotal, monthlyTotal, dailyCabinet, monthlyCabinet, dailyApp, monthlyApp, status });
    });

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
    $('#import-hint').textContent = '支持粘贴 CSV 或上传文件，校验通过后整批导入';
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
        <td>${row.dailyTotal ?? '缺失'} / ${row.monthlyTotal ?? '缺失'}</td>
        <td>${row.dailyCabinet ?? '—'} / ${row.monthlyCabinet ?? '—'}</td>
        <td>${row.dailyApp ?? '—'} / ${row.monthlyApp ?? '—'}</td>
        <td>${statusLabel(row.status)}</td>
      </tr>`).join('');
    importMore.hidden = result.rows.length <= 20;
    importMore.textContent = result.rows.length > 20 ? `仅展示前 20 行，另有 ${result.rows.length - 20} 行待导入。` : '';
    $('#import-hint').textContent = hasErrors ? '修正错误后重新校验，整批通过才会导入' : `${result.rows.length} 条规则待导入，确认后整批写入`;
  };

  const previewImport = () => {
    const result = parseImportRows(importText.value);
    renderImportPreview(result);
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
      toast('批量导入未执行，请先修正校验问题。', 'error');
      return;
    }
    const batchId = nextBatchId();
    const usedIds = new Set(rules.map((rule) => rule.id));
    const importedRules = result.rows.map((row) => {
      const id = nextRuleId(usedIds);
      const rule = {
        id,
        name: row.name || `未命名次数规则 ${id}`,
        status: row.status,
        activities: [...row.activities],
        dailyTotal: row.dailyTotal,
        monthlyTotal: row.monthlyTotal,
        dailyCabinet: row.dailyCabinet,
        monthlyCabinet: row.monthlyCabinet,
        dailyApp: row.dailyApp,
        monthlyApp: row.monthlyApp,
        updated: '',
        updater: OPERATOR,
        logs: []
      };
      const log = makeLog('批量导入创建', createChanges(rule), `导入批次 ${batchId}`);
      rule.updated = log.time;
      rule.logs = [log];
      return rule;
    });
    rules = [...importedRules, ...rules];
    renderRules();
    closeImportDrawer(true);
    toast(`已通过 ${batchId} 导入 ${importedRules.length} 条规则，并写入操作日志。`);
  };

  const downloadTemplate = () => {
    const available = activities.filter((activity) => !ownerOfActivity(activity.id)).slice(0, 2);
    const rows = [IMPORT_HEADERS.join(',')];
    if (available[0]) rows.push(`导入示例规则 A,${available[0].id},20,200,8,,12,,启用`);
    if (available[1]) rows.push(`导入示例规则 B,${available[1].id},10,100,,,6,60,停用`);
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
      toast('当前已无未占用活动，无法填入可用示例。', 'error');
      return;
    }
    const rows = [IMPORT_HEADERS.join(',')];
    rows.push(`导入示例规则 A,${available[0].id},20,200,8,,12,,启用`);
    if (available[1]) rows.push(`导入示例规则 B,${available[1].id},10,100,,,6,60,停用`);
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
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (!logDrawer.hidden) closeLogDrawer();
    else if (!importDrawer.hidden) closeImportDrawer(true);
    else if (!drawer.hidden) closeDrawer();
  });
  form?.addEventListener('submit', saveRule);

  $('#rules-body')?.addEventListener('click', (event) => {
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
      toast('文件读取失败，请重新选择 CSV 文件。', 'error');
    });
  });

  renderRules();
})();
