/* ================================================
   FORM PAGE LOGIC
   Render pertanyaan, validasi, dan submit handler
   ================================================ */

(function () {
  'use strict';

  const questions = APP_CONFIG.QUESTIONS;
  const container = document.getElementById('questions-container');
  const form = document.getElementById('questionnaire-form');
  const progressCurrent = document.getElementById('progress-current');
  const progressTotal = document.getElementById('progress-total');
  const btnSubmit = document.getElementById('btn-submit');
  const notification = document.getElementById('notification');

  // ── Render Questions ──

  function createQuestionElement(text, num) {
    const name = 'q' + num;
    const item = document.createElement('div');
    item.className = 'question-item';
    item.id = 'question-' + num;

    let scaleHTML = '';
    for (let v = APP_CONFIG.SCALE_MIN; v <= APP_CONFIG.SCALE_MAX; v++) {
      scaleHTML +=
        '\n          <label class="scale-option" title="' + APP_CONFIG.SCALE[v] + '">' +
        '\n            <input type="radio" name="' + name + '" value="' + v + '" required>' +
        '\n            <span class="radio-custom"></span>' +
        '\n            <span class="scale-value">' + v + '</span>' +
        '\n          </label>';
    }

    item.innerHTML =
      '<p class="question-text">' +
      '<span class="question-number">' + num + '.</span> ' +
      text +
      '</p>' +
      '<div class="scale-options">' + scaleHTML + '</div>';

    return item;
  }

  function renderQuestions() {
    progressTotal.textContent = questions.length;
    container.innerHTML = '';

    if (APP_CONFIG.SECTIONS && APP_CONFIG.SECTIONS.length > 0) {
      let currentNum = 1;

      APP_CONFIG.SECTIONS.forEach(function (sec) {
        const secCard = document.createElement('section');
        secCard.className = 'form-section';

        let secHTML = '<h2 class="form-section__title">' + sec.title + '</h2>';
        if (sec.description) {
          secHTML += '<p class="form-section__desc">' + sec.description + '</p>';
        }
        secHTML += '<div class="section-questions"></div>';
        secCard.innerHTML = secHTML;

        const qContainer = secCard.querySelector('.section-questions');
        sec.questions.forEach(function (qText) {
          const qEl = createQuestionElement(qText, currentNum);
          qContainer.appendChild(qEl);
          currentNum++;
        });

        container.appendChild(secCard);
      });
    } else {
      const secCard = document.createElement('section');
      secCard.className = 'form-section';
      secCard.innerHTML = '<h2 class="form-section__title">Pernyataan</h2><div class="section-questions"></div>';
      const qContainer = secCard.querySelector('.section-questions');

      questions.forEach(function (text, index) {
        const qEl = createQuestionElement(text, index + 1);
        qContainer.appendChild(qEl);
      });

      container.appendChild(secCard);
    }

    // Listen for radio changes to update progress
    container.addEventListener('change', updateProgress);
  }

  // ── Progress Tracker ──

  function updateProgress() {
    let answered = 0;
    for (let i = 1; i <= questions.length; i++) {
      const checked = form.querySelector('input[name="q' + i + '"]:checked');
      if (checked) answered++;
    }
    progressCurrent.textContent = answered;
  }

  // ── Notification ──

  let notificationTimer = null;

  function hideNotification() {
    if (notificationTimer) {
      clearTimeout(notificationTimer);
      notificationTimer = null;
    }
    notification.classList.remove('is-visible');
  }

  function showNotification(message, type) {
    if (notificationTimer) clearTimeout(notificationTimer);

    notification.innerHTML =
      '<span class="notification__message">' + message + '</span>' +
      '<button type="button" class="notification__close" aria-label="Tutup notifikasi" title="Tutup">&times;</button>';
    notification.className = 'notification notification--' + type + ' is-visible';

    const closeBtn = notification.querySelector('.notification__close');
    if (closeBtn) {
      closeBtn.onclick = hideNotification;
    }

    notificationTimer = setTimeout(hideNotification, 5000);
  }

  // ── Validation ──

  function validateForm() {
    let isValid = true;
    const errors = [];

    // Check nama
    const inputNama = document.getElementById('input-nama');
    const nama = inputNama.value.trim();
    if (!nama) {
      errors.push('Nama lengkap harus diisi.');
      inputNama.classList.add('is-invalid');
      isValid = false;
    } else {
      inputNama.classList.remove('is-invalid');
    }

    // Check kelas
    const selectKelas = document.getElementById('input-kelas');
    const kelas = selectKelas.value.trim();
    if (!kelas) {
      errors.push('Pilih kelas Anda terlebih dahulu.');
      selectKelas.classList.add('is-invalid');
      isValid = false;
    } else {
      selectKelas.classList.remove('is-invalid');
    }

    // Check all questions answered
    const unanswered = [];
    for (let i = 1; i <= questions.length; i++) {
      const questionItem = document.getElementById('question-' + i);
      const checked = form.querySelector('input[name="q' + i + '"]:checked');

      if (!checked) {
        unanswered.push(i);
        questionItem.classList.add('is-invalid');
        isValid = false;
      } else {
        questionItem.classList.remove('is-invalid');
      }
    }

    if (unanswered.length > 0) {
      errors.push('Pertanyaan nomor ' + unanswered.join(', ') + ' belum dijawab.');
    }

    return { isValid, errors, nama, kelas };
  }

  // ── Collect Answers ──

  function collectAnswers() {
    const answers = {};
    for (let i = 1; i <= questions.length; i++) {
      const checked = form.querySelector('input[name="q' + i + '"]:checked');
      answers['q' + i] = checked ? parseInt(checked.value, 10) : null;
    }
    return answers;
  }

  // ── Confirmation Modal ──

  const confirmModal = document.getElementById('confirm-modal');
  const btnCancelModal = document.getElementById('btn-cancel-modal');
  const btnConfirmSubmit = document.getElementById('btn-confirm-submit');

  function openConfirmModal() {
    if (confirmModal) confirmModal.classList.add('is-open');
  }

  function closeConfirmModal() {
    if (confirmModal) confirmModal.classList.remove('is-open');
  }

  // ── Submit Handler ──

  let pendingValidation = null;

  function handleSubmit(e) {
    e.preventDefault();

    const validation = validateForm();

    if (!validation.isValid) {
      showNotification(validation.errors[0], 'error');

      // Scroll to first invalid item
      const firstInvalid =
        !validation.nama
          ? document.getElementById('input-nama')
          : !validation.kelas
            ? document.getElementById('input-kelas')
            : document.querySelector('.question-item.is-invalid');

      if (firstInvalid) {
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    pendingValidation = validation;
    openConfirmModal();
  }

  async function executeSubmit() {
    if (!pendingValidation) return;

    btnConfirmSubmit.disabled = true;
    btnConfirmSubmit.innerHTML = '<span class="spinner"></span> Mengirim...';
    btnCancelModal.disabled = true;

    try {
      // Check duplicate
      const isDuplicate = await Storage.checkDuplicate(
        pendingValidation.nama,
        pendingValidation.kelas
      );

      if (isDuplicate) {
        closeConfirmModal();
        showNotification(
          'Anda sudah pernah mengisi kuesioner ini sebelumnya.',
          'warning'
        );
        btnConfirmSubmit.disabled = false;
        btnConfirmSubmit.textContent = 'Ya, Kirim Sekarang';
        btnCancelModal.disabled = false;
        return;
      }

      // Collect and save
      const answers = collectAnswers();
      const result = await Storage.saveResponse({
        nama: pendingValidation.nama,
        kelas: pendingValidation.kelas,
        answers: answers,
      });

      if (result.success) {
        window.location.href = 'thankyou.html';
      } else if (result.error === 'duplicate') {
        closeConfirmModal();
        showNotification(
          'Anda sudah pernah mengisi kuesioner ini sebelumnya.',
          'warning'
        );
      } else {
        closeConfirmModal();
        showNotification(
          'Terjadi kesalahan saat mengirim jawaban. Silakan coba lagi.',
          'error'
        );
      }
    } catch (err) {
      console.error('[Form] Submit error:', err);
      closeConfirmModal();
      showNotification(
        'Terjadi kesalahan yang tidak terduga. Silakan coba lagi.',
        'error'
      );
    } finally {
      btnConfirmSubmit.disabled = false;
      btnConfirmSubmit.textContent = 'Ya, Kirim Sekarang';
      btnCancelModal.disabled = false;
    }
  }

  // ── Class Dropdown ──

  function populateClassDropdown() {
    const select = document.getElementById('input-kelas');
    if (!select || !APP_CONFIG.CLASSES) return;

    APP_CONFIG.CLASSES.forEach(function (group) {
      const optgroup = document.createElement('optgroup');
      optgroup.label = group.group;

      group.items.forEach(function (cls) {
        const option = document.createElement('option');
        option.value = cls;
        option.textContent = cls;
        optgroup.appendChild(option);
      });

      select.appendChild(optgroup);
    });
  }

  // ── Clear validation state on input ──

  function setupValidationClear() {
    document.getElementById('input-nama').addEventListener('input', function () {
      this.classList.remove('is-invalid');
    });
    document.getElementById('input-kelas').addEventListener('change', function () {
      this.classList.remove('is-invalid');
    });

    container.addEventListener('change', function (e) {
      if (e.target.type === 'radio') {
        const questionItem = e.target.closest('.question-item');
        if (questionItem) {
          questionItem.classList.remove('is-invalid');
        }
      }
    });
  }

  // ── Initialize ──

  function init() {
    populateClassDropdown();
    renderQuestions();
    setupValidationClear();
    form.addEventListener('submit', handleSubmit);

    if (btnCancelModal) {
      btnCancelModal.addEventListener('click', closeConfirmModal);
    }
    if (btnConfirmSubmit) {
      btnConfirmSubmit.addEventListener('click', executeSubmit);
    }
    if (confirmModal) {
      confirmModal.addEventListener('click', function (e) {
        if (e.target === confirmModal) {
          closeConfirmModal();
        }
      });
    }
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && confirmModal && confirmModal.classList.contains('is-open')) {
        closeConfirmModal();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
