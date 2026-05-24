/**
 * WordPress E-Commerce Automation Dashboard System
 * Lightweight, strictly frontend-based logic
 * No database required. Uses static JSON configs.
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // Set Current Year
    document.getElementById('year').innerText = new Date().getFullYear();

    // 1. MOCK DATA (JSON / Arrays)
    // Easily editable properties without touching any DB
    const MOCK_DATA = {
        kpis: [
            { id: "orders", title: "Total Orders", value: "1,248", change: "+12.5%", isPositive: true, icon: "fa-box", color: "text-blue-500", bg: "bg-blue-50" },
            { id: "revenue", title: "Total Revenue", value: "৳245,600", change: "+8.2%", isPositive: true, icon: "fa-sack-dollar", color: "text-emerald-500", bg: "bg-emerald-50" },
            { id: "roas", title: "Avg. ROAS", value: "3.2x", change: "-0.5%", isPositive: false, icon: "fa-bullseye", color: "text-orange-500", bg: "bg-orange-50" },
            { id: "cancelled", title: "Cancelled", value: "42", change: "-2.1%", isPositive: true, icon: "fa-ban", color: "text-red-500", bg: "bg-red-50" }
        ],
        alerts: [
            { id: 1, type: "warning", message: "High abandon cart rate detected on Mobile checkout.", time: "10 mins ago" },
            { id: 2, type: "success", message: "Automated recovery email successfully converted 5 orders today.", time: "2 hours ago" }
        ],
        cancelledOrders: [
            { id: "#ORD-9021", customer: "John Doe",  amount: "৳1,250", reason: "Payment Failed", statusClass: "text-red-600 bg-red-100" },
            { id: "#ORD-9018", customer: "Jane Smith", amount: "৳850",  reason: "Customer Cancelled", statusClass: "text-orange-600 bg-orange-100" },
            { id: "#ORD-8995", customer: "Rafiq Islam",amount: "৳2,100", reason: "Fraud Suspected", statusClass: "text-red-600 bg-red-100" },
            { id: "#ORD-8991", customer: "Abdul Karim",amount: "৳450",  reason: "Out of Stock", statusClass: "text-gray-600 bg-gray-100" }
        ],
        trafficSources: {
            labels: ['Facebook Ads', 'TikTok Ads', 'Organic Search', 'Direct'],
            data: [45, 25, 20, 10],
            colors: ['#4267B2', '#000000', '#10B981', '#6B7280']
        },
        orderSummary: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            revenue: [12000, 19000, 15000, 22000, 18000, 28000, 32000],
            orders: [15, 22, 18, 28, 24, 35, 42]
        }
    };

    // 2. RENDER KPI CARDS
    const kpiContainer = document.getElementById('kpiCardsContainer');
    MOCK_DATA.kpis.forEach(kpi => {
        const trendColor = kpi.isPositive ? 'text-emerald-500' : 'text-red-500';
        const trendIcon = kpi.isPositive ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down';
        
        kpiContainer.insertAdjacentHTML('beforeend', `
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 dashboard-card hover-lift">
                <div class="flex justify-between items-start">
                    <div>
                        <p class="text-sm font-bold text-gray-500 mb-1">${kpi.title}</p>
                        <h3 class="text-2xl font-bold text-gray-900">${kpi.value}</h3>
                    </div>
                    <div class="${kpi.bg} ${kpi.color} w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-sm">
                        <i class="fa-solid ${kpi.icon}"></i>
                    </div>
                </div>
                <div class="mt-4 flex items-center text-sm font-bold">
                    <span class="${trendColor} flex items-center mr-2 bg-gray-50 px-2 py-1 rounded-md">
                        <i class="fa-solid ${trendIcon} mr-1"></i> ${kpi.change}
                    </span>
                    <span class="text-gray-400 font-medium">vs last week</span>
                </div>
            </div>
        `);
    });

    // 3. RENDER ALERTS
    const alertsContainer = document.getElementById('alertsContainer');
    MOCK_DATA.alerts.forEach(alert => {
        const bgColors = alert.type === 'warning' ? 'bg-orange-50 border-orange-200 text-orange-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800';
        const iconColor = alert.type === 'warning' ? 'text-orange-500 fa-triangle-exclamation' : 'text-emerald-500 fa-circle-check';
        
        alertsContainer.insertAdjacentHTML('beforeend', `
            <div class="alert-item flex items-center justify-between p-3 rounded-xl border ${bgColors} shadow-sm backdrop-blur-sm">
                <div class="flex items-center space-x-3">
                    <i class="fa-solid ${iconColor} text-lg"></i>
                    <div>
                        <p class="text-sm font-bold">${alert.message}</p>
                        <p class="text-xs opacity-75 mt-0.5 font-medium">${alert.time}</p>
                    </div>
                </div>
                <button class="text-gray-400 hover:text-gray-700 p-2"><i class="fa-solid fa-xmark"></i></button>
            </div>
        `);
    });

    // 4. RENDER CANCELLED ORDERS TABLE
    const tableBody = document.getElementById('cancelledOrdersTable');
    MOCK_DATA.cancelledOrders.forEach(order => {
        tableBody.insertAdjacentHTML('beforeend', `
            <tr class="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td class="p-3 font-mono text-sm font-bold text-gray-700">${order.id}</td>
                <td class="p-3">
                    <div class="font-bold text-sm text-gray-800">${order.customer}</div>
                </td>
                <td class="p-3 font-bold text-sm text-gray-800">${order.amount}</td>
                <td class="p-3">
                    <span class="inline-flex px-2 py-1 rounded text-xs font-bold ${order.statusClass}">${order.reason}</span>
                </td>
                <td class="p-3">
                    <button class="text-blue-600 hover:text-blue-800 text-xs font-bold bg-blue-50 px-3 py-1.5 rounded-md hover:bg-blue-100 transition-colors">Review</button>
                </td>
            </tr>
        `);
    });

    // 5. CHART.JS INTEGRATION (Lightweight Data Visualization)
    Chart.defaults.font.family = "'Inter', sans-serif";
    Chart.defaults.color = '#94a3b8';
    
    // Order Summary Chart (Line/Bar Sync)
    const ctxOrder = document.getElementById('orderSummaryChart').getContext('2d');
    new Chart(ctxOrder, {
        type: 'line',
        data: {
            labels: MOCK_DATA.orderSummary.labels,
            datasets: [
                {
                    label: 'Revenue (৳)',
                    data: MOCK_DATA.orderSummary.revenue,
                    borderColor: '#8b5cf6',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    yAxisID: 'y'
                },
                {
                    label: 'Orders',
                    data: MOCK_DATA.orderSummary.orders,
                    type: 'bar',
                    backgroundColor: '#e2e8f0',
                    borderRadius: 4,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(17, 24, 39, 0.9)',
                    titleFont: { size: 13, weight: 'bold' },
                    bodyFont: { size: 13, weight: 'bold' },
                    padding: 12,
                    cornerRadius: 8,
                    displayColors: true
                }
            },
            scales: {
                x: {
                    grid: { display: false, drawBorder: false }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    grid: { color: '#f1f5f9', borderDash: [5, 5] },
                    ticks: { callback: (value) => '৳' + (value/1000) + 'k' }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    grid: { display: false },
                    ticks: { color: '#94a3b8' }
                }
            }
        }
    });

    // Traffic Sources Chart (Doughnut)
    const ctxTraffic = document.getElementById('trafficSourcesChart').getContext('2d');
    new Chart(ctxTraffic, {
        type: 'doughnut',
        data: {
            labels: MOCK_DATA.trafficSources.labels,
            datasets: [{
                data: MOCK_DATA.trafficSources.data,
                backgroundColor: MOCK_DATA.trafficSources.colors,
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '75%',
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(17, 24, 39, 0.9)',
                    bodyFont: { weight: 'bold' },
                    callbacks: {
                        label: function(context) {
                            return ` ${context.label}: ${context.raw}%`;
                        }
                    }
                }
            }
        }
    });

    // Render Custom Legend for Traffic
    const trafficLegend = document.getElementById('trafficLegend');
    MOCK_DATA.trafficSources.labels.forEach((label, i) => {
        trafficLegend.insertAdjacentHTML('beforeend', `
            <div class="flex flex-col items-center p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <div class="flex items-center space-x-2 mb-1">
                    <span class="w-3 h-3 rounded-full" style="background-color: ${MOCK_DATA.trafficSources.colors[i]}"></span>
                    <span class="text-xs font-bold text-gray-600">${label}</span>
                </div>
                <span class="text-lg font-bold text-gray-900">${MOCK_DATA.trafficSources.data[i]}%</span>
            </div>
        `);
    });

    // 6. REAL-TIME SIMULATOR (Live Visitors)
    const activeUsersEl = document.getElementById('activeUsersCounter');
    let currentUsers = Math.floor(Math.random() * 20) + 40; // Base: 40-60
    activeUsersEl.innerText = currentUsers;

    setInterval(() => {
        // Random fluctuation between -3 and +3
        const change = Math.floor(Math.random() * 7) - 3;
        currentUsers = Math.max(12, currentUsers + change);
        
        // Add subtle pop animation on change
        activeUsersEl.innerText = currentUsers;
        activeUsersEl.style.transform = 'scale(1.1)';
        activeUsersEl.style.color = '#d8b4fe';
        setTimeout(() => {
            activeUsersEl.style.transform = 'scale(1)';
            activeUsersEl.style.color = '#ffffff';
        }, 150);
        
    }, 3500);

    // Sidebar Mobile Toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const sidebar = document.querySelector('.sidebar');
    if (mobileMenuBtn && sidebar) {
        mobileMenuBtn.addEventListener('click', () => {
            if (sidebar.classList.contains('hidden')) {
                sidebar.classList.remove('hidden');
                sidebar.classList.add('absolute', 'z-50', 'h-full');
            } else {
                sidebar.classList.add('hidden');
                sidebar.classList.remove('absolute', 'z-50', 'h-full');
            }
        });
    }
});
