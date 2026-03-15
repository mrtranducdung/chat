export const INDUSTRIES = [
  { id: 'mfg', name: 'Manufacturing' },
  { id: 'whl', name: 'Wholesale' },
  { id: 'rtl', name: 'Retail' },
  { id: 'con', name: 'Construction' },
  { id: 'it', name: 'IT / Software' },
  { id: 'log', name: 'Logistics' },
  { id: 'pro', name: 'Professional Services' },
  { id: 'hos', name: 'Hospitality / F&B' },
  { id: 'hlt', name: 'Healthcare' },
  { id: 'real', name: 'Real Estate' },
  { id: 'edu', name: 'Education' },
  { id: 'agr', name: 'Agriculture / Food' },
  { id: 'psv', name: 'Personal Services' },
  { id: 'ecom', name: 'E-commerce' },
];

export const KPI_GROUPS = [
  // 1. Manufacturing
  { id: 'mfg-g1', industryId: 'mfg', name: 'Revenue Metrics' },
  { id: 'mfg-g2', industryId: 'mfg', name: 'Profitability Metrics' },
  { id: 'mfg-g3', industryId: 'mfg', name: 'Orders & Backlog' },
  { id: 'mfg-g4', industryId: 'mfg', name: 'Delivery Performance' },
  { id: 'mfg-g5', industryId: 'mfg', name: 'Customer Metrics' },
  // 2. Wholesale
  { id: 'whl-g1', industryId: 'whl', name: 'Revenue Metrics' },
  { id: 'whl-g2', industryId: 'whl', name: 'Margin & Pricing' },
  { id: 'whl-g3', industryId: 'whl', name: 'Inventory & Fulfillment' },
  { id: 'whl-g4', industryId: 'whl', name: 'Sales Activity' },
  { id: 'whl-g5', industryId: 'whl', name: 'Receivables & Collections' },
  // 3. Retail
  { id: 'rtl-g1', industryId: 'rtl', name: 'Sales Performance' },
  { id: 'rtl-g2', industryId: 'rtl', name: 'Basket Metrics' },
  { id: 'rtl-g3', industryId: 'rtl', name: 'Store Operations' },
  { id: 'rtl-g4', industryId: 'rtl', name: 'Inventory Metrics' },
  { id: 'rtl-g5', industryId: 'rtl', name: 'Customer Loyalty' },
  // 4. Construction
  { id: 'con-g1', industryId: 'con', name: 'Sales Pipeline' },
  { id: 'con-g2', industryId: 'con', name: 'Contract Revenue' },
  { id: 'con-g3', industryId: 'con', name: 'Bid Efficiency' },
  { id: 'con-g4', industryId: 'con', name: 'Project Delivery Impact' },
  { id: 'con-g5', industryId: 'con', name: 'Client Metrics' },
  // 5. IT / Software
  { id: 'it-g1', industryId: 'it', name: 'Revenue Metrics' },
  { id: 'it-g2', industryId: 'it', name: 'Sales Funnel' },
  { id: 'it-g3', industryId: 'it', name: 'Subscription Metrics' },
  { id: 'it-g4', industryId: 'it', name: 'Retention Metrics' },
  { id: 'it-g5', industryId: 'it', name: 'Delivery / Implementation' },
  // 6. Logistics
  { id: 'log-g1', industryId: 'log', name: 'Revenue Metrics' },
  { id: 'log-g2', industryId: 'log', name: 'Margin & Cost' },
  { id: 'log-g3', industryId: 'log', name: 'Capacity & Utilization' },
  { id: 'log-g4', industryId: 'log', name: 'Service Performance' },
  { id: 'log-g5', industryId: 'log', name: 'Contract & Customer' },
  // 7. Professional Services
  { id: 'pro-g1', industryId: 'pro', name: 'Pipeline Metrics' },
  { id: 'pro-g2', industryId: 'pro', name: 'Revenue Metrics' },
  { id: 'pro-g3', industryId: 'pro', name: 'Utilization Metrics' },
  { id: 'pro-g4', industryId: 'pro', name: 'Client Retention' },
  { id: 'pro-g5', industryId: 'pro', name: 'Collections' },
  // 8. Hospitality / F&B
  { id: 'hos-g1', industryId: 'hos', name: 'Revenue Metrics' },
  { id: 'hos-g2', industryId: 'hos', name: 'Customer Metrics' },
  { id: 'hos-g3', industryId: 'hos', name: 'Menu / Service Performance' },
  { id: 'hos-g4', industryId: 'hos', name: 'Operations Metrics' },
  { id: 'hos-g5', industryId: 'hos', name: 'Loyalty & Channel' },
  // 9. Healthcare
  { id: 'hlt-g1', industryId: 'hlt', name: 'Revenue Metrics' },
  { id: 'hlt-g2', industryId: 'hlt', name: 'Patient Metrics' },
  { id: 'hlt-g3', industryId: 'hlt', name: 'Utilization Metrics' },
  { id: 'hlt-g4', industryId: 'hlt', name: 'Quality & Service' },
  { id: 'hlt-g5', industryId: 'hlt', name: 'Claims & Collections' },
  // 10. Real Estate
  { id: 'real-g1', industryId: 'real', name: 'Lead & Inquiry Metrics' },
  { id: 'real-g2', industryId: 'real', name: 'Revenue Metrics' },
  { id: 'real-g3', industryId: 'real', name: 'Property Performance' },
  { id: 'real-g4', industryId: 'real', name: 'Sales Efficiency' },
  { id: 'real-g5', industryId: 'real', name: 'Customer Metrics' },
  // 11. Education
  { id: 'edu-g1', industryId: 'edu', name: 'Enrollment Metrics' },
  { id: 'edu-g2', industryId: 'edu', name: 'Revenue Metrics' },
  { id: 'edu-g3', industryId: 'edu', name: 'Retention Metrics' },
  { id: 'edu-g4', industryId: 'edu', name: 'Operational Metrics' },
  { id: 'edu-g5', industryId: 'edu', name: 'Loyalty & Referral' },
  // 12. Agriculture / Food
  { id: 'agr-g1', industryId: 'agr', name: 'Revenue Metrics' },
  { id: 'agr-g2', industryId: 'agr', name: 'Margin & Pricing' },
  { id: 'agr-g3', industryId: 'agr', name: 'Supply & Fulfillment' },
  { id: 'agr-g4', industryId: 'agr', name: 'Customer Metrics' },
  { id: 'agr-g5', industryId: 'agr', name: 'Quality & Compliance' },
  // 13. Personal Services
  { id: 'psv-g1', industryId: 'psv', name: 'Revenue Metrics' },
  { id: 'psv-g2', industryId: 'psv', name: 'Booking Metrics' },
  { id: 'psv-g3', industryId: 'psv', name: 'Customer Metrics' },
  { id: 'psv-g4', industryId: 'psv', name: 'Operations Metrics' },
  { id: 'psv-g5', industryId: 'psv', name: 'Loyalty & Membership' },
  // 14. E-commerce
  { id: 'ecom-g1', industryId: 'ecom', name: 'Traffic & Conversion' },
  { id: 'ecom-g2', industryId: 'ecom', name: 'Revenue Metrics' },
  { id: 'ecom-g3', industryId: 'ecom', name: 'Marketing Efficiency' },
  { id: 'ecom-g4', industryId: 'ecom', name: 'Fulfillment Metrics' },
  { id: 'ecom-g5', industryId: 'ecom', name: 'Customer Retention' },
];

const generateItems = (groupId: string, prefix: string, names: string[]) => {
  return names.map((name, i) => ({
    id: `${groupId}-k${i + 1}`,
    groupId,
    name,
    code: `${prefix.substring(0,3).toUpperCase()}-${String(i + 1).padStart(2, '0')}`,
    desc: `${name} performance indicator`,
    defaultVisible: i < 3,
    chartType: ['card', 'line', 'bar', 'pie', 'table'][i % 5],
    isCore: i === 0
  }));
};

export const KPI_ITEMS = [
  // 1. Manufacturing
  ...generateItems('mfg-g1', 'REV', ['Monthly Revenue', 'Quarterly Revenue', 'Yearly Revenue', 'Revenue by Product Line', 'Revenue by Customer', 'Revenue by Region', 'Revenue by Sales Channel', 'Export Revenue', 'Domestic Revenue', 'Average Order Value']),
  ...generateItems('mfg-g2', 'PRF', ['Gross Profit', 'Gross Margin', 'Contribution Margin', 'Profit per Product', 'Profit per Customer', 'Cost-to-Serve', 'Discount Impact on Margin', 'Material Cost Impact', 'Price Variance', 'Net Sales Margin']),
  ...generateItems('mfg-g3', 'ORD', ['Orders Received', 'Orders Fulfilled', 'Open Orders', 'Backlog Value', 'Backlog Aging', 'Book-to-Bill Ratio', 'Rush Order Ratio', 'Repeat Order Rate', 'Lost Orders', 'Order Cancellation Rate']),
  ...generateItems('mfg-g4', 'DEL', ['On-Time Delivery Rate', 'OTIF', 'Average Delivery Lead Time', 'Delivery Delay Count', 'Fill Rate', 'Short Shipment Rate', 'Lost Sales due to Stockout', 'Production Delay Impact', 'Return Rate', 'Warranty Claim Rate']),
  ...generateItems('mfg-g5', 'CUS', ['New Customers', 'Active Customers', 'Repeat Customers', 'Customer Retention Rate', 'Churn Rate', 'Revenue Concentration Top 5 Customers', 'Complaint Rate', 'Customer Satisfaction Score', 'Contract Renewal Rate', 'Customer Lifetime Value']),

  // 2. Wholesale
  ...generateItems('whl-g1', 'REV', ['Monthly Revenue', 'Revenue by Brand', 'Revenue by Category', 'Revenue by Customer Segment', 'Revenue by Region', 'Revenue by Sales Rep', 'Revenue by Distribution Channel', 'Average Order Value', 'Revenue per Customer', 'Revenue Growth Rate']),
  ...generateItems('whl-g2', 'MAR', ['Gross Profit', 'Gross Margin', 'Margin by SKU', 'Margin by Brand', 'Discount Rate', 'Rebate Cost', 'Promotion Cost', 'Net Margin after Discount', 'Price Realization', 'Trade Discount Ratio']),
  ...generateItems('whl-g3', 'INV', ['Inventory Turnover', 'Days Inventory on Hand', 'Fill Rate', 'Backorder Rate', 'Stockout Rate', 'Overstock Ratio', 'Slow-Moving Inventory Ratio', 'Inventory Aging', 'Lost Sales due to Stockout', 'Order Accuracy Rate']),
  ...generateItems('whl-g4', 'SAL', ['Sales Visits', 'Accounts Covered', 'Orders per Visit', 'New Account Opened', 'Dormant Account Reactivated', 'Proposal Count', 'Quote-to-Order Conversion', 'Follow-up Completion Rate', 'Sales Productivity per Rep', 'Sales Cycle Length']),
  ...generateItems('whl-g5', 'REC', ['Collection Rate', 'DSO', 'Overdue Invoice Ratio', 'AR Aging', 'Credit Limit Usage', 'Bad Debt Risk', 'Late Payment Count', 'Collection Success Rate', 'Invoice Accuracy Rate', 'Cash Collected']),

  // 3. Retail
  ...generateItems('rtl-g1', 'SAL', ['Daily Sales', 'Monthly Sales', 'Same Store Sales Growth', 'Sales per Store', 'Sales per Employee', 'Sales per Square Meter', 'Transaction Count', 'Average Order Value', 'Units per Transaction', 'Revenue per Category']),
  ...generateItems('rtl-g2', 'BSK', ['Average Basket Size', 'Average Basket Value', 'Units per Basket', 'Add-on Purchase Rate', 'Promotion Basket Uplift', 'Cross-Sell Rate', 'Upsell Rate', 'Discount Usage Rate', 'Premium Product Ratio', 'Basket Conversion by Campaign']),
  ...generateItems('rtl-g3', 'OPE', ['Footfall', 'Visitor-to-Buyer Conversion', 'Peak Hour Sales', 'Checkout Waiting Time', 'Staff Productivity', 'Return Rate', 'Complaint Rate', 'Refund Rate', 'Campaign Execution Compliance', 'Queue Abandonment Rate']),
  ...generateItems('rtl-g4', 'INV', ['Sell-Through Rate', 'Stockout Rate', 'Dead Stock Ratio', 'Stock Cover Days', 'Shrinkage Rate', 'Inventory Turnover', 'Markdown Ratio', 'Seasonal Item Sell-Through', 'Inventory Accuracy', 'Replenishment Lead Time']),
  ...generateItems('rtl-g5', 'LOY', ['Loyalty Member Count', 'Repeat Purchase Rate', 'New Member Acquisition', 'Member Sales Ratio', 'Point Redemption Rate', 'Churn Rate', 'Reactivation Rate', 'NPS', 'Customer Satisfaction Score', 'Referral Rate']),

  // 4. Construction
  ...generateItems('con-g1', 'PIP', ['Tender Invitations', 'Tender Submitted', 'Tender Win Rate', 'Bid Value', 'Awarded Contract Value', 'Pipeline Value', 'Pipeline by Stage', 'Opportunity Count', 'Repeat Client Opportunities', 'Upcoming Bid Schedule']),
  ...generateItems('con-g2', 'REV', ['Contracted Revenue', 'Recognized Revenue', 'Progress Billing Value', 'Variation Order Value', 'Claim Value', 'Backlog Value', 'Backlog Burn Rate', 'Revenue by Project Type', 'Revenue by Client', 'Revenue Forecast']),
  ...generateItems('con-g3', 'BID', ['Bid Preparation Time', 'Bid Cost', 'Bid-to-Win Ratio', 'Margin at Tender Stage', 'Margin after Award', 'Competitor Loss Count', 'Discount Given in Negotiation', 'Proposal Turnaround Time', 'Win/Loss Analysis', 'Quote Approval Time']),
  ...generateItems('con-g4', 'DEL', ['Project Delay Rate', 'Change Order Success Rate', 'Rework Cost', 'Defect Rate', 'Handover Delay Count', 'Punch List Closure Time', 'Safety Incident Impact', 'Claim Resolution Time', 'Schedule Variance', 'Cost Overrun Impact on Margin']),
  ...generateItems('con-g5', 'CLI', ['Repeat Client Rate', 'Client Retention Rate', 'Revenue by Developer/Owner', 'Satisfaction Score', 'Complaint Rate', 'Collection Delay by Client', 'Top Client Revenue Concentration', 'Referral Count', 'Renewal Opportunity Count', 'Client Payment Timeliness']),

  // 5. IT / Software
  ...generateItems('it-g1', 'REV', ['MRR', 'ARR', 'One-Time Implementation Revenue', 'Recurring Maintenance Revenue', 'License Revenue', 'Usage-Based Revenue', 'Revenue by Product', 'Revenue by Industry', 'Revenue by New Customer', 'Revenue by Existing Customer']),
  ...generateItems('it-g2', 'FUN', ['Inbound Leads', 'Outbound Leads', 'MQL', 'SQL', 'Demo Count', 'Trial Started', 'Trial-to-Paid Conversion', 'Proposal Count', 'POC Count', 'POC-to-Contract Conversion']),
  ...generateItems('it-g3', 'SUB', ['ACV', 'ARPA', 'CAC', 'CAC Payback Period', 'LTV', 'LTV/CAC Ratio', 'Expansion Revenue', 'Gross Revenue Retention', 'Net Revenue Retention', 'Churn Revenue Rate']),
  ...generateItems('it-g4', 'RET', ['Logo Churn Rate', 'Revenue Churn Rate', 'Renewal Rate', 'Renewal Win Rate', 'Upsell Rate', 'Cross-Sell Rate', 'Seat Expansion Rate', 'Feature Adoption Rate', 'Paid User Activation Rate', 'Customer Health Score']),
  ...generateItems('it-g5', 'DEL', ['Time to Go-Live', 'Implementation Success Rate', 'Deployment Delay Rate', 'Billable Utilization', 'Consultant Utilization', 'Post-Go-Live Ticket Volume', 'SLA Achievement Rate', 'Project Completion Rate', 'On-Time Delivery', 'Support Escalation Rate']),

  // 6. Logistics
  ...generateItems('log-g1', 'REV', ['Revenue per Shipment', 'Revenue per Route', 'Revenue per Customer', 'Revenue per Vehicle', 'Revenue per Driver', 'Revenue per Warehouse', 'Revenue per Kilometer', 'Revenue per Pallet', 'Revenue by Service Type', 'Revenue Growth Rate']),
  ...generateItems('log-g2', 'MAR', ['Gross Margin per Shipment', 'Cost per Delivery', 'Cost per Stop', 'Cost per Kilometer', 'Fuel Cost Ratio', 'Fuel Surcharge Recovery Rate', 'Empty Run Ratio', 'Margin by Lane', 'Margin by Customer', 'Net Margin after Claims']),
  ...generateItems('log-g3', 'CAP', ['Vehicle Utilization Rate', 'Load Factor', 'Warehouse Occupancy', 'Shipment Volume', 'Delivery Capacity Usage', 'Driver Utilization', 'Route Efficiency', 'Available Fleet Ratio', 'Idle Vehicle Ratio', 'Capacity Constraint Rate']),
  ...generateItems('log-g4', 'SER', ['On-Time Pickup Rate', 'On-Time Delivery Rate', 'Failed Delivery Rate', 'Damage Rate', 'Claim Rate', 'POD Completion Rate', 'ETA Accuracy', 'Lost Shipment Incidents', 'Return Logistics Ratio', 'Complaint Rate']),
  ...generateItems('log-g5', 'CON', ['Contract Renewal Rate', 'Spot vs Contract Revenue Mix', 'Revenue Concentration by Customer', 'Bid Win Rate', 'DSO by Customer', 'Collection Rate', 'Repeat Customer Rate', 'New Contract Count', 'Client Churn Rate', 'Satisfaction Score']),

  // 7. Professional Services
  ...generateItems('pro-g1', 'PIP', ['Lead Count', 'Qualified Lead Count', 'Proposal Count', 'Proposal Acceptance Rate', 'Win Rate', 'Sales Cycle Length', 'Referral Lead Count', 'Webinar/Seminar Lead Conversion', 'Opportunity Value', 'Pipeline Coverage Ratio']),
  ...generateItems('pro-g2', 'REV', ['Revenue Recognized', 'Billable Revenue', 'Retainer Revenue', 'Project Revenue', 'Revenue by Consultant', 'Revenue by Service Line', 'Revenue by Industry', 'Revenue by Client', 'Average Contract Value', 'Revenue Growth Rate']),
  ...generateItems('pro-g3', 'UTI', ['Billable Utilization', 'Realization Rate', 'Write-Off Rate', 'Scope Creep Ratio', 'Project Overrun Rate', 'On-Time Deliverable Rate', 'Consultant Productivity', 'Hours per Project', 'Delivery Efficiency', 'Resource Allocation Rate']),
  ...generateItems('pro-g4', 'RET', ['Retainer Renewal Rate', 'Repeat Project Rate', 'Cross-Sell Rate', 'Upsell Rate', 'Revenue per Client', 'Churn Rate', 'Satisfaction Score', 'Referral Rate', 'Complaint Rate', 'Contract Extension Rate']),
  ...generateItems('pro-g5', 'COL', ['Collection Rate', 'DSO', 'Overdue Invoice Ratio', 'AR Aging', 'Late Payment Count', 'Bad Debt Risk', 'Invoice Accuracy', 'Billing Cycle Time', 'Cash Collection Value', 'Payment Timeliness']),

  // 8. Hospitality / F&B
  ...generateItems('hos-g1', 'REV', ['Sales by Outlet', 'Sales by Meal Period', 'ADR', 'RevPAR', 'Occupancy Rate', 'Table Turnover Rate', 'Covers Served', 'Average Check Value', 'Revenue per Seat', 'Delivery/Takeout Revenue Ratio']),
  ...generateItems('hos-g2', 'CUS', ['Walk-in Count', 'Reservation Count', 'Repeat Guest Ratio', 'OTA Booking Ratio', 'Direct Booking Ratio', 'Cancellation Rate', 'No-Show Rate', 'Review Score', 'Complaint Rate', 'Customer Satisfaction Score']),
  ...generateItems('hos-g3', 'MEN', ['Sales by Menu Item', 'Contribution by Item', 'Menu Popularity Index', 'Add-on Attachment Rate', 'Seasonal Promotion Performance', 'Upsell Rate', 'Package Conversion Rate', 'Best Seller Ratio', 'Low Seller Ratio', 'Average Spend per Guest']),
  ...generateItems('hos-g4', 'OPE', ['Food Cost %', 'Labor Cost %', 'Gross Margin by Outlet', 'Waiting Time', 'Service Speed', 'Order Error Rate', 'Waste Rate', 'Refund/Comp Rate', 'Table Utilization Rate', 'Staff Productivity']),
  ...generateItems('hos-g5', 'LOY', ['Member Sales Ratio', 'Loyalty Program Enrollment', 'Repeat Booking Rate', 'Campaign Conversion Rate', 'Delivery Platform Revenue', 'Direct Channel Growth', 'Referral Rate', 'Reactivation Rate', 'Email Campaign Conversion', 'Promotion ROI']),

  // 9. Healthcare
  ...generateItems('hlt-g1', 'REV', ['Revenue by Service Type', 'Revenue by Site', 'Revenue by Doctor/Team', 'Revenue by Payer Type', 'Self-Pay Revenue', 'Insurance Claim Revenue', 'Monthly Revenue', 'Revenue per Patient', 'New Patient Revenue', 'Repeat Patient Revenue']),
  ...generateItems('hlt-g2', 'PAT', ['Number of Patients', 'New Patients', 'Repeat Patients', 'Follow-Up Booking Rate', 'Appointment Booking Count', 'Show-Up Rate', 'Cancellation Rate', 'Referral Conversion Rate', 'Patient Retention Rate', 'Patient Satisfaction Score']),
  ...generateItems('hlt-g3', 'UTI', ['Facility Utilization Rate', 'Bed/Room Occupancy', 'Staff Utilization', 'Appointment Slot Utilization', 'Average Waiting Time', 'Service Completion Rate', 'Resource Allocation Efficiency', 'Capacity Usage', 'Idle Slot Rate', 'Overbooking Rate']),
  ...generateItems('hlt-g4', 'QUA', ['Complaint Rate', 'Incident Rate', 'Readmission/Return Issue Rate', 'Service Delay Rate', 'Resolution Time', 'SLA Achievement', 'Documentation Accuracy', 'Patient Review Score', 'Escalation Rate', 'Rework/Correction Rate']),
  ...generateItems('hlt-g5', 'CLA', ['Claim Submission Value', 'Claim Acceptance Rate', 'Claim Rejection Rate', 'Collection Lead Time', 'AR Aging', 'Overdue Claim Ratio', 'DSO', 'Payment Timeliness', 'Invoice Accuracy', 'Cash Collected']),

  // 10. Real Estate
  ...generateItems('real-g1', 'LEA', ['Listing Count', 'Inquiry Count', 'Viewing Count', 'Viewing-to-Offer Conversion', 'Offer-to-Contract Conversion', 'Days on Market', 'Lead Source by Portal', 'Referral Leads', 'Agent Follow-Up Rate', 'Lead Response Time']),
  ...generateItems('real-g2', 'REV', ['Brokerage Fee Revenue', 'Leasing Revenue', 'Property Management Revenue', 'Renewal Fee Revenue', 'Revenue by Agent', 'Revenue by Property Type', 'Revenue by Area', 'Revenue by Client Type', 'Average Commission Value', 'Monthly Revenue']),
  ...generateItems('real-g3', 'PRO', ['Occupancy Rate', 'Vacancy Rate', 'Vacancy Days', 'Average Rent per Unit', 'Renewal Rate', 'Tenant Churn Rate', 'Rent Collection Rate', 'Delinquency Rate', 'Maintenance Complaint Rate', 'Unit Turnaround Time']),
  ...generateItems('real-g4', 'SAL', ['Close Rate', 'Sales Cycle Length', 'Agent Productivity', 'Exclusive Listing Ratio', 'Acquisition Cost per Landlord', 'Commission Margin', 'Discount/Concession Ratio', 'Upsell to Management Services', 'Proposal Count', 'Contract Turnaround Time']),
  ...generateItems('real-g5', 'CUS', ['Landlord Retention Rate', 'Tenant Retention Rate', 'Satisfaction Score', 'Complaint Rate', 'Repeat Client Rate', 'Referral Rate', 'Collection Delay by Tenant', 'Top Client Revenue Concentration', 'Renewal Opportunity Count', 'Service Response Time']),

  // 11. Education
  ...generateItems('edu-g1', 'ENR', ['Inquiry Count', 'Trial Lesson Count', 'Trial-to-Enrollment Conversion', 'Enrollment Count', 'Active Students', 'New Students', 'Revenue per Course', 'Revenue per Branch', 'Revenue per Teacher', 'Enrollment Growth Rate']),
  ...generateItems('edu-g2', 'REV', ['Tuition Revenue', 'Course Revenue', 'Add-on Program Revenue', 'Subscription/Membership Revenue', 'Revenue by Course Level', 'Revenue by Student Type', 'Revenue by Campus', 'Monthly Revenue', 'Average Revenue per Student', 'Revenue Renewal Rate']),
  ...generateItems('edu-g3', 'RET', ['Student Retention Rate', 'Dropout Rate', 'Renewal Rate', 'Attendance Rate', 'Course Completion Rate', 'Upsell to Higher-Level Program', 'Repeat Enrollment Rate', 'Churn Rate', 'Reactivation Rate', 'Parent/Student Satisfaction Score']),
  ...generateItems('edu-g4', 'OPE', ['Teacher Utilization', 'Class Fill Rate', 'Schedule Efficiency', 'Make-Up Class Rate', 'Complaint Rate', 'Waiting List Count', 'Average Class Size', 'On-Time Class Start Rate', 'Staff Productivity', 'Capacity Usage']),
  ...generateItems('edu-g5', 'LOY', ['Referral Rate', 'New Student from Referral', 'Parent Satisfaction Score', 'NPS', 'Community Event Conversion', 'Campaign Conversion Rate', 'Loyalty Program Participation', 'Repeat Family Enrollment', 'Review Score', 'Re-enrollment Rate']),

  // 12. Agriculture / Food
  ...generateItems('agr-g1', 'REV', ['Sales by Product', 'Sales by Grade', 'Sales by Market', 'Export Revenue', 'Domestic Revenue', 'Seasonal Revenue', 'Contract Farming Revenue', 'Wholesale Revenue', 'Retail Revenue', 'Revenue Growth Rate']),
  ...generateItems('agr-g2', 'MAR', ['Gross Profit', 'Gross Margin by Product', 'Farmgate Price vs Selling Price', 'Yield-to-Sales Conversion', 'Price Fluctuation Impact', 'Spoilage Cost Impact', 'Discount due to Quality Issues', 'Net Margin', 'Processing Margin', 'Cost per Unit Sold']),
  ...generateItems('agr-g3', 'SUP', ['Harvest Volume', 'Processed Volume', 'Sellable Yield', 'Stock Freshness Days', 'OTIF', 'Buyer Rejection Rate', 'Return Rate', 'Damage Rate', 'Spoilage Rate', 'Fulfillment Accuracy']),
  ...generateItems('agr-g4', 'CUS', ['New Distributor Count', 'Repeat Buyer Rate', 'Export Buyer Retention', 'Revenue by Buyer', 'Complaint Rate', 'Contract Renewal Rate', 'Buyer Satisfaction Score', 'Customer Churn Rate', 'Top Buyer Concentration', 'Referral Buyer Count']),
  ...generateItems('agr-g5', 'QUA', ['Certification-Based Sales Ratio', 'Quality Claim Rate', 'Safety Incident Count', 'Compliance Pass Rate', 'Inspection Pass Rate', 'Batch Traceability Completion', 'Product Recall Count', 'Documentation Accuracy', 'Non-Conformance Rate', 'Corrective Action Closure Time']),

  // 13. Personal Services
  ...generateItems('psv-g1', 'REV', ['Sales per Branch', 'Sales per Staff', 'Appointment Revenue', 'Walk-in Revenue', 'Average Ticket Size', 'Product Attachment Revenue', 'Add-on Service Revenue', 'Revenue by Service Type', 'Monthly Revenue', 'Revenue Growth Rate']),
  ...generateItems('psv-g2', 'BOO', ['Appointment Count', 'Walk-in Count', 'Booking Conversion Rate', 'No-Show Rate', 'Cancellation Rate', 'Repeat Booking Rate', 'Next-Booking-on-Site Rate', 'Average Booking Lead Time', 'Peak Slot Utilization', 'Booking Source Mix']),
  ...generateItems('psv-g3', 'CUS', ['New Customers', 'Repeat Customers', 'Churn Rate', 'Membership Enrollment', 'Loyalty Usage Rate', 'Review Score', 'Complaint Rate', 'Satisfaction Score', 'Referral Rate', 'Reactivation Rate']),
  ...generateItems('psv-g4', 'OPE', ['Chair/Room Utilization', 'Staff Occupancy', 'Waiting Time', 'Service Duration Variance', 'Refund Rate', 'Rework Rate', 'Staff Productivity', 'Add-on Service Conversion', 'Product Sales Attachment Rate', 'Capacity Usage']),
  ...generateItems('psv-g5', 'LOY', ['Member Revenue Ratio', 'Membership Renewal Rate', 'Loyalty Point Usage', 'Referral Conversion', 'VIP Customer Ratio', 'Repeat Visit Frequency', 'Campaign Conversion Rate', 'Upsell Rate', 'Cross-Sell Rate', 'NPS']),

  // 14. E-commerce
  ...generateItems('ecom-g1', 'TRA', ['Website Traffic', 'Unique Visitors', 'Conversion Rate', 'Sessions-to-Order Rate', 'Product Page View Rate', 'Cart Abandonment Rate', 'Checkout Completion Rate', 'Bounce Rate', 'Traffic by Channel', 'Traffic by Device']),
  ...generateItems('ecom-g2', 'REV', ['Gross Merchandise Value', 'Net Revenue', 'Revenue by Channel', 'Revenue by Campaign', 'Revenue by Device', 'Revenue by Marketplace', 'Average Order Value', 'Revenue Growth Rate', 'Revenue per Visitor', 'Revenue per Customer']),
  ...generateItems('ecom-g3', 'MAR', ['CAC', 'ROAS', 'MER', 'Cost per Conversion', 'Email Campaign Conversion', 'Paid Search Conversion', 'Organic Conversion', 'Affiliate Conversion', 'Promotion ROI', 'Discount Dependency Ratio']),
  ...generateItems('ecom-g4', 'FUL', ['Order Processing Time', 'Dispatch SLA', 'Delivery SLA', 'Return Rate', 'Refund Rate', 'CS Tickets per 100 Orders', 'Payment Failure Rate', 'COD Failure Rate', 'Fulfillment Accuracy', 'Lost Package Rate']),
  ...generateItems('ecom-g5', 'RET', ['Repeat Order Rate', 'Customer Retention Rate', 'Churn Rate', 'Reactivation Rate', 'LTV', 'Purchase Frequency', 'Cross-Sell Rate', 'Upsell Rate', 'Loyalty Enrollment', 'NPS']),
];
