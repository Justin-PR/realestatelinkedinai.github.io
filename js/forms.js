// Form handling and lead capture functionality
class FormHandler {
    constructor() {
        this.forms = new Map();
        this.init();
    }

    init() {
        this.setupForms();
        this.setupAutoComplete();
        this.setupFormProgress();
        this.setupExitIntent();
    }

    setupForms() {
        const forms = document.querySelectorAll('.lead-form');
        
        forms.forEach(form => {
            const formId = form.id || this.generateFormId();
            this.forms.set(formId, {
                element: form,
                attempts: 0,
                startTime: Date.now(),
                fields: this.getFormFields(form)
            });
            
            this.enhanceForm(form, formId);
        });
    }

    generateFormId() {
        return 'form_' + Math.random().toString(36).substr(2, 9);
    }

    getFormFields(form) {
        const fields = {};
        const inputs = form.querySelectorAll('.form__input');
        
        inputs.forEach(input => {
            fields[input.name || input.type] = {
                element: input,
                touched: false,
                valid: false,
                value: ''
            };
        });
        
        return fields;
    }

    enhanceForm(form, formId) {
        const inputs = form.querySelectorAll('.form__input');
        
        inputs.forEach(input => {
            // Add input event listeners
            input.addEventListener('input', (e) => {
                this.handleInputChange(e, formId);
            });
            
            input.addEventListener('focus', (e) => {
                this.handleInputFocus(e, formId);
            });
            
            input.addEventListener('blur', (e) => {
                this.handleInputBlur(e, formId);
            });
            
            // Add placeholder animation
            this.addPlaceholderAnimation(input);
        });
        
        // Add form submission handler
        form.addEventListener('submit', (e) => {
            this.handleFormSubmit(e, formId);
        });
    }

    addPlaceholderAnimation(input) {
        const wrapper = document.createElement('div');
        wrapper.className = 'form__input-wrapper';
        
        const label = document.createElement('label');
        label.className = 'form__label';
        label.textContent = input.placeholder;
        label.setAttribute('for', input.id || '');
        
        input.parentNode.insertBefore(wrapper, input);
        wrapper.appendChild(label);
        wrapper.appendChild(input);
        
        // Clear placeholder since we're using label
        input.placeholder = '';
        
        // Add floating label functionality
        const updateLabel = () => {
            if (input.value || input === document.activeElement) {
                wrapper.classList.add('form__input-wrapper--active');
            } else {
                wrapper.classList.remove('form__input-wrapper--active');
            }
        };
        
        input.addEventListener('focus', updateLabel);
        input.addEventListener('blur', updateLabel);
        input.addEventListener('input', updateLabel);
        
        // Initial state
        updateLabel();
    }

    handleInputChange(event, formId) {
        const input = event.target;
        const formData = this.forms.get(formId);
        const fieldName = input.name || input.type;
        
        if (formData && formData.fields[fieldName]) {
            formData.fields[fieldName].value = input.value;
            formData.fields[fieldName].touched = true;
            
            // Real-time validation
            this.validateField(input, formId);
        }
        
        this.trackFieldInteraction(input, 'input_change');
    }

    handleInputFocus(event, formId) {
        const input = event.target;
        this.trackFieldInteraction(input, 'input_focus');
        
        // Add focus styling
        input.parentElement.classList.add('form__input-wrapper--focused');
        
        // Track time to focus for UX analysis
        const formData = this.forms.get(formId);
        if (formData) {
            const timeToFocus = Date.now() - formData.startTime;
            this.trackEvent('form_field_focus_time', {
                field: input.name || input.type,
                time_to_focus: timeToFocus
            });
        }
    }

    handleInputBlur(event, formId) {
        const input = event.target;
        input.parentElement.classList.remove('form__input-wrapper--focused');
        
        // Validate on blur
        this.validateField(input, formId);
    }

    validateField(input, formId) {
        const value = input.value.trim();
        let isValid = true;
        let errorMessage = '';
        
        // Always clear errors first to prevent duplicates
        this.clearFieldError(input);
        
        // Required field validation
        if (input.required && !value) {
            isValid = false;
            errorMessage = 'This field is required';
        }
        
        // Email validation
        else if (input.type === 'email' && value) {
            const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address';
            }
        }
        
        // Phone validation
        else if (input.type === 'tel' && value) {
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            const cleanPhone = value.replace(/[\s\-\(\)]/g, '');
            if (!phoneRegex.test(cleanPhone) || cleanPhone.length < 10) {
                isValid = false;
                errorMessage = 'Please enter a valid phone number';
            }
        }
        
        // Name validation
        else if (input.type === 'text' && (input.name === 'name' || input.id.includes('name')) && value) {
            if (value.length < 2) {
                isValid = false;
                errorMessage = 'Please enter your full name';
            }
        }
        
        // Update field state
        const formData = this.forms.get(formId);
        if (formData && formData.fields[input.name || input.type]) {
            formData.fields[input.name || input.type].valid = isValid;
        }
        
        // Show error only if invalid
        if (!isValid) {
            this.showFieldError(input, errorMessage);
        }
        
        return isValid;
    }

    showFieldError(input, message) {
        // Find the correct wrapper - look for form__field first, then parent
        const wrapper = input.closest('.form__field') || input.closest('.form__input-wrapper') || input.parentElement;
        
        // Remove any existing error styling and elements first
        this.clearFieldError(input);
        
        // Add error styling
        wrapper.classList.add('form__field--error');
        input.classList.add('form__input--error');
        
        // Create or update error element
        let errorElement = wrapper.querySelector('.form__error-message');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'form__error-message';
            wrapper.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
        errorElement.style.display = 'flex';
    }

    clearFieldError(input) {
        // Find the correct wrapper
        const wrapper = input.closest('.form__field') || input.closest('.form__input-wrapper') || input.parentElement;
        
        // Remove all error styling
        wrapper.classList.remove('form__field--error', 'form__input-wrapper--error');
        input.classList.remove('form__input--error');
        
        // Remove all error elements to prevent duplicates
        const errorElements = wrapper.querySelectorAll('.form__error, .form__error-message');
        errorElements.forEach(element => {
            element.remove();
        });
    }

    handleFormSubmit(event, formId) {
        event.preventDefault();
        
        const form = event.target;
        const formData = this.forms.get(formId);
        
        if (!formData) return;
        
        formData.attempts++;
        
        // Validate all fields
        const inputs = form.querySelectorAll('.form__input');
        let isFormValid = true;
        
        inputs.forEach(input => {
            if (!this.validateField(input, formId)) {
                isFormValid = false;
            }
        });
        
        if (!isFormValid) {
            this.handleFormError(form, 'Please correct the errors above');
            this.trackEvent('form_validation_error', {
                form_id: formId,
                attempt: formData.attempts
            });
            return;
        }
        
        // Collect and submit data
        this.submitFormData(form, formId);
    }

    async submitFormData(form, formId) {
        const formData = this.forms.get(formId);
        const submitButton = form.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        
        // Show loading state
        this.setFormLoading(form, submitButton, true);
        
        try {
            // Collect form data
            const data = this.collectFormData(form);
            data.form_id = formId;
            data.timestamp = new Date().toISOString();
            data.user_agent = navigator.userAgent;
            data.referrer = document.referrer;
            
            // Add UTM parameters if available
            data.utm = this.getUTMParameters();
            
            // Submit to multiple endpoints
            const submissions = [
                this.submitToAPI(data),
                this.submitToEmail(data),
                this.submitToWebhook(data)
            ];
            
            const results = await Promise.allSettled(submissions);
            
            // Check if at least one submission succeeded
            const hasSuccess = results.some(result => result.status === 'fulfilled');
            
            if (hasSuccess) {
                this.handleFormSuccess(form, formId, data);
            } else {
                throw new Error('All submission methods failed');
            }
            
        } catch (error) {
            console.error('Form submission error:', error);
            this.handleFormError(form, 'Submission failed. Please try again or contact support.');
            this.trackEvent('form_submit_error', {
                form_id: formId,
                error: error.message,
                attempt: formData.attempts
            });
        } finally {
            this.setFormLoading(form, submitButton, false, originalButtonText);
        }
    }

    collectFormData(form) {
        const formData = new FormData(form);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        return data;
    }

    async submitToAPI(data) {
        const response = await fetch('/api/submit-lead', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error(`API submission failed: ${response.status}`);
        }
        
        return response.json();
    }

    async submitToEmail(data) {
        // Using a service like EmailJS or Formspree
        const response = await fetch('https://formspree.io/f/xzzgopaw', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error(`Email submission failed: ${response.status}`);
        }
        
        return response.json();
    }

    async submitToWebhook(data) {
        // Webhook for CRM integration (like Zapier)
        const webhookUrl = 'https://hooks.zapier.com/hooks/catch/your-webhook-id';
        
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error(`Webhook submission failed: ${response.status}`);
        }
        
        return response.json();
    }

    setFormLoading(form, button, isLoading, originalText = 'Submit') {
        if (isLoading) {
            button.disabled = true;
            button.textContent = 'Submitting...';
            form.classList.add('form--loading');
        } else {
            button.disabled = false;
            button.textContent = originalText;
            form.classList.remove('form--loading');
        }
    }

    handleFormSuccess(form, formId, data) {
        // Track successful submission
        this.trackEvent('form_submit_success', {
            form_id: formId,
            conversion_type: this.getConversionType(form)
        });
        
        // Trigger PDF download
        this.triggerPDFDownload();
        
        // Show success message
        this.showSuccessMessage(form, data);
        
        // Trigger additional actions
        this.triggerPostSubmissionActions(data);
    }

    handleFormError(form, message) {
        form.classList.add('form--error');
        
        // Show error message
        let errorContainer = form.querySelector('.form__error-container');
        if (!errorContainer) {
            errorContainer = document.createElement('div');
            errorContainer.className = 'form__error-container';
            form.insertBefore(errorContainer, form.firstChild);
        }
        
        errorContainer.innerHTML = `
            <div class="form__error-message">
                <span class="error-icon">⚠️</span>
                ${message}
            </div>
        `;
        
        // Remove error state after animation
        setTimeout(() => {
            form.classList.remove('form--error');
        }, 3000);
    }

    showSuccessMessage(form, data) {
        const successMessage = document.createElement('div');
        successMessage.className = 'form__success-message';
        
        // Add mobile-specific styling to ensure proper viewport display
        this.applyMobileSuccessStyles(successMessage);
        
        const conversionType = this.getConversionType(form);
        let message = '';
        
        switch (conversionType) {
            case 'demo':
                message = `
                    <div class="success__icon">📅</div>
                    <h3>Demo Booked!</h3>
                    <p>We'll call you within 2 hours to schedule your demo.</p>
                    <div class="success__next-steps">
                        <h4>What happens next:</h4>
                        <ul>
                            <li>✅ Email confirmation</li>
                            <li>📞 Schedule call</li>
                            <li>🎯 Custom strategy</li>
                        </ul>
                    </div>
                `;
                break;
            case 'email_capture':
            default:
                message = `
                    <div class="success__icon">🎉</div>
                    <h3>Success!</h3>
                    <p>Your strategy guide is downloading. <a href="assets/downloads/linkedin-authority-strategy-guide.html" target="_blank" class="download-backup-link">Click here if it doesn't start</a></p>
                    <div class="success__next-steps">
                        <h4>Includes:</h4>
                        <ul>
                            <li>📊 Lead Reports</li>
                            <li>📝 Templates</li>
                            <li>🎯 Strategy Guide</li>
                        </ul>
                    </div>
                `;
                break;
        }
        
        successMessage.innerHTML = message;
        
        // ALWAYS use safe positioning to avoid any background conflicts
        // Find the form's containing section
        const currentSection = form.closest('section');
        const nextSection = currentSection ? currentSection.nextElementSibling : null;
        
        // Hide the form instead of removing it
        form.style.display = 'none';
        
        // Create a standalone success container that's always safe
        const successContainer = document.createElement('div');
        successContainer.className = 'success-section';
        successContainer.style.cssText = `
            background: white !important;
            padding: 3rem 0 !important;
            width: 100% !important;
            position: relative !important;
            z-index: 1000 !important;
            clear: both !important;
            border-top: 1px solid #e2e8f0;
            margin: 0 !important;
        `;
        
        const containerDiv = document.createElement('div');
        containerDiv.className = 'container';
        containerDiv.style.cssText = `
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 1rem;
        `;
        containerDiv.appendChild(successMessage);
        successContainer.appendChild(containerDiv);
        
        // Always insert after the current section, regardless of which section it is
        if (currentSection && nextSection) {
            currentSection.parentNode.insertBefore(successContainer, nextSection);
        } else if (currentSection) {
            currentSection.parentNode.appendChild(successContainer);
        } else {
            // Fallback: insert after body content
            document.body.appendChild(successContainer);
        }
        
        // Add success animation
        successMessage.classList.add('animate-scale-in');
        
        // Ensure mobile viewport positioning after DOM insertion
        setTimeout(() => {
            this.ensureMobileViewport(successMessage);
            // Always scroll to success message since it's now in a new section
            successMessage.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }, 100);
    }
    
    applyMobileSuccessStyles(successMessage) {
        // Detect mobile device
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const isSmallScreen = window.innerWidth <= 768;
        
        if (isMobile || isSmallScreen) {
            // Apply aggressive inline styles for mobile rendering
            const mobileStyles = {
                'max-width': window.innerWidth <= 480 ? 'calc(100vw - 0.5rem)' : 'calc(60vw - 1rem)',
                'width': window.innerWidth <= 480 ? 'calc(100vw - 0.5rem)' : 'calc(60vw - 1rem)',
                'padding': window.innerWidth <= 480 ? '0.75rem 0.5rem' : '1rem 0.75rem',
                'margin': window.innerWidth <= 480 ? '0.75rem 0.25rem' : '1rem 0',
                'margin-left': window.innerWidth <= 480 ? '0.25rem' : '0.5rem',
                'margin-right': 'auto',
                'box-sizing': 'border-box',
                'position': 'relative',
                'left': '0',
                'float': 'left',
                'clear': 'both',
                'word-wrap': 'break-word',
                'overflow-wrap': 'break-word',
                'white-space': 'normal',
                'overflow': 'hidden',
                'text-overflow': 'ellipsis'
            };
            
            Object.assign(successMessage.style, mobileStyles);
            
            // Add mobile class for additional CSS targeting
            successMessage.classList.add('success-message--mobile', 'success-message--left');
        } else {
            // Desktop styling - keep on left side but larger and more readable
            const desktopStyles = {
                'max-width': '50%',
                'width': '50%',
                'padding': '2rem 1.5rem',
                'margin': '1.5rem 0',
                'margin-left': '0',
                'margin-right': 'auto',
                'float': 'left',
                'clear': 'both',
                'box-sizing': 'border-box',
                'font-size': '1rem',
                'background': 'var(--neutral-white)',
                'border': '2px solid var(--success)',
                'border-radius': 'var(--radius-xl)',
                'box-shadow': 'var(--shadow-lg)',
                'position': 'relative',
                'z-index': '100',
                'overflow': 'visible',
                'text-overflow': 'initial'
            };
            
            Object.assign(successMessage.style, desktopStyles);
            successMessage.classList.add('success-message--left');
        }
    }
    
    ensureMobileViewport(successMessage) {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const isSmallScreen = window.innerWidth <= 768;
        
        if (isMobile || isSmallScreen) {
            // Force viewport positioning for left-side display
            successMessage.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start',
                inline: 'start'
            });
            
            // Apply additional mobile styling to child elements
            const nextSteps = successMessage.querySelector('.success__next-steps');
            if (nextSteps) {
                nextSteps.style.width = '100%';
                nextSteps.style.wordWrap = 'break-word';
                nextSteps.style.overflowWrap = 'break-word';
                
                const listItems = nextSteps.querySelectorAll('li');
                listItems.forEach(li => {
                    li.style.wordWrap = 'break-word';
                    li.style.overflowWrap = 'break-word';
                    li.style.whiteSpace = 'normal';
                    li.style.fontSize = window.innerWidth <= 480 ? '0.875rem' : '1rem';
                    li.style.lineHeight = '1.4';
                });
            }
            
            // Ensure proper text sizing on very small screens
            if (window.innerWidth <= 480) {
                const heading = successMessage.querySelector('h3');
                if (heading) {
                    heading.style.fontSize = '1.1rem';
                    heading.style.lineHeight = '1.2';
                    heading.style.wordWrap = 'break-word';
                }
                
                const icon = successMessage.querySelector('.success__icon');
                if (icon) {
                    icon.style.fontSize = '1.5rem';
                }
                
                const paragraph = successMessage.querySelector('p');
                if (paragraph) {
                    paragraph.style.fontSize = '0.8rem';
                    paragraph.style.lineHeight = '1.3';
                    paragraph.style.wordWrap = 'break-word';
                    paragraph.style.overflowWrap = 'break-word';
                }
                
                const downloadLink = successMessage.querySelector('.download-backup-link');
                if (downloadLink) {
                    downloadLink.style.fontSize = '0.8rem';
                    downloadLink.style.wordBreak = 'break-word';
                }
            }
        } else {
            // Desktop enhancements for better readability
            const heading = successMessage.querySelector('h3');
            if (heading) {
                heading.style.fontSize = '1.5rem';
                heading.style.lineHeight = '1.3';
                heading.style.marginBottom = '1rem';
            }
            
            const paragraph = successMessage.querySelector('p');
            if (paragraph) {
                paragraph.style.fontSize = '1rem';
                paragraph.style.lineHeight = '1.5';
                paragraph.style.marginBottom = '1.25rem';
            }
            
            const icon = successMessage.querySelector('.success__icon');
            if (icon) {
                icon.style.fontSize = '2.5rem';
                icon.style.marginBottom = '1rem';
            }
            
            const nextSteps = successMessage.querySelector('.success__next-steps');
            if (nextSteps) {
                nextSteps.style.marginTop = '1.25rem';
                
                const listItems = nextSteps.querySelectorAll('li');
                listItems.forEach(li => {
                    li.style.fontSize = '1rem';
                    li.style.lineHeight = '1.5';
                    li.style.padding = '0.5rem 0';
                });
                
                const h4 = nextSteps.querySelector('h4');
                if (h4) {
                    h4.style.fontSize = '1.125rem';
                    h4.style.marginBottom = '0.75rem';
                }
            }
        }
    }

    getConversionType(form) {
        if (form.classList.contains('lead-form--demo')) {
            return 'demo';
        }
        return 'email_capture';
    }

    triggerPDFDownload() {
        try {
            // Open strategy guide in new tab
            const guideUrl = 'assets/downloads/linkedin-authority-strategy-guide.html';
            window.open(guideUrl, '_blank');
            
            // Track download event
            this.trackEvent('strategy_guide_view', {
                file_name: 'LinkedIn-Authority-Strategy-Guide',
                download_method: 'automatic',
                status: 'success'
            });
        } catch (error) {
            console.error('Strategy guide view failed:', error);
            
            // Track download failure
            this.trackEvent('strategy_guide_view', {
                file_name: 'LinkedIn-Authority-Strategy-Guide',
                download_method: 'automatic',
                status: 'failed',
                error: error.message
            });
            
            // Fallback: Try alternative URL
            window.open('assets/downloads/linkedin-authority-strategy-guide.html', '_blank');
        }
    }

    triggerPostSubmissionActions(data) {
        // Trigger Facebook Pixel event
        if (typeof fbq !== 'undefined') {
            fbq('track', 'Lead', {
                content_name: 'LinkedIn Authority AI',
                content_category: 'Real Estate Software',
                value: 197, // Average customer value
                currency: 'USD'
            });
        }
        
        // Trigger Google Ads conversion
        if (typeof gtag !== 'undefined') {
            gtag('event', 'conversion', {
                send_to: 'AW-CONVERSION_ID/CONVERSION_LABEL',
                value: 197,
                currency: 'USD'
            });
        }
        
        // Redirect to thank you page (optional)
        // window.location.href = '/thank-you';
    }

    setupAutoComplete() {
        // Add autocomplete attributes for better UX
        const emailInputs = document.querySelectorAll('input[type="email"]');
        emailInputs.forEach(input => {
            input.setAttribute('autocomplete', 'email');
        });
        
        const nameInputs = document.querySelectorAll('input[name*="name"]');
        nameInputs.forEach(input => {
            input.setAttribute('autocomplete', 'name');
        });
        
        const phoneInputs = document.querySelectorAll('input[type="tel"]');
        phoneInputs.forEach(input => {
            input.setAttribute('autocomplete', 'tel');
        });
    }

    setupFormProgress() {
        // Track form completion progress
        const forms = document.querySelectorAll('.lead-form--demo');
        
        forms.forEach(form => {
            const inputs = form.querySelectorAll('.form__input');
            const totalFields = inputs.length;
            
            inputs.forEach(input => {
                input.addEventListener('input', () => {
                    const completedFields = Array.from(inputs).filter(inp => inp.value.trim()).length;
                    const progress = (completedFields / totalFields) * 100;
                    
                    this.trackEvent('form_progress', {
                        progress: Math.round(progress),
                        completed_fields: completedFields,
                        total_fields: totalFields
                    });
                });
            });
        });
    }

    setupExitIntent() {
        let exitIntentShown = false;
        
        document.addEventListener('mouseleave', (e) => {
            if (e.clientY <= 0 && !exitIntentShown) {
                exitIntentShown = true;
                this.showExitIntentPopup();
            }
        });
    }

    showExitIntentPopup() {
        // Create exit intent popup
        const popup = document.createElement('div');
        popup.className = 'exit-intent-popup';
        popup.innerHTML = `
            <div class="popup__overlay">
                <div class="popup__content">
                    <button class="popup__close">&times;</button>
                    <h3>Wait! Don't Miss Out on 277% More Leads</h3>
                    <p>Get your free LinkedIn Authority Content Kit before you go. It includes everything you need to start attracting high-net-worth clients on LinkedIn.</p>
                    <form class="popup__form">
                        <input type="email" placeholder="Enter your email" class="popup__input" required>
                        <button type="submit" class="btn btn--primary">Get Free Kit</button>
                    </form>
                </div>
            </div>
        `;
        
        document.body.appendChild(popup);
        
        // Add event listeners
        const closeButton = popup.querySelector('.popup__close');
        const overlay = popup.querySelector('.popup__overlay');
        const form = popup.querySelector('.popup__form');
        
        const closePopup = () => {
            popup.remove();
        };
        
        closeButton.addEventListener('click', closePopup);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closePopup();
        });
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = form.querySelector('.popup__input').value;
            
            // Submit email
            this.submitToEmail({ email, source: 'exit_intent' });
            
            // Show success and close
            form.innerHTML = '<p>✅ Thank you! Check your email for the free kit.</p>';
            setTimeout(closePopup, 2000);
            
            this.trackEvent('exit_intent_conversion', { email });
        });
        
        // Track exit intent shown
        this.trackEvent('exit_intent_shown');
    }

    getUTMParameters() {
        const urlParams = new URLSearchParams(window.location.search);
        return {
            utm_source: urlParams.get('utm_source'),
            utm_medium: urlParams.get('utm_medium'),
            utm_campaign: urlParams.get('utm_campaign'),
            utm_term: urlParams.get('utm_term'),
            utm_content: urlParams.get('utm_content')
        };
    }

    trackFieldInteraction(input, action) {
        this.trackEvent('form_field_interaction', {
            field_name: input.name || input.type,
            field_type: input.type,
            action: action
        });
    }

    trackEvent(eventName, properties = {}) {
        // Use the main app's tracking method if available
        if (window.linkedInAuthorityApp && window.linkedInAuthorityApp.trackEvent) {
            window.linkedInAuthorityApp.trackEvent(eventName, properties);
        } else {
            console.log('Form Event:', eventName, properties);
        }
    }
}

// Initialize form handler
document.addEventListener('DOMContentLoaded', () => {
    window.formHandler = new FormHandler();
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FormHandler;
}