#pragma once

#include <set>
#include <string>

#include "../core/code_generator.h"

namespace picoforge {

class MainGenerator : public ICodeGenerator {
public:
    GeneratedCode generate(const ModuleList& modules) const override;
};

}  // namespace picoforge
