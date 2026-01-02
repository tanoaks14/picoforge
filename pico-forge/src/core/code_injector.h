#pragma once

#include <map>
#include <string>

namespace picoforge {

class CodeInjector {
public:
    // Extract user code blocks marked with [USER_CODE] tags
    static std::map<std::string, std::string> extractUserBlocks(const std::string& source);
    
    // Inject user blocks back into generated template
    static std::string injectUserBlocks(
        const std::string& generated,
        const std::map<std::string, std::string>& userBlocks
    );
};

}  // namespace picoforge
