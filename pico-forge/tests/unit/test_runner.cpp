#include <iostream>
#include <cassert>



void testModuleRegistration();
void testUnknownModule();


void testGpioValidation();
void testPwmValidation();
void testTimerValidation();
void testAdcValidation();
void testUartValidation();
void testI2cValidation();
void testSpiValidation();


void testConfigParser();


void testMainGenerator();


void testCMakeGenerator();


void testCodeInjection();
void testMultipleBlocks();
void testNestedBlocks();


void testPinValidation();
void testFrequencyValidation();
void testBaudRateValidation();
void testI2cSpeedValidation();
void testSpiSpeedValidation();


void testTemplateGeneration();


void testCodeGenerationCorrectness();

int main() {
    std::cout << "=== Running PicoForge Unit Tests ===\n\n";
    
    
    std::cout << "--- Module Registry Tests ---\n";
    try {
        testModuleRegistration();
        testUnknownModule();
        std::cout << " Module Registry Tests Passed\n\n";
    } catch (...) {
        std::cerr << " Module Registry Tests Failed\n\n";
        return 1;
    }
    
    
    std::cout << "--- Module Validation Tests ---\n";
    try {
        testGpioValidation();
        testPwmValidation();
        testTimerValidation();
        testAdcValidation();
        testUartValidation();
        testI2cValidation();
        testSpiValidation();
        std::cout << " Module Validation Tests Passed\n\n";
    } catch (...) {
        std::cerr << " Module Validation Tests Failed\n\n";
        return 1;
    }
    
    
    std::cout << "--- Config Parser Tests ---\n";
    try {
        testConfigParser();
        std::cout << " Config Parser Tests Passed\n\n";
    } catch (...) {
        std::cerr << " Config Parser Tests Failed\n\n";
        return 1;
    }
    
    
    std::cout << "--- Main Generator Tests ---\n";
    try {
        testMainGenerator();
        std::cout << " Main Generator Tests Passed\n\n";
    } catch (...) {
        std::cerr << " Main Generator Tests Failed\n\n";
        return 1;
    }
    
    
    std::cout << "--- CMake Generator Tests ---\n";
    try {
        testCMakeGenerator();
        std::cout << " CMake Generator Tests Passed\n\n";
    } catch (...) {
        std::cerr << " CMake Generator Tests Failed\n\n";
        return 1;
    }
    
    
    std::cout << "--- Code Injector Tests ---\n";
    try {
        testCodeInjection();
        testMultipleBlocks();
        testNestedBlocks();
        std::cout << " Code Injector Tests Passed\n\n";
    } catch (...) {
        std::cerr << " Code Injector Tests Failed\n\n";
        return 1;
    }
    
    
    std::cout << "--- Config Validator Tests ---\n";
    try {
        testPinValidation();
        testFrequencyValidation();
        testBaudRateValidation();
        testI2cSpeedValidation();
        testSpiSpeedValidation();
        std::cout << " Config Validator Tests Passed\n\n";
    } catch (...) {
        std::cerr << " Config Validator Tests Failed\n\n";
        return 1;
    }
    
    
    std::cout << "--- Template Generation Tests ---\n";
    try {
        testTemplateGeneration();
        std::cout << " Template Generation Tests Passed\n\n";
    } catch (...) {
        std::cerr << " Template Generation Tests Failed\n\n";
        return 1;
    }
    
    
    std::cout << "--- Code Generation Correctness Tests ---\n";
    try {
        testCodeGenerationCorrectness();
        std::cout << " Code Generation Correctness Tests Passed\n\n";
    } catch (...) {
        std::cerr << " Code Generation Correctness Tests Failed\n\n";
        return 1;
    }
    
    std::cout << "===  All Unit Tests Passed! ===\n";
    return 0;
}
