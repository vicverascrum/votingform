#!/bin/bash

# Simple RDS deployment without Lambda
# Just creates RDS + simple PHP backend

echo "🚀 Deploying Simple RDS Solution (No Lambda)..."

# Step 1: Create RDS instance
echo "📦 Creating RDS MySQL instance..."
aws rds create-db-instance \
    --db-instance-identifier votingform-results \
    --db-instance-class db.t3.micro \
    --engine mysql \
    --engine-version 8.0.35 \
    --master-username admin \
    --master-user-password VotingForm2025! \
    --allocated-storage 20 \
    --storage-type gp2 \
    --db-name sprint_voting \
    --backup-retention-period 7 \
    --publicly-accessible true \
    --region us-east-1

echo "⏳ Waiting for RDS to be available..."
aws rds wait db-instance-available --db-instance-identifier votingform-results --region us-east-1

# Get endpoint
ENDPOINT=$(aws rds describe-db-instances \
    --db-instance-identifier votingform-results \
    --region us-east-1 \
    --query 'DBInstances[0].Endpoint.Address' \
    --output text)

echo "📋 RDS Endpoint: $ENDPOINT"

# Update PHP file with real endpoint
sed -i.bak "s/your-rds-endpoint.amazonaws.com/$ENDPOINT/" api.php

# Setup database
echo "🗄️ Setting up database schema..."
mysql -h $ENDPOINT -u admin -pVotingForm2025! < setup-database.sql

echo "✅ RDS Setup Complete!"
echo ""
echo "📊 Next steps:"
echo "1. Upload api.php to any web server (EC2, shared hosting, etc.)"
echo "2. Update your form to use the API URL"
echo "3. Use results-dashboard.html to see results"
echo ""
echo "🔗 RDS Details:"
echo "   Endpoint: $ENDPOINT"
echo "   Database: sprint_voting"
echo "   Username: admin"
echo "   Password: VotingForm2025!"
