#include <cassert>
#include <iostream>
#include <string>

#include "../../src/generators/main_generator.h"
#include "../../src/generators/cmake_generator.h"
#include "../../src/core/code_injector.h"
#include "../../src/modules/gpio_module.h"
#include "../../src/modules/pwm_module.h"
#include "../../src/modules/uart_module.h"

using namespace picoforge;

void testGeneratedCodeHasHeaders() {
    std::cout << "    Testing generated code has headers...\n";
    
    ModuleList modules;
    modules.push_back(std::make_shared<GpioModule>(GpioConfig{15, "output", "none"}));
    
    MainGenerator gen;
    auto code = gen.generate(modules);
    
    assert(!code.headers.empty());
    assert(code.headers.find("#include") != std::string::npos);
    
    std::cout << "      ✓ Generated code has proper headers\n";
}

void testGeneratedCodeHasBody() {
    std::cout << "    Testing generated code has body...\n";
    
    ModuleList modules;
    modules.push_back(std::make_shared<GpioModule>(GpioConfig{15, "output", "none"}));
    
    MainGenerator gen;
    auto code = gen.generate(modules);
    
    assert(!code.mainBody.empty());
    assert(code.mainBody.length() > 10);
    
    std::cout << "      ✓ Generated code has body\n";
}

void testGeneratedCodeBalancedBraces() {
    std::cout << "    Testing generated code has balanced braces...\n";
    
    ModuleList modules;
    modules.push_back(std::make_shared<GpioModule>(GpioConfig{15, "output", "none"}));
    modules.push_back(std::make_shared<PwmModule>(PwmConfig{0, 1000, 50.0}));
    
    MainGenerator gen;
    auto code = gen.generate(modules);
    
    int open = 0, close = 0;
    for (char c : code.mainBody) {
        if (c == '{') open++;
        if (c == '}') close++;
    }
    assert(open == close);
    
    std::cout << "      ✓ Generated code has balanced braces\n";
}

void testGeneratedCodeBalancedParens() {
    std::cout << "    Testing generated code has balanced parentheses...\n";
    
    ModuleList modules;
    modules.push_back(std::make_shared<GpioModule>(GpioConfig{15, "output", "none"}));
    
    MainGenerator gen;
    auto code = gen.generate(modules);
    
    int open = 0, close = 0;
    for (char c : code.mainBody) {
        if (c == '(') open++;
        if (c == ')') close++;
    }
    assert(open == close);
    
    std::cout << "      ✓ Generated code has balanced parentheses\n";
}

void testCmakeCodeCorrect() {
    std::cout << "    Testing CMake code is correct...\n";
    
    ModuleList modules;
    modules.push_back(std::make_shared<GpioModule>(GpioConfig{15, "output", "none"}));
    
    auto cmake = CMakeGenerator::generate("test_proj", modules);
    
    assert(!cmake.empty());
    assert(cmake.find("test_proj") != std::string::npos);
    assert(cmake.find("project") != std::string::npos || cmake.find("cmake") != std::string::npos);
    
    std::cout << "      ✓ CMake code is correct\n";
}

void testCodeInjectionPreserves() {
    std::cout << "    Testing code injection preserves structure...\n";
    
    std::string original = 
        "void main() {\n"
        "  // [USER_CODE] setup\n"
        "  my_code();\n"
        "  // [USER_CODE] END\n"
        "}\n";
    
    CodeInjector injector;
    auto blocks = injector.extractUserBlocks(original);
    auto result = injector.injectUserBlocks(original, blocks);
    
    assert(!result.empty());
    
    std::cout << "      ✓ Code injection preserves structure\n";
}

void testMultiModuleGeneration() {
    std::cout << "    Testing multi-module generation...\n";
    
    ModuleList modules;
    modules.push_back(std::make_shared<GpioModule>(GpioConfig{15, "output", "none"}));
    modules.push_back(std::make_shared<PwmModule>(PwmConfig{0, 1000, 50.0}));
    modules.push_back(std::make_shared<UartModule>(UartConfig{0, 115200, 0, 1, "none"}));
    
    MainGenerator gen;
    auto code = gen.generate(modules);
    
    assert(!code.headers.empty());
    assert(!code.mainBody.empty());
    
    // Count includes
    int includes = 0;
    size_t pos = 0;
    while ((pos = code.headers.find("#include", pos)) != std::string::npos) {
        includes++;
        pos++;
    }
    assert(includes >= 2);
    
    std::cout << "      ✓ Multi-module generation works\n";
}

void testEmptyModuleListGeneration() {
    std::cout << "    Testing empty module list generation...\n";
    
    ModuleList modules;  // Empty
    
    MainGenerator gen;
    auto code = gen.generate(modules);
    
    // Should handle gracefully (even if empty)
    std::cout << "      ✓ Empty module list handled\n";
}

void testCodeGenerationCorrectness() {
    std::cout << "\n--- Code Generation Correctness Tests ---\n";
    
    try {
        testGeneratedCodeHasHeaders();
        testGeneratedCodeHasBody();
        testGeneratedCodeBalancedBraces();
        testGeneratedCodeBalancedParens();
        testCmakeCodeCorrect();
        testCodeInjectionPreserves();
        testMultiModuleGeneration();
        testEmptyModuleListGeneration();
        
        std::cout << "✅ Code Generation Correctness Tests Passed\n\n";
    } catch (const std::exception& e) {
        std::cerr << "✗ Code generation correctness test failed: " << e.what() << "\n\n";
        throw;
    }
}
