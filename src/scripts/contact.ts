/**
 * 상담 폼 전송.
 * data-endpoint 가 있으면 JSON POST, 없으면 mailto 로 메일 앱을 엽니다.
 */
export function initContactForm(form: HTMLFormElement) {
  const status = form.querySelector<HTMLElement>('[data-form-status]');
  const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  const endpoint = form.dataset.endpoint || '';
  const email = form.dataset.email || '';

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;

    const data = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;

    if (!endpoint) {
      const subject = `[현장 적용 상담] ${data.company || ''}`;
      const body = [
        `회사명: ${data.company || ''}`,
        `담당자: ${data.name || ''}`,
        `연락처: ${data.phone || ''}`,
        `이메일: ${data.email || ''}`,
        `시설 유형: ${data.facility || ''}`,
        `사업장 수: ${data.sites || ''}`,
        '',
        data.message || '',
      ].join('\n');
      window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      return;
    }

    button?.setAttribute('disabled', '');
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(String(res.status));
      form.reset();
      if (status) {
        status.textContent = form.dataset.success || '';
        status.dataset.tone = 'ok';
      }
    } catch {
      if (status) {
        status.textContent = form.dataset.error || '';
        status.dataset.tone = 'error';
      }
    } finally {
      button?.removeAttribute('disabled');
    }
  });
}
