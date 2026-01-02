#pragma once

namespace picoforge {

// Error code categories
enum class ErrorCode {
    Success = 0,
    
    // Config errors (1xx)
    ConfigFileNotFound = 100,
    ConfigParseError = 101,
    ConfigValidationError = 102,
    InvalidPinNumber = 103,
    InvalidFrequency = 104,
    InvalidBaudRate = 105,
    InvalidModuleConfiguration = 106,
    
    // Module errors (2xx)
    ModuleValidationFailed = 200,
    ModuleNotFound = 201,
    ModuleDependencyMissing = 202,
    
    // Generation errors (3xx)
    CodeGenerationFailed = 300,
    FileWriteFailed = 301,
    
    // Runtime errors (4xx)
    UnknownError = 400
};

inline const char* errorCodeToString(ErrorCode code) {
    switch (code) {
        case ErrorCode::Success: return "Success";
        case ErrorCode::ConfigFileNotFound: return "Config file not found";
        case ErrorCode::ConfigParseError: return "Config parse error";
        case ErrorCode::ConfigValidationError: return "Config validation error";
        case ErrorCode::InvalidPinNumber: return "Invalid pin number";
        case ErrorCode::InvalidFrequency: return "Invalid frequency";
        case ErrorCode::InvalidBaudRate: return "Invalid baud rate";
        case ErrorCode::ModuleValidationFailed: return "Module validation failed";
        case ErrorCode::ModuleNotFound: return "Module not found";
        case ErrorCode::ModuleDependencyMissing: return "Module dependency missing";
        case ErrorCode::CodeGenerationFailed: return "Code generation failed";
        case ErrorCode::FileWriteFailed: return "File write failed";
        default: return "Unknown error";
    }
}

}  // namespace picoforge
