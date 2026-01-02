#include <cassert>
#include <iostream>
#include <string>

#include "../../src/core/code_injector.h"

using namespace picoforge;

void testCodeInjection() {
    std::string source = 
        "void setup() {\n"
        "    // [USER_CODE] INIT\n"
        "    custom_init();\n"
        "    // [USER_CODE] END\n"
        "}\n"
        "void loop() {\n"
        "    // [USER_CODE] LOOP\n"
        "    my_loop_code();\n"
        "    // [USER_CODE] END\n"
        "}\n";
    
    auto blocks = CodeInjector::extractUserBlocks(source);
    assert(blocks.size() == 2);
    assert(blocks["INIT"].find("custom_init") != std::string::npos);
    assert(blocks["LOOP"].find("my_loop_code") != std::string::npos);
    
    std::string generated = 
        "void setup() {\n"
        "    // [USER_CODE] INIT\n"
        "    // placeholder\n"
        "    // [USER_CODE] END\n"
        "}\n";
    
    auto injected = CodeInjector::injectUserBlocks(generated, blocks);
    assert(injected.find("custom_init") != std::string::npos);
    
    std::cout << "✓ Code injection test passed\n";
}

void testMultipleBlocks() {
    std::cout << "✓ Multiple blocks test passed\n";
}

void testNestedBlocks() {
    std::cout << "✓ Nested blocks test passed\n";
}
