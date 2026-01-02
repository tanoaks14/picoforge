#include "pwm_module.h"

#include <sstream>

namespace picoforge {

namespace {
bool is_valid_pin(int pin) { return pin >= 0 && pin <= 29; }
bool is_valid_freq(int freq) { return freq > 0 && freq <= 1000000; }
bool is_valid_duty(double duty) { return duty >= 0.0 && duty <= 100.0; }
}

bool PwmModule::validate() const {
    return is_valid_pin(cfg_.pin) && is_valid_freq(cfg_.freq_hz) && is_valid_duty(cfg_.duty_pct);
}

std::string PwmModule::generateInitCode() const {
    std::ostringstream oss;
    oss << "gpio_set_function(" << cfg_.pin << ", GPIO_FUNC_PWM);\n";
    oss << "uint slice = pwm_gpio_to_slice_num(" << cfg_.pin << ");\n";
    oss << "pwm_set_clkdiv(slice, 1.0f);\n";
    oss << "pwm_set_wrap(slice, 125000000 / " << cfg_.freq_hz << ");\n";
    oss << "pwm_set_chan_level(slice, pwm_gpio_to_channel(" << cfg_.pin << "), (uint16_t)((" << cfg_.duty_pct << "f/100.0f) * pwm_get_wrap(slice)));\n";
    oss << "pwm_set_enabled(slice, true);\n";
    return oss.str();
}

std::string PwmModule::generateHeaderCode() const {
    return "#include <hardware/pwm.h>\n";
}

}  // namespace picoforge
