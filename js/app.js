import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js';
import { getFirestore, collection, addDoc, getDocs, orderBy, query, doc, setDoc } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js';
import { firebaseConfig } from './firebase-config.js';
import Router from './router.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Initialize Router
const router = new Router();

// Sample data untuk testing
const sampleChambers = [
    {
        id: 'chamber1',
        name: 'Inorganic Recyclable',
        type: 'recyclable',
        currentVolume: 45,
        maxVolume: 100,
        percentage: 45
    },
    {
        id: 'chamber2', 
        name: 'Inorganic Non-Recyclable',
        type: 'non-recyclable',
        currentVolume: 134,
        maxVolume: 180,
        percentage: 74
    },
    {
        id: 'chamber3',
        name: 'Organic',
        type: 'organic',
        currentVolume: 45,
        maxVolume: 100,
        percentage: 45
    }
];

// Dashboard functionality
async function loadChambers() {
    const container = document.getElementById('chambers-container');
    if (!container) return;

    try {
        // Coba ambil data dari Firebase, kalau error pakai sample data
        let chambers = sampleChambers;
        
        try {
            const querySnapshot = await getDocs(collection(db, "chambers"));
            if (!querySnapshot.empty) {
                chambers = [];
                querySnapshot.forEach((doc) => {
                    chambers.push({ id: doc.id, ...doc.data() });
                });
            } else {
                // Jika tidak ada data di Firebase, simpan sample data
                await initializeSampleData();
            }
        } catch (error) {
            console.log('Using sample data for chambers');
        }
        
        container.innerHTML = '';
        chambers.forEach(chamber => {
            const chamberElement = createChamberElement(chamber);
            container.appendChild(chamberElement);
        });
        
    } catch (error) {
        console.error('Error loading chambers:', error);
        container.innerHTML = '<div class="error">Error loading chambers data</div>';
    }
}

function createChamberElement(chamber) {
    const element = document.createElement('div');
    element.className = 'chamber-item';
    element.setAttribute('data-chamber-id', chamber.id);
    
    // Tentukan warna berdasarkan percentage
    let fillColor = 'green';
    if (chamber.percentage >= 70) {
        fillColor = 'red';
    } else if (chamber.percentage >= 50) {
        fillColor = 'yellow';
    }
    
    element.innerHTML = `
        <div class="chamber-visual">
            <div class="chamber-container">
                <div class="chamber-fill ${fillColor}" style="height: ${chamber.percentage}%"></div>
                <div class="chamber-percentage">${chamber.percentage}%</div>
            </div>
        </div>
        <div class="chamber-info">
            <h3>${chamber.name}</h3>
            <div class="chamber-volume">${chamber.currentVolume} / ${chamber.maxVolume} Liter</div>
            <div class="chamber-type ${chamber.type}">
                ${chamber.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </div>
        </div>
    `;
    
    return element;
}

async function initializeSampleData() {
    try {
        for (const chamber of sampleChambers) {
            await setDoc(doc(db, "chambers", chamber.id), chamber);
        }
        
        // Add some sample activity logs
        const activities = [
            { action: 'Chamber cleaned', chamber: 'Organic', timestamp: new Date() },
            { action: 'Waste collected', chamber: 'Inorganic Non-Recyclable', timestamp: new Date(Date.now() - 3600000) },
            { action: 'Maintenance completed', chamber: 'Inorganic Recyclable', timestamp: new Date(Date.now() - 7200000) }
        ];
        
        for (const activity of activities) {
            await addDoc(collection(db, "activities"), activity);
        }
        
        console.log('Sample data initialized');
    } catch (error) {
        console.error('Error initializing sample data:', error);
    }
}

// Detail page functionality
async function initDetailPage() {
    console.log('Initializing detail page...');
    await loadDetailChambers();
    await loadActivityLog();
}

async function loadDetailChambers() {
    const container = document.getElementById('detail-chambers');
    if (!container) return;
    
    try {
        let chambers = sampleChambers;
        
        try {
            const querySnapshot = await getDocs(collection(db, "chambers"));
            if (!querySnapshot.empty) {
                chambers = [];
                querySnapshot.forEach((doc) => {
                    chambers.push({ id: doc.id, ...doc.data() });
                });
            }
        } catch (error) {
            console.log('Using sample data for detail chambers');
        }
        
        container.innerHTML = '';
        chambers.forEach(chamber => {
            const chamberElement = createDetailChamberElement(chamber);
            container.appendChild(chamberElement);
        });
        
    } catch (error) {
        console.error('Error loading detail chambers:', error);
    }
}

function createDetailChamberElement(chamber) {
    const element = document.createElement('div');
    element.className = 'chamber-item';
    
    let fillColor = 'green';
    if (chamber.percentage >= 70) {
        fillColor = 'red';
    } else if (chamber.percentage >= 50) {
        fillColor = 'yellow';
    }
    
    element.innerHTML = `
        <div class="chamber-visual">
            <div class="chamber-container">
                <div class="chamber-fill ${fillColor}" style="height: ${chamber.percentage}%"></div>
                <div class="chamber-percentage">${chamber.percentage}%</div>
            </div>
        </div>
        <div class="chamber-info">
            <h3>${chamber.name}</h3>
            <div class="chamber-volume">${chamber.currentVolume} / ${chamber.maxVolume} Liter</div>
            <div class="chamber-type ${chamber.type}">
                ${chamber.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </div>
            <div style="margin-top: 1rem;">
                <small style="color: #666;">
                    Last updated: ${new Date().toLocaleString('id-ID')}
                </small>
            </div>
        </div>
    `;
    
    return element;
}

async function loadActivityLog() {
    const container = document.getElementById('activity-log');
    if (!container) return;
    
    try {
        container.innerHTML = '<div class="loading">Loading activity log</div>';
        
        const sampleActivities = [
            { action: 'Chamber cleaned', chamber: 'Organic', timestamp: new Date() },
            { action: 'Waste collected', chamber: 'Inorganic Non-Recyclable', timestamp: new Date(Date.now() - 3600000) },
            { action: 'Maintenance completed', chamber: 'Inorganic Recyclable', timestamp: new Date(Date.now() - 7200000) },
            { action: 'Alert resolved', chamber: 'Inorganic Non-Recyclable', timestamp: new Date(Date.now() - 10800000) }
        ];
        
        let activities = sampleActivities;
        
        try {
            const q = query(collection(db, "activities"), orderBy("timestamp", "desc"));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                activities = [];
                querySnapshot.forEach((doc) => {
                    activities.push({ id: doc.id, ...doc.data() });
                });
            }
        } catch (error) {
            console.log('Using sample data for activities');
        }
        
        container.innerHTML = '';
        activities.forEach(activity => {
            const logItem = document.createElement('div');
            logItem.className = 'log-item';
            logItem.innerHTML = `
                <div>
                    <strong>${activity.action}</strong>
                    <div style="color: #666; font-size: 0.9rem;">${activity.chamber}</div>
                </div>
                <div class="log-time">
                    ${activity.timestamp instanceof Date ? 
                        activity.timestamp.toLocaleString('id-ID') : 
                        new Date(activity.timestamp.seconds * 1000).toLocaleString('id-ID')
                    }
                </div>
            `;
            container.appendChild(logItem);
        });
        
    } catch (error) {
        console.error('Error loading activity log:', error);
        container.innerHTML = '<div class="error">Error loading activity log</div>';
    }
}

// Products page functionality
async function initProductsPage() {
    console.log('Initializing products page...');
    await loadProducts();
    
    // Handle add product form
    const form = document.getElementById('product-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await addProduct();
        });
    }
}

// Contact page functionality
function initContactPage() {
    console.log('Initializing contact page...');
    const form = document.getElementById('contact-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await submitContact();
        });
    }
}

// Firebase functions
async function addProduct() {
    const name = document.getElementById('product-name').value;
    const price = document.getElementById('product-price').value;
    const description = document.getElementById('product-description').value;

    if (!name || !price) {
        alert('Please fill in product name and price!');
        return;
    }

    try {
        await addDoc(collection(db, "products"), {
            name: name,
            price: parseFloat(price),
            description: description,
            createdAt: new Date()
        });
        
        alert('Product added successfully!');
        document.getElementById('product-form').reset();
        await loadProducts();
    } catch (error) {
        console.error('Error adding product:', error);
        alert('Error adding product. Please check your Firebase configuration.');
    }
}

async function loadProducts() {
    const container = document.getElementById('products-container');
    if (!container) return;

    try {
        container.innerHTML = '<div class="loading">Loading products</div>';
        
        const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            container.innerHTML = `
                <div class="product-card" style="grid-column: 1 / -1; text-align: center;">
                    <h3>No products yet</h3>
                    <p>Add your first product using the form below!</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = '';
        querySnapshot.forEach((doc) => {
            const product = doc.data();
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = `
                <h3>${product.name}</h3>
                <p class="price">Rp ${product.price.toLocaleString('id-ID')}</p>
                <p>${product.description || 'No description available'}</p>
                <small style="color: #888;">Added: ${product.createdAt.toDate().toLocaleDateString('id-ID')}</small>
            `;
            container.appendChild(productCard);
        });
    } catch (error) {
        console.error('Error loading products:', error);
        container.innerHTML = `
            <div class="product-card" style="grid-column: 1 / -1; text-align: center;">
                <h3>Error loading products</h3>
                <p>Please check your Firebase configuration and try again.</p>
                <button onclick="window.location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Retry
                </button>
            </div>
        `;
    }
}

async function submitContact() {
    const name = document.getElementById('contact-name').value;
    const email = document.getElementById('contact-email').value;
    const subject = document.getElementById('contact-subject').value;
    const message = document.getElementById('contact-message').value;

    if (!name || !email || !message) {
        alert('Please fill in all required fields!');
        return;
    }

    try {
        await addDoc(collection(db, "contacts"), {
            name: name,
            email: email,
            subject: subject,
            message: message,
            createdAt: new Date()
        });
        
        alert('Message sent successfully! We will get back to you soon.');
        document.getElementById('contact-form').reset();
    } catch (error) {
        console.error('Error sending message:', error);
        alert('Error sending message. Please check your Firebase configuration.');
    }
}

// Add routes
router.addRoute('products', initProductsPage);
router.addRoute('contact', initContactPage);
router.addRoute('detail', initDetailPage);
router.addRoute('about', () => {
    console.log('About page loaded');
});

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    console.log('Nusabin Waste Management Dashboard initialized');
    console.log('Firebase config:', firebaseConfig.projectId ? 'Configured' : 'Not configured');
    router.init();
});

// Global error handler
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
});

// Export functions for debugging and router access
window.app = {
    loadProducts,
    addProduct,
    submitContact,
    loadChambers,
    loadDetailChambers,
    loadActivityLog,
    router
};
