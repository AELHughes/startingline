jQuery(function ($) {
  var $root = $('#sl-merch-modal');
  var $box  = $root.find('.sl-modal__box');
  var inflight = false; // global guard

  function openModal(productId) {
    $root.addClass('open').attr('aria-hidden', 'false');
    $box.html('<p>Loading…</p>');

    $.get(SL_MERCH.ajax, {
      action: 'sl_merch_modal',
      product_id: productId,
      nonce: SL_MERCH.nonce
    }, null, 'json')
      .done(function (res) {
        if (res && res.success) {
          $box.html(res.data.html);

          // Re-init WC variation JS for injected markup (if any)
          try {
            $box.find('.variations_form').each(function () {
              var $vf = $(this);
              if (typeof $vf.wc_variation_form === 'function') {
                $vf.wc_variation_form();
                $vf.find('.variations select').trigger('change');
              }
            });
          } catch (_) {}
			
		// 1) Make Woo's submit button a plain button
        $box.find('.single_add_to_cart_button').attr('type', 'button');

        // 2) If user presses Enter anywhere in the form, use our AJAX submit
        $box.find('form.sl-add-form')
          .off('keydown.slMerch')
          .on('keydown.slMerch', function (e) {
            if (e.key === 'Enter' && !$(e.target).is('textarea')) {
              e.preventDefault();
              $(this).trigger('submit');
            }
          });
			
        } else {
          $box.html('<p>Sorry, could not load product options.</p>');
        }
      })
      .fail(function () {
        $box.html('<p>Sorry, could not load product options.</p>');
      });
  }

  function closeModal() {
    $root.removeClass('open').attr('aria-hidden', 'true');
  }

  // === Bindings (namespaced + de-duped) ===

  // Open modal
  $(document)
    .off('click.slMerchOpen', '[data-sl-merch-open]')
    .on('click.slMerchOpen', '[data-sl-merch-open]', function (e) {
      e.preventDefault();
      var pid = $(this).data('productId');
      if (pid) openModal(pid);
    });

  // Close on backdrop or (x)
  $(document)
    .off('click.slMerchClose', '.sl-modal__backdrop, .sl-modal__close')
    .on('click.slMerchClose',  '.sl-modal__backdrop, .sl-modal__close', function () {
      closeModal();
    });

  // Route any in-modal add buttons to ONE submit path
  $(document)
    .off('click.slMerchBtn', '#sl-merch-modal .single_add_to_cart_button, #sl-merch-modal .sl-add-submit')
    .on('click.slMerchBtn',  '#sl-merch-modal .single_add_to_cart_button, #sl-merch-modal .sl-add-submit', function (e) {
      e.preventDefault();
      e.stopImmediatePropagation();
      $(this).closest('form').trigger('submit');
    });

  // Submit inside modal → AJAX add to cart (idempotent)
  $(document)
    .off('submit.slMerch', '#sl-merch-modal .sl-add-form')
    .on('submit.slMerch',  '#sl-merch-modal .sl-add-form', function (e) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      var $form = $(this);

      // In-flight guard (prevents duplicates even if bound twice)
      if (inflight || $form.data('slBusy')) return;
      inflight = true;
      $form.data('slBusy', true);

      // For variable products, ensure a variation is chosen
      var needsVariation = $form.find('input[name="variation_id"]').length;
      var hasVariation   = $form.find('input[name="variation_id"]').val();
      if (needsVariation && !hasVariation) {
        inflight = false; $form.removeData('slBusy');
        alert('Please choose your options.');
        return;
      }

      var data = $form.serializeArray();
      data.push({ name: 'action', value: 'sl_merch_add_to_cart' });
      data.push({ name: 'nonce',  value: SL_MERCH.nonce });

      $.post(SL_MERCH.ajax, data, null, 'json')
        .done(function (res) {
          if (res && res.fragments) {
            // Success: close & refresh checkout
            closeModal();
            $(document.body).trigger('update_checkout');
            $(document.body).trigger('added_to_cart', [res.fragments, res.cart_hash, $form]);
          } else {
            alert(res && res.data && res.data.message ? res.data.message : 'Could not add item.');
          }
        })
        .fail(function () {
          alert('Could not add item.');
        })
        .always(function () {
          inflight = false;
          $form.removeData('slBusy');
        });
    });
});