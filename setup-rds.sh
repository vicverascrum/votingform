#!/bin/bash

# Setup RDS MySQL for VotingForm Results
# Run this script to create the RDS instance

echo "🚀 Setting up RDS MySQL for VotingForm..."

# Variables
DB_INSTANCE_ID="votingform-results"
DB_NAME="sprint_voting"
DB_USERNAME="admin"
DB_PASSWORD="VotingForm2025!"
DB_CLASS="db.t3.micro"
REGION="us-east-1"

echo "📦 Creating RDS MySQL instance..."

# Create RDS instance
aws rds create-db-instance \
    --db-instance-identifier $DB_INSTANCE_ID \
    --db-instance-class $DB_CLASS \
    --engine mysql \
    --engine-version 8.0.35 \
    --master-username $DB_USERNAME \
    --master-user-password $DB_PASSWORD \
    --allocated-storage 20 \
    --storage-type gp2 \
    --vpc-security-group-ids sg-default \
    --db-name $DB_NAME \
    --backup-retention-period 7 \
    --multi-az false \
    --publicly-accessible true \
    --storage-encrypted false \
    --region $REGION

echo "⏳ Waiting for RDS instance to be available..."
aws rds wait db-instance-available --db-instance-identifier $DB_INSTANCE_ID --region $REGION

echo "📋 Getting RDS endpoint..."
ENDPOINT=$(aws rds describe-db-instances \
    --db-instance-identifier $DB_INSTANCE_ID \
    --region $REGION \
    --query 'DBInstances[0].Endpoint.Address' \
    --output text)

echo "✅ RDS MySQL created successfully!"
echo "📊 Connection details:"
echo "   Endpoint: $ENDPOINT"
echo "   Database: $DB_NAME"
echo "   Username: $DB_USERNAME"
echo "   Password: $DB_PASSWORD"
echo "   Port: 3306"

# Save connection details
cat > rds-config.json << EOF
{
  "host": "$ENDPOINT",
  "database": "$DB_NAME",
  "username": "$DB_USERNAME",
  "password": "$DB_PASSWORD",
  "port": 3306
}
EOF

echo "💾 Connection details saved to rds-config.json"
echo "🔧 Next: Run setup-database.sql to create tables"
