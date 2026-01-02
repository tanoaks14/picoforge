#include "multicore_module.h"

#include <sstream>

namespace picoforge {

bool MulticoreModule::validate() const {
    return cfg_.enable && !cfg_.core1_entry.empty();
}

std::string MulticoreModule::generateInitCode() const {
    std::ostringstream oss;
    oss << "multicore_launch_core1(" << cfg_.core1_entry << ");\n";
    return oss.str();
}

std::string MulticoreModule::generateHeaderCode() const {
    return "#include <pico/multicore.h>\n";
}

}  // namespace picoforge
