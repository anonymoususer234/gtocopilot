// PokerNow GTO Copilot - Extension Test Script
// Run this in the browser console on a PokerNow page to test the extension

console.log('🧪 PokerNow GTO Copilot Extension Test Starting...');

function testExtension() {
    const results = {
        timestamp: new Date().toISOString(),
        url: window.location.href,
        hostname: window.location.hostname,
        tests: {}
    };
    
    // Test 1: Check if we're on PokerNow
    results.tests.onPokerNow = {
        name: 'PokerNow Domain Check',
        passed: window.location.hostname.includes('pokernow.club'),
        details: `Current hostname: ${window.location.hostname}`
    };
    
    // Test 2: Check if content script test function exists
    results.tests.contentScriptLoaded = {
        name: 'Content Script Loading',
        passed: typeof window.testContentScript === 'function',
        details: window.testContentScript ? 'Test function available' : 'Test function not found'
    };
    
    // Test 3: Check if copilot object exists
    results.tests.copilotObject = {
        name: 'Copilot Object Existence',
        passed: !!window.PokerCopilot,
        details: window.PokerCopilot ? `Version: ${window.PokerCopilot.version}` : 'PokerCopilot object not found'
    };
    
    // Test 4: Check if copilot is initialized
    if (window.PokerCopilot) {
        results.tests.copilotInitialized = {
            name: 'Copilot Initialization',
            passed: window.PokerCopilot.initialized,
            details: window.PokerCopilot.initialized ? 'Fully initialized' : 'Not yet initialized'
        };
        
        // Test 5: Check copilot status
        try {
            const status = window.PokerCopilot.getStatus();
            results.tests.copilotStatus = {
                name: 'Copilot Status',
                passed: !!status,
                details: status ? JSON.stringify(status, null, 2) : 'No status available'
            };
        } catch (error) {
            results.tests.copilotStatus = {
                name: 'Copilot Status',
                passed: false,
                details: `Error: ${error.message}`
            };
        }
    }
    
    // Test 6: Check if UI is present
    const copilotUI = document.getElementById('pokernow-copilot');
    results.tests.uiPresent = {
        name: 'Copilot UI Presence',
        passed: !!copilotUI,
        details: copilotUI ? 'UI element found in DOM' : 'UI element not found'
    };
    
    // Test 7: Check if required classes are available
    const requiredClasses = ['PokerEngine', 'EquityCalculator', 'GTOAdvisor', 'PokerNowParser', 'CopilotUI'];
    const missingClasses = requiredClasses.filter(className => typeof window[className] === 'undefined');
    results.tests.requiredClasses = {
        name: 'Required Classes',
        passed: missingClasses.length === 0,
        details: missingClasses.length === 0 ? 'All classes loaded' : `Missing: ${missingClasses.join(', ')}`
    };
    
    // Test 8: Try to call content script test function
    if (window.testContentScript) {
        try {
            const testResult = window.testContentScript();
            results.tests.contentScriptFunction = {
                name: 'Content Script Function Call',
                passed: !!testResult,
                details: testResult ? JSON.stringify(testResult, null, 2) : 'Function returned nothing'
            };
        } catch (error) {
            results.tests.contentScriptFunction = {
                name: 'Content Script Function Call',
                passed: false,
                details: `Error: ${error.message}`
            };
        }
    }
    
    // Display results
    console.log('\n🧪 ===== EXTENSION TEST RESULTS =====\n');
    
    let passedTests = 0;
    let totalTests = 0;
    
    Object.values(results.tests).forEach(test => {
        totalTests++;
        if (test.passed) passedTests++;
        
        const status = test.passed ? '✅ PASS' : '❌ FAIL';
        console.log(`${status} ${test.name}`);
        console.log(`   ${test.details}\n`);
    });
    
    console.log(`📊 Overall Result: ${passedTests}/${totalTests} tests passed\n`);
    
    if (passedTests === totalTests) {
        console.log('🎉 All tests passed! Extension is working correctly.');
    } else if (passedTests > totalTests / 2) {
        console.log('⚠️ Some tests failed. Extension may be partially working.');
    } else {
        console.log('❌ Multiple tests failed. Extension has issues that need fixing.');
    }
    
    console.log('\n🔧 Troubleshooting Tips:');
    console.log('• Make sure you are on a PokerNow.club page');
    console.log('• Try refreshing the page');
    console.log('• Check if the extension is enabled in chrome://extensions/');
    console.log('• Open the popup and try the "Test Connection" button');
    
    return results;
}

// Auto-run the test
testExtension();

// Also expose the function globally for manual testing
window.testPokerNowExtension = testExtension; 