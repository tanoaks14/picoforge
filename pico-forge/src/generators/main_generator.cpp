#include "main_generator.h"

#include <set>
#include <sstream>

namespace picoforge {

GeneratedCode MainGenerator::generate(const ModuleList& modules) const {
    std::set<std::string> header_set;
    std::ostringstream body;

    for (const auto& m : modules) {
        header_set.insert(m->generateHeaderCode());
        body << m->generateInitCode();
    }

    std::ostringstream headers;
    for (const auto& h : header_set) {
        headers << h;
    }

    GeneratedCode out;
    out.headers = headers.str();
    out.mainBody = body.str();
    return out;
}

}  // namespace picoforge
