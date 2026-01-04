#pragma once

#include <map>
#include <string>

namespace picoforge {

class CodeInjector {
public:
    
    static std::map<std::string, std::string> extractUserBlocks(const std::string& source);
    
    
    static std::string injectUserBlocks(
        const std::string& generated,
        const std::map<std::string, std::string>& userBlocks
    );
};

}  
