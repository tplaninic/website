// payment.js — tier selection + Stripe Checkout redirect

const API_BASE = 'https://schedulerapi-production.up.railway.app/api';

function getParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    workplaceId: params.get('workplaceId'),
    email: params.get('email'),
    preselectedTier: (params.get('tier') || '').toUpperCase(),
  };
}

function showError(msg) {
  const toast = document.getElementById('errorToast');
  toast.textContent = msg;
  toast.classList.add('visible');
  setTimeout(() => toast.classList.remove('visible'), 5000);
}

function showLoading(visible) {
  document.getElementById('loadingOverlay').classList.toggle('visible', visible);
}

function selectTier(tier) {
  // Visual selection
  document.querySelectorAll('.card').forEach(card => {
    card.classList.toggle('selected', card.dataset.tier === tier);
  });

  // Start checkout
  startCheckout(tier);
}

async function startCheckout(tier) {
  const { workplaceId, email } = getParams();

  if (!workplaceId) {
    showError('Missing workplace ID. Please try again from the app.');
    return;
  }

  showLoading(true);

  try {
    const res = await fetch(`${API_BASE}/subscriptions/create-checkout-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workplaceId: parseInt(workplaceId),
        tier: tier,
        email: email,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      showLoading(false);
      showError(data.error || 'Something went wrong. Please try again.');
      return;
    }

    if (data.checkoutUrl) {
      window.location.href = data.checkoutUrl;
    } else {
      showLoading(false);
      showError('No checkout URL received. Please try again.');
    }
  } catch (err) {
    showLoading(false);
    showError('Connection error. Please check your internet and try again.');
  }
}

// Pre-select tier from URL params if provided
const { preselectedTier } = getParams();
if (preselectedTier) {
  const card = document.querySelector(`.card[data-tier="${preselectedTier}"]`);
  if (card) card.classList.add('selected');
}
