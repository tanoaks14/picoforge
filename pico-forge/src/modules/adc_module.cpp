#include "adc_module.h"

#include <sstream>

namespace picoforge {

namespace {
bool is_valid_adc_pin(int pin) { return pin >= 26 && pin <= 29; }
bool is_valid_samples(int samples) { return samples > 0 && samples <= 1024; }
}

bool AdcModule::validate() const {
    if (cfg_.temperature) {
        return is_valid_samples(cfg_.samples);
    }
    return is_valid_adc_pin(cfg_.pin) && is_valid_samples(cfg_.samples);
}

std::string AdcModule::generateInitCode() const {
    std::ostringstream oss;
    oss << "adc_init();\n";
    if (cfg_.temperature) {
        oss << "adc_set_temp_sensor_enabled(true);\n";
    } else {
        oss << "adc_gpio_init(" << cfg_.pin << ");\n";
        oss << "adc_select_input(" << (cfg_.pin - 26) << ");\n";
    }
    oss << "// ADC sampling x" << cfg_.samples << " will be handled in read helper.\n";
    return oss.str();
}

std::string AdcModule::generateHeaderCode() const {
    return "#include <hardware/adc.h>\n";
}

}  // namespace picoforge
