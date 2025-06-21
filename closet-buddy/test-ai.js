// Simple test script to verify AI functionality
const { testAIConnection } = require('./lib/ai/index.ts');

async function testAI() {
    console.log('Testing AI connection...');
    
    try {
        const result = await testAIConnection();
        console.log('AI Test Result:', JSON.stringify(result, null, 2));
        
        if (result.success) {
            console.log('✅ AI connection successful!');
            console.log('Provider:', result.data?.provider);
            console.log('Message:', result.data?.message);
        } else {
            console.log('❌ AI connection failed:', result.error);
        }
    } catch (error) {
        console.error('❌ Test failed with error:', error.message);
    }
}

testAI();
