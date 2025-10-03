// AWS Lambda function for handling VotingForm with RDS MySQL
// Deploy this to AWS Lambda

const mysql = require('mysql2/promise');

// RDS Configuration
const dbConfig = {
    host: process.env.RDS_ENDPOINT,
    user: process.env.RDS_USERNAME,
    password: process.env.RDS_PASSWORD,
    database: process.env.RDS_DATABASE,
    port: 3306,
    ssl: { rejectUnauthorized: false }
};

exports.handler = async (event, context) => {
    // Set CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    };

    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    let connection;
    
    try {
        // Create database connection
        connection = await mysql.createConnection(dbConfig);
        
        if (event.httpMethod === 'POST') {
            return await handleSubmission(connection, event, headers);
        } else if (event.httpMethod === 'GET') {
            return await handleQuery(connection, event, headers);
        }
        
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
        
    } catch (error) {
        console.error('Database error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: 'Database connection failed',
                details: error.message 
            })
        };
    } finally {
        if (connection) {
            await connection.end();
        }
    }
};

async function handleSubmission(connection, event, headers) {
    try {
        const data = JSON.parse(event.body);
        
        // Validate required fields
        if (!data.email || !data.selectedItems || data.totalHours === undefined) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Missing required fields' })
            };
        }

        // Insert main voting result
        const [result] = await connection.execute(
            `INSERT INTO voting_results 
             (email, selected_items, total_hours, capacity_percentage, sprint_number, ip_address, user_agent) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                data.email,
                JSON.stringify(data.selectedItems),
                data.totalHours,
                (data.totalHours / 260) * 100,
                data.sprintNumber || 24,
                event.requestContext?.identity?.sourceIp || 'unknown',
                event.requestContext?.identity?.userAgent || 'unknown'
            ]
        );

        const votingResultId = result.insertId;

        // Insert individual question selections
        if (data.selectedItems && Array.isArray(data.selectedItems)) {
            for (const item of data.selectedItems) {
                await connection.execute(
                    `INSERT INTO question_selections 
                     (voting_result_id, question_id, question_title, estimated_hours, complexity, category) 
                     VALUES (?, ?, ?, ?, ?, ?)`,
                    [
                        votingResultId,
                        item.id,
                        item.title,
                        item.estimatedHours || null,
                        item.complexity || null,
                        item.category || null
                    ]
                );
            }
        }

        // Log analytics event
        await connection.execute(
            `INSERT INTO form_analytics (event_type, event_data, user_email) 
             VALUES (?, ?, ?)`,
            [
                'form_submission',
                JSON.stringify({
                    totalHours: data.totalHours,
                    itemsCount: data.selectedItems.length,
                    capacityPercentage: (data.totalHours / 260) * 100
                }),
                data.email
            ]
        );

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                message: 'Voting result saved successfully',
                id: votingResultId
            })
        };

    } catch (error) {
        console.error('Submission error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: 'Failed to save voting result',
                details: error.message 
            })
        };
    }
}

async function handleQuery(connection, event, headers) {
    try {
        const queryType = event.queryStringParameters?.type || 'results';
        
        if (queryType === 'results') {
            // Get all voting results
            const [rows] = await connection.execute(
                `SELECT * FROM results_summary ORDER BY submission_date DESC LIMIT 100`
            );
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    data: rows,
                    count: rows.length
                })
            };
            
        } else if (queryType === 'stats') {
            // Get statistics
            const [stats] = await connection.execute(`
                SELECT 
                    COUNT(*) as total_submissions,
                    AVG(total_hours) as avg_hours,
                    MAX(total_hours) as max_hours,
                    MIN(total_hours) as min_hours,
                    AVG(capacity_percentage) as avg_capacity
                FROM voting_results 
                WHERE sprint_number = 24
            `);
            
            const [topItems] = await connection.execute(`
                SELECT 
                    question_title,
                    COUNT(*) as selection_count,
                    AVG(estimated_hours) as avg_hours
                FROM question_selections qs
                JOIN voting_results vr ON qs.voting_result_id = vr.id
                WHERE vr.sprint_number = 24
                GROUP BY question_title
                ORDER BY selection_count DESC
                LIMIT 10
            `);
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    stats: stats[0],
                    topItems: topItems
                })
            };
        }
        
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Invalid query type' })
        };
        
    } catch (error) {
        console.error('Query error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: 'Failed to query results',
                details: error.message 
            })
        };
    }
}
