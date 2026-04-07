// payment.js — Subscription is now handled via in-app purchases (Google Play)
// This page is no longer used for Stripe checkout.
'use strict';

document.addEventListener('DOMContentLoaded', function() {
  const container = document.querySelector('.container') || document.body;
  container.innerHTML = '<div style="text-align:center;padding:60px 20px;"><h2>Subscriptions are now managed in the app</h2><p style="margin-top:16px;color:#666;">Please open the Wrok app to manage your subscription via Google Play.</p></div>';
});
