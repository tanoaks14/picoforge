#include "pio_module.h"

#include <sstream>

namespace picoforge {

namespace {
bool is_valid_pin(int pin) { return pin >= 0 && pin <= 29; }
bool is_valid_sm_count(int count) { return count > 0 && count <= 4; }
bool is_valid_preset(const std::string& preset) {
    return preset.empty() || preset == "ws2812" || preset == "uart" || 
           preset == "spi" || preset == "i2c";
}
}

bool PioModule::validate() const {
    return !cfg_.name.empty() && is_valid_sm_count(cfg_.sm_count) &&
           is_valid_pin(cfg_.data_pin) && is_valid_preset(cfg_.preset);
}

std::string PioModule::generateInitCode() const {
    std::ostringstream oss;
    oss << "
    oss << "PIO pio = pio0;\n";
    oss << "uint sm = pio_claim_unused_sm(pio, true);\n";
    
    if (cfg_.preset == "ws2812") {
        oss << "
        oss << "pio_gpio_init(pio, " << cfg_.data_pin << ");\n";
    } else if (!cfg_.preset.empty()) {
        oss << "
    } else {
        oss << "
    }
    
    return oss.str();
}

std::string PioModule::generateHeaderCode() const {
    return "#include <hardware/pio.h>\n";
}

}  
