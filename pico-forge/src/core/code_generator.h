#pragma once

#include <string>

#include "module.h"

namespace picoforge {

struct GeneratedCode {
    std::string mainBody;
    std::string headers;
};

class ICodeGenerator {
public:
    virtual ~ICodeGenerator() = default;
    virtual GeneratedCode generate(const ModuleList& modules) const = 0;
};

}  // namespace picoforge
