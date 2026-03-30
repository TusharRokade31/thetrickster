/* =============================================
   DENTESSA — INQUIRY POPUP  (inquiry-popup.js)
   Works on any page. Just include the CSS + JS
   and call: DentessaInquiry.init({ email: 'you@domain.com' })
   =============================================

   SETUP:
   1. Replace YOUR_EMAIL below with your real email.
   2. First form submit → FormSubmit.co sends you a
      confirmation email. Click the link once to activate.
   ============================================= */

(function () {
  'use strict';

  /* ── CONFIG ────────────────────────────────── */
  const CONFIG = {
    toEmail: 'website@alphabetasolution.com',  // ← CHANGE THIS
    brandName: 'Dentessa',
  };

  /* ── HTML TEMPLATE ──────────────────────────── */
  function buildModal() {
    const el = document.createElement('div');
    el.id = 'dentessa-inquiry-overlay';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-labelledby', 'diq-modal-title');
    el.innerHTML = `
      <div id="dentessa-inquiry-modal">

        <!-- HEADER -->
        <div class="diq-header">
          <button id="dentessa-inquiry-close" aria-label="Close">&times;</button>
          <h2 id="diq-modal-title">Request a Quote</h2>
          
          <p class="diq-product-badge" id="diq-product-badge">Product Inquiry</p>
        </div>

        <!-- FORM BODY -->
        <div class="diq-body" id="diq-form-wrapper">
          <form id="diq-inquiry-form" novalidate>

            <!-- hidden fields for FormSubmit.co -->
            <input type="hidden" name="_subject" id="diq-hidden-subject" value="New B2B Inquiry — Dentessa">
            <input type="hidden" name="_template" value="table">
            <input type="hidden" name="_captcha" value="false">
            <input type="hidden" name="Product" id="diq-hidden-product" value="">
            <input type="text" name="_honey" style="display:none">

            <div class="diq-row">
              <div class="diq-field" id="diq-f-name">
                <label for="diq-name">Full Name <span class="req">*</span></label>
                <input type="text" id="diq-name" name="Full Name" placeholder="Dr. Ananya Shah" autocomplete="name">
                <div class="diq-error-msg">Please enter your name</div>
              </div>
              <div class="diq-field" id="diq-f-clinic">
                <label for="diq-clinic">Clinic / Hospital <span class="req">*</span></label>
                <input type="text" id="diq-clinic" name="Clinic or Hospital" placeholder="Smile Dental Clinic">
                <div class="diq-error-msg">Please enter clinic name</div>
              </div>
            </div>

            <div class="diq-row">
              <div class="diq-field" id="diq-f-email">
                <label for="diq-email">Email Address <span class="req">*</span></label>
                <input type="email" id="diq-email" name="Email" placeholder="you@clinic.com" autocomplete="email">
                <div class="diq-error-msg">Please enter a valid email</div>
              </div>
              <div class="diq-field" id="diq-f-phone">
                <label for="diq-phone">Phone / WhatsApp <span class="req">*</span></label>
                <input type="tel" id="diq-phone" name="Phone" placeholder="+91 98765 43210" autocomplete="tel">
                <div class="diq-error-msg">Please enter your phone</div>
              </div>
            </div>

            <div class="diq-row">
              <div class="diq-field" id="diq-f-qty">
                <label for="diq-qty">Quantity Required</label>
                <select id="diq-qty" name="Quantity Required">
                  <option value="">— Select —</option>
                  <option value="Trial / Sample">Trial / Sample</option>
                  <option value="1–10 units">1–10 units</option>
                  <option value="11–50 units">11–50 units</option>
                  <option value="51–200 units">51–200 units</option>
                  <option value="200+ units (Bulk)">200+ units (Bulk)</option>
                </select>
              </div>
              <div class="diq-field" id="diq-f-city">
                <label for="diq-city">City</label>
                <input type="text" id="diq-city" name="City" placeholder="Mumbai">
              </div>
            </div>

            <div class="diq-field">
              <label for="diq-msg">Message / Special Requirements</label>
              <textarea id="diq-msg" name="Message" placeholder="E.g. Looking for bulk pricing, distributor partnership, sample request…"></textarea>
            </div>

            <button type="submit" class="diq-submit-btn" id="diq-submit-btn">
              Send Inquiry
            </button>
          </form>

          <p class="diq-note">
            By submitting you agree to be contacted by ${CONFIG.brandName}.<br>
            We respect your privacy and never share your data.
          </p>
        </div>

        <!-- SUCCESS STATE -->
        <div class="diq-success" id="diq-success-state">
          <div class="diq-checkmark">✓</div>
          <h3>Inquiry Sent!</h3>
          <p>Thank you! Our team will reach out to you within <strong>24 hours</strong>.<br>Check your inbox for a confirmation.</p>
        </div>

      </div>`;
    document.body.appendChild(el);
  }

  /* ── VALIDATION ────────────────────────────── */
  function validateField(fieldWrapId, inputEl, testFn) {
    const wrap = document.getElementById(fieldWrapId);
    if (!wrap) return true;
    if (!testFn(inputEl.value.trim())) {
      wrap.classList.add('has-error');
      return false;
    }
    wrap.classList.remove('has-error');
    return true;
  }

  function validateForm() {
    const name  = document.getElementById('diq-name');
    const clinic= document.getElementById('diq-clinic');
    const email = document.getElementById('diq-email');
    const phone = document.getElementById('diq-phone');

    let ok = true;
    if (!validateField('diq-f-name',   name,   v => v.length >= 2))  ok = false;
    if (!validateField('diq-f-clinic', clinic, v => v.length >= 2))  ok = false;
    if (!validateField('diq-f-email',  email,  v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))) ok = false;
    if (!validateField('diq-f-phone',  phone,  v => v.length >= 7))  ok = false;
    return ok;
  }

  /* ── SUBMIT VIA FORMSUBMIT.CO ───────────────── */
  function submitForm(form, productName) {
    const btn = document.getElementById('diq-submit-btn');
    btn.disabled = true;
    btn.textContent = 'Sending…';

    const formData = new FormData(form);

    fetch(`https://formsubmit.co/ajax/${CONFIG.toEmail}`, {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: formData,
    })
    .then(res => res.json())
    .then(data => {
      if (data.success === 'true' || data.success === true) {
        document.getElementById('diq-form-wrapper').style.display = 'none';
        document.getElementById('diq-success-state').classList.add('active');
      } else {
        throw new Error('FormSubmit failed');
      }
    })
    .catch(() => {
      btn.disabled = false;
      btn.textContent = 'Send Inquiry';
      alert('Something went wrong. Please try again or email us directly.');
    });
  }

  /* ── OPEN / CLOSE ────────────────────────────── */
  function openModal(productName) {
    const overlay = document.getElementById('dentessa-inquiry-overlay');
    const badge   = document.getElementById('diq-product-badge');
    const subject = document.getElementById('diq-hidden-subject');
    const hidden  = document.getElementById('diq-hidden-product');

    // Reset state
    document.getElementById('diq-form-wrapper').style.display = '';
    document.getElementById('diq-success-state').classList.remove('active');
    document.getElementById('diq-inquiry-form').reset();
    document.querySelectorAll('[id^="diq-f-"]').forEach(el => el.classList.remove('has-error'));
    const btn = document.getElementById('diq-submit-btn');
    btn.disabled = false;
    btn.textContent = 'Send Inquiry';

    // Set product context
    const label = productName || 'General Inquiry';
    badge.textContent = label;
    subject.value = `B2B Inquiry: ${label} — ${CONFIG.brandName}`;
    hidden.value  = label;

    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Focus first input for accessibility
    setTimeout(() => {
      const first = document.getElementById('diq-name');
      if (first) first.focus();
    }, 100);
  }

  function closeModal() {
    const overlay = document.getElementById('dentessa-inquiry-overlay');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  /* ── BIND EVENTS ────────────────────────────── */
  function bindEvents() {
    // Close button
    document.getElementById('dentessa-inquiry-close').addEventListener('click', closeModal);

    // Click on overlay backdrop
    document.getElementById('dentessa-inquiry-overlay').addEventListener('click', function (e) {
      if (e.target === this) closeModal();
    });

    // ESC key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeModal();
    });

    // Form submit
    document.getElementById('diq-inquiry-form').addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validateForm()) return;
      const productName = document.getElementById('diq-hidden-product').value;
      submitForm(this, productName);
    });

    // Remove error on input
    ['diq-name','diq-clinic','diq-email','diq-phone'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', function () {
        const wrap = this.closest('.diq-field');
        if (wrap) wrap.classList.remove('has-error');
      });
    });
  }

  /* ── PUBLIC API ─────────────────────────────── */
  window.DentessaInquiry = {
    /**
     * Call once on page load.
     * @param {object} opts - { email: 'you@domain.com' }
     */
    init: function (opts) {
      if (opts && opts.email) CONFIG.toEmail = opts.email;
      buildModal();
      bindEvents();
    },

    /**
     * Open the popup manually with optional product name.
     * @param {string} productName
     */
    open: function (productName) {
      openModal(productName);
    },

    close: closeModal,
  };

})();
