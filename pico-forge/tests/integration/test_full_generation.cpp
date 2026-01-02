#include <iostream>
#include <cassert>
#include <fstream>
#include "../src/config/config_parser.h"
#include "../src/generators/main_generator.h"
#include "../src/generators/cmake_generator.h"
#include "../src/core/code_injector.h"

using namespace picoforge;

void testFullGenerationPipeline() {
    std::cout << "Testing full generation pipeline...\n";
    
    // Step 1: Parse configuration
    ConfigParser parser;
    std::string fixturePath = FIXTURES_PATH;
    auto modules = parser.parseFile(fixturePath + "/sample_forge.json");
    
    assert(!modules.empty());
    std::cout << "  ✓ Parsed " << modules.size() << " modules from config\n";
    
    // Step 2: Generate main.cpp
    MainGenerator mainGen;
    auto generated = mainGen.generate(modules);
    
    assert(!generated.headers.empty());
    assert(!generated.mainBody.empty());
    assert(generated.headers.find("#include") != std::string::npos);
    std::cout << "  ✓ Generated main.cpp with headers and body\n";
    
    // Step 3: Generate CMakeLists.txt
    CMakeGenerator cmakeGen;
    std::string cmake = cmakeGen.generate("pico_sample", modules);
    
    assert(!cmake.empty());
    assert(cmake.find("cmake_minimum_required") != std::string::npos);
    assert(cmake.find("pico_sdk_init") != std::string::npos);
    std::cout << "  ✓ Generated CMakeLists.txt with SDK integration\n";
    
    // Step 4: Test code injection (simplified)
    // Create a test code string with user blocks
    std::string testCode = 
        "#include \"test.h\"\n"
        "// [USER_CODE] init\n"
        "my_init_code();\n"
        "// [USER_CODE] END\n"
        "\nvoid main() {\n"
        "  // [USER_CODE] loop\n"
        "  my_loop_code();\n"
        "  // [USER_CODE] END\n"
        "}\n";
    
    CodeInjector injector;
    auto userBlocks = injector.extractUserBlocks(testCode);
    
    assert(!userBlocks.empty());
    std::cout << "  ✓ Extracted " << userBlocks.size() << " user code blocks\n";
    
    std::string fullMain = generated.headers + "\n\n" + generated.mainBody;
    std::string finalCode = injector.injectUserBlocks(fullMain, userBlocks);
    
    assert(!finalCode.empty());
    std::cout << "  ✓ Injected user code blocks into generated code\n";
}

void testModuleCombinations() {
    std::cout << "\nTesting module combinations...\n";
    
    ConfigParser parser;
    std::string fixturePath = FIXTURES_PATH;
    auto modules = parser.parseFile(fixturePath + "/sample_forge.json");
    
    // Verify multiple modules were parsed
    assert(!modules.empty());
    assert(modules.size() >= 3);  // Should have at least GPIO, PWM, ADC or similar
    std::cout << "  ✓ Parsed " << modules.size() << " module types\n";
    
    // Generate code with all modules
    MainGenerator gen;
    auto result = gen.generate(modules);
    
    assert(!result.headers.empty());
    assert(!result.mainBody.empty());
    std::cout << "  ✓ Generated code for all " << modules.size() << " modules\n";
}

int main() {
    std::cout << "Running integration tests...\n\n";
    
    try {
        testFullGenerationPipeline();
        testModuleCombinations();
        
        std::cout << "\n✅ All integration tests passed!\n";
        return 0;
    } catch (const std::exception& e) {
        std::cerr << "\n✗ Integration test failed: " << e.what() << "\n";
        return 1;
    }
}
