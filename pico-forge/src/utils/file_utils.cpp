#include "file_utils.h"

#include <fstream>
#include <sstream>

namespace picoforge {

std::string FileUtils::readFile(const std::string& filepath) {
    std::ifstream file(filepath);
    if (!file.is_open()) {
        return "";
    }
    
    std::ostringstream ss;
    ss << file.rdbuf();
    return ss.str();
}

bool FileUtils::writeFile(const std::string& filepath, const std::string& content) {
    std::ofstream file(filepath);
    if (!file.is_open()) {
        return false;
    }
    
    file << content;
    return file.good();
}

bool FileUtils::fileExists(const std::string& filepath) {
    std::ifstream file(filepath);
    return file.good();
}

std::string FileUtils::getDirectory(const std::string& filepath) {
    size_t pos = filepath.find_last_of("/\\");
    if (pos == std::string::npos) {
        return ".";
    }
    return filepath.substr(0, pos);
}

std::string FileUtils::getFilename(const std::string& filepath) {
    size_t pos = filepath.find_last_of("/\\");
    if (pos == std::string::npos) {
        return filepath;
    }
    return filepath.substr(pos + 1);
}

}  // namespace picoforge
