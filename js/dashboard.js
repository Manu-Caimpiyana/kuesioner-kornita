/* ================================================
   DASHBOARD LOGIC
   Load data, compute statistics, render donut charts
   ================================================ */

(function () {
  'use strict';

  const questions = APP_CONFIG.QUESTIONS;

  // ── Chart Color Palette (purple gradient) ──
  const CHART_COLORS = [
    '#E0D6F0', // 1 — Sangat Tidak Setuju (lightest)
    '#AA97D3', // 2 — Tidak Setuju
    '#7254AD', // 3 — Setuju
    '#3D2766', // 4 — Sangat Setuju (darkest)
  ];

  const CHART_LABELS = [
    APP_CONFIG.SCALE[1],
    APP_CONFIG.SCALE[2],
    APP_CONFIG.SCALE[3],
    APP_CONFIG.SCALE[4],
  ];

  // ── DOM Elements ──
  const statTotal = document.getElementById('stat-total');
  const statAvg = document.getElementById('stat-avg');
  const statHighest = document.getElementById('stat-highest');
  const statLowest = document.getElementById('stat-lowest');
  const chartsGrid = document.getElementById('charts-grid');

  // ── Compute Statistics ──

  function computeStats(responses) {
    const totalResponses = responses.length;

    if (totalResponses === 0) {
      return {
        total: 0,
        avgOverall: 0,
        highest: { index: -1, avg: 0 },
        lowest: { index: -1, avg: 0 },
        perQuestion: [],
      };
    }

    const questionCount = questions.length;
    const perQuestion = [];

    for (let i = 0; i < questionCount; i++) {
      const key = 'q' + (i + 1);
      const distribution = { 1: 0, 2: 0, 3: 0, 4: 0 };
      let sum = 0;
      let count = 0;

      responses.forEach(function (r) {
        const val = r.answers && r.answers[key];
        if (val >= APP_CONFIG.SCALE_MIN && val <= APP_CONFIG.SCALE_MAX) {
          distribution[val]++;
          sum += val;
          count++;
        }
      });

      const avg = count > 0 ? sum / count : 0;

      perQuestion.push({
        index: i,
        key: key,
        distribution: distribution,
        avg: avg,
        count: count,
      });
    }

    // Overall average
    let totalSum = 0;
    let totalCount = 0;
    perQuestion.forEach(function (q) {
      totalSum += q.avg * q.count;
      totalCount += q.count;
    });
    const avgOverall = totalCount > 0 ? totalSum / totalCount : 0;

    // Highest and lowest average question
    let highest = perQuestion[0];
    let lowest = perQuestion[0];
    perQuestion.forEach(function (q) {
      if (q.avg > highest.avg) highest = q;
      if (q.avg < lowest.avg) lowest = q;
    });

    return {
      total: totalResponses,
      avgOverall: avgOverall,
      highest: highest,
      lowest: lowest,
      perQuestion: perQuestion,
    };
  }

  // ── Render Stats Cards ──

  function renderStats(stats) {
    statTotal.textContent = stats.total;
    statAvg.textContent = stats.avgOverall.toFixed(2);

    if (stats.total > 0) {
      statHighest.textContent = 'P' + (stats.highest.index + 1) + ' (' + stats.highest.avg.toFixed(2) + ')';
      statLowest.textContent = 'P' + (stats.lowest.index + 1) + ' (' + stats.lowest.avg.toFixed(2) + ')';
    } else {
      statHighest.textContent = '-';
      statLowest.textContent = '-';
    }
  }

  // ── Render Charts ──

  function renderCharts(stats) {
    chartsGrid.innerHTML = '';

    if (stats.total === 0) {
      chartsGrid.innerHTML =
        '<div class="dashboard-empty">' +
        '<div class="dashboard-empty__icon">📋</div>' +
        '<p class="dashboard-empty__text">Belum ada data responden. Bagikan link kuesioner kepada siswa untuk mulai mengumpulkan data.</p>' +
        '</div>';
      return;
    }

    stats.perQuestion.forEach(function (q) {
      const num = q.index + 1;
      const canvasId = 'chart-' + num;

      const card = document.createElement('div');
      card.className = 'chart-card';
      card.innerHTML =
        '<div class="chart-card__title">' + num + '. ' + questions[q.index] + '</div>' +
        '<div class="chart-card__canvas-wrapper">' +
        '<canvas id="' + canvasId + '"></canvas>' +
        '</div>' +
        '<div class="chart-card__avg">Rata-rata: <span class="chart-card__avg-value">' + q.avg.toFixed(2) + '</span></div>';

      chartsGrid.appendChild(card);

      // Create donut chart
      const ctx = document.getElementById(canvasId).getContext('2d');
      new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: CHART_LABELS,
          datasets: [
            {
              data: [
                q.distribution[1],
                q.distribution[2],
                q.distribution[3],
                q.distribution[4],
              ],
              backgroundColor: CHART_COLORS,
              borderColor: '#FFFFFF',
              borderWidth: 2,
              hoverOffset: 6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          cutout: '55%',
          plugins: {
            legend: {
              display: true,
              position: 'bottom',
              labels: {
                usePointStyle: true,
                pointStyle: 'circle',
                padding: 12,
                font: {
                  family: "'Lora', Georgia, serif",
                  size: 10,
                },
                color: '#4A4554',
              },
            },
            tooltip: {
              backgroundColor: '#2D1B4E',
              titleFont: {
                family: "'Playfair Display', Georgia, serif",
                size: 12,
              },
              bodyFont: {
                family: "'Lora', Georgia, serif",
                size: 11,
              },
              cornerRadius: 3,
              padding: 10,
              callbacks: {
                label: function (context) {
                  const total = context.dataset.data.reduce(function (a, b) { return a + b; }, 0);
                  const value = context.parsed;
                  const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                  return context.label + ': ' + value + ' (' + percentage + '%)';
                },
              },
            },
          },
          animation: {
            animateRotate: true,
            duration: 800,
          },
        },
      });
    });
  // ── Respondent Table & Export ──

  let cachedResponses = [];
  const tableBody = document.getElementById('table-body');
  const tableCount = document.getElementById('table-count');
  const btnExport = document.getElementById('btn-export');
  const filterKelas = document.getElementById('filter-kelas');

  function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, function (tag) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;',
      }[tag] || tag;
    });
  }

  function getRespondentAverage(answers) {
    if (!answers) return '0.00';
    let sum = 0;
    let count = 0;
    for (let i = 1; i <= questions.length; i++) {
      const val = answers['q' + i];
      if (val) {
        sum += val;
        count++;
      }
    }
    return count > 0 ? (sum / count).toFixed(2) : '0.00';
  }

  function renderTable(responses) {
    if (!tableBody) return;
    tableBody.innerHTML = '';
    if (tableCount) tableCount.textContent = responses.length + ' Siswa';

    if (responses.length === 0) {
      tableBody.innerHTML =
        '<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: var(--space-xl);">' +
        'Belum ada data responden siswa yang cocok.' +
        '</td></tr>';
      return;
    }

    responses.forEach(function (r, index) {
      const tr = document.createElement('tr');
      const dateStr = r.created_at
        ? new Date(r.created_at).toLocaleString('id-ID', {
            dateStyle: 'medium',
            timeStyle: 'short',
          })
        : '-';
      const avg = getRespondentAverage(r.answers);

      tr.innerHTML =
        '<td style="color: var(--text-muted);">' + (index + 1) + '</td>' +
        '<td style="font-weight: 600; color: var(--text-primary);">' + escapeHTML(r.nama) + '</td>' +
        '<td>' + escapeHTML(r.kelas) + '</td>' +
        '<td style="color: var(--text-muted); font-size: 0.85rem;">' + dateStr + '</td>' +
        '<td style="text-align: right;"><span class="table-score-badge">' + avg + '</span></td>';

      tableBody.appendChild(tr);
    });
  }

  function populateFilterKelas() {
    if (!filterKelas || !APP_CONFIG.CLASSES) return;

    APP_CONFIG.CLASSES.forEach(function (group) {
      const optgroup = document.createElement('optgroup');
      optgroup.label = group.group;

      group.items.forEach(function (cls) {
        const option = document.createElement('option');
        option.value = cls;
        option.textContent = cls;
        optgroup.appendChild(option);
      });

      filterKelas.appendChild(optgroup);
    });

    filterKelas.addEventListener('change', function () {
      const selectedClass = filterKelas.value;
      if (selectedClass === 'all') {
        renderTable(cachedResponses);
      } else {
        const filtered = cachedResponses.filter(function (r) {
          return r.kelas === selectedClass;
        });
        renderTable(filtered);
      }
    });
  }

  function exportToCSV(responses, selectedClass) {
    if (!responses || responses.length === 0) {
      alert('Belum ada data responden untuk diunduh.');
      return;
    }

    const headers = ['No', 'Nama Lengkap', 'Kelas', 'Waktu Pengisian', 'Rata-rata Skor'];
    for (let i = 1; i <= questions.length; i++) {
      headers.push('P' + i + ' (' + questions[i - 1].replace(/"/g, '""') + ')');
    }

    const rows = [headers.map(function (h) { return '"' + h + '"'; }).join(',')];

    responses.forEach(function (r, idx) {
      const dateStr = r.created_at
        ? new Date(r.created_at).toLocaleString('id-ID')
        : '-';
      const avg = getRespondentAverage(r.answers);
      const row = [
        idx + 1,
        '"' + (r.nama || '').replace(/"/g, '""') + '"',
        '"' + (r.kelas || '').replace(/"/g, '""') + '"',
        '"' + dateStr + '"',
        avg,
      ];

      for (let i = 1; i <= questions.length; i++) {
        const val = r.answers && r.answers['q' + i] ? r.answers['q' + i] : '';
        row.push(val);
      }

      rows.push(row.join(','));
    });

    const suffix = selectedClass && selectedClass !== 'all' ? '-' + selectedClass : '';
    const csvContent = '\uFEFF' + rows.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download =
      'kuesioner-disiplin-kornita' + suffix + '-' + new Date().toISOString().slice(0, 10) + '.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // ── Initialize Dashboard ──

  async function init() {
    try {
      cachedResponses = await Storage.getResponses();
      const stats = computeStats(cachedResponses);
      renderStats(stats);
      renderCharts(stats);
      renderTable(cachedResponses);
      populateFilterKelas();

      if (btnExport) {
        btnExport.addEventListener('click', function () {
          const selectedClass = filterKelas ? filterKelas.value : 'all';
          const toExport =
            selectedClass === 'all'
              ? cachedResponses
              : cachedResponses.filter(function (r) {
                  return r.kelas === selectedClass;
                });
          exportToCSV(toExport, selectedClass);
        });
      }
    } catch (err) {
      console.error('[Dashboard] Error loading data:', err);
      chartsGrid.innerHTML =
        '<div class="dashboard-empty">' +
        '<div class="dashboard-empty__icon">⚠️</div>' +
        '<p class="dashboard-empty__text">Terjadi kesalahan saat memuat data. Periksa konfigurasi Supabase atau coba muat ulang halaman.</p>' +
        '</div>';
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
