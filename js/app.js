// Main Application JavaScript
class LinkedInAuthorityApp {
    constructor() {
        this.init();
    }

    init() {
        this.setupScrollAnimations();
        this.setupSmoothScrolling();
        this.setupAnimationObserver();
        this.setupPricingInteractions();
        this.setupFAQAccordion();
        this.setupNavbarScrollEffect();
        this.setupFormValidation();
        this.setupLegalSections();
        this.trackPageViews();
    }

    // Smooth scrolling for navigation links
    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    const headerOffset = 80;
                    const elementPosition = target.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // Intersection Observer for scroll animations
    setupAnimationObserver() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe elements with scroll animation classes
        document.querySelectorAll('.scroll-fade-in, .scroll-fade-in-left, .scroll-fade-in-right').forEach(el => {
            observer.observe(el);
        });
    }

    // Add scroll animations to sections
    setupScrollAnimations() {
        const sections = document.querySelectorAll('section');
        sections.forEach((section, index) => {
            const animationClass = index % 2 === 0 ? 'scroll-fade-in-left' : 'scroll-fade-in-right';
            section.classList.add(animationClass);
        });

        // Add staggered animation to grid items
        document.querySelectorAll('.problem__grid, .features__grid, .testimonials__grid').forEach(grid => {
            grid.classList.add('stagger-fade-in');
        });
    }

    // Pricing plan interactions
    setupPricingInteractions() {
        const pricingPlans = document.querySelectorAll('.pricing__plan');
        
        pricingPlans.forEach(plan => {
            const button = plan.querySelector('.btn');
            if (button) {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    const planType = plan.querySelector('h3').textContent;
                    this.trackEvent('pricing_plan_click', { plan: planType });
                    
                    // Show demo form or redirect to sign-up
                    this.showDemoForm(planType);
                });
            }
        });
    }

    // FAQ Accordion functionality
    setupFAQAccordion() {
        const faqItems = document.querySelectorAll('.faq__item');
        
        faqItems.forEach(item => {
            const question = item.querySelector('.faq__question');
            const answer = item.querySelector('.faq__answer');
            
            // Initially hide answers
            answer.style.display = 'none';
            question.style.cursor = 'pointer';
            question.innerHTML += ' <span class="faq__toggle">+</span>';
            
            question.addEventListener('click', () => {
                const isOpen = answer.style.display === 'block';
                const toggle = question.querySelector('.faq__toggle');
                
                if (isOpen) {
                    answer.style.display = 'none';
                    toggle.textContent = '+';
                    item.classList.remove('faq__item--open');
                } else {
                    answer.style.display = 'block';
                    toggle.textContent = '−';
                    item.classList.add('faq__item--open');
                }
                
                this.trackEvent('faq_click', { question: question.textContent });
            });
        });
    }

    // Navbar scroll effect
    setupNavbarScrollEffect() {
        const header = document.querySelector('.header');
        let lastScrollY = window.scrollY;
        
        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;
            
            if (currentScrollY > 100) {
                header.classList.add('header--scrolled');
            } else {
                header.classList.remove('header--scrolled');
            }
            
            // Hide/show header based on scroll direction
            if (currentScrollY > lastScrollY && currentScrollY > 200) {
                header.style.transform = 'translateY(-100%)';
            } else {
                header.style.transform = 'translateY(0)';
            }
            
            lastScrollY = currentScrollY;
        });
    }

    // Form validation
    setupFormValidation() {
        const forms = document.querySelectorAll('.lead-form');
        
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmission(form);
            });
            
            // Real-time validation
            const inputs = form.querySelectorAll('.form__input');
            inputs.forEach(input => {
                input.addEventListener('blur', () => {
                    this.validateInput(input);
                });
            });
        });
    }

    // Input validation
    validateInput(input) {
        const value = input.value.trim();
        let isValid = true;
        
        // Remove previous error states
        input.classList.remove('form__input--error');
        this.removeErrorMessage(input);
        
        // Email validation
        if (input.type === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                this.showErrorMessage(input, 'Please enter a valid email address');
            }
        }
        
        // Phone validation
        if (input.type === 'tel') {
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            if (!phoneRegex.test(value.replace(/\s/g, ''))) {
                isValid = false;
                this.showErrorMessage(input, 'Please enter a valid phone number');
            }
        }
        
        // Required field validation
        if (input.required && !value) {
            isValid = false;
            this.showErrorMessage(input, 'This field is required');
        }
        
        if (!isValid) {
            input.classList.add('form__input--error');
        }
        
        return isValid;
    }

    // Show error message
    showErrorMessage(input, message) {
        const errorElement = document.createElement('div');
        errorElement.className = 'form__error';
        errorElement.textContent = message;
        input.parentNode.insertBefore(errorElement, input.nextSibling);
    }

    // Remove error message
    removeErrorMessage(input) {
        const errorElement = input.parentNode.querySelector('.form__error');
        if (errorElement) {
            errorElement.remove();
        }
    }

    // Handle form submission
    handleFormSubmission(form) {
        const inputs = form.querySelectorAll('.form__input');
        let isFormValid = true;
        
        // Validate all inputs
        inputs.forEach(input => {
            if (!this.validateInput(input)) {
                isFormValid = false;
            }
        });
        
        if (!isFormValid) {
            form.classList.add('form-error');
            setTimeout(() => {
                form.classList.remove('form-error');
            }, 600);
            return;
        }
        
        // Show loading state
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Submitting...';
        submitButton.disabled = true;
        form.classList.add('loading');
        
        // Collect form data
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // Simulate form submission (replace with actual API call)
        setTimeout(() => {
            this.submitForm(data, form, submitButton, originalText);
        }, 1500);
    }

    // Submit form data
    async submitForm(data, form, submitButton, originalText) {
        try {
            // Replace with actual API endpoint
            const response = await fetch('/api/submit-lead', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            if (response.ok) {
                this.showSuccessMessage(form);
                this.trackEvent('form_submit_success', { form_type: form.id });
                form.reset();
            } else {
                throw new Error('Submission failed');
            }
        } catch (error) {
            console.error('Form submission error:', error);
            this.showErrorMessage(form.querySelector('.form__input'), 'Submission failed. Please try again.');
            this.trackEvent('form_submit_error', { form_type: form.id });
        } finally {
            // Reset button state
            submitButton.textContent = originalText;
            submitButton.disabled = false;
            form.classList.remove('loading');
        }
    }

    // Show success message
    showSuccessMessage(form) {
        // Trigger PDF download
        this.triggerPDFDownload();
        
        const successMessage = document.createElement('div');
        successMessage.className = 'form__success';
        successMessage.innerHTML = `
            <div class="success__icon">✓</div>
            <h3>Download Started!</h3>
            <p>Your guide is downloading. <a href="assets/downloads/linkedin-authority-strategy-guide.pdf" download="LinkedIn-Authority-Strategy-Guide.pdf" class="download-backup-link">Click here</a> if it doesn't start.</p>
        `;
        
        form.parentNode.replaceChild(successMessage, form);
        
        // Add success animation
        successMessage.classList.add('form-success');
    }
    
    // Trigger PDF download
    triggerPDFDownload() {
        try {
            const pdfUrl = 'assets/downloads/linkedin-authority-strategy-guide.pdf';
            const downloadLink = document.createElement('a');
            downloadLink.href = pdfUrl;
            downloadLink.download = 'LinkedIn-Authority-Strategy-Guide.pdf';
            downloadLink.style.display = 'none';
            
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            
            // Track download event
            this.trackEvent('pdf_download', {
                file_name: 'LinkedIn-Authority-Strategy-Guide.pdf',
                download_method: 'automatic',
                status: 'success'
            });
        } catch (error) {
            console.error('PDF download failed:', error);
            
            // Track download failure
            this.trackEvent('pdf_download', {
                file_name: 'LinkedIn-Authority-Strategy-Guide.pdf',
                download_method: 'automatic',
                status: 'failed',
                error: error.message
            });
            
            // Fallback: Open PDF in new tab
            window.open('assets/downloads/linkedin-authority-strategy-guide.pdf', '_blank');
        }
    }

    // Show demo form
    showDemoForm(planType) {
        const demoSection = document.querySelector('#demo');
        if (demoSection) {
            demoSection.scrollIntoView({ behavior: 'smooth' });
            
            // Highlight the demo form
            const demoForm = demoSection.querySelector('.lead-form--demo');
            if (demoForm) {
                demoForm.classList.add('form--highlighted');
                setTimeout(() => {
                    demoForm.classList.remove('form--highlighted');
                }, 2000);
            }
        }
    }

    // Event tracking
    trackEvent(eventName, properties = {}) {
        // Google Analytics 4
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, properties);
        }
        
        // Facebook Pixel
        if (typeof fbq !== 'undefined') {
            fbq('track', eventName, properties);
        }
        
        // Console log for development
        console.log('Event tracked:', eventName, properties);
    }

    // Track page views
    trackPageViews() {
        // Track initial page view
        this.trackEvent('page_view', {
            page_title: document.title,
            page_location: window.location.href
        });
        
        // Track scroll depth
        let maxScroll = 0;
        const scrollDepthThresholds = [25, 50, 75, 100];
        
        window.addEventListener('scroll', () => {
            const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
            
            if (scrollPercent > maxScroll) {
                maxScroll = scrollPercent;
                
                scrollDepthThresholds.forEach(threshold => {
                    if (scrollPercent >= threshold && !this[`tracked_${threshold}`]) {
                        this.trackEvent('scroll_depth', { depth: threshold });
                        this[`tracked_${threshold}`] = true;
                    }
                });
            }
        });
    }

    // Utility method to get URL parameters
    getUrlParameter(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    }

    // Track UTM parameters
    trackUTMParameters() {
        const utmParams = {
            utm_source: this.getUrlParameter('utm_source'),
            utm_medium: this.getUrlParameter('utm_medium'),
            utm_campaign: this.getUrlParameter('utm_campaign'),
            utm_term: this.getUrlParameter('utm_term'),
            utm_content: this.getUrlParameter('utm_content')
        };
        
        // Only track if UTM parameters exist
        if (Object.values(utmParams).some(param => param !== null)) {
            this.trackEvent('utm_tracking', utmParams);
        }
    }

    // Setup legal sections show/hide functionality
    setupLegalSections() {
        // Handle privacy policy links
        document.querySelectorAll('a[href="#privacy-policy"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleLegalSection('privacy-policy');
            });
        });

        // Handle terms of service links
        document.querySelectorAll('a[href="#terms-of-service"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleLegalSection('terms-of-service');
            });
        });
    }

    // Toggle legal section visibility
    toggleLegalSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            // Hide all legal sections first
            document.querySelectorAll('.legal-section').forEach(s => {
                s.style.display = 'none';
            });

            // Show the requested section
            section.style.display = 'block';
            section.scrollIntoView({ behavior: 'smooth' });

            // Track the view
            this.trackEvent('legal_section_view', { section: sectionId });
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.linkedInAuthorityApp = new LinkedInAuthorityApp();
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LinkedInAuthorityApp;
}