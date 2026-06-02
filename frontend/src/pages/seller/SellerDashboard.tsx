// frontend/src/pages/seller/SellerDashboard.tsx
import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import {
  getSellerOverview,
  getSellerRevenueChart,
  getSellerGrowth,
  getSellerTopProducts,
  getSellerRatingDistribution
} from '../../services/profile.service';

// ==================== API SERVICES ====================

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
      const [overviewRes, chartRes, growthRes, productsRes, ratingsRes] = await Promise.all([
        getSellerOverview(),
        getSellerRevenueChart(`${period}d`),
        getSellerGrowth(`${period}d`),
        getSellerTopProducts(10),
        getSellerRatingDistribution()
      ]);
      
      if (overviewRes.success) setKpi(overviewRes.data);
      if (chartRes.success) setChartData(chartRes.data);
      if (growthRes.success) setGrowth(growthRes.data);
      if (productsRes.success) setTopProducts(productsRes.data);
      if (ratingsRes.success) setRatingDist(ratingsRes.data);
    } catch (err: any) {
      setError(err.message || 'Không thể tải dữ liệu. Vui lòng thử lại.');
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

        <div className="dev-note">[API Hệ thống] Dữ liệu thực tế được đồng bộ hóa.</div>
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