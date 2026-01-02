#include "code_injector.h"

#include <regex>
#include <sstream>

namespace picoforge {

std::map<std::string, std::string> CodeInjector::extractUserBlocks(const std::string& source) {
    std::map<std::string, std::string> blocks;
    std::regex pattern(R"(// \[USER_CODE\] (\w+)\n([\s\S]*?)// \[USER_CODE\] END)");
    
    auto begin = std::sregex_iterator(source.begin(), source.end(), pattern);
    auto end = std::sregex_iterator();
    
    for (auto it = begin; it != end; ++it) {
        blocks[(*it)[1].str()] = (*it)[2].str();
    }
    
    return blocks;
}

std::string CodeInjector::injectUserBlocks(
    const std::string& generated,
    const std::map<std::string, std::string>& userBlocks
) {
    std::string result = generated;
    
    for (const auto& [tag, code] : userBlocks) {
        std::string marker_start = "// [USER_CODE] " + tag + "\n";
        std::string marker_end = "// [USER_CODE] END";
        
        size_t start_pos = result.find(marker_start);
        if (start_pos == std::string::npos) continue;
        
        start_pos += marker_start.length();
        size_t end_pos = result.find(marker_end, start_pos);
        if (end_pos == std::string::npos) continue;
        
        result.replace(start_pos, end_pos - start_pos, code);
    }
    
    return result;
}

}  // namespace picoforge
