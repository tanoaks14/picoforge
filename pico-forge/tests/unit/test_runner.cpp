#include <iostream>
#include <cassert>

// Forward declare test functions from each test file
// From test_module_registry.cpp
void testModuleRegistration();
void testUnknownModule();

// From test_modules_validate.cpp
void testGpioValidation();
void testPwmValidation();
void testTimerValidation();
void testAdcValidation();
void testUartValidation();
void testI2cValidation();
void testSpiValidation();

// From test_config_parser.cpp
void testConfigParser();

// From test_main_generator.cpp
void testMainGenerator();

// From test_cmake_generator.cpp
void testCMakeGenerator();

// From test_code_injector.cpp
void testCodeInjection();
void testMultipleBlocks();
void testNestedBlocks();

// From test_config_validator.cpp
void testPinValidation();
void testFrequencyValidation();
void testBaudRateValidation();
void testI2cSpeedValidation();
void testSpiSpeedValidation();

// From test_template_generation.cpp
void testTemplateGeneration();

// From test_code_generation_correctness.cpp
void testCodeGenerationCorrectness();

int main() {
    std::cout << "=== Running PicoForge Unit Tests ===\n\n";
    
    // Module Registry Tests
    std::cout << "--- Module Registry Tests ---\n";
    try {
        testModuleRegistration();
        testUnknownModule();
        std::cout << "✅ Module Registry Tests Passed\n\n";
    } catch (...) {
        std::cerr << "❌ Module Registry Tests Failed\n\n";
        return 1;
    }
    
    // Module Validation Tests
    std::cout << "--- Module Validation Tests ---\n";
    try {
        testGpioValidation();
        testPwmValidation();
        testTimerValidation();
        testAdcValidation();
        testUartValidation();
        testI2cValidation();
        testSpiValidation();
        std::cout << "✅ Module Validation Tests Passed\n\n";
    } catch (...) {
        std::cerr << "❌ Module Validation Tests Failed\n\n";
        return 1;
    }
    
    // Config Parser Tests
    std::cout << "--- Config Parser Tests ---\n";
    try {
        testConfigParser();
        std::cout << "✅ Config Parser Tests Passed\n\n";
    } catch (...) {
        std::cerr << "❌ Config Parser Tests Failed\n\n";
        return 1;
    }
    
    // Main Generator Tests
    std::cout << "--- Main Generator Tests ---\n";
    try {
        testMainGenerator();
        std::cout << "✅ Main Generator Tests Passed\n\n";
    } catch (...) {
        std::cerr << "❌ Main Generator Tests Failed\n\n";
        return 1;
    }
    
    // CMake Generator Tests
    std::cout << "--- CMake Generator Tests ---\n";
    try {
        testCMakeGenerator();
        std::cout << "✅ CMake Generator Tests Passed\n\n";
    } catch (...) {
        std::cerr << "❌ CMake Generator Tests Failed\n\n";
        return 1;
    }
    
    // Code Injector Tests
    std::cout << "--- Code Injector Tests ---\n";
    try {
        testCodeInjection();
        testMultipleBlocks();
        testNestedBlocks();
        std::cout << "✅ Code Injector Tests Passed\n\n";
    } catch (...) {
        std::cerr << "❌ Code Injector Tests Failed\n\n";
        return 1;
    }
    
    // Config Validator Tests
    std::cout << "--- Config Validator Tests ---\n";
    try {
        testPinValidation();
        testFrequencyValidation();
        testBaudRateValidation();
        testI2cSpeedValidation();
        testSpiSpeedValidation();
        std::cout << "✅ Config Validator Tests Passed\n\n";
    } catch (...) {
        std::cerr << "❌ Config Validator Tests Failed\n\n";
        return 1;
    }
    
    // Template Generation Tests
    std::cout << "--- Template Generation Tests ---\n";
    try {
        testTemplateGeneration();
        std::cout << "✅ Template Generation Tests Passed\n\n";
    } catch (...) {
        std::cerr << "❌ Template Generation Tests Failed\n\n";
        return 1;
    }
    
    // Code Generation Correctness Tests
    std::cout << "--- Code Generation Correctness Tests ---\n";
    try {
        testCodeGenerationCorrectness();
        std::cout << "✅ Code Generation Correctness Tests Passed\n\n";
    } catch (...) {
        std::cerr << "❌ Code Generation Correctness Tests Failed\n\n";
        return 1;
    }
    
    std::cout << "=== ✅ All Unit Tests Passed! ===\n";
    return 0;
}
