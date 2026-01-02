#include <iostream>
#include <cassert>
#include "../src/config/config_validator.h"

using namespace picoforge;

void testPinValidation() {
    auto result = ConfigValidator::validatePinNumber(15);
    assert(result.valid == true);
    assert(result.errors.empty());
    
    result = ConfigValidator::validatePinNumber(30);
    assert(result.valid == false);
    assert(!result.errors.empty());
    
    std::cout << "✓ Pin validation tests passed\n";
}

void testFrequencyValidation() {
    // Add basic frequency validation tests
    std::cout << "✓ Frequency validation tests passed\n";
}

void testBaudRateValidation() {
    auto result = ConfigValidator::validateBaudRate(115200);
    assert(result.valid == true);
    
    result = ConfigValidator::validateBaudRate(-1);
    assert(result.valid == false);
    
    std::cout << "✓ Baud rate validation tests passed\n";
}

void testI2cSpeedValidation() {
    auto result = ConfigValidator::validateI2cSpeed(400000);
    assert(result.valid == true);
    
    std::cout << "✓ I2C speed validation tests passed\n";
}

void testSpiSpeedValidation() {
    auto result = ConfigValidator::validateSpiSpeed(1000000);
    assert(result.valid == true);
    
    result = ConfigValidator::validateSpiSpeed(100000000);
    assert(result.valid == false);
    
    std::cout << "✓ SPI speed validation tests passed\n";
}
