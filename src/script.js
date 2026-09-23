document.addEventListener('DOMContentLoaded', () => {
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    const loginForm = document.getElementById('loginForm');

    // Toggle password visibility
    togglePassword.addEventListener('click', () => {
        // Toggle the type attribute
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        // Optional: change icon based on visibility
        if (type === 'text') {
            togglePassword.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>';
        } else {
            togglePassword.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
        }
    });

    // Handle form submission
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const terminal = document.getElementById('terminal').value;
        const nik = document.getElementById('nik').value;
        const password = passwordInput.value;
        const remember = document.getElementById('remember').checked;

        // Basic validation
        if (!nik || !password) {
            alert('Mohon isi NIK / ID Operator dan Kata Sandi.');
            return;
        }

        console.log('Login attempt:', {
            terminal,
            nik,
            remember
        });

        // Simulate login process
        const btn = loginForm.querySelector('.btn-primary');
        const originalText = btn.innerHTML;
        
        btn.innerHTML = 'Memproses...';
        btn.disabled = true;

        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.disabled = false;
            alert('Proses login disimulasikan. Cek console untuk data.');
        }, 1500);
    });
});
