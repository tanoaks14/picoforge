#include "gpio_module.h"

#include <sstream>

namespace picoforge {

namespace {
bool is_valid_pin(int pin) { return pin >= 0 && pin <= 29; }
bool is_valid_direction(const std::string& dir) {
    return dir == "input" || dir == "output";
}
bool is_valid_pull(const std::string& pull) {
    return pull == "up" || pull == "down" || pull == "none";
}
}  // namespace

bool GpioModule::validate() const {
    return is_valid_pin(cfg_.pin) && is_valid_direction(cfg_.direction) && is_valid_pull(cfg_.pull);
}

std::string GpioModule::generateInitCode() const {
    std::ostringstream oss;
    oss << "gpio_init(" << cfg_.pin << ");\n";
    oss << "gpio_set_dir(" << cfg_.pin << ", " << (cfg_.direction == "output" ? "true" : "false") << ");\n";
    if (cfg_.pull == "up") {
        oss << "gpio_pull_up(" << cfg_.pin << ");\n";
    } else if (cfg_.pull == "down") {
        oss << "gpio_pull_down(" << cfg_.pin << ");\n";
    }
    return oss.str();
}

std::string GpioModule::generateHeaderCode() const {
    return "#include <hardware/gpio.h>\n";
}

}  // namespace picoforge
