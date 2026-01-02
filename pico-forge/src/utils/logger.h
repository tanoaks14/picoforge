#pragma once

#include <string>

namespace picoforge {

enum class LogLevel {
    Debug,
    Info,
    Warning,
    Error
};

class Logger {
public:
    static void setLevel(LogLevel level);
    static void debug(const std::string& message);
    static void info(const std::string& message);
    static void warning(const std::string& message);
    static void error(const std::string& message);

private:
    static LogLevel currentLevel_;
    static void log(LogLevel level, const std::string& message);
};

}  // namespace picoforge
