#!/bin/bash

# Deploy Sprint 24 Form to AWS S3
# Requiere AWS CLI configurado

BUCKET_NAME="sprint24-form-foundever"
REGION="us-east-1"

echo "🚀 Deploying Sprint 24 Form to AWS..."

# 1. Crear bucket S3 (si no existe)
echo "📦 Creating S3 bucket..."
aws s3 mb s3://$BUCKET_NAME --region $REGION 2>/dev/null || echo "Bucket already exists"

# 2. Configurar bucket para hosting web
echo "🌐 Configuring web hosting..."
aws s3 website s3://$BUCKET_NAME --index-document index.html --error-document index.html

# 3. Configurar política pública
echo "🔓 Setting public access policy..."
cat > bucket-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::$BUCKET_NAME/*"
        }
    ]
}
EOF

aws s3api put-bucket-policy --bucket $BUCKET_NAME --policy file://bucket-policy.json

# 4. Subir archivos
echo "📤 Uploading files..."
aws s3 sync . s3://$BUCKET_NAME --exclude "*.sh" --exclude "*.md" --exclude ".git/*" --exclude "node_modules/*" --exclude "*.json" --exclude "deploy-to-aws.sh"

# 5. Configurar tipos MIME
echo "🔧 Setting MIME types..."
aws s3 cp s3://$BUCKET_NAME/src/styles/style.css s3://$BUCKET_NAME/src/styles/style.css --content-type "text/css" --metadata-directive REPLACE
aws s3 cp s3://$BUCKET_NAME/src/styles/foundever-theme.css s3://$BUCKET_NAME/src/styles/foundever-theme.css --content-type "text/css" --metadata-directive REPLACE
aws s3 cp s3://$BUCKET_NAME/src/scripts/main.js s3://$BUCKET_NAME/src/scripts/main.js --content-type "application/javascript" --metadata-directive REPLACE
aws s3 cp s3://$BUCKET_NAME/src/scripts/aws-integration.js s3://$BUCKET_NAME/src/scripts/aws-integration.js --content-type "application/javascript" --metadata-directive REPLACE

# 6. Mostrar URL
echo ""
echo "✅ Deployment complete!"
echo "🌐 Your form is now available at:"
echo "   http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com"
echo ""
echo "🔗 To use a custom domain, configure CloudFront distribution"

# Cleanup
rm bucket-policy.json
