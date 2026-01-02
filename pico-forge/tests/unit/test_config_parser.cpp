#include <cassert>
#include <iostream>
#include <string>

#include "../../src/config/config_parser.h"
#include "../../src/generators/main_generator.h"

using namespace picoforge;

void testConfigParser() {
    std::string fixture_path = FIXTURES_PATH;
    fixture_path += "/sample_forge_basic.json";

    auto modules = ConfigParser::parseFile(fixture_path);
    assert(!modules.empty());

    MainGenerator gen;
    auto code = gen.generate(modules);

    assert(!code.headers.empty());
    assert(!code.mainBody.empty());
    assert(code.mainBody.find("gpio_init") != std::string::npos);

    std::cout << "✓ Config Parser test passed\n";
}
