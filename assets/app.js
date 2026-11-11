(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const simulator = {
    used: { cabinet: 0, app: 0 },
    limits: { total: null, cabinet: 4, app: 8 }
  };

  const dom = {
    totalLimit: $('#total-limit'),
    cabinetLimit: $('#cabinet-limit'),
    appLimit: $('#app-limit'),
    totalUsed: $('#total-used'),
    totalRemaining: $('#total-remaining'),
    totalLimitView: $('#total-limit-view'),
    totalLimitRow: $('#total-limit-row'),
    totalUsedRow: $('#total-used-row'),
    cabinetUsed: $('#cabinet-used'),
    cabinetLimitView: $('#cabinet-limit-view'),
    cabinetRemaining: $('#cabinet-remaining'),
    appUsed: $('#app-used'),
    appLimitView: $('#app-limit-view'),
    appRemaining: $('#app-remaining'),
    totalProgress: $('#total-progress'),
    cabinetProgress: $('#cabinet-progress'),
    appProgress: $('#app-progress'),
    status: $('#usage-status'),
    message: $('#simulator-message')
  };

  const readLimit = (input) => {
    const value = Number.parseInt(input.value, 10);
    return Number.isFinite(value) && value > 0 ? value : null;
  };

  const updateProgress = (element, used, limit) => {
    if (limit === null) {
      element.querySelector('span').style.width = '0%';
      element.setAttribute('aria-valuemax', '1');
      element.setAttribute('aria-valuenow', '0');
      element.setAttribute('aria-valuetext', '不执行');
      element.classList.remove('warning', 'full');
      return;
    }
    const percent = Math.min(100, Math.max(0, (used / limit) * 100));
    element.querySelector('span').style.width = `${percent}%`;
    element.setAttribute('aria-valuemax', String(limit));
    element.setAttribute('aria-valuenow', String(used));
    element.setAttribute('aria-valuetext', `${used} / ${limit}`);
    element.classList.toggle('warning', percent >= 75 && percent < 100);
    element.classList.toggle('full', percent >= 100);
  };

  const isBlocked = (entry) => {
    const totalUsed = simulator.used.cabinet + simulator.used.app;
    const totalBlocked = simulator.limits.total !== null && totalUsed >= simulator.limits.total;
    const entryBlocked = simulator.limits[entry] !== null && simulator.used[entry] >= simulator.limits[entry];
    return totalBlocked || entryBlocked;
  };

  const setMessage = (text, type = '') => {
    dom.message.textContent = text;
    dom.message.className = `simulator-message ${type}`.trim();
  };

  const quotaBlockMessage = (entry) => entry === 'app'
    ? 'APP端办单限量开启，请移步柜机端办理。'
    : '活动数量已用完，请选择其他活动参与。';

  const renderSimulator = () => {
    simulator.limits.total = readLimit(dom.totalLimit);
    simulator.limits.cabinet = readLimit(dom.cabinetLimit);
    simulator.limits.app = readLimit(dom.appLimit);

    const totalUsed = simulator.used.cabinet + simulator.used.app;
    const totalRemaining = simulator.limits.total === null ? '—' : Math.max(0, simulator.limits.total - totalUsed);
    const cabinetRemaining = simulator.limits.cabinet === null ? '—' : Math.max(0, simulator.limits.cabinet - simulator.used.cabinet);
    const appRemaining = simulator.limits.app === null ? '—' : Math.max(0, simulator.limits.app - simulator.used.app);
    const configured = [simulator.limits.total, simulator.limits.cabinet, simulator.limits.app].some((limit) => limit !== null);
    const exhausted = configured && isBlocked('cabinet') && isBlocked('app');

    dom.totalUsed.textContent = totalUsed;
    dom.totalRemaining.textContent = totalRemaining;
    dom.totalLimitView.textContent = simulator.limits.total ?? '不执行';
    dom.totalLimitRow.textContent = simulator.limits.total ?? '不执行';
    dom.totalUsedRow.textContent = totalUsed;
    dom.cabinetUsed.textContent = simulator.used.cabinet;
    dom.cabinetLimitView.textContent = simulator.limits.cabinet ?? '不执行';
    dom.cabinetRemaining.textContent = cabinetRemaining;
    dom.appUsed.textContent = simulator.used.app;
    dom.appLimitView.textContent = simulator.limits.app ?? '不执行';
    dom.appRemaining.textContent = appRemaining;

    dom.status.textContent = !configured ? '待配置' : exhausted ? '活动数量已用完' : '可参与';
    dom.status.classList.toggle('blocked', exhausted);

    updateProgress(dom.totalProgress, totalUsed, simulator.limits.total);
    updateProgress(dom.cabinetProgress, simulator.used.cabinet, simulator.limits.cabinet);
    updateProgress(dom.appProgress, simulator.used.app, simulator.limits.app);
  };

  const simulate = (entry) => {
    renderSimulator();
    const label = entry === 'cabinet' ? '柜机' : 'App';
    const totalUsed = simulator.used.cabinet + simulator.used.app;
    const configured = [simulator.limits.total, simulator.limits.cabinet, simulator.limits.app].some((limit) => limit !== null);

    if (!configured) {
      setMessage('请至少填写 1 项日次数后再试算。', 'error');
      return;
    }

    if (simulator.limits.total !== null && totalUsed >= simulator.limits.total) {
      setMessage(`本次${label}进入顾客信息页被拦截：${quotaBlockMessage(entry)}`, 'error');
      return;
    }
    if (simulator.limits[entry] !== null && simulator.used[entry] >= simulator.limits[entry]) {
      setMessage(`本次${label}进入顾客信息页被拦截：${quotaBlockMessage(entry)}`, 'error');
      return;
    }

    simulator.used[entry] += 1;
    renderSimulator();

    const nextTotal = simulator.used.cabinet + simulator.used.app;
    if (simulator.limits.total !== null && nextTotal >= simulator.limits.total) {
      setMessage(`本次${label}成交已计入 1 次。门店总次数刚刚用完，柜机和 App 此后都会被拦截。`, 'success');
    } else if (simulator.limits.total === null) {
      setMessage(`本次${label}成交已计入 1 次。门店日总量未配置，仅按柜机/App 各自日次数独立统计。`, 'success');
    } else {
      setMessage(`本次${label}成交已计入 1 次，门店总次数同步 +1。`, 'success');
    }
  };

  const resetSimulator = () => {
    simulator.used.cabinet = 0;
    simulator.used.app = 0;
    dom.totalLimit.value = '';
    dom.cabinetLimit.value = 4;
    dom.appLimit.value = 8;
    renderSimulator();
    setMessage('示例已重置。可点击上方按钮开始试算。');
  };

  if (dom.totalLimit) {
    [dom.totalLimit, dom.cabinetLimit, dom.appLimit].forEach((input) => {
      input.addEventListener('change', renderSimulator);
    });
    $('#simulate-cabinet')?.addEventListener('click', () => simulate('cabinet'));
    $('#simulate-app')?.addEventListener('click', () => simulate('app'));
    $('#reset-simulator')?.addEventListener('click', resetSimulator);
    renderSimulator();
  }

  const toSafeId = (index) => `prd-section-${index}`;

  const buildToc = (content) => {
    const toc = $('#document-toc');
    const headings = $$('h2, h3', content);
    if (!toc || !headings.length) return;

    const fragment = document.createDocumentFragment();
    headings.forEach((heading, index) => {
      if (!heading.id) heading.id = toSafeId(index);
      const link = document.createElement('a');
      link.href = `#${heading.id}`;
      link.textContent = heading.textContent.trim();
      link.className = heading.tagName === 'H3' ? 'level-3' : 'level-2';
      fragment.appendChild(link);
    });
    toc.replaceChildren(fragment);

    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (!visible) return;
      $$('.document-toc a').forEach((link) => {
        link.classList.toggle('is-current', link.getAttribute('href') === `#${visible.target.id}`);
      });
    }, { rootMargin: '-88px 0px -70% 0px', threshold: 0 });
    headings.forEach((heading) => observer.observe(heading));
  };

  const loadPrd = async () => {
    const content = $('#document-content');
    if (!content) return;
    if (!window.marked?.parse) {
      content.innerHTML = '<p>Markdown 渲染组件加载失败，请使用页面上方“Markdown 原文”入口阅读。</p>';
      return;
    }

    try {
      const response = await fetch('prd.md', { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const markdown = await response.text();
      content.innerHTML = window.marked.parse(markdown, { gfm: true, breaks: false });
      $$('pre', content).forEach((block, index) => {
        block.tabIndex = 0;
        block.setAttribute('role', 'region');
        block.setAttribute('aria-label', `代码示例 ${index + 1}，可横向滚动`);
      });
      $$('table', content).forEach((table, index) => {
        table.tabIndex = 0;
        table.setAttribute('aria-label', `数据表格 ${index + 1}`);
      });
      buildToc(content);
    } catch (error) {
      content.innerHTML = '<p>PRD 正文加载失败，请使用页面上方“Markdown 原文”入口阅读。</p>';
      console.error('PRD load failed:', error);
    }
  };

  loadPrd();

  const topLinks = $$('.topnav a').filter((link) => link.getAttribute('href')?.startsWith('#'));
  const topSections = topLinks.map((link) => $(link.getAttribute('href'))).filter(Boolean);
  const updateTopNav = () => {
    const current = [...topSections].reverse().find((section) => section.getBoundingClientRect().top <= 120);
    topLinks.forEach((link) => link.classList.toggle('is-active', current && link.getAttribute('href') === `#${current.id}`));
  };
  window.addEventListener('scroll', updateTopNav, { passive: true });
  updateTopNav();

  const backToTop = $('#back-to-top');
  const updateBackToTop = () => backToTop?.classList.toggle('visible', window.scrollY > 900);
  window.addEventListener('scroll', updateBackToTop, { passive: true });
  backToTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  updateBackToTop();
})();
