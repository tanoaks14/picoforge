#pragma once

#include <string>
#include <vector>

#include "../utils/error_codes.h"

namespace picoforge {

struct ValidationResult {
    bool valid;
    ErrorCode errorCode;
    std::vector<std::string> errors;
    
    ValidationResult() : valid(true), errorCode(ErrorCode::Success) {}
    
    void addError(ErrorCode code, const std::string& message) {
        valid = false;
        errorCode = code;
        errors.push_back(message);
    }
};

class ConfigValidator {
public:
    static ValidationResult validatePinNumber(int pin);
    static ValidationResult validateFrequency(int freq, int min, int max);
    static ValidationResult validateBaudRate(int baud);
    static ValidationResult validateI2cSpeed(int speed);
    static ValidationResult validateSpiSpeed(int speed);
};

}  // namespace picoforge
