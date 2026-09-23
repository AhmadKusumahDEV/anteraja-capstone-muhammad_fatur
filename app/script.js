// app/script.js

document.addEventListener('DOMContentLoaded', () => {
  // Modal Handling
  const openModalButtons = document.querySelectorAll('[data-open-modal]');
  const closeModalButtons = document.querySelectorAll('[data-close-modal]');

  openModalButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const modalId = button.getAttribute('data-open-modal');
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.showModal();
      }
    });
  });

  closeModalButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const modal = button.closest('dialog');
      if (modal) {
        modal.close();
      }
    });
  });

  // Range Slider update (for Manifest Generator)
  const qtySlider = document.getElementById('qtySlider');
  const qtyValue = document.getElementById('qtyValue');
  if (qtySlider && qtyValue) {
    qtySlider.addEventListener('input', (e) => {
      qtyValue.value = e.target.value;
    });
    
    qtyValue.addEventListener('input', (e) => {
      qtySlider.value = e.target.value;
    });
  }

  // Quick Select buttons (for Manifest Generator)
  const quickSelectBtns = document.querySelectorAll('[data-quick-select]');
  if (quickSelectBtns && qtySlider && qtyValue) {
    quickSelectBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const val = btn.getAttribute('data-quick-select');
        qtySlider.value = val;
        qtyValue.value = val;
      });
    });
  }
});
