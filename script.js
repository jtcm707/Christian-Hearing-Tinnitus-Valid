/* =========================================================================
   Christian Hearing & Tinnitus — Referral Page Logic
   -------------------------------------------------------------------------
   What this file does
   1.  Footer year stamp
   2.  Subtle fade-in on scroll (IntersectionObserver)
   3.  Form validation with large, clear error messages
   4.  submitReferral() — the single place to later connect Supabase
   5.  Success screen handling

   No libraries. Everything runs on plain browser JavaScript.
   ========================================================================= */

'use strict';

/* -------------------------------------------------------------------------
   0. SUPABASE CLIENT
   Reads keys from config.js (window.CHT_CONFIG). If they are missing or still
   placeholders, we stay in "demo mode" and the form logs instead of saving.
   ------------------------------------------------------------------------- */
const CONFIG = window.CHT_CONFIG || {};
const SUPABASE_READY =
  CONFIG.SUPABASE_URL &&
  CONFIG.SUPABASE_ANON_KEY &&
  CONFIG.SUPABASE_URL !== 'YOUR_SUPABASE_URL' &&
  CONFIG.SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY';

// The global "supabase" comes from the CDN script loaded in index.html.
const supabaseClient = SUPABASE_READY
  ? window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY)
  : null;

if (!SUPABASE_READY) {
  console.warn(
    'Supabase is not configured yet — running in DEMO MODE. ' +
    'Add your keys in config.js to start saving referrals.'
  );
}

/* -------------------------------------------------------------------------
   1. FOOTER YEAR
   ------------------------------------------------------------------------- */
document.getElementById('year').textContent = new Date().getFullYear();

/* -------------------------------------------------------------------------
   2. FADE-IN ON SCROLL
   Adds .is-visible to any .reveal element as it enters the viewport.
   Falls back to showing everything if IntersectionObserver is unavailable
   or the user prefers reduced motion.
   ------------------------------------------------------------------------- */
(function initReveal() {
  const items = document.querySelectorAll('.reveal');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduceMotion || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target); // reveal once, then stop watching
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  items.forEach((el) => observer.observe(el));
})();

/* -------------------------------------------------------------------------
   3. FORM VALIDATION HELPERS
   ------------------------------------------------------------------------- */
const form = document.getElementById('referralForm');
const submitBtn = document.getElementById('submitBtn');
const formPanel = document.getElementById('formPanel');
const successPanel = document.getElementById('successPanel');

/** Show an error message under a field and mark the input invalid. */
function setError(fieldId, message) {
  const input = document.getElementById(fieldId);
  const errorEl = document.getElementById(fieldId + '-error');
  if (input) {
    input.classList.add('is-invalid');
    input.setAttribute('aria-invalid', 'true');
  }
  if (errorEl) errorEl.textContent = message;
}

/** Clear the error state for a single field. */
function clearError(fieldId) {
  const input = document.getElementById(fieldId);
  const errorEl = document.getElementById(fieldId + '-error');
  if (input) {
    input.classList.remove('is-invalid');
    input.removeAttribute('aria-invalid');
  }
  if (errorEl) errorEl.textContent = '';
}

/** Basic email shape check (only used when a value is present). */
function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

/** Phone check: require at least 10 digits, ignoring formatting characters. */
function isValidPhone(value) {
  const digits = value.replace(/\D/g, '');
  return digits.length >= 10;
}

/**
 * Validate every field.
 * Returns true if the form is ready to submit; otherwise shows errors
 * and moves focus to the first problem field.
 */
function validateForm() {
  let firstInvalid = null;

  // Required text/phone fields: id -> friendly message
  const required = {
    yourName:    'Please enter your name.',
    yourPhone:   'Please enter a valid phone number.',
    friendName:  "Please enter your friend's name.",
    friendPhone: "Please enter your friend's phone number.",
  };

  Object.keys(required).forEach((id) => {
    const value = form.elements[id].value.trim();
    clearError(id);

    if (!value) {
      setError(id, required[id]);
      firstInvalid = firstInvalid || id;
    } else if (id.toLowerCase().includes('phone') && !isValidPhone(value)) {
      setError(id, 'Please enter a valid phone number (at least 10 digits).');
      firstInvalid = firstInvalid || id;
    }
  });

  // Optional emails: only validated if the person typed something
  ['yourEmail', 'friendEmail'].forEach((id) => {
    const value = form.elements[id].value.trim();
    clearError(id);
    if (value && !isValidEmail(value)) {
      setError(id, 'Please enter a valid email address, or leave it blank.');
      firstInvalid = firstInvalid || id;
    }
  });

  // Move focus to the first issue so keyboard/screen-reader users are guided
  if (firstInvalid) {
    const el = document.getElementById(firstInvalid);
    if (el) el.focus();
    return false;
  }
  return true;
}

// Clear a field's error as soon as the user starts fixing it
form.addEventListener('input', (e) => {
  if (e.target.id) clearError(e.target.id);
});

/* -------------------------------------------------------------------------
   4. submitReferral()  ← SUPABASE INTEGRATION LIVES HERE
   -------------------------------------------------------------------------
   The single place where referral data leaves the page.

   - If Supabase is configured (config.js filled in), it inserts one row into
     the "referrals" table. The table + its security rules are defined in
     supabase-schema.sql.
   - If not configured, it falls back to demo mode so the page still works
     for previewing.

   The keys of `referral` match the columns in the "referrals" table exactly,
   so no field mapping is needed.

   @param {Object} referral - collected + trimmed form values
   @returns {Promise<{ok: boolean, error?: string}>}
   ------------------------------------------------------------------------- */
async function submitReferral(referral) {
  // ---- DEMO MODE (no keys yet): log instead of saving ----
  if (!supabaseClient) {
    console.log('Referral captured (demo mode — not saved):', referral);
    await new Promise((resolve) => setTimeout(resolve, 700)); // mimic a network call
    return { ok: true };
  }

  // ---- LIVE MODE: save to Supabase ----
  const { error } = await supabaseClient
    .from('referrals')      // table created by supabase-schema.sql
    .insert([referral]);    // one row per referral

  if (error) {
    console.error('Supabase insert failed:', error);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

/* -------------------------------------------------------------------------
   5. FORM SUBMIT FLOW
   ------------------------------------------------------------------------- */
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  clearError('form'); // clear any previous submit-failure message

  if (!validateForm()) return;

  // Gather + trim the data into one tidy object (ready for Supabase columns)
  const referral = {
    your_name:      form.elements['yourName'].value.trim(),
    your_phone:     form.elements['yourPhone'].value.trim(),
    your_email:     form.elements['yourEmail'].value.trim() || null,
    friend_name:    form.elements['friendName'].value.trim(),
    friend_phone:   form.elements['friendPhone'].value.trim(),
    friend_email:   form.elements['friendEmail'].value.trim() || null,
    contact_method: form.elements['contactMethod'].value,
    promo_code:     'JULY4-20',           // tag for the current promotion
    submitted_at:   new Date().toISOString(),
  };

  // Enter loading state
  submitBtn.classList.add('is-loading');
  submitBtn.disabled = true;

  try {
    const result = await submitReferral(referral);

    if (result.ok) {
      showSuccess();
    } else {
      // Surface a gentle, non-technical error near the button
      setError('form', 'Something went wrong sending your referral. Please try again or call our office.');
    }
  } catch (err) {
    console.error(err);
    setError('form', 'We could not send your referral just now. Please try again or call our office.');
  } finally {
    submitBtn.classList.remove('is-loading');
    submitBtn.disabled = false;
  }
});

/** Swap the form out for the success message and scroll it into view. */
function showSuccess() {
  formPanel.hidden = true;
  successPanel.hidden = false;
  // Move focus + scroll so the confirmation is seen and announced
  successPanel.setAttribute('tabindex', '-1');
  successPanel.focus({ preventScroll: true });
  successPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
