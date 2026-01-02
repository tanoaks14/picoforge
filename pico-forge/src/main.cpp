#include <iostream>
#include <fstream>

#include "config/config_parser.h"
#include "generators/main_generator.h"

int main(int argc, const char* argv[]) {
    if (argc < 2) {
        std::cerr << "Usage: pico-forge <config.json>\n";
        return 1;
    }

    try {
        auto modules = picoforge::ConfigParser::parseFile(argv[1]);
        picoforge::MainGenerator gen;
        auto code = gen.generate(modules);

        std::cout << "// Generated Headers\n" << code.headers << "\n";
        std::cout << "// Generated Init Code\n" << code.mainBody << "\n";

        return 0;
    } catch (const std::exception& e) {
        std::cerr << "Error: " << e.what() << "\n";
        return 1;
    }
}
