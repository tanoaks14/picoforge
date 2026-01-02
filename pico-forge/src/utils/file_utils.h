#pragma once

#include <string>

namespace picoforge {

class FileUtils {
public:
    static std::string readFile(const std::string& filepath);
    static bool writeFile(const std::string& filepath, const std::string& content);
    static bool fileExists(const std::string& filepath);
    static std::string getDirectory(const std::string& filepath);
    static std::string getFilename(const std::string& filepath);
};

}  // namespace picoforge
