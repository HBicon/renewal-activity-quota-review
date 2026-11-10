(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

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

  let rules = [
    { id: 'R-001', name: '双十一换新·门店限额', status: 'enabled', activities: ['ACT-20261101', 'ACT-20261103'], dailyTotal: 50, monthlyTotal: 800, dailyCabinet: 20, monthlyCabinet: 300, dailyApp: 40, monthlyApp: 600, updated: '2026-11-10 14:32', updater: '王运营' },
    { id: 'R-002', name: '月中换新·限额兜底', status: 'enabled', activities: ['ACT-20261105', 'ACT-20261108'], dailyTotal: 30, monthlyTotal: 500, dailyCabinet: 12, monthlyCabinet: 200, dailyApp: 25, monthlyApp: 400, updated: '2026-11-09 18:05', updater: '陈运营' },
    { id: 'R-003', name: '九月开学换新（已停用）', status: 'disabled', activities: ['ACT-20260901'], dailyTotal: 20, monthlyTotal: 260, dailyCabinet: 8, monthlyCabinet: 100, dailyApp: 16, monthlyApp: 180, updated: '2026-09-30 17:40', updater: '王运营' }
  ];

  let activeRuleId = null;
  let formActivities = [];
  const form = $('#rule-form');
  const drawer = $('#rule-drawer');
  const backdrop = $('#drawer-backdrop');
  const searchInput = $('#rule-search');
  const statusFilter = $('#status-filter');
  const activitySearch = $('#activity-search');

  const activityById = (id) => activities.find((activity) => activity.id === id);
  const ruleId = () => `R-${String(rules.length + 1).padStart(3, '0')}`;

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

  const updateMetrics = () => {
    const activitiesUsed = new Set(rules.flatMap((rule) => rule.activities));
    const overlap = rules.flatMap((rule) => rule.activities).filter((activityId) => rules.filter((rule) => rule.activities.includes(activityId)).length > 1);
    $('#metric-rules').textContent = rules.length;
    $('#metric-enabled').textContent = rules.filter((rule) => rule.status === 'enabled').length;
    $('#metric-activities').textContent = activitiesUsed.size;
    $('#metric-conflicts').textContent = new Set(overlap).size;
    $('#menu-rule-count').textContent = rules.length;
  };

  const dailyText = (value) => value ? `${value} / 日` : '不限';
  const monthlyText = (value) => value ? `${value} / 月` : '月度不限';

  const renderRules = () => {
    const query = searchInput.value.trim().toLowerCase();
    const status = statusFilter.value;
    const visibleRules = rules.filter((rule) => {
      const matchesStatus = status === 'all' || rule.status === status;
      const searchable = [rule.name, rule.id, ...rule.activities, ...rule.activities.map(formatActivity)].join(' ').toLowerCase();
      return matchesStatus && (!query || searchable.includes(query));
    });

    const body = $('#rules-body');
    body.innerHTML = visibleRules.map((rule) => {
      const tags = rule.activities.slice(0, 2).map((id) => `<span class="activity-tag" title="${escapeHtml(formatActivity(id))}">${escapeHtml(id)}</span>`).join('');
      const more = rule.activities.length > 2 ? `<span class="activity-tag more">+${rule.activities.length - 2}</span>` : '';
      const nextStatus = rule.status === 'enabled' ? 'disabled' : 'enabled';
      return `
        <tr data-rule-id="${rule.id}">
          <td><span class="rule-name">${escapeHtml(rule.name)}</span><span class="rule-code">${rule.id}</span></td>
          <td><div class="activity-tags">${tags}${more}</div></td>
          <td class="limit-cell"><strong>${dailyText(rule.dailyTotal)}</strong><small>${monthlyText(rule.monthlyTotal)}</small></td>
          <td class="limit-cell"><strong>${dailyText(rule.dailyCabinet)}</strong><small>${monthlyText(rule.monthlyCabinet)}</small></td>
          <td class="limit-cell"><strong>${dailyText(rule.dailyApp)}</strong><small>${monthlyText(rule.monthlyApp)}</small></td>
          <td><span class="status-text ${rule.status}">${rule.status === 'enabled' ? '启用中' : '已停用'}</span></td>
          <td class="update-cell">${rule.updated}<br>${escapeHtml(rule.updater)}</td>
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
      const state = selected ? '已添加' : owner ? `已被“${owner.name}”占用` : '可添加';
      return `<button class="activity-option" type="button" role="option" data-activity-option="${activity.id}" ${disabled ? 'disabled' : ''}><code>${activity.id}</code><span class="option-name">${escapeHtml(activity.name)} · ${activity.period}</span><span class="option-state ${owner ? 'occupied' : ''}">${escapeHtml(state)}</span></button>`;
    }).join('');
  };

  const resetForm = () => {
    form.reset();
    formActivities = [];
    setError('#name-error');
    setError('#activity-error');
    setError('#limit-error');
    $('#rule-name').classList.remove('invalid');
    $('.activity-picker')?.classList.remove('invalid');
    activitySearch.value = '';
    $$('.quota-field input[type="number"]').forEach((input) => input.closest('.number-wrap').classList.remove('invalid'));
    $$('.quota-field').forEach((field) => {
      const checkbox = $('input[type="checkbox"]', field);
      const number = $('input[type="number"]', field);
      checkbox.checked = true;
      number.disabled = false;
      field.classList.remove('disabled');
    });
    $('#save-hint').textContent = '请完整填写必填项';
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
    form.elements.dailyCabinet.value = rule.dailyCabinet;
    form.elements.monthlyCabinet.value = rule.monthlyCabinet;
    form.elements.dailyApp.value = rule.dailyApp;
    form.elements.monthlyApp.value = rule.monthlyApp;
    renderSelectedActivities();
    renderActivityOptions();
  };

  const openDrawer = (rule = null) => {
    activeRuleId = rule?.id || null;
    resetForm();
    if (rule) {
      fillForm(rule);
      $('#drawer-title').textContent = '编辑限制规则';
      $('#drawer-subtitle').textContent = `正在编辑 ${rule.id}，活动占用校验会排除当前规则。`;
    } else {
      $('#drawer-title').textContent = '新建限制规则';
      $('#drawer-subtitle').textContent = '配置活动集合与门店次数额度。';
    }
    backdrop.hidden = false;
    drawer.hidden = false;
    document.body.style.overflow = 'hidden';
    window.requestAnimationFrame(() => $('#rule-name').focus());
  };

  const closeDrawer = () => {
    drawer.hidden = true;
    backdrop.hidden = true;
    document.body.style.overflow = '';
    activeRuleId = null;
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
      setError('#activity-error', `活动 ${normalized} 已配置在“${owner.name}”中，同一活动不能重复配置。`);
      $('.activity-picker')?.classList.add('invalid');
      return;
    }
    formActivities.push(normalized);
    activitySearch.value = '';
    renderSelectedActivities();
    renderActivityOptions();
    setError('#activity-error');
    $('.activity-picker')?.classList.remove('invalid');
    $('#save-hint').textContent = '活动已添加，可继续配置额度';
  };

  const collectQuotas = () => {
    const quotas = {};
    let enabledCount = 0;
    let invalid = false;
    $$('.quota-field').forEach((field) => {
      const key = field.dataset.quota;
      const checkbox = $('input[type="checkbox"]', field);
      const number = $('input[type="number"]', field);
      const wrap = number.closest('.number-wrap');
      wrap.classList.remove('invalid');
      if (!checkbox.checked) {
        quotas[key] = null;
        return;
      }
      enabledCount += 1;
      const value = Number(number.value);
      if (!Number.isInteger(value) || value <= 0) {
        invalid = true;
        wrap.classList.add('invalid');
      }
      quotas[key] = value;
    });
    return { quotas, enabledCount, invalid };
  };

  const validateForm = () => {
    let valid = true;
    const name = $('#rule-name').value.trim();
    setError('#name-error');
    $('#rule-name').classList.remove('invalid');
    if (!name) {
      setError('#name-error', '请输入规则名称。');
      $('#rule-name').classList.add('invalid');
      valid = false;
    }
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
      setError('#activity-error', `活动 ${duplicate} 已配置在“${owner.name}”中，同一活动不能重复配置。`);
      $('.activity-picker')?.classList.add('invalid');
      valid = false;
    }
    const quotaResult = collectQuotas();
    setError('#limit-error');
    if (!quotaResult.enabledCount) {
      setError('#limit-error', '至少启用 1 项次数额度。');
      valid = false;
    } else if (quotaResult.invalid) {
      setError('#limit-error', '已启用的额度必须填写大于 0 的整数。');
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
    const payload = {
      id: activeRuleId || ruleId(),
      name: $('#rule-name').value.trim(),
      status,
      activities: [...formActivities],
      ...quotas,
      updated: '刚刚',
      updater: '运营管理员'
    };
    if (activeRuleId) {
      rules = rules.map((rule) => rule.id === activeRuleId ? payload : rule);
      toast(`已更新“${payload.name}”。`);
    } else {
      rules = [payload, ...rules];
      toast(`已创建“${payload.name}”，${status === 'enabled' ? '立即启用' : '当前为停用'}。`);
    }
    renderRules();
    closeDrawer();
  };

  const toggleRule = (id) => {
    const rule = rules.find((item) => item.id === id);
    if (!rule) return;
    rule.status = rule.status === 'enabled' ? 'disabled' : 'enabled';
    rule.updated = '刚刚';
    rule.updater = '运营管理员';
    renderRules();
    toast(`“${rule.name}”已${rule.status === 'enabled' ? '启用' : '停用'}。`);
  };

  $('#create-rule')?.addEventListener('click', () => openDrawer());
  $('#close-drawer')?.addEventListener('click', closeDrawer);
  $('#cancel-drawer')?.addEventListener('click', closeDrawer);
  backdrop?.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !drawer.hidden) closeDrawer();
  });
  form?.addEventListener('submit', saveRule);

  $('#rules-body')?.addEventListener('click', (event) => {
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
  $$('.quota-field input[type="checkbox"]').forEach((checkbox) => {
    checkbox.addEventListener('change', () => {
      const field = checkbox.closest('.quota-field');
      const number = $('input[type="number"]', field);
      number.disabled = !checkbox.checked;
      field.classList.toggle('disabled', !checkbox.checked);
    });
  });
  $$('.demo-link').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      toast('当前原型仅实现“换新活动次数限制”配置。');
    });
  });

  renderRules();
})();
