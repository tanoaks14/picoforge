#include "config_validator.h"

namespace picoforge {

ValidationResult ConfigValidator::validatePinNumber(int pin) {
    ValidationResult result;
    
    
    if (pin < 0 || pin > 29) {
        result.addError(ErrorCode::InvalidModuleConfiguration,
                       "GPIO pin must be between 0 and 29");
    }
    
    return result;
}

ValidationResult ConfigValidator::validateFrequency(int freq, int min, int max) {
    ValidationResult result;
    
    if (freq < min || freq > max) {
        result.addError(ErrorCode::InvalidModuleConfiguration,
                       "Frequency must be between " + std::to_string(min) + 
                       " and " + std::to_string(max) + " Hz");
    }
    
    return result;
}

ValidationResult ConfigValidator::validateBaudRate(int baud) {
    ValidationResult result;
    
    
    std::vector<int> validRates = {
        300, 600, 1200, 2400, 4800, 9600, 14400, 19200, 
        38400, 57600, 115200, 230400, 460800, 921600
    };
    
    bool found = false;
    for (int rate : validRates) {
        if (baud == rate) {
            found = true;
            break;
        }
    }
    
    if (!found && baud > 0 && baud <= 3000000) {
        
        found = true;
    }
    
    if (!found) {
        result.addError(ErrorCode::InvalidModuleConfiguration,
                       "Invalid or unsupported baud rate");
    }
    
    return result;
}

ValidationResult ConfigValidator::validateI2cSpeed(int speed) {
    ValidationResult result;
    
    
    if (speed != 100000 && speed != 400000 && speed != 1000000) {
        if (speed <= 0 || speed > 1000000) {
            result.addError(ErrorCode::InvalidModuleConfiguration,
                           "I2C speed must be positive and <= 1MHz");
        }
    }
    
    return result;
}

ValidationResult ConfigValidator::validateSpiSpeed(int speed) {
    ValidationResult result;
    
    
    if (speed <= 0 || speed > 62500000) {
        result.addError(ErrorCode::InvalidModuleConfiguration,
                       "SPI speed must be between 1 and 62500000 Hz");
    }
    
    return result;
}

}  
