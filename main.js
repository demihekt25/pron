// Main JavaScript for Sewing School Website

// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
  const nav = document.querySelector('.nav');
  
  if (mobileMenuToggle && nav) {
    mobileMenuToggle.addEventListener('click', function() {
      nav.classList.toggle('active');
    });
  }

  // Close menu when clicking outside
  document.addEventListener('click', function(e) {
    if (nav && !nav.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
      nav.classList.remove('active');
    }
  });

  // Initialize accordions
  initAccordions();
  
  // Initialize forms
  initForms();
  
  // Initialize schedule filters
  initScheduleFilters();
  
  // Initialize lazy loading for images
  initLazyLoading();
});

// Accordion functionality
function initAccordions() {
  const accordions = document.querySelectorAll('.accordion');
  
  accordions.forEach(accordion => {
    const header = accordion.querySelector('.accordion-header');
    
    if (header) {
      header.addEventListener('click', function() {
        const isActive = accordion.classList.contains('active');
        
        // Close all accordions in the same group
        const accordionGroup = accordion.closest('.accordion-group');
        if (accordionGroup) {
          accordionGroup.querySelectorAll('.accordion').forEach(acc => {
            acc.classList.remove('active');
          });
        }
        
        // Toggle current accordion
        if (!isActive) {
          accordion.classList.add('active');
        }
      });
    }
  });
}

// Form validation and submission
function initForms() {
  const forms = document.querySelectorAll('.form');
  
  forms.forEach(form => {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      
      if (validateForm(form)) {
        submitForm(form);
      }
    });
    
    // Real-time validation
    const inputs = form.querySelectorAll('.form-input, .form-select');
    inputs.forEach(input => {
      input.addEventListener('blur', function() {
        validateField(input);
      });
    });
  });
}

function validateForm(form) {
  let isValid = true;
  const inputs = form.querySelectorAll('.form-input[required], .form-select[required]');
  
  inputs.forEach(input => {
    if (!validateField(input)) {
      isValid = false;
    }
  });
  
  return isValid;
}

function validateField(field) {
  const value = field.value.trim();
  const fieldName = field.name || field.id;
  let isValid = true;
  let errorMessage = '';
  
  // Remove previous error
  field.classList.remove('error');
  const errorElement = field.parentElement.querySelector('.form-error');
  if (errorElement) {
    errorElement.classList.remove('show');
  }
  
  // Check if required
  if (field.hasAttribute('required') && !value) {
    isValid = false;
    errorMessage = 'Это поле обязательно для заполнения';
  }
  
  // Validate email
  if (field.type === 'email' && value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      isValid = false;
      errorMessage = 'Введите корректный email адрес';
    }
  }
  
  // Validate phone
  if (fieldName === 'phone' && value) {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(value) || value.replace(/\D/g, '').length < 10) {
      isValid = false;
      errorMessage = 'Введите корректный номер телефона';
    }
  }
  
  // Show error if invalid
  if (!isValid) {
    field.classList.add('error');
    if (errorElement) {
      errorElement.textContent = errorMessage;
      errorElement.classList.add('show');
    }
  }
  
  return isValid;
}

function submitForm(form) {
  const submitButton = form.querySelector('button[type="submit"], .btn-primary');
  const formData = new FormData(form);
  const data = Object.fromEntries(formData);
  
  // Show loading state
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.classList.add('loading');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Отправка...';
  }
  
  // Simulate AJAX request (replace with actual endpoint)
  fetch('/api/submit-form', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  })
  .then(response => response.json())
  .then(result => {
    // Show success message
    showFormSuccess(form);
    
    // Reset form
    form.reset();
    
    // Send to Telegram (if configured)
    sendToTelegram(data);
    
    // Send email notification (if configured)
    sendEmailNotification(data);
  })
  .catch(error => {
    console.error('Error:', error);
    alert('Произошла ошибка при отправке формы. Пожалуйста, попробуйте позже или свяжитесь с нами по телефону.');
  })
  .finally(() => {
    // Reset button state
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.classList.remove('loading');
      submitButton.textContent = submitButton.getAttribute('data-original-text') || 'Отправить';
    }
  });
}

function showFormSuccess(form) {
  const successElement = form.querySelector('.form-success');
  if (successElement) {
    successElement.classList.add('show');
    setTimeout(() => {
      successElement.classList.remove('show');
    }, 5000);
  } else {
    alert('Спасибо! Ваша заявка успешно отправлена. Мы свяжемся с вами в ближайшее время.');
  }
}

// Send notification to Telegram (requires backend configuration)
function sendToTelegram(data) {
  // This should be handled by backend
  // Example: POST to /api/telegram with form data
  console.log('Form data for Telegram:', data);
}

// Send email notification (requires backend configuration)
function sendEmailNotification(data) {
  // This should be handled by backend
  // Example: POST to /api/email with form data
  console.log('Form data for Email:', data);
}

// Schedule filters
function initScheduleFilters() {
  const filterSelects = document.querySelectorAll('.filter-select');
  const scheduleRows = document.querySelectorAll('.schedule-table tbody tr');
  
  if (filterSelects.length === 0 || scheduleRows.length === 0) {
    return;
  }
  
  filterSelects.forEach(select => {
    select.addEventListener('change', function() {
      filterSchedule();
    });
  });
  
  function filterSchedule() {
    const level = document.querySelector('[data-filter="level"]')?.value || 'all';
    const format = document.querySelector('[data-filter="format"]')?.value || 'all';
    const day = document.querySelector('[data-filter="day"]')?.value || 'all';
    
    scheduleRows.forEach(row => {
      const rowLevel = row.getAttribute('data-level');
      const rowFormat = row.getAttribute('data-format');
      const rowDay = row.getAttribute('data-day');
      
      let show = true;
      
      if (level !== 'all' && rowLevel !== level) show = false;
      if (format !== 'all' && rowFormat !== format) show = false;
      if (day !== 'all' && rowDay !== day) show = false;
      
      if (show) {
        row.classList.remove('hidden');
      } else {
        row.classList.add('hidden');
      }
    });
  }
}

// Lazy loading for images
function initLazyLoading() {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            img.classList.add('loaded');
            observer.unobserve(img);
          }
        }
      });
    });
    
    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach(img => imageObserver.observe(img));
  } else {
    // Fallback for browsers without IntersectionObserver
    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach(img => {
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
    });
  }
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    if (href === '#') return;
    
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// Fixed CTA button scroll behavior
const fixedCTA = document.querySelector('.fixed-cta');
if (fixedCTA) {
  window.addEventListener('scroll', function() {
    if (window.scrollY > 300) {
      fixedCTA.style.display = 'block';
    } else {
      fixedCTA.style.display = 'none';
    }
  });
}
