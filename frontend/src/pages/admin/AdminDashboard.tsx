import React, { useState, useEffect, useCallback } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import api from '../../services/api';



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
      const [kpiRes, chartRes, growthRes, ratingRes, categoriesRes] = await Promise.all([
        api.get(`/admin/stats/overview?from=${from}&to=${to}`),
        api.get(`/admin/stats/revenue-chart?from=${from}&to=${to}`),
        api.get(`/admin/stats/growth?from=${from}&to=${to}`),
        api.get(`/admin/stats/rating-distribution?from=${from}&to=${to}`),
        api.get(`/admin/stats/category-revenue?from=${from}&to=${to}`),
      ]);
      setKpiData(kpiRes.data.data);
      setChartData(chartRes.data.data);
      setGrowthData(growthRes.data.data);
      setRatingData(ratingRes.data.data);
      setCategoriesData(categoriesRes.data.data);
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