#include "cmake_generator.h"

#include <set>
#include <sstream>

namespace picoforge {

std::string CMakeGenerator::generate(const std::string& projectName, const ModuleList& modules) {
    std::set<std::string> libs;
    
    for (const auto& m : modules) {
        for (const auto& dep : m->dependencies()) {
            if (dep.find("hardware/") == 0) {
                libs.insert(dep.substr(9)); // strip "hardware/"
            } else if (dep == "pico/time.h") {
                libs.insert("pico_time");
            }
        }
    }
    
    std::ostringstream oss;
    oss << "cmake_minimum_required(VERSION 3.13)\n\n";
    oss << "include(pico_sdk_import.cmake)\n\n";
    oss << "project(" << projectName << " C CXX ASM)\n";
    oss << "set(CMAKE_C_STANDARD 11)\n";
    oss << "set(CMAKE_CXX_STANDARD 17)\n\n";
    oss << "pico_sdk_init()\n\n";
    oss << "add_executable(" << projectName << "\n    main.cpp\n)\n\n";
    oss << "target_link_libraries(" << projectName << "\n    pico_stdlib\n";
    
    for (const auto& lib : libs) {
        oss << "    " << lib << "\n";
    }
    
    oss << ")\n\n";
    oss << "pico_add_extra_outputs(" << projectName << ")\n";
    
    return oss.str();
}

}  // namespace picoforge
