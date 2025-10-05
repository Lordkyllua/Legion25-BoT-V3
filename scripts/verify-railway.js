// Script para verificar la configuración de Railway
console.log('🚄 Railway Environment Check');
console.log('============================');

const requiredVars = ['DISCORD_TOKEN', 'MONGODB_URI'];
const missingVars = [];

console.log('\n📋 Checking environment variables:');
requiredVars.forEach(varName => {
    if (process.env[varName]) {
        console.log(`✅ ${varName}: Present`);
        
        // Mostrar info segura (no mostrar tokens completos)
        if (varName === 'MONGODB_URI') {
            const safeUri = process.env[varName].replace(/:([^@]+)@/, ':****@');
            console.log(`   🔗 ${safeUri}`);
        } else if (varName === 'DISCORD_TOKEN') {
            const token = process.env[varName];
            console.log(`   🤖 Token: ${token.substring(0, 10)}...${token.substring(token.length - 5)}`);
        }
    } else {
        console.log(`❌ ${varName}: MISSING`);
        missingVars.push(varName);
    }
});

if (missingVars.length > 0) {
    console.log('\n❌ Missing required variables:', missingVars.join(', '));
    console.log('💡 Add them in Railway dashboard → Variables');
    process.exit(1);
} else {
    console.log('\n🎉 All environment variables are set correctly!');
    console.log('🚀 Bot should start successfully on Railway');
}