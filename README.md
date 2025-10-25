# Financial Freedom Platform

A comprehensive debt management platform that helps users visualize their path to financial freedom by tracking multiple debts, comparing repayment strategies (Avalanche vs Snowball vs Hybrid), and showing the impact of extra payments on debt-free timelines.

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "Financial Freedom"
   ```

2. **Start the platform**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:5006
   - Database: localhost:6001

### First Time Setup

1. Open http://localhost:3001 in your browser
2. Click "Add Your First Debt" to start tracking
3. Enter your debt details (name, balance, APR, minimum payment)
4. Explore different repayment strategies
5. See the impact of extra payments on your timeline

## 🏗️ Architecture

### Services
- **Frontend (React)**: Port 3001 - User interface with Nodus design theme
- **Backend (Flask)**: Port 5006 - REST API with MCP/AI integration
- **Database (MySQL)**: Port 6001 - Data persistence with DECIMAL precision
- **Nginx**: Port 80 - Reverse proxy (optional)

### Key Features
- **Dashboard**: Total debt overview with months-to-zero tracking
- **Debt Management**: Add, edit, delete debts with validation
- **Strategy Comparison**: Avalanche, Snowball, and Hybrid strategies
- **Extra Payment Calculator**: Real-time impact analysis
- **Visual Charts**: Timeline, balance trends, and payment breakdowns
- **Insights Panel**: Personalized recommendations and ROI analysis

## 📊 Repayment Strategies

### Avalanche Strategy (Mathematical)
- Targets highest APR debt first
- Minimizes total interest paid
- Best for math-focused users

### Snowball Strategy (Psychological)
- Targets smallest balance first
- Provides quick wins and motivation
- Best for motivation-focused users

### Hybrid Strategy (Balanced)
- APR-adjusted balance heuristic
- Combines math and psychology
- Best for balanced approach

## 🔧 Development

### Backend API
All backend functions are exposed as REST APIs for MCP/AI agent integration:

```bash
# Debt Management
GET    /api/debts              # List all debts
POST   /api/debts              # Create new debt
PUT    /api/debts/:id          # Update debt
DELETE /api/debts/:id          # Delete debt

# Calculations
POST   /api/calculate/simulate          # Run full simulation
POST   /api/calculate/avalanche         # Calculate avalanche strategy
POST   /api/calculate/snowball          # Calculate snowball strategy
POST   /api/calculate/hybrid            # Calculate hybrid strategy
POST   /api/calculate/compare           # Compare all strategies
POST   /api/calculate/impact            # Calculate extra payment impact

# Insights
GET    /api/insights/recommend          # Get recommended debt target
GET    /api/insights/top-targets        # Get top 3 debt targets
GET    /api/insights/marginal-benefit   # ROI per extra rand

# Analytics
POST   /api/analytics/timeline          # Timeline data for charts
POST   /api/analytics/balance-trend     # Balance over time
```

### Database Schema
- **debts**: Core debt information with DECIMAL precision
- **payments**: Payment history tracking
- **commitments**: Extra payment tracking
- **plan_snapshots**: Scenario comparison

### Frontend Components
- **Dashboard**: Main overview with debt cards and charts
- **DebtForm**: Add/edit debt with validation
- **StrategyComparison**: Side-by-side strategy analysis
- **CommitPanel**: Extra payment impact calculator
- **InsightsPanel**: Recommendations and ROI analysis

## 🎨 Design System

Built with **Nodus Design System** featuring:
- Professional matte carbon fiber aesthetic
- Mint green accents (#00d4aa)
- Inter font family
- Dark theme optimized for financial data
- Responsive design for all devices

## 📈 Charts & Visualizations

- **Timeline Chart**: Debt balance over time
- **Balance Trend Chart**: Payment breakdown (interest vs principal)
- **Months to Zero Card**: Prominent debt-free timeline
- **Strategy Comparison**: Side-by-side analysis

## 🔒 Security & Privacy

- Local browser storage (no authentication required)
- All calculations performed client-side and server-side
- No personal data transmitted to external services
- Docker containers for isolated execution

## 🐳 Docker Services

```yaml
services:
  database:    # MySQL on port 6001
  backend:    # Flask API on port 5006
  frontend:   # React app on port 3001
  nginx:      # Reverse proxy on port 80
```

## 📚 Documentation

- [API Documentation](docs/API.md) - Complete endpoint reference
- [MCP Integration Guide](docs/MCP-INTEGRATION.md) - AI agent integration
- [User Guide](docs/USER-GUIDE.md) - Complete user manual
- [Quick Start Guide](docs/QUICK-START.md) - 5-minute setup
- [Algorithms Guide](docs/ALGORITHMS.md) - Simulation logic

## 🚀 Deployment

### Production Deployment
1. Update environment variables in docker-compose.yml
2. Configure SSL certificates for HTTPS
3. Set up database backups
4. Configure monitoring and logging

### Development
```bash
# Start development environment
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild services
docker-compose up --build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the documentation in the `docs/` folder
- Review the API documentation for integration help
- Open an issue for bugs or feature requests

## 🎯 Success Metrics

- ✅ Dashboard displays all debts with accurate totals
- ✅ Months to zero card prominently displayed
- ✅ All three strategies calculate correctly
- ✅ Extra payment impact shows immediate visual feedback
- ✅ Cumulative repayment effect clearly demonstrated
- ✅ Timeline visualization shows debt-free date
- ✅ Charts display balance trends and projections
- ✅ Insights recommend optimal debt targeting
- ✅ All backend functions accessible via REST API
- ✅ Professional Nodus design throughout
- ✅ Runs in Docker containers
- ✅ ZAR currency formatting throughout

---

**Built with ❤️ using Nodus Design System**
