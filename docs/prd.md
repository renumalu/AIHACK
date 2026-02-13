# Deadline Radar AI – Predictive Student Life Intelligence System Requirements Document

## 1. Application Overview

### 1.1 Application Name
Deadline Radar AI – Predictive Student Life Intelligence System

### 1.2 Application Description
An AI-powered predictive student life management platform designed for college undergraduate students. The system tracks deadlines, predicts overload risk, analyzes behavioral patterns, and provides intelligent recommendations to prevent academic, financial, and career management failures.

### 1.3 Target Users
College students at undergraduate level

## 2. Core Functional Requirements

### 2.1 User Profile Setup
User registration and profile management with the following fields:
- Name
- Department
- Year of Study
- Semester Start Date
- Monthly Budget Limit
- Career Goal (Product Company / Higher Studies / Core Job / Government Job)

### 2.2 Predictive Deadline Generator
Automatically generate academic deadlines based on Semester Start Date:
- Internal Exam 1 → Week 4
- Internal Exam 2 → Week 8
- Model Exam → Week 12
- Semester Exam → Week 16
- Exam Registration Window → 2 weeks before Semester Exam

Deadlines are calculated dynamically using date calculation logic.

### 2.3 AI Deadline Intelligence Engine
Calculate and display intelligent metrics:

**Deadline Urgency Score**
Based on:
- Days remaining until deadline
- Number of pending tasks
- Missed deadlines count

**Overload Risk Score (0–100)**
Calculated based on:
- More than 5 deadlines within 7 days
- 1 or more missed deadlines
- No progress updates

Risk Level Display:
- Green (0–40): Low risk
- Yellow (41–70): Medium risk
- Red (71–100): High risk

### 2.4 Analytics Dashboard
Visual analytics dashboard displaying:
- Pie chart: Deadline distribution by category
- Bar chart: Deadlines per week
- Line chart: Risk score trend over time
- Budget usage progress bar
- Countdown timer widgets for upcoming deadlines

### 2.5 AI Recommendation System
Dynamic, rule-based AI recommendations that adapt to user data:
- Academic workload suggestions (e.g., You have 3 academic deadlines this week. Allocate 2 study sessions.)
- Risk management alerts (e.g., Your risk score increased by 20%. Reduce low-priority tasks.)
- Budget warnings (e.g., You are spending 30% above your budget. Limit non-essential expenses.)
- Career preparation reminders (e.g., Internship season approaching. Update resume this month.)

### 2.6 Financial Analytics
Expense tracking and budget management:
- Add and categorize expenses
- Monthly spending trend analysis
- Budget utilization percentage
- Predict potential budget overspending
- Display warning messages when predicted overspending is detected

### 2.7 Career Timeline Intelligence
Generate personalized career preparation timelines based on Career Goal:

**Product Company Track:**
- DSA Practice Plan
- Resume Review Reminder
- Internship Application Window

**Higher Studies Track:**
- Exam preparation schedule
- Application deadlines
- Document checklist

Timeline suggestions are generated automatically based on user profile.

### 2.8 AI Assistant Integration
Integrate AI assistant functionality using real API key for:
- Natural language query support
- Personalized guidance
- Smart task prioritization

## 3. Data Management Requirements

### 3.1 Data Entities
- User: Store user profile information
- Deadline: Store deadline records with category, date, status
- Category: Classify deadlines (Academic, Financial, Career, Personal)
- Expense: Track financial transactions
- RiskScore: Store calculated risk metrics over time
- Recommendation: Store generated AI recommendations

### 3.2 Data Storage
All user data must be securely stored and persisted, including:
- User profiles
- Deadline records
- Expense history
- Risk score history
- Generated recommendations

## 4. Technical Implementation Requirements

### 4.1 Calculation Logic
- Implement automated deadline generation based on semester start date
- Implement risk score calculation algorithm
- Implement budget prediction algorithm
- Use calculated attributes for urgency and risk scoring

### 4.2 Automation
- Enable scheduled events to update risk scores daily
- Trigger recommendation generation based on data changes

### 4.3 User Interface
- Mobile-responsive design
- Color-coded risk indicators (Green/Yellow/Red)
- Interactive analytics charts and visualizations
- Real-time countdown timers

### 4.4 AI Integration
- Integrate AI assistant with real API key
- Ensure AI features are fully functional

## 5. Expected Outcome
A fully functional AI-driven predictive student life intelligence system featuring:
- Automated deadline tracking and generation
- Real-time risk assessment and scoring
- Interactive analytics dashboards
- Dynamic AI-powered recommendations
- Financial management and prediction
- Career timeline planning
- Persistent data storage
- AI assistant integration

This system goes beyond basic task management to provide predictive intelligence and proactive guidance for student success.