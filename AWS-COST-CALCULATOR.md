# 💰 AWS Cost Calculator - Recruitment System

Estimate your monthly AWS costs for deploying the Recruitment Management System on AWS.

---

## 📊 Cost Breakdown by Tier

### 🌱 Starter Tier ($30-50/month)
**Best for:** Small teams, 1-50 users, <1000 resumes/month

#### Services:
- **EC2 t3.small** (2 vCPU, 2GB RAM)
  - On-Demand: $15.18/month
  - Reserved (1 year): $9.49/month
  
- **RDS PostgreSQL db.t3.micro** (1 vCPU, 1GB RAM, 20GB storage)
  - On-Demand: $15.33/month
  - Reserved (1 year): $9.49/month
  
- **S3 Storage** (10GB for resumes)
  - Storage: $0.23/month
  - Requests: $0.05/month
  
- **Data Transfer** (10GB out)
  - First 1GB free
  - Next 9GB: $0.81/month
  
- **Route 53** (DNS)
  - Hosted Zone: $0.50/month
  - Queries: $0.40/month

**Total Starter (On-Demand):** ~$32.50/month  
**Total Starter (Reserved):** ~$21.00/month

---

### 🚀 Growth Tier ($80-120/month)
**Best for:** Medium teams, 50-200 users, 1000-5000 resumes/month

#### Services:
- **EC2 t3.medium** (2 vCPU, 4GB RAM)
  - On-Demand: $30.37/month
  - Reserved (1 year): $18.98/month
  
- **RDS PostgreSQL db.t3.small** (2 vCPU, 2GB RAM, 50GB storage)
  - On-Demand: $30.66/month
  - Reserved (1 year): $18.98/month
  - Storage: $5.75/month
  
- **S3 Storage** (50GB for resumes)
  - Storage: $1.15/month
  - Requests: $0.25/month
  
- **Application Load Balancer**
  - ALB: $16.20/month
  - LCU: $5.84/month
  
- **Data Transfer** (50GB out)
  - First 10GB: $0.90/month
  - Next 40GB: $3.60/month
  
- **CloudWatch** (Monitoring)
  - Logs: $2.00/month
  - Metrics: $1.00/month
  
- **Route 53**
  - Hosted Zone: $0.50/month
  - Queries: $1.00/month

**Total Growth (On-Demand):** ~$98.00/month  
**Total Growth (Reserved):** ~$75.00/month

---

### 💼 Professional Tier ($200-350/month)
**Best for:** Large teams, 200-1000 users, 5000-20000 resumes/month

#### Services:
- **EC2 t3.large** (2 vCPU, 8GB RAM) x2 (High Availability)
  - On-Demand: $60.74/month x2 = $121.48/month
  - Reserved (1 year): $37.96/month x2 = $75.92/month
  
- **RDS PostgreSQL db.t3.medium** (2 vCPU, 4GB RAM, 100GB storage)
  - Multi-AZ On-Demand: $122.64/month
  - Multi-AZ Reserved: $75.92/month
  - Storage: $11.50/month
  
- **S3 Storage** (200GB for resumes)
  - Storage: $4.60/month
  - Requests: $1.00/month
  
- **Application Load Balancer**
  - ALB: $16.20/month
  - LCU: $11.68/month
  
- **ElastiCache Redis** (cache.t3.micro)
  - On-Demand: $12.41/month
  - Reserved: $7.74/month
  
- **Data Transfer** (200GB out)
  - First 10GB: $0.90/month
  - Next 40GB: $3.60/month
  - Next 100GB: $8.50/month
  - Next 50GB: $4.25/month
  
- **CloudWatch** (Enhanced Monitoring)
  - Logs: $5.00/month
  - Metrics: $3.00/month
  - Alarms: $1.00/month
  
- **Route 53**
  - Hosted Zone: $0.50/month
  - Queries: $2.00/month
  
- **AWS Backup**
  - Storage: $5.00/month
  - Restore: $1.00/month

**Total Professional (On-Demand):** ~$323.00/month  
**Total Professional (Reserved):** ~$240.00/month

---

### 🏢 Enterprise Tier ($500-1000+/month)
**Best for:** Enterprise, 1000+ users, 20000+ resumes/month

#### Services:
- **EC2 c5.xlarge** (4 vCPU, 8GB RAM) x3 (Auto Scaling)
  - On-Demand: $124.10/month x3 = $372.30/month
  - Reserved (1 year): $77.56/month x3 = $232.68/month
  
- **RDS PostgreSQL db.r5.large** (2 vCPU, 16GB RAM, 500GB storage)
  - Multi-AZ On-Demand: $489.12/month
  - Multi-AZ Reserved: $305.70/month
  - Storage: $57.50/month
  - IOPS: $50.00/month
  
- **S3 Storage** (1TB for resumes)
  - Storage: $23.55/month
  - Requests: $5.00/month
  - Intelligent Tiering: $10.00/month
  
- **Application Load Balancer**
  - ALB: $16.20/month
  - LCU: $23.36/month
  
- **ElastiCache Redis** (cache.r5.large) x2 (Cluster)
  - On-Demand: $124.10/month x2 = $248.20/month
  - Reserved: $77.56/month x2 = $155.12/month
  
- **CloudFront CDN**
  - Data Transfer: $20.00/month
  - Requests: $5.00/month
  
- **Data Transfer** (1TB out)
  - First 10GB: $0.90/month
  - Next 40GB: $3.60/month
  - Next 100GB: $8.50/month
  - Next 350GB: $29.75/month
  - Next 500GB: $40.00/month
  
- **CloudWatch** (Full Monitoring)
  - Logs: $15.00/month
  - Metrics: $10.00/month
  - Alarms: $5.00/month
  - Dashboards: $3.00/month
  
- **AWS WAF** (Security)
  - Web ACL: $5.00/month
  - Rules: $10.00/month
  
- **AWS Backup**
  - Storage: $25.00/month
  - Restore: $5.00/month
  
- **Route 53**
  - Hosted Zone: $0.50/month
  - Queries: $5.00/month
  
- **AWS Certificate Manager**
  - SSL Certificates: Free

**Total Enterprise (On-Demand):** ~$1,390.00/month  
**Total Enterprise (Reserved):** ~$1,020.00/month

---

## 💡 Cost Optimization Tips

### 1. Use Reserved Instances
- **Savings:** 30-40% compared to On-Demand
- **Commitment:** 1 or 3 years
- **Best for:** Predictable workloads

### 2. Use Spot Instances (Non-Production)
- **Savings:** Up to 90% for dev/test environments
- **Risk:** Can be terminated with 2-minute notice
- **Best for:** Development, testing, batch processing

### 3. Right-Size Your Instances
- Monitor CPU/Memory usage
- Downsize underutilized instances
- Use Auto Scaling for variable loads

### 4. S3 Lifecycle Policies
- Move old resumes to S3 Glacier after 90 days
- **Savings:** 80% on storage costs
- Archive resumes older than 1 year

### 5. Use CloudFront CDN
- Cache static assets
- Reduce data transfer costs
- Improve performance globally

### 6. Enable S3 Intelligent-Tiering
- Automatically moves data between tiers
- No retrieval fees
- Saves 40-70% on storage

### 7. Use AWS Cost Explorer
- Track spending daily
- Set up budget alerts
- Identify cost anomalies

### 8. Delete Unused Resources
- Old snapshots
- Unattached EBS volumes
- Unused Elastic IPs
- Old AMIs

---

## 📈 Cost Scaling Examples

### Scenario 1: Startup (10 users, 100 resumes/month)
- **EC2:** t3.micro ($7.59/month)
- **RDS:** db.t3.micro ($15.33/month)
- **S3:** 5GB ($0.12/month)
- **Total:** ~$25/month

### Scenario 2: Small Business (50 users, 500 resumes/month)
- **EC2:** t3.small ($15.18/month)
- **RDS:** db.t3.small ($30.66/month)
- **S3:** 25GB ($0.58/month)
- **Total:** ~$50/month

### Scenario 3: Mid-Size Company (200 users, 2000 resumes/month)
- **EC2:** t3.medium ($30.37/month)
- **RDS:** db.t3.medium ($61.32/month)
- **S3:** 100GB ($2.30/month)
- **ALB:** $22.04/month
- **Total:** ~$120/month

### Scenario 4: Enterprise (1000 users, 10000 resumes/month)
- **EC2:** c5.xlarge x2 ($248.20/month)
- **RDS:** db.r5.large Multi-AZ ($546.62/month)
- **S3:** 500GB ($11.50/month)
- **ALB:** $39.56/month
- **ElastiCache:** $124.10/month
- **Total:** ~$1,000/month

---

## 🧮 Custom Cost Calculator

### Your Usage:
- **Users:** _____ users
- **Resumes/month:** _____ resumes
- **Storage needed:** _____ GB
- **Data transfer:** _____ GB/month

### Estimated Costs:

#### Compute (EC2):
- Users < 50: t3.small = $15/month
- Users 50-200: t3.medium = $30/month
- Users 200-1000: t3.large = $60/month
- Users 1000+: c5.xlarge x2 = $248/month

#### Database (RDS):
- Storage < 50GB: db.t3.micro = $15/month
- Storage 50-200GB: db.t3.small = $30/month
- Storage 200-500GB: db.t3.medium = $61/month
- Storage 500GB+: db.r5.large = $489/month

#### Storage (S3):
- Per GB: $0.023/month
- Your cost: _____ GB x $0.023 = $_____/month

#### Data Transfer:
- First 10GB: Free
- Next 40GB: $0.09/GB
- Next 100GB: $0.085/GB
- Your cost: $_____/month

**Your Estimated Total:** $_____/month

---

## 📊 Cost Comparison: AWS vs Alternatives

### AWS (Starter Tier)
- **Cost:** $30-50/month
- **Pros:** Scalable, reliable, global
- **Cons:** Complex pricing, learning curve

### DigitalOcean (Droplet)
- **Cost:** $12-24/month
- **Pros:** Simple pricing, easy to use
- **Cons:** Limited services, less scalable

### Heroku
- **Cost:** $25-50/month
- **Pros:** Zero DevOps, easy deployment
- **Cons:** Expensive at scale, limited control

### Railway
- **Cost:** $5-20/month
- **Pros:** Modern, simple, affordable
- **Cons:** Newer platform, fewer features

### Self-Hosted VPS
- **Cost:** $5-20/month
- **Pros:** Full control, cheapest
- **Cons:** You manage everything, no support

---

## 💳 Payment Options

### 1. Pay-As-You-Go
- No upfront costs
- Pay only for what you use
- Most flexible

### 2. Reserved Instances
- 1 or 3 year commitment
- 30-40% savings
- Best for production

### 3. Savings Plans
- Flexible commitment
- Up to 72% savings
- Applies across services

### 4. AWS Credits
- Startup programs
- Education credits
- Promotional offers

---

## 🎯 Recommended Starting Point

### For Most Teams:
**Growth Tier with Reserved Instances**
- **Cost:** ~$75/month
- **Capacity:** 50-200 users
- **Scalable:** Easy to upgrade
- **Reliable:** Multi-AZ database

### Setup:
1. EC2 t3.medium (Reserved 1-year)
2. RDS db.t3.small (Reserved 1-year)
3. S3 with Intelligent-Tiering
4. Application Load Balancer
5. CloudWatch monitoring
6. Daily automated backups

**Total:** ~$75/month with room to grow

---

## 📞 Need Help Estimating?

Use AWS Pricing Calculator:
https://calculator.aws/

Or contact AWS Support for:
- Architecture review
- Cost optimization
- Reserved Instance recommendations

---

## 🔄 Monthly Cost Review Checklist

- [ ] Review AWS Cost Explorer
- [ ] Check for unused resources
- [ ] Verify Reserved Instance utilization
- [ ] Review S3 storage classes
- [ ] Check data transfer patterns
- [ ] Optimize instance sizes
- [ ] Review CloudWatch logs retention
- [ ] Delete old snapshots
- [ ] Review backup retention
- [ ] Update cost estimates

---

**Last Updated:** December 2, 2025  
**Pricing Region:** US East (N. Virginia)  
**Currency:** USD

*Note: Prices are estimates and may vary by region and usage. Always check current AWS pricing.*
