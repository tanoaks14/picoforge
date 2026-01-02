#pragma once

#include <string>
#include <vector>

#include "../core/module.h"

namespace picoforge {

class ConfigParser {
public:
    static ModuleList parseFile(const std::string& filepath);
    static ModuleList parseString(const std::string& json_str);
};

}  // namespace picoforge
