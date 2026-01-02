#include <cassert>
#include <iostream>
#include <string>

#include "../../src/generators/main_generator.h"
#include "../../src/generators/cmake_generator.h"
#include "../../src/core/code_injector.h"
#include "../../src/modules/gpio_module.h"
#include "../../src/modules/pwm_module.h"
#include "../../src/modules/timer_module.h"
#include "../../src/modules/adc_module.h"
#include "../../src/modules/uart_module.h"

using namespace picoforge;

bool contains(const std::string& text, const std::string& pattern) {
    return text.find(pattern) != std::string::npos;
}

void testGpioTemplateCorrect() {
    std::cout << "    Testing GPIO template...\n";
    
    ModuleList modules;
    modules.push_back(std::make_shared<GpioModule>(GpioConfig{15, "output", "none"}));
    
    MainGenerator gen;
    auto code = gen.generate(modules);
    
    assert(!code.headers.empty());
    assert(!code.mainBody.empty());
    assert(code.mainBody.length() > 0);
    
    std::cout << "      ✓ GPIO template correct\n";
}

void testPwmTemplateCorrect() {
    std::cout << "    Testing PWM template...\n";
    
    ModuleList modules;
    modules.push_back(std::make_shared<PwmModule>(PwmConfig{0, 1000, 50.0}));
    
    MainGenerator gen;
    auto code = gen.generate(modules);
    
    assert(!code.headers.empty());
    assert(!code.mainBody.empty());
    
    std::cout << "      ✓ PWM template correct\n";
}

void testUartTemplateCorrect() {
    std::cout << "    Testing UART template...\n";
    
    ModuleList modules;
    modules.push_back(std::make_shared<UartModule>(UartConfig{0, 115200, 0, 1, "none"}));
    
    MainGenerator gen;
    auto code = gen.generate(modules);
    
    assert(!code.headers.empty());
    assert(!code.mainBody.empty());
    
    std::cout << "      ✓ UART template correct\n";
}

void testAdcTemplateCorrect() {
    std::cout << "    Testing ADC template...\n";
    
    ModuleList modules;
    modules.push_back(std::make_shared<AdcModule>(AdcConfig{26, 12, true}));
    
    MainGenerator gen;
    auto code = gen.generate(modules);
    
    assert(!code.headers.empty());
    assert(!code.mainBody.empty());
    
    std::cout << "      ✓ ADC template correct\n";
}

void testTimerTemplateCorrect() {
    std::cout << "    Testing Timer template...\n";
    
    ModuleList modules;
    modules.push_back(std::make_shared<TimerModule>(TimerConfig{"timer", 1000, true, "callback"}));
    
    MainGenerator gen;
    auto code = gen.generate(modules);
    
    assert(!code.headers.empty());
    assert(!code.mainBody.empty());
    
    std::cout << "      ✓ Timer template correct\n";
}

void testMultiModuleTemplateCorrect() {
    std::cout << "    Testing multi-module template...\n";
    
    ModuleList modules;
    modules.push_back(std::make_shared<GpioModule>(GpioConfig{15, "output", "none"}));
    modules.push_back(std::make_shared<PwmModule>(PwmConfig{0, 1000, 50.0}));
    modules.push_back(std::make_shared<AdcModule>(AdcConfig{26, 12, true}));
    modules.push_back(std::make_shared<UartModule>(UartConfig{0, 115200, 0, 1, "none"}));
    
    MainGenerator gen;
    auto code = gen.generate(modules);
    
    assert(!code.headers.empty());
    assert(!code.mainBody.empty());
    
    // Should have multiple includes
    int includes = 0;
    size_t pos = 0;
    while ((pos = code.headers.find("#include", pos)) != std::string::npos) {
        includes++;
        pos++;
    }
    assert(includes >= 2);
    
    std::cout << "      ✓ Multi-module template correct\n";
}

void testCmakeTemplateCorrect() {
    std::cout << "    Testing CMake template...\n";
    
    ModuleList modules;
    modules.push_back(std::make_shared<GpioModule>(GpioConfig{15, "output", "none"}));
    
    auto cmake = CMakeGenerator::generate("my_project", modules);
    
    assert(!cmake.empty());
    assert(contains(cmake, "my_project"));
    assert(contains(cmake, "cmake") || contains(cmake, "project"));
    
    std::cout << "      ✓ CMake template correct\n";
}

void testCodeInjectionTemplate() {
    std::cout << "    Testing code injection template...\n";
    
    std::string code =
        "void init() {\n"
        "  // [USER_CODE] setup\n"
        "  user_code();\n"
        "  // [USER_CODE] END\n"
        "}\n";
    
    CodeInjector injector;
    auto blocks = injector.extractUserBlocks(code);
    
    assert(!blocks.empty());
    
    std::cout << "      ✓ Code injection template correct\n";
}

void testTemplateValidSyntax() {
    std::cout << "    Testing template syntax validity...\n";
    
    ModuleList modules;
    modules.push_back(std::make_shared<GpioModule>(GpioConfig{15, "output", "none"}));
    
    MainGenerator gen;
    auto code = gen.generate(modules);
    
    // Check balanced braces
    int open_braces = 0;
    int close_braces = 0;
    for (char c : code.mainBody) {
        if (c == '{') open_braces++;
        if (c == '}') close_braces++;
    }
    assert(open_braces == close_braces);
    
    std::cout << "      ✓ Template syntax is valid\n";
}

void testTemplateGeneration() {
    std::cout << "\n--- Template Generation Tests ---\n";
    
    try {
        testGpioTemplateCorrect();
        testPwmTemplateCorrect();
        testUartTemplateCorrect();
        testAdcTemplateCorrect();
        testTimerTemplateCorrect();
        testMultiModuleTemplateCorrect();
        testCmakeTemplateCorrect();
        testCodeInjectionTemplate();
        testTemplateValidSyntax();
        
        std::cout << "✅ Template Generation Tests Passed\n\n";
    } catch (const std::exception& e) {
        std::cerr << "✗ Template generation test failed: " << e.what() << "\n\n";
        throw;
    }
}
