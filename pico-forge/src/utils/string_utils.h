#pragma once

#include <string>
#include <vector>

namespace picoforge {

class StringUtils {
public:
    static std::string trim(const std::string& str);
    static std::vector<std::string> split(const std::string& str, char delimiter);
    static bool startsWith(const std::string& str, const std::string& prefix);
    static bool endsWith(const std::string& str, const std::string& suffix);
    static std::string toLower(const std::string& str);
    static std::string toUpper(const std::string& str);
};

}  // namespace picoforge
