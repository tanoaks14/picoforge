#include <cassert>
#include <iostream>
#include <string>

#include "../../src/generators/cmake_generator.h"
#include "../../src/modules/gpio_module.h"
#include "../../src/modules/uart_module.h"

using namespace picoforge;

void testCMakeGenerator() {
    ModuleList modules;
    modules.push_back(std::make_shared<GpioModule>(GpioConfig{15, "output", "none"}));
    modules.push_back(std::make_shared<UartModule>(UartConfig{0, 115200, 0, 1, "none"}));
    
    auto cmake = CMakeGenerator::generate("test_project", modules);
    
    assert(cmake.find("project(test_project") != std::string::npos);
    assert(cmake.find("pico_stdlib") != std::string::npos);
    assert(cmake.find("gpio") != std::string::npos);
    assert(cmake.find("uart") != std::string::npos);
    assert(cmake.find("pico_add_extra_outputs") != std::string::npos);
    
    std::cout << "✓ CMake Generator test passed\n";
}
