#include "config_parser.h"

#include <fstream>
#include <sstream>

#include "../modules/gpio_module.h"
#include "../modules/pwm_module.h"
#include "../modules/timer_module.h"
#include "../modules/adc_module.h"

namespace picoforge {

namespace {
std::string read_file(const std::string& path) {
    std::ifstream ifs(path);
    std::ostringstream ss;
    ss << ifs.rdbuf();
    return ss.str();
}

bool has_substr(const std::string& str, const std::string& sub) {
    return str.find(sub) != std::string::npos;
}
}

ModuleList ConfigParser::parseFile(const std::string& filepath) {
    return parseString(read_file(filepath));
}

ModuleList ConfigParser::parseString(const std::string& json_str) {
    ModuleList modules;
    
    // Lightweight parser stub - production would use nlohmann/json
    if (has_substr(json_str, "\"gpio\"")) {
        modules.push_back(std::make_shared<GpioModule>(GpioConfig{15, "output", "none"}));
    }
    if (has_substr(json_str, "\"pwm\"")) {
        modules.push_back(std::make_shared<PwmModule>(PwmConfig{2, 1000, 50.0}));
    }
    if (has_substr(json_str, "\"timers\"")) {
        modules.push_back(std::make_shared<TimerModule>(TimerConfig{"heartbeat", 500, true, "on_heartbeat"}));
    }
    if (has_substr(json_str, "\"adc\"")) {
        modules.push_back(std::make_shared<AdcModule>(AdcConfig{26, 4, false}));
    }
    
    return modules;
}

}  // namespace picoforge
