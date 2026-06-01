// frontend/src/pages/seller/SellerDashboard.tsx
import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';

// ==================== MOCK DATA & API GIẢ LẬP ====================

const mockKpiData = {
  totalRevenue: 245800000,
  totalOrders: 342,
  totalProductsSold: 1289,
  averageRating: 4.6,
  cancelRate: 3.2,
  stockItems: 547,
};

const generateChartData = (days: number) => {
  const data = [];
  const today = new Date();
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().slice(0, 10);
    const revenue = Math.floor(5000000 + Math.random() * 15000000);
    const orders = Math.floor(5 + Math.random() * 25);
    data.push({ date: dateStr, revenue, orders });
  }
  return data;
};

const mockGrowthData = {
  revenue: { current: 245800000, previous: 212000000, percent: 15.9 },
  orders: { current: 342, previous: 298, percent: 14.8 },
  productsSold: { current: 1289, previous: 1150, percent: 12.1 },
};

const mockTopProducts = [
  { id: 'sp1', name: 'Áo thun cotton cao cấp', image: '/products/ao-thun.jpg', sold: 245, revenue: 36750000, rating: 4.8 },
  { id: 'sp2', name: 'Quần jeans nam rách gối', image: '/products/quan-jeans.jpg', sold: 189, revenue: 47250000, rating: 4.5 },
  // ... (có thể rút gọn, nhưng giữ đủ 10 sản phẩm để demo)
];

const mockRatingDistribution = [
  { stars: 5, count: 320 },
  { stars: 4, count: 210 },
  { stars: 3, count: 85 },
  { stars: 2, count: 30 },
  { stars: 1, count: 15 },
];

const fetchOverview = (): Promise<any> => {
  console.log('[Mock API] GET /api/seller/dashboard/overview');
  return new Promise((resolve) => setTimeout(() => resolve({ ...mockKpiData }), 600));
};

const fetchChartData = (days: number): Promise<any[]> => {
  console.log(`[Mock API] GET /api/seller/dashboard/revenue-chart?period=${days}d`);
  return new Promise((resolve) => setTimeout(() => resolve(generateChartData(days)), 500));
};

const fetchGrowthData = (): Promise<any> => {
  console.log('[Mock API] GET /api/seller/dashboard/growth');
  return new Promise((resolve) => setTimeout(() => resolve({ ...mockGrowthData }), 400));
};

const fetchTopProducts = (limit: number = 10): Promise<any[]> => {
  console.log(`[Mock API] GET /api/seller/dashboard/top-products?limit=${limit}`);
  return new Promise((resolve) => setTimeout(() => resolve([...mockTopProducts]), 500));
};

const fetchRatingDistribution = (): Promise<any[]> => {
  console.log('[Mock API] GET /api/seller/dashboard/rating-distribution');
  return new Promise((resolve) => setTimeout(() => resolve([...mockRatingDistribution]), 300));
};

// ==================== COMPONENT CHÍNH ====================
const SellerDashboard: React.FC = () => {
  const [loading, setLoading] = useState({
    overview: true, chart: true, growth: true, topProducts: true, ratingDist: true,
  });
  const [error, setError] = useState<string | null>(null);
  const [kpi, setKpi] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [growth, setGrowth] = useState<any>(null);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [ratingDist, setRatingDist] = useState<any[]>([]);
  const [period, setPeriod] = useState<number>(30);

  const loadData = async () => {
    setError(null);
    setLoading({ overview: true, chart: true, growth: true, topProducts: true, ratingDist: true });
    try {
      const [overview, chart, growthData, products, ratings] = await Promise.all([
        fetchOverview(), fetchChartData(period), fetchGrowthData(), fetchTopProducts(10), fetchRatingDistribution()
      ]);
      setKpi(overview); setChartData(chart); setGrowth(growthData); setTopProducts(products); setRatingDist(ratings);
    } catch (err) {
      setError('Không thể tải dữ liệu. Vui lòng thử lại.');
    } finally {
      setLoading({ overview: false, chart: false, growth: false, topProducts: false, ratingDist: false });
    }
  };

  useEffect(() => { loadData(); }, [period]);

  const formatCurrency = (value: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  const formatNumber = (value: number) => value.toLocaleString('vi-VN');

  return (
    <div className="seller-dashboard-page">
      <div className="dashboard-container">
        {/* Header */}
        <div className="dashboard-header">
          <h1>Tổng quan cửa hàng</h1>
          <div className="period-selector">
            <span>Khoảng thời gian:</span>
            <select value={period} onChange={(e) => setPeriod(Number(e.target.value))}>
              <option value={7}>7 ngày qua</option>
              <option value={30}>30 ngày qua</option>
              <option value={90}>3 tháng qua</option>
              <option value={365}>12 tháng qua</option>
            </select>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="error-banner">
            <span>{error}</span>
            <button onClick={loadData}>Thử lại</button>
          </div>
        )}

        {/* Hàng KPI */}
        <div className="kpi-grid">
          <KpiCard title="Tổng doanh thu" value={kpi?.totalRevenue ? formatCurrency(kpi.totalRevenue) : '---'} loading={loading.overview} />
          <KpiCard title="Số đơn hàng" value={kpi?.totalOrders ? formatNumber(kpi.totalOrders) : '---'} loading={loading.overview} />
          <KpiCard title="Sản phẩm đã bán" value={kpi?.totalProductsSold ? formatNumber(kpi.totalProductsSold) : '---'} loading={loading.overview} />
          <KpiCard title="Đánh giá TB" value={kpi?.averageRating ? `${kpi.averageRating}/5` : '---'} loading={loading.overview} />
          <KpiCard title="Tỷ lệ hủy đơn" value={kpi?.cancelRate ? `${kpi.cancelRate}%` : '---'} loading={loading.overview} />
          <KpiCard title="Tồn kho" value={kpi?.stockItems ? formatNumber(kpi.stockItems) : '---'} loading={loading.overview} />
        </div>

        {/* Biểu đồ */}
        <div className="chart-card">
          <h2>Doanh thu và số đơn hàng theo thời gian</h2>
          {loading.chart ? <div className="skeleton-chart"></div> : (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" tickFormatter={(v) => `${(v / 1e6).toFixed(0)}M`} />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip formatter={(v: any, name: any) => name === 'revenue' ? formatCurrency(v) : v} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#10b981" name="Doanh thu" />
                <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#f59e0b" name="Số đơn" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Tăng trưởng */}
        <div className="growth-grid">
          <GrowthCard title="Doanh thu" current={growth?.revenue.current} previous={growth?.revenue.previous} percent={growth?.revenue.percent} loading={loading.growth} />
          <GrowthCard title="Đơn hàng" current={growth?.orders.current} previous={growth?.orders.previous} percent={growth?.orders.percent} loading={loading.growth} />
          <GrowthCard title="Sản phẩm bán ra" current={growth?.productsSold.current} previous={growth?.productsSold.previous} percent={growth?.productsSold.percent} loading={loading.growth} />
        </div>

        {/* Bảng sản phẩm + Biểu đồ sao */}
        <div className="two-columns">
          <div className="top-products">
            <h2>Top 10 sản phẩm bán chạy</h2>
            {loading.topProducts ? <div className="skeleton-table"></div> : (
              <table className="product-table">
                <thead><tr><th>#</th><th>Sản phẩm</th><th>Đã bán</th><th>Doanh thu</th><th>Đánh giá</th></tr></thead>
                <tbody>
                  {topProducts.map((p, idx) => (
                    <tr key={p.id}>
                      <td>{idx+1}</td>
                      <td><div className="product-name"><img src={p.image} alt="" />{p.name}</div></td>
                      <td>{p.sold}</td>
                      <td>{formatCurrency(p.revenue)}</td>
                      <td>⭐ {p.rating}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div className="rating-dist">
            <h2>Phân bố đánh giá sao</h2>
            {loading.ratingDist ? <div className="skeleton-chart"></div> : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart layout="vertical" data={ratingDist}>
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="stars" tickFormatter={(v) => `${v}⭐`} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#fbbf24" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="dev-note">[Mock API] Dữ liệu giả lập, không gọi thật.</div>
      </div>
    </div>
  );
};

// Helper components
const KpiCard = ({ title, value, loading }: { title: string; value: string; loading: boolean }) => (
  <div className="kpi-card">
    <div className="kpi-title">{title}</div>
    {loading ? <div className="skeleton-text"></div> : <div className="kpi-value">{value}</div>}
  </div>
);

const GrowthCard = ({ title, current, previous, percent, loading }: any) => {
  const isPositive = percent && percent >= 0;
  return (
    <div className="growth-card">
      <h3>{title}</h3>
      {loading ? <div className="skeleton-text"></div> : <div className="growth-current">{current}</div>}
      {!loading && percent !== undefined && (
        <div className={`growth-percent ${isPositive ? 'positive' : 'negative'}`}>
          {isPositive ? '▲' : '▼'} {Math.abs(percent)}% so với kỳ trước
        </div>
      )}
      {!loading && previous && <div className="growth-previous">Kỳ trước: {previous}</div>}
    </div>
  );
};

export default SellerDashboard;