#include "logger.h"

#include <iostream>

namespace picoforge {

LogLevel Logger::currentLevel_ = LogLevel::Info;

void Logger::setLevel(LogLevel level) {
    currentLevel_ = level;
}

void Logger::debug(const std::string& message) {
    log(LogLevel::Debug, message);
}

void Logger::info(const std::string& message) {
    log(LogLevel::Info, message);
}

void Logger::warning(const std::string& message) {
    log(LogLevel::Warning, message);
}

void Logger::error(const std::string& message) {
    log(LogLevel::Error, message);
}

void Logger::log(LogLevel level, const std::string& message) {
    if (level < currentLevel_) return;
    
    const char* prefix = "";
    switch (level) {
        case LogLevel::Debug:   prefix = "[DEBUG] "; break;
        case LogLevel::Info:    prefix = "[INFO]  "; break;
        case LogLevel::Warning: prefix = "[WARN]  "; break;
        case LogLevel::Error:   prefix = "[ERROR] "; break;
    }
    
    std::cerr << prefix << message << "\n";
}

}  // namespace picoforge
