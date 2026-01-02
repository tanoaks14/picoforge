#pragma once

#include <string>
#include <vector>

#include "../core/module.h"

namespace picoforge {

class CMakeGenerator {
public:
    static std::string generate(const std::string& projectName, const ModuleList& modules);
};

}  // namespace picoforge
