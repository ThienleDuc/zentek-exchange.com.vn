import React, { useState, useEffect, useCallback } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';

// --- Mock data generators (đầy đủ) ---
const generateRandomData = (days: number) => {
  const data = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  for (let i = 0; i <= days; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    data.push({
      date: date.toISOString().slice(0, 10),
      revenue: Math.floor(Math.random() * 10000000) + 5000000,
      orders: Math.floor(Math.random() * 200) + 50,
    });
  }
  return data;
};

const generateRandomKPIs = () => ({
  newUsers: Math.floor(Math.random() * 500) + 100,
  newStores: Math.floor(Math.random() * 50) + 10,
  newProducts: Math.floor(Math.random() * 1000) + 200,
  totalOrders: Math.floor(Math.random() * 2000) + 500,
  totalRevenue: Math.floor(Math.random() * 50000000) + 10000000,
  avgRating: (Math.random() * 2 + 3).toFixed(1),
  cancelRate: (Math.random() * 15 + 2).toFixed(1),
  pendingProducts: Math.floor(Math.random() * 300) + 50,
});

const generateGrowth = () => ({
  revenue: (Math.random() * 40 - 10).toFixed(1),
  orders: (Math.random() * 30 - 5).toFixed(1),
  users: (Math.random() * 25 - 5).toFixed(1),
  stores: (Math.random() * 20 - 5).toFixed(1),
});

const generateRatingDistribution = () => [
  { stars: 1, count: Math.floor(Math.random() * 100) + 10 },
  { stars: 2, count: Math.floor(Math.random() * 150) + 20 },
  { stars: 3, count: Math.floor(Math.random() * 250) + 50 },
  { stars: 4, count: Math.floor(Math.random() * 400) + 100 },
  { stars: 5, count: Math.floor(Math.random() * 800) + 200 },
];

const generateTopCategories = () => [
  { name: 'Thời trang nam', revenue: Math.floor(Math.random() * 20000000) + 5000000 },
  { name: 'Thời trang nữ', revenue: Math.floor(Math.random() * 18000000) + 4000000 },
  { name: 'Điện tử', revenue: Math.floor(Math.random() * 25000000) + 8000000 },
  { name: 'Nhà cửa', revenue: Math.floor(Math.random() * 12000000) + 3000000 },
  { name: 'Mỹ phẩm', revenue: Math.floor(Math.random() * 15000000) + 2000000 },
];

const AdminDashboard: React.FC = () => {
  // State
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [loading, setLoading] = useState({
    kpi: true,
    chart: true,
    growth: true,
    rating: true,
    categories: true,
  });
  const [kpiData, setKpiData] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [growthData, setGrowthData] = useState<any>(null);
  const [ratingData, setRatingData] = useState<any[]>([]);
  const [categoriesData, setCategoriesData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Hàm lấy ngày mặc định (30 ngày trước)
  const getDefaultDates = () => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 30);
    return {
      from: from.toISOString().slice(0, 10),
      to: to.toISOString().slice(0, 10),
    };
  };

  // Khởi tạo dateRange
  useEffect(() => {
    const { from, to } = getDefaultDates();
    setDateRange({ from, to });
  }, []);

  // Hàm fetch toàn bộ dữ liệu
  const fetchAllData = useCallback(async (from: string, to: string) => {
    console.log(`[API Giả lập] Admin dashboard: ${from} → ${to}`);
    setError(null);
    setLoading({ kpi: true, chart: true, growth: true, rating: true, categories: true });

    try {
      // Giả lập call API
      const [kpi, chart, growth, rating, categories] = await Promise.all([
        new Promise(resolve => setTimeout(() => resolve(generateRandomKPIs()), 800)),
        new Promise(resolve => setTimeout(() => resolve(generateRandomData(30)), 1000)),
        new Promise(resolve => setTimeout(() => resolve(generateGrowth()), 600)),
        new Promise(resolve => setTimeout(() => resolve(generateRatingDistribution()), 700)),
        new Promise(resolve => setTimeout(() => resolve(generateTopCategories()), 900)),
      ]);
      setKpiData(kpi);
      setChartData(chart as any[]);
      setGrowthData(growth);
      setRatingData(rating as any[]);
      setCategoriesData(categories as any[]);
    } catch (err) {
      setError('Không thể tải dữ liệu. Vui lòng thử lại.');
      console.error(err);
    } finally {
      setLoading({ kpi: false, chart: false, growth: false, rating: false, categories: false });
    }
  }, []);

  // Gọi khi dateRange thay đổi
  useEffect(() => {
    if (dateRange.from && dateRange.to) {
      fetchAllData(dateRange.from, dateRange.to);
    }
  }, [dateRange, fetchAllData]);

  // Xử lý thay đổi ngày
  const handleDateChange = (type: 'from' | 'to', value: string) => {
    setDateRange(prev => ({ ...prev, [type]: value }));
  };

  const handleRetry = () => {
    if (dateRange.from && dateRange.to) fetchAllData(dateRange.from, dateRange.to);
  };

  const formatCurrency = (value: number) => value.toLocaleString() + 'đ';

  const GrowthCard = ({ label, value }: { label: string; value: string }) => {
    const num = parseFloat(value);
    const isPositive = num >= 0;
    return (
      <div className="adm-growth-card">
        <div className="adm-growth-label">{label}</div>
        <div className={`adm-growth-value ${isPositive ? 'positive' : 'negative'}`}>
          {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          {Math.abs(num)}%
        </div>
      </div>
    );
  };

  // Skeleton
  const KPISkeleton = () => (
    <div className="adm-kpi-grid">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="adm-kpi-card skeleton">
          <div className="adm-skeleton-line" style={{ width: '60%', height: '1rem' }}></div>
          <div className="adm-skeleton-line" style={{ width: '40%', height: '2rem', marginTop: '0.5rem' }}></div>
        </div>
      ))}
    </div>
  );

  const ChartSkeleton = () => (
    <div className="adm-chart-card skeleton">
      <div className="adm-skeleton-line" style={{ width: '40%', height: '1.5rem', marginBottom: '1rem' }}></div>
      <div className="adm-skeleton-chart" style={{ height: '300px', background: '#e5e7eb', borderRadius: '0.5rem' }}></div>
    </div>
  );

  if (error) {
    return (
      <div className="adm-dashboard">
        <div className="adm-container">
          <div className="adm-error-state">
            <p>{error}</p>
            <button onClick={handleRetry} className="adm-retry-btn">
              <RefreshCw size={16} /> Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="adm-dashboard">
      <div className="adm-container">
        {/* Bộ lọc thời gian */}
        <div className="adm-filter-bar">
          <div className="adm-filter-group">
            <label>Từ ngày:</label>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => handleDateChange('from', e.target.value)}
              className="adm-date-input"
            />
          </div>
          <div className="adm-filter-group">
            <label>Đến ngày:</label>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => handleDateChange('to', e.target.value)}
              className="adm-date-input"
            />
          </div>
          <button onClick={() => fetchAllData(dateRange.from, dateRange.to)} className="adm-refresh-btn">
            <RefreshCw size={16} /> Làm mới
          </button>
        </div>

        {/* KPI */}
        {loading.kpi ? <KPISkeleton /> : kpiData && (
          <div className="adm-kpi-grid">
            <div className="adm-kpi-card"><div className="adm-kpi-label">Người dùng mới</div><div className="adm-kpi-value">{kpiData.newUsers}</div></div>
            <div className="adm-kpi-card"><div className="adm-kpi-label">Cửa hàng mới</div><div className="adm-kpi-value">{kpiData.newStores}</div></div>
            <div className="adm-kpi-card"><div className="adm-kpi-label">Sản phẩm mới</div><div className="adm-kpi-value">{kpiData.newProducts}</div></div>
            <div className="adm-kpi-card"><div className="adm-kpi-label">Tổng đơn hàng</div><div className="adm-kpi-value">{kpiData.totalOrders}</div></div>
            <div className="adm-kpi-card"><div className="adm-kpi-label">Doanh thu</div><div className="adm-kpi-value">{formatCurrency(kpiData.totalRevenue)}</div></div>
            <div className="adm-kpi-card"><div className="adm-kpi-label">Đánh giá TB</div><div className="adm-kpi-value">{kpiData.avgRating} /5</div></div>
            <div className="adm-kpi-card"><div className="adm-kpi-label">Tỷ lệ hủy</div><div className="adm-kpi-value">{kpiData.cancelRate}%</div></div>
            <div className="adm-kpi-card"><div className="adm-kpi-label">SP chờ duyệt</div><div className="adm-kpi-value pending">{kpiData.pendingProducts}</div></div>
          </div>
        )}

        {/* Biểu đồ doanh thu & số đơn */}
        {loading.chart ? <ChartSkeleton /> : chartData.length > 0 && (
          <div className="adm-chart-card">
            <h3>Doanh thu & Số đơn hàng theo ngày</h3>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" tickFormatter={(v) => (v / 1000000).toFixed(0) + 'tr'} />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip formatter={(value, name) => name === 'revenue' ? formatCurrency(value as number) : value} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#8884d8" name="Doanh thu" />
                <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#82ca9d" name="Số đơn" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Tăng trưởng */}
        {loading.growth ? <ChartSkeleton /> : growthData && (
          <div className="adm-growth-grid">
            <GrowthCard label="Tăng trưởng doanh thu" value={growthData.revenue} />
            <GrowthCard label="Tăng trưởng đơn hàng" value={growthData.orders} />
            <GrowthCard label="Tăng trưởng người dùng" value={growthData.users} />
            <GrowthCard label="Tăng trưởng cửa hàng" value={growthData.stores} />
          </div>
        )}

        {/* 2 cột: đánh giá và top danh mục */}
        <div className="adm-two-columns">
          {loading.rating ? <ChartSkeleton /> : ratingData.length > 0 && (
            <div className="adm-chart-card">
              <h3>Phân bố đánh giá sao</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ratingData} layout="vertical" margin={{ left: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="stars" type="category" />
                  <Tooltip />
                  <Bar dataKey="count" fill="#ffc658" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          {loading.categories ? <ChartSkeleton /> : categoriesData.length > 0 && (
            <div className="adm-chart-card">
              <h3>Top danh mục theo doanh thu</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(v) => (v / 1000000).toFixed(0) + 'tr'} />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Bar dataKey="revenue" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;