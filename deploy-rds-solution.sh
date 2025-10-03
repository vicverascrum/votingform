#!/bin/bash

# Complete deployment script for RDS VotingForm solution
echo "🚀 Deploying RDS VotingForm Solution..."

# Step 1: Create RDS instance
echo "📦 Step 1: Creating RDS MySQL instance..."
./setup-rds.sh

# Wait for RDS to be ready
echo "⏳ Waiting for RDS to be fully available..."
sleep 60

# Step 2: Get RDS endpoint
ENDPOINT=$(aws rds describe-db-instances \
    --db-instance-identifier votingform-results \
    --region us-east-1 \
    --query 'DBInstances[0].Endpoint.Address' \
    --output text)

echo "📋 RDS Endpoint: $ENDPOINT"

# Step 3: Setup database schema
echo "🗄️ Step 2: Setting up database schema..."
mysql -h $ENDPOINT -u admin -pVotingForm2025! < setup-database.sql

# Step 4: Create Lambda deployment package
echo "📦 Step 3: Creating Lambda deployment package..."
mkdir -p lambda-package
cp lambda-rds-handler.js lambda-package/index.js

# Create package.json for Lambda
cat > lambda-package/package.json << EOF
{
  "name": "votingform-rds-handler",
  "version": "1.0.0",
  "description": "Lambda function for VotingForm with RDS",
  "main": "index.js",
  "dependencies": {
    "mysql2": "^3.6.0"
  }
}
EOF

cd lambda-package
npm install
zip -r ../votingform-lambda.zip .
cd ..

# Step 5: Deploy Lambda function
echo "⚡ Step 4: Deploying Lambda function..."
aws lambda create-function \
    --function-name votingform-rds-handler \
    --runtime nodejs18.x \
    --role arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):role/lambda-execution-role \
    --handler index.handler \
    --zip-file fileb://votingform-lambda.zip \
    --timeout 30 \
    --memory-size 256 \
    --environment Variables="{RDS_ENDPOINT=$ENDPOINT,RDS_USERNAME=admin,RDS_PASSWORD=VotingForm2025!,RDS_DATABASE=sprint_voting}" \
    --region us-east-1

# Step 6: Update API Gateway
echo "🌐 Step 5: Updating API Gateway..."
API_ID=$(aws apigateway get-rest-apis --query 'items[?name==`sprint-prioritization-api`].id' --output text)

if [ "$API_ID" != "" ]; then
    # Update existing API Gateway to point to new Lambda
    aws lambda add-permission \
        --function-name votingform-rds-handler \
        --statement-id api-gateway-invoke \
        --action lambda:InvokeFunction \
        --principal apigateway.amazonaws.com \
        --source-arn "arn:aws:execute-api:us-east-1:$(aws sts get-caller-identity --query Account --output text):$API_ID/*/*"
    
    echo "✅ API Gateway updated to use new Lambda function"
else
    echo "⚠️ API Gateway not found. You may need to create it manually."
fi

# Step 7: Update form configuration
echo "🔧 Step 6: Updating form configuration..."
sed -i.bak "s/SPRINT_NUMBER: 23/SPRINT_NUMBER: 24/" config.js

echo "✅ RDS Solution deployed successfully!"
echo ""
echo "📊 Access your results dashboard:"
echo "   File: results-dashboard.html"
echo "   Open in browser to see all voting results"
echo ""
echo "🔗 Connection details:"
echo "   RDS Endpoint: $ENDPOINT"
echo "   Database: sprint_voting"
echo "   Username: admin"
echo ""
echo "🧪 Test the setup:"
echo "   1. Open index.html and submit a test vote"
echo "   2. Open results-dashboard.html to see results"
echo "   3. Check RDS database for stored data"

# Cleanup
rm -rf lambda-package
rm votingform-lambda.zip
