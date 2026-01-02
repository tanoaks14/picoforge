#pragma once

#include <string>
#include <vector>

namespace picoforge {

enum class ErrorCode {
    None,
    InvalidModuleConfiguration,
    InvalidPinNumber,
    InvalidFrequency,
    InvalidBaudRate,
    InvalidI2cSpeed,
    InvalidSpiSpeed,
    InvalidConfiguration,
    FileNotFound,
    ParseError,
    ValidationFailed,
    GenerationFailed
};

struct ValidationError {
    ErrorCode code;
    std::string message;
    std::string context;
    
    ValidationError(ErrorCode c, const std::string& msg, const std::string& ctx = "")
        : code(c), message(msg), context(ctx) {}
};

class ValidationResult {
public:
    ValidationResult() : valid_(true) {}
    
    void addError(ErrorCode code, const std::string& message, const std::string& context = "") {
        errors_.emplace_back(code, message, context);
        valid_ = false;
    }
    
    bool isValid() const { return valid_; }
    const std::vector<ValidationError>& errors() const { return errors_; }
    
    std::string formatErrors() const {
        std::string result;
        for (const auto& err : errors_) {
            result += "[" + std::to_string(static_cast<int>(err.code)) + "] " + err.message;
            if (!err.context.empty()) {
                result += " (" + err.context + ")";
            }
            result += "\n";
        }
        return result;
    }
    
private:
    bool valid_;
    std::vector<ValidationError> errors_;
};

}  // namespace picoforge
