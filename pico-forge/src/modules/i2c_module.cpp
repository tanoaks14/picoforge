#include "i2c_module.h"

#include <sstream>

namespace picoforge {

namespace {
bool is_valid_i2c_id(int id) { return id == 0 || id == 1; }
bool is_valid_pin(int pin) { return pin >= 0 && pin <= 29; }
bool is_valid_speed(int speed) { return speed > 0 && speed <= 1000000; }
}

bool I2cModule::validate() const {
    return is_valid_i2c_id(cfg_.id) && is_valid_pin(cfg_.sda) &&
           is_valid_pin(cfg_.scl) && is_valid_speed(cfg_.speed_hz);
}

std::string I2cModule::generateInitCode() const {
    std::ostringstream oss;
    oss << "i2c_init(i2c" << cfg_.id << ", " << cfg_.speed_hz << ");\n";
    oss << "gpio_set_function(" << cfg_.sda << ", GPIO_FUNC_I2C);\n";
    oss << "gpio_set_function(" << cfg_.scl << ", GPIO_FUNC_I2C);\n";
    if (cfg_.pullups) {
        oss << "gpio_pull_up(" << cfg_.sda << ");\n";
        oss << "gpio_pull_up(" << cfg_.scl << ");\n";
    }
    return oss.str();
}

std::string I2cModule::generateHeaderCode() const {
    return "#include <hardware/i2c.h>\n";
}

}  // namespace picoforge
