
// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-analytics.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, where } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDCaeJQf-MJEY1uJE7i2g2lNvBxR0iutb0",
    authDomain: "graduation-hust.firebaseapp.com",
    projectId: "graduation-hust",
    storageBucket: "graduation-hust.firebasestorage.app",
    messagingSenderId: "919618677213",
    appId: "1:919618677213:web:bfcc8c6ee16ebe1f52ae34",
    measurementId: "G-MWLBEL4F74"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

// Guest list data
let guestList = [];
let isLoading = false;

// Firebase functions
async function loadGuestsFromFirebase() {
    if (isLoading) return; // Prevent multiple simultaneous loads
    
    isLoading = true;
    showLoadingState();

    try {
        console.log('Loading guests from Firebase...');
        const q = query(collection(db, "guests"), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);
        
        guestList = [];
        querySnapshot.forEach((doc) => {
            guestList.push({ id: doc.id, ...doc.data() });
        });
        
        console.log(`Loaded ${guestList.length} guests from Firebase`);
        updateGuestList();
        
    } catch (error) {
        console.error("Error loading guests from Firebase:", error);
        showErrorState();
    } finally {
        isLoading = false;
        hideLoadingState();
    }
}

async function addGuestToFirebase(guestData) {
    try {
        const docRef = await addDoc(collection(db, "guests"), guestData);
        return docRef.id;
    } catch (error) {
        console.error("Error adding guest to Firebase:", error);
        throw error;
    }
}

async function checkGuestExists(phone) {
    try {
        const q = query(collection(db, "guests"), where("phone", "==", phone));
        const querySnapshot = await getDocs(q);
        return !querySnapshot.empty;
    } catch (error) {
        console.error("Error checking guest existence:", error);
        // If Firebase fails, check in local list as fallback
        return guestList.some(guest => guest.phone === phone);
    }
}

// Loading state functions
function showLoadingState() {
    const guestListContainer = document.getElementById('guest-list');
    const guestCount = document.getElementById('guest-count');
    
    guestCount.textContent = '...';
    guestListContainer.innerHTML = `
        <div class="loading-state">
            <div class="loading-spinner"></div>
            <p>🔄 Đang tải danh sách khách mời...</p>
        </div>
    `;
}

function hideLoadingState() {
    // Loading state will be replaced by actual content in updateGuestList()
}

function showErrorState() {
    const guestListContainer = document.getElementById('guest-list');
    const guestCount = document.getElementById('guest-count');
    
    guestCount.textContent = '❌';
    guestListContainer.innerHTML = `
        <div class="error-state">
            <p>❌ Không thể tải danh sách khách mời</p>
            <button onclick="retryLoadGuests()" class="retry-button">🔄 Thử lại</button>
        </div>
    `;
}

// Retry function
window.retryLoadGuests = function() {
    loadGuestsFromFirebase();
}

// Intersection Observer for scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            // Optional: Unobserve after animation to improve performance
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all elements with animate-on-scroll class
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach(el => {
        observer.observe(el);
    });
}

// Create floating particles
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 8 + 's';
        particle.style.animationDuration = (Math.random() * 3 + 5) + 's';
        particlesContainer.appendChild(particle);
    }
}

// Load photo function
window.loadPhoto = function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const photoDisplay = document.getElementById('photo-display');
            photoDisplay.innerHTML = `
                <img src="${e.target.result}" alt="Graduate Photo" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">
                <div class="upload-area" onclick="document.getElementById('photo-input').click()">
                    <div class="upload-text">Click để<br>thay đổi ảnh</div>
                </div>
            `;
        };
        reader.readAsDataURL(file);
    }
}

// Show RSVP Modal
window.showRSVPModal = function() {
    const modal = document.getElementById('rsvp-modal');
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Focus on name input
    setTimeout(() => {
        document.getElementById('guest-name').focus();
    }, 300);
}

// Close RSVP Modal
window.closeRSVPModal = function() {
    const modal = document.getElementById('rsvp-modal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    
    // Reset form
    document.getElementById('rsvp-form').reset();
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('rsvp-modal');
    if (event.target == modal) {
        closeRSVPModal();
    }
}

// Submit RSVP - Updated with better error handling
window.submitRSVP = async function(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const guestName = formData.get('guestName').trim();
    const guestPhone = formData.get('guestPhone').trim();
    
    // Validate required fields
    if (!guestName) {
        alert('⚠️ Vui lòng nhập tên của bạn!');
        return;
    }

    // Show loading state
    const submitButton = event.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Đang xử lý...';
    submitButton.disabled = true;

    try {
        // Check if phone number already exists (only if phone is provided)
        if (guestPhone && guestPhone !== '') {
            const exists = await checkGuestExists(guestPhone);
            if (exists) {
                alert('⚠️ Số điện thoại này đã được đăng ký rồi! Vui lòng kiểm tra lại hoặc liên hệ trực tiếp nếu có vấn đề.');
                return;
            }
        }

        const guestData = {
            name: guestName,
            nameLowerCase: guestName.toLowerCase(),
            phone: guestPhone || '', // Empty string if no phone provided
            note: formData.get('guestNote').trim(),
            timestamp: new Date().toISOString(),
            timestampDisplay: new Date().toLocaleString('vi-VN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            })
        };

        // Add to Firebase
        const docId = await addGuestToFirebase(guestData);
        console.log('Guest added to Firebase with ID:', docId);
        
        // Reload the entire guest list from Firebase to ensure consistency
        await loadGuestsFromFirebase();
        
        // Create success animation
        createConfetti();
        
        // Close modal and show success message
        closeRSVPModal();
        
        setTimeout(() => {
            alert(`🎉 Cảm ơn ${guestData.name} đã xác nhận tham dự!\n\n✨ Chúng tôi rất mong được gặp bạn trong ngày đặc biệt này!\n\n📋 Tên của bạn đã được thêm vào danh sách khách mời.`);
        }, 500);

    } catch (error) {
        console.error("Error submitting RSVP:", error);
        alert('❌ Có lỗi xảy ra khi đăng ký. Vui lòng thử lại sau!');
    } finally {
        // Reset button state
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    }
}

// Update guest list display
function updateGuestList() {
    const guestListContainer = document.getElementById('guest-list');
    const guestCount = document.getElementById('guest-count');
    
    guestCount.textContent = guestList.length;
    
    if (guestList.length === 0) {
        guestListContainer.innerHTML = `
            <div class="no-guests">
                <p>🎭 Chưa có khách nào xác nhận tham dự</p>
                <p style="margin-top: 10px; font-size: 0.9rem;">Hãy là người đầu tiên!</p>
            </div>
        `;
    } else {
        guestListContainer.innerHTML = guestList.map((guest, index) => `
            <div class="guest-item animate-on-scroll" style="animation-delay: ${index * 0.1}s;">
                <div class="guest-name">👤 ${guest.name}</div>
                ${guest.note ? `<div class="guest-note">"${guest.note}"</div>` : '<div class="guest-note">🎉 Sẽ tham dự</div>'}
                <div class="guest-time">📅 ${guest.timestampDisplay}</div>
            </div>
        `).join('');
        
        // Re-observe new guest items for animations
        const newGuestItems = guestListContainer.querySelectorAll('.guest-item');
        newGuestItems.forEach(item => {
            observer.observe(item);
        });
    }
}

// Decline attendance
window.regretAttendance = function() {
    setTimeout(() => {
        alert('😔 Rất tiếc khi bạn không thể tham dự.');
    }, 300);
}

// Create confetti effect
function createConfetti() {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7'];
    const emojis = ['🎉', '🎊', '✨', '🌟', '💫', '🎈'];
    
    for (let i = 0; i < 30; i++) {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
            position: fixed;
            left: ${Math.random() * 100}vw;
            top: -10px;
            font-size: ${Math.random() * 20 + 15}px;
            color: ${colors[Math.floor(Math.random() * colors.length)]};
            pointer-events: none;
            z-index: 9999;
            animation: confettiFall 3s linear forwards;
        `;
        confetti.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        document.body.appendChild(confetti);
        
        setTimeout(() => confetti.remove(), 3000);
    }
}

// Add confetti animation
const confettiStyle = document.createElement('style');
confettiStyle.textContent = `
    @keyframes confettiFall {
        to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
        }
    }
    
    .loading-state {
        text-align: center;
        padding: 40px 20px;
        color: #666;
    }
    
    .loading-spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #f3f3f3;
        border-top: 4px solid #4ecdc4;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 20px;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    .error-state {
        text-align: center;
        padding: 40px 20px;
        color: #ff6b6b;
    }
    
    .retry-button {
        background: #4ecdc4;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 25px;
        cursor: pointer;
        margin-top: 15px;
        font-size: 14px;
        transition: all 0.3s ease;
    }
    
    .retry-button:hover {
        background: #3ab0a8;
        transform: translateY(-2px);
    }
`;
document.head.appendChild(confettiStyle);

// Add mouse trail effect
let mouseTrail = [];
document.addEventListener('mousemove', (e) => {
    mouseTrail.push({ x: e.clientX, y: e.clientY, time: Date.now() });
    
    if (mouseTrail.length > 5) mouseTrail.shift();
    
    if (Math.random() < 0.1) {
        const trail = document.createElement('div');
        trail.style.cssText = `
            position: fixed;
            left: ${e.clientX}px;
            top: ${e.clientY}px;
            width: 4px;
            height: 4px;
            background: radial-gradient(circle, #4ecdc4, transparent);
            border-radius: 50%;
            pointer-events: none;
            z-index: 9998;
            animation: trailFade 1s ease-out forwards;
        `;
        document.body.appendChild(trail);
        setTimeout(() => trail.remove(), 1000);
    }
});

// Add trail fade animation
const trailStyle = document.createElement('style');
trailStyle.textContent = `
    @keyframes trailFade {
        from { opacity: 1; transform: scale(1); }
        to { opacity: 0; transform: scale(0); }
    }
`;
document.head.appendChild(trailStyle);

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // ESC to close modal
    if (e.key === 'Escape') {
        closeRSVPModal();
    }
    
    // Enter to submit form when modal is open
    if (e.key === 'Enter' && document.getElementById('rsvp-modal').style.display === 'block') {
        if (e.target.tagName !== 'TEXTAREA') {
            document.getElementById('rsvp-form').dispatchEvent(new Event('submit'));
        }
    }
});

// Add scroll progress indicator
function createScrollProgress() {
    const progressBar = document.createElement('div');
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 0%;
        height: 3px;
        background: linear-gradient(90deg, #4ecdc4, #ff6b6b);
        z-index: 10001;
        transition: width 0.1s ease;
    `;
    document.body.appendChild(progressBar);

    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset;
        const docHeight = document.body.offsetHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        progressBar.style.width = scrollPercent + '%';
    });
}

// Parallax effect for background elements
function initParallax() {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        
        const particles = document.getElementById('particles');
        if (particles) {
            particles.style.transform = `translateY(${rate}px)`;
        }
    });
}

// Add smooth reveal for detail cards with staggered animation
function enhanceDetailCards() {
    const detailCards = document.querySelectorAll('.detail-card');
    detailCards.forEach((card, index) => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
        });
    });
}

// Initialize everything - Updated to load guests first
window.addEventListener('load', async () => {
    console.log('Page loaded, initializing...');
    
    // Initialize visual effects first
    createParticles();
    initScrollAnimations();
    createScrollProgress();
    initParallax();
    enhanceDetailCards();
    
    // Load guests from Firebase as the main priority
    await loadGuestsFromFirebase();
    
    // Add a welcome bounce animation to the graduation icon
    const gradIcon = document.querySelector('.graduation-icon');
    if (gradIcon) {
        setTimeout(() => {
            gradIcon.style.animation = 'iconPulse 3s ease-in-out infinite, bounceWelcome 2s ease-out';
        }, 1000);
    }
    
    console.log('Initialization complete');
});

// Add welcome bounce animation
const welcomeStyle = document.createElement('style');
welcomeStyle.textContent = `
    @keyframes bounceWelcome {
        0%, 20%, 53%, 80%, 100% { transform: translate3d(0,0,0) scale(1); }
        40%, 43% { transform: translate3d(0, -15px, 0) scale(1.1); }
        70% { transform: translate3d(0, -7px, 0) scale(1.05); }
        90% { transform: translate3d(0, -2px, 0) scale(1.02); }
    }
`;
document.head.appendChild(welcomeStyle);

// Add typing effect for the message
function addTypingEffect() {
    const messageEl = document.querySelector('.message');
    if (!messageEl) return;
    
    const originalText = messageEl.textContent;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                messageEl.textContent = '';
                let i = 0;
                
                function typeWriter() {
                    if (i < originalText.length) {
                        messageEl.textContent += originalText.charAt(i);
                        i++;
                        setTimeout(typeWriter, 30);
                    }
                }
                
                setTimeout(typeWriter, 500);
                observer.unobserve(messageEl);
            }
        });
    });
    
    observer.observe(messageEl);
}

// Initialize typing effect after DOM is loaded
document.addEventListener('DOMContentLoaded', addTypingEffect);

// Auto-refresh guest list every 30 seconds (optional)
setInterval(() => {
    if (!isLoading) {
        console.log('Auto-refreshing guest list...');
        loadGuestsFromFirebase();
    }
}, 30000); // 30 seconds

// Manual refresh function
window.refreshGuestList = function() {
    if (!isLoading) {
        loadGuestsFromFirebase();
    }
}
