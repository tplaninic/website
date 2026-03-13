// payment.js — tier selection + Stripe Checkout redirect
'use strict';

const API_BASE = 'https://schedulerapi-production.up.railway.app/api';
const VALID_TIERS = ['STARTER', 'GROWTH', 'BUSINESS', 'ENTERPRISE'];

let isProcessing = false;

function getParams() {
  const params = new URLSearchParams(window.location.search);
  const workplaceId = params.get('workplaceId');
  const email = params.get('email');
  const tier = (params.get('tier') || '').toUpperCase();

  // Read JWT token from URL fragment (not sent in HTTP requests/referrer)
  let token = null;
  if (window.location.hash) {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    token = hashParams.get('token');
  }

  return {
    workplaceId: workplaceId && /^\d+$/.test(workplaceId) ? workplaceId : null,
    email: email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null,
    preselectedTier: VALID_TIERS.includes(tier) ? tier : null,
    token: token && token.length > 10 && token.length < 4096 ? token : null,
  };
}

function showError(msg) {
  const toast = document.getElementById('errorToast');
  // Use textContent to prevent XSS from error messages
  toast.textContent = typeof msg === 'string' ? msg.slice(0, 200) : 'An error occurred.';
  toast.classList.add('visible');
  setTimeout(() => toast.classList.remove('visible'), 5000);
}

function showLoading(visible) {
  document.getElementById('loadingOverlay').classList.toggle('visible', visible);
}

function selectTier(tier) {
  // Validate tier
  if (!VALID_TIERS.includes(tier)) return;
  if (isProcessing) return;

  // Visual selection
  document.querySelectorAll('.card').forEach(card => {
    card.classList.toggle('selected', card.dataset.tier === tier);
  });

  // Start checkout
  startCheckout(tier);
}

async function startCheckout(tier) {
  const { workplaceId, email, token } = getParams();

  if (!workplaceId) {
    showError('Missing workplace ID. Please try again from the app.');
    return;
  }

  if (!VALID_TIERS.includes(tier)) {
    showError('Invalid plan selected.');
    return;
  }

  isProcessing = true;
  showLoading(true);

  try {
    const body = {
      workplaceId: parseInt(workplaceId, 10),
      tier: tier,
    };
    if (email) body.email = email;

    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = 'Bearer ' + token;
    }

    const res = await fetch(`${API_BASE}/subscriptions/create-checkout-session`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body),
    });

    let data;
    try {
      data = await res.json();
    } catch {
      throw new Error('Invalid server response.');
    }

    if (!res.ok) {
      showLoading(false);
      isProcessing = false;
      showError(typeof data.error === 'string' ? data.error.slice(0, 200) : 'Something went wrong. Please try again.');
      return;
    }

    if (data.checkoutUrl && typeof data.checkoutUrl === 'string') {
      // Validate the checkout URL points to Stripe
      try {
        const url = new URL(data.checkoutUrl);
        if (!url.hostname.endsWith('.stripe.com')) {
          throw new Error('Invalid checkout URL');
        }
        window.location.href = data.checkoutUrl;
      } catch {
        showLoading(false);
        isProcessing = false;
        showError('Invalid checkout URL received. Please try again.');
      }
    } else {
      showLoading(false);
      isProcessing = false;
      showError('No checkout URL received. Please try again.');
    }
  } catch (err) {
    showLoading(false);
    isProcessing = false;
    showError('Connection error. Please check your internet and try again.');
  }
}

// Pre-select tier from URL params if provided (safely)
const { preselectedTier } = getParams();
if (preselectedTier) {
  // Safe: preselectedTier is already validated against VALID_TIERS whitelist
  const card = document.querySelector(`.card[data-tier="${preselectedTier}"]`);
  if (card) card.classList.add('selected');
}

// Clean sensitive params from URL after reading (removes query params and fragment)
if (window.history.replaceState) {
  window.history.replaceState({}, document.title, window.location.pathname);
}
